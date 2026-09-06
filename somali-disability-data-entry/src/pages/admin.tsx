import { useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { getGetCurrentUserQueryKey, getGetDashboardSummaryQueryKey, getListBackupsQueryKey, getListPeopleQueryKey, useGetCurrentUser, useImportPeople, useListBackups, useListPeople, useLogout, useUpdatePassword, useUpdateUsername, useUploadBackupToGoogleDrive } from '@workspace/api-client-react';
import type { PersonInput } from '@workspace/api-client-react';
import { Check, Cloud, Download, FileSpreadsheet, KeyRound, LogOut, Moon, RefreshCcw, Settings2, Sun, Upload, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader, ErrorBlock, LoadingBlock } from '@/components/app-shell';
import { toast } from 'sonner';
import { downloadWorkbook, parseWorkbook, validateImportedRow, workbookBase64 } from '@/lib/excel';

export function ImportExportPage() {
  const importPeople = useImportPeople();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<PersonInput[]>([]);
  const [invalidRows, setInvalidRows] = useState<Array<{ rowNumber: number; error: string }>>([]);
  const [duplicateRows, setDuplicateRows] = useState<number>(0);
  const [totalRows, setTotalRows] = useState(0);
  const [fileName, setFileName] = useState('');
  const [busy, setBusy] = useState(false);
  const { data: people } = useListPeople();
  const onFile = async (file?: File) => {
    if (!file) return;
    setBusy(true); setFileName(file.name);
    try {
      const parsed = await parseWorkbook(file);
      const errors: Array<{ rowNumber: number; error: string }> = [];
      const valid: PersonInput[] = [];
      const seen = new Set<string>();
      let duplicates = 0;
      parsed.rows.forEach(({ input, rowNumber }) => {
        const error = validateImportedRow(input);
        const dedupeKey = `${input.name.toLowerCase()}|${input.phone}|${input.city.toLowerCase()}`;
        if (error) errors.push({ rowNumber, error });
        else if (seen.has(dedupeKey)) duplicates += 1;
        else {
          seen.add(dedupeKey);
          valid.push(input);
        }
      });
      setTotalRows(parsed.totalRows);
      setRows(valid.slice(0, 200));
      setInvalidRows(errors);
      setDuplicateRows(duplicates);
    } catch {
      toast.error('Invalid Excel file. Please choose a workbook with a People sheet.');
      setRows([]);
      setInvalidRows([]);
      setTotalRows(0);
    } finally {
      setBusy(false);
    }
  };
  const runImport = () => importPeople.mutate({ data: { records: rows } }, { onSuccess: (result) => { queryClient.invalidateQueries({ queryKey: getListPeopleQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() }); toast.success(`${result.imported} records imported`); setRows([]); setInvalidRows([]); setDuplicateRows(0); setTotalRows(0); }, onError: () => toast.error('Import failed. Review the file and try again.') });
  const exportData = () => {
    if (!people?.length) { toast.error('There are no records to export yet.'); return; }
    downloadWorkbook(people, `Somali_Disability_Data_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success('Excel exported successfully.');
  };
  return <div className="animate-rise-in"><PageHeader eyebrow="Data operations" title="Import & export" description="Move registry data carefully. Preview rows before importing, or download a complete working copy." />
    <div className="grid gap-5 xl:grid-cols-2"><Card><CardContent className="p-6 sm:p-8"><div className="flex items-start justify-between"><div><span className="grid size-11 place-items-center rounded-xl bg-accent text-accent-foreground"><Upload className="size-5" /></span><h2 className="mt-5 font-display text-xl font-semibold">Import records</h2><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Upload an Excel workbook. Values are checked and previewed before anything is written.</p></div><Badge variant="secondary">Up to 200</Badge></div><input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => void onFile(e.target.files?.[0])} data-testid="input-import-file" /><button onClick={() => fileRef.current?.click()} className="mt-7 flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-primary/35 bg-primary/[0.03] px-5 py-8 text-center transition hover:bg-primary/[0.07]" data-testid="button-choose-import-file"><FileSpreadsheet className="size-7 text-primary" /><span className="mt-3 text-sm font-semibold">{busy ? 'Reading workbook…' : fileName || 'Choose an Excel workbook'}</span><span className="mt-1 text-xs text-muted-foreground">.xlsx or .xls · first sheet is used</span></button>{(totalRows > 0 || rows.length > 0) && <div className="mt-5 rounded-xl border border-border"><div className="flex items-center justify-between border-b border-border px-4 py-3"><span className="text-sm font-semibold">Import preview</span><button onClick={() => { setRows([]); setInvalidRows([]); setDuplicateRows(0); setTotalRows(0); }} className="text-xs text-muted-foreground hover:text-foreground" data-testid="button-clear-import">Clear</button></div><div className="grid grid-cols-3 gap-2 border-b border-border px-4 py-3 text-center text-xs"><span><strong className="block text-base">{totalRows}</strong>Total rows</span><span><strong className="block text-base text-primary">{rows.length}</strong>Valid rows</span><span><strong className="block text-base text-destructive">{invalidRows.length + duplicateRows}</strong>Needs review</span></div>{invalidRows.length > 0 && <div className="max-h-20 overflow-auto border-b border-border px-4 py-2 text-xs text-destructive">{invalidRows.slice(0, 4).map((item) => <p key={item.rowNumber}>Row {item.rowNumber}: {item.error}</p>)}</div>}<div className="max-h-44 overflow-auto text-xs"><div className="grid grid-cols-3 gap-3 border-b border-border px-4 py-2 font-semibold text-muted-foreground"><span>Name</span><span>City</span><span>Disability</span></div>{rows.slice(0, 8).map((row, index) => <div key={`${row.name}-${index}`} className="grid grid-cols-3 gap-3 px-4 py-2"><span className="truncate">{row.name}</span><span className="truncate">{row.city}</span><span className="truncate">{row.disabilityType}</span></div>)}</div></div>}{rows.length > 0 && <Button onClick={runImport} disabled={importPeople.isPending} className="mt-5 w-full" data-testid="button-confirm-import">{importPeople.isPending ? 'Importing…' : `Confirm import of ${rows.length} records`}</Button>}</CardContent></Card>
      <Card><CardContent className="p-6 sm:p-8"><span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground"><Download className="size-5" /></span><h2 className="mt-5 font-display text-xl font-semibold">Export records</h2><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Download a complete Excel workbook with the official registry columns for reporting or offline review.</p><div className="mt-8 rounded-xl bg-muted/55 p-4"><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Records ready</span><span className="font-mono font-bold">{people?.length ?? 0}</span></div><div className="mt-3 flex items-center justify-between text-sm"><span className="text-muted-foreground">Format</span><span className="font-semibold">.xlsx workbook</span></div></div><Button onClick={exportData} variant="outline" className="mt-5 w-full" data-testid="button-export-excel"><Download className="mr-2 size-4" /> Export to Excel</Button></CardContent></Card></div>
  </div>;
}

export function BackupPage() {
  const queryClient = useQueryClient();
  const { data: backups, isLoading, isError, refetch } = useListBackups({ query: { queryKey: getListBackupsQueryKey() } });
  const { data: people } = useListPeople();
  const uploadToDrive = useUploadBackupToGoogleDrive();
  const backupNow = () => {
    if (!people?.length) {
      toast.error('There are no records to back up yet.');
      return;
    }
    const fileName = `Somali_Disability_Data_${new Date().toISOString().slice(0, 10)}.xlsx`;
    uploadToDrive.mutate({ data: { fileName, contentBase64: workbookBase64(people), recordCount: people.length } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBackupsQueryKey() });
        toast.success('Backup uploaded to Google Drive.');
      },
      onError: () => {
        downloadWorkbook(people, fileName);
        toast.error('Google Drive upload failed. A local Excel backup was downloaded instead.');
      },
    });
  };
  return <div className="animate-rise-in"><PageHeader eyebrow="Data operations" title="Backups" description="Keep a reliable copy of your registry and understand exactly when it was last protected." action={<Button onClick={backupNow} disabled={uploadToDrive.isPending} data-testid="button-backup-now"><RefreshCcw className="mr-2 size-4" />{uploadToDrive.isPending ? 'Uploading…' : 'Backup to Google Drive'}</Button>} /><div className="grid gap-5 lg:grid-cols-2"><Card><CardContent className="p-6 sm:p-8"><div className="flex items-start gap-4"><span className="grid size-11 place-items-center rounded-xl bg-[#d8e6d8] text-[#2e5939]"><Cloud className="size-5" /></span><div><h2 className="font-display text-xl font-semibold">Google Drive</h2><p className="mt-1 text-sm text-muted-foreground">Automatic off-site backup destination</p></div></div><div className="mt-7 flex items-center justify-between rounded-xl border border-border p-4"><div className="flex items-center gap-2 text-sm"><span className="size-2 rounded-full bg-emerald-500" /> Connected</div><Badge variant="secondary">Ready</Badge></div><p className="mt-4 text-xs leading-5 text-muted-foreground">Backups are uploaded through the secure administrator-approved Google Drive connection. A local Excel copy is downloaded automatically if the upload fails.</p></CardContent></Card><Card><CardContent className="p-6 sm:p-8"><h2 className="font-display text-xl font-semibold">Backup policy</h2><div className="mt-6 space-y-4 text-sm"><div className="flex items-center justify-between border-b border-border pb-4"><span className="text-muted-foreground">Backup format</span><span className="font-semibold">Excel workbook</span></div><div className="flex items-center justify-between border-b border-border pb-4"><span className="text-muted-foreground">Last action</span><span className="font-semibold">{backups?.[0] ? new Date(backups[0].createdAt).toLocaleDateString() : 'No backup yet'}</span></div><div className="flex items-center justify-between"><span className="text-muted-foreground">Access</span><span className="flex items-center gap-1.5 font-semibold text-[#2e5939]"><Check className="size-4" /> Administrator only</span></div></div></CardContent></Card></div><section className="mt-7"><h2 className="mb-4 font-display text-xl font-semibold">Backup history</h2>{isLoading ? <LoadingBlock label="Loading backup history" /> : isError ? <ErrorBlock onRetry={() => refetch()} /> : !backups?.length ? <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">Your backup history will appear here.</div> : <div className="overflow-x-auto rounded-2xl border border-border bg-card"><table className="w-full min-w-[600px] text-left"><thead className="bg-muted/45 text-[11px] uppercase tracking-wider text-muted-foreground"><tr><th className="px-5 py-4">File</th><th className="px-5 py-4">Type</th><th className="px-5 py-4">Records</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Created</th></tr></thead><tbody className="divide-y divide-border">{backups.map((backup) => <tr key={backup.id} data-testid={`row-backup-${backup.id}`}><td className="px-5 py-4 text-sm font-semibold">{backup.fileName}</td><td className="px-5 py-4 text-sm text-muted-foreground">{backup.type}</td><td className="px-5 py-4 font-mono text-sm">{backup.recordCount}</td><td className="px-5 py-4"><Badge variant={backup.status === 'Completed' ? 'secondary' : 'outline'}>{backup.status}</Badge></td><td className="px-5 py-4 text-xs text-muted-foreground">{new Date(backup.createdAt).toLocaleString()}</td></tr>)}</tbody></table></div>}</section></div>;
}

export function SettingsPage() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { data: user } = useGetCurrentUser();
  const updateUsername = useUpdateUsername();
  const updatePassword = useUpdatePassword();
  const logout = useLogout();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  const [username, setUsername] = useState({ currentPassword: '', newUsername: '', confirmNewUsername: '' });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const updateTheme = (value: 'light' | 'dark') => { setTheme(value); document.documentElement.classList.toggle('dark', value === 'dark'); localStorage.setItem('somali-disability-data-entry-theme', value); };
  const submitUsername = (event: React.FormEvent) => { event.preventDefault(); updateUsername.mutate({ data: username }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() }); setUsername({ currentPassword: '', newUsername: '', confirmNewUsername: '' }); toast.success('Username updated'); }, onError: () => toast.error('Could not update username.') }); };
  const submitPassword = (event: React.FormEvent) => { event.preventDefault(); if (password.newPassword !== password.confirmNewPassword) { toast.error('Passwords do not match.'); return; } updatePassword.mutate({ data: password }, { onSuccess: () => { setPassword({ currentPassword: '', newPassword: '', confirmNewPassword: '' }); toast.success('Password updated'); }, onError: () => toast.error('Could not update password.') }); };
  const signOut = () => logout.mutate(undefined, { onSuccess: () => setLocation('/login') });
  return <div className="animate-rise-in"><PageHeader eyebrow="Workspace controls" title="Settings" description="Manage how Somali Disability Data Entry looks and protect access to your registry." /><div className="grid gap-5 lg:grid-cols-2"><Card><CardContent className="p-6 sm:p-8"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-accent"><Settings2 className="size-5" /></span><div><h2 className="font-display text-xl font-semibold">System settings</h2><p className="text-sm text-muted-foreground">Your local workspace preferences</p></div></div><div className="mt-7"><p className="text-xs font-semibold">Theme</p><div className="mt-3 grid grid-cols-2 gap-3"><button onClick={() => updateTheme('light')} className={`flex items-center gap-3 rounded-xl border p-3 text-left ${theme === 'light' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border'}`} data-testid="button-theme-light"><Sun className="size-4" /><span className="text-sm font-semibold">Light</span></button><button onClick={() => updateTheme('dark')} className={`flex items-center gap-3 rounded-xl border p-3 text-left ${theme === 'dark' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border'}`} data-testid="button-theme-dark"><Moon className="size-4" /><span className="text-sm font-semibold">Dark</span></button></div></div><div className="mt-7 rounded-xl bg-muted/55 p-4 text-sm"><p className="font-semibold">Registry capacity</p><p className="mt-1 text-muted-foreground">Records are protected by your administrator session and can be exported from Data operations.</p></div></CardContent></Card><Card><CardContent className="p-6 sm:p-8"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-secondary"><UserCog className="size-5 text-primary" /></span><div><h2 className="font-display text-xl font-semibold">Administrator account</h2><p className="text-sm text-muted-foreground">Signed in as {user?.username ?? 'Administrator'}</p></div></div><form onSubmit={submitUsername} className="mt-6 space-y-3" data-testid="form-change-username"><p className="text-xs font-semibold">Change username</p><Input placeholder="Current password" type="password" value={username.currentPassword} onChange={(e) => setUsername({ ...username, currentPassword: e.target.value })} required data-testid="input-current-password-username" /><Input placeholder="New username" value={username.newUsername} onChange={(e) => setUsername({ ...username, newUsername: e.target.value })} required data-testid="input-new-username" /><Input placeholder="Confirm new username" value={username.confirmNewUsername} onChange={(e) => setUsername({ ...username, confirmNewUsername: e.target.value })} required data-testid="input-confirm-username" /><Button type="submit" variant="outline" disabled={updateUsername.isPending} data-testid="button-update-username">{updateUsername.isPending ? 'Updating…' : 'Update username'}</Button></form><form onSubmit={submitPassword} className="mt-8 space-y-3 border-t border-border pt-6" data-testid="form-change-password"><p className="text-xs font-semibold">Change password</p><Input placeholder="Current password" type="password" value={password.currentPassword} onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })} required data-testid="input-current-password" /><Input placeholder="New password · 8+ characters" type="password" minLength={8} value={password.newPassword} onChange={(e) => setPassword({ ...password, newPassword: e.target.value })} required data-testid="input-new-password" /><Input placeholder="Confirm new password" type="password" minLength={8} value={password.confirmNewPassword} onChange={(e) => setPassword({ ...password, confirmNewPassword: e.target.value })} required data-testid="input-confirm-password" /><Button type="submit" variant="outline" disabled={updatePassword.isPending} data-testid="button-update-password"><KeyRound className="mr-2 size-4" />{updatePassword.isPending ? 'Updating…' : 'Update password'}</Button></form><div className="mt-8 border-t border-border pt-6"><Button variant="ghost" className="text-destructive hover:text-destructive" onClick={signOut} data-testid="button-settings-logout"><LogOut className="mr-2 size-4" /> Sign out of this session</Button></div></CardContent></Card></div></div>;
}