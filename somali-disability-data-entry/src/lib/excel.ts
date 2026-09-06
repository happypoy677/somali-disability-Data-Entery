import * as XLSX from 'xlsx';
import type { Person, PersonInput } from '@workspace/api-client-react';

export const EXCEL_HEADERS = [
  'No.',
  'Name',
  'Gender',
  'Age',
  'Marital Status',
  'Nationality',
  'Phone',
  'Address',
  'City',
  'Education',
  'Disability Type',
  'Cause of Disability',
  'Amputee / Body Status',
  'Hand Side',
  'Leg Side',
  'Notes',
] as const;

const key = (value: unknown) => String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');

const readCell = (row: Record<string, unknown>, ...names: string[]) => {
  const entries = Object.entries(row);
  const match = entries.find(([header]) => names.includes(key(header)));
  return String(match?.[1] ?? '').trim();
};

export function parseWorkbook(file: File): Promise<{ rows: Array<{ input: PersonInput; rowNumber: number; error?: string }>; totalRows: number }> {
  return file.arrayBuffer().then((buffer) => {
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
    const rows = rawRows.map((row, index) => ({
      rowNumber: index + 2,
      input: {
        name: readCell(row, 'name'),
        gender: readCell(row, 'gender'),
        age: Number(readCell(row, 'age')) || 0,
        maritalStatus: readCell(row, 'maritalstatus'),
        nationality: readCell(row, 'nationality'),
        phone: readCell(row, 'phone'),
        address: readCell(row, 'address'),
        city: readCell(row, 'city'),
        education: readCell(row, 'education'),
        disabilityType: readCell(row, 'disabilitytype'),
        causeOfDisability: readCell(row, 'causeofdisability'),
        amputeeBodyStatus: readCell(row, 'amputeebodystatus'),
        handSide: readCell(row, 'handside'),
        legSide: readCell(row, 'legside'),
        notes: readCell(row, 'notes'),
      },
    }));
    return { rows, totalRows: rows.length };
  });
}

export function validateImportedRow(input: PersonInput): string | undefined {
  const required: Array<[string, string]> = [
    ['Name', input.name],
    ['Gender', input.gender],
    ['Marital Status', input.maritalStatus],
    ['Nationality', input.nationality],
    ['Phone', input.phone],
    ['Address', input.address],
    ['City', input.city],
    ['Education', input.education],
    ['Disability Type', input.disabilityType],
    ['Cause of Disability', input.causeOfDisability],
    ['Amputee / Body Status', input.amputeeBodyStatus],
    ['Hand Side', input.handSide],
    ['Leg Side', input.legSide],
  ];
  const missing = required.find(([, value]) => !value);
  if (missing) return `${missing[0]} is required`;
  if (!Number.isInteger(input.age) || input.age < 0 || input.age > 130) return 'Age must be between 0 and 130';
  const accepted: Record<string, readonly string[]> = {
    gender: ['Male', 'Female', 'Other'],
    maritalStatus: ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'],
    education: ['No Formal Education', 'Primary', 'Secondary', 'Diploma', "Bachelor's Degree", "Master's Degree", 'PhD', 'Vocational/Technical', 'Other'],
    disabilityType: ['Physical', 'Visual', 'Hearing', 'Intellectual', 'Psychosocial', 'Multiple', 'Other'],
    causeOfDisability: ['Natural/Congenital', 'Accident', 'Landmine', 'Explosion', 'Bullet/Gunshot', 'Other/Unknown'],
    amputeeBodyStatus: ['No Amputation', 'Double Hand', 'Double Leg', 'Single Hand Right', 'Single Hand Left', 'Single Leg Right', 'Single Leg Left', 'One Hand + One Leg'],
    handSide: ['None', 'Right', 'Left', 'Both'],
    legSide: ['None', 'Right', 'Left', 'Both'],
  };
  for (const [field, values] of Object.entries(accepted)) {
    if (!values.includes(input[field as keyof PersonInput] as string)) return `${field} has an unsupported value`;
  }
  return undefined;
}

function createWorkbook(people: Person[]) {
  const rows = people.map((person) => ({
    'No.': person.no,
    Name: person.name,
    Gender: person.gender,
    Age: person.age,
    'Marital Status': person.maritalStatus,
    Nationality: person.nationality,
    Phone: person.phone,
    Address: person.address,
    City: person.city,
    Education: person.education,
    'Disability Type': person.disabilityType,
    'Cause of Disability': person.causeOfDisability,
    'Amputee / Body Status': person.amputeeBodyStatus,
    'Hand Side': person.handSide,
    'Leg Side': person.legSide,
    Notes: person.notes,
  }));
  const sheet = XLSX.utils.json_to_sheet(rows, { header: [...EXCEL_HEADERS] });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'People');
  return workbook;
}

export function downloadWorkbook(people: Person[], filename: string) {
  XLSX.writeFile(createWorkbook(people), filename);
}

export function workbookBase64(people: Person[]) {
  return XLSX.write(createWorkbook(people), { bookType: 'xlsx', type: 'base64' });
}