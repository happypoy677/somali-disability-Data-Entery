import { useForm } from 'react-hook-form';
import type { Person, PersonInput } from '@workspace/api-client-react';
import { PersonAmputeeBodyStatus, PersonCauseOfDisability, PersonDisabilityType, PersonEducation, PersonGender, PersonHandSide, PersonLegSide, PersonMaritalStatus } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SelectField } from '@/components/app-shell';
import { Save } from 'lucide-react';

const values = {
  gender: Object.values(PersonGender),
  maritalStatus: Object.values(PersonMaritalStatus),
  education: Object.values(PersonEducation),
  disabilityType: Object.values(PersonDisabilityType),
  causeOfDisability: Object.values(PersonCauseOfDisability),
  amputeeBodyStatus: Object.values(PersonAmputeeBodyStatus),
  handSide: Object.values(PersonHandSide),
  legSide: Object.values(PersonLegSide),
};

export type PersonFormValues = PersonInput;

export function PersonForm({ person, onSubmit, submitting, submitLabel = 'Save record' }: { person?: Person; onSubmit: (data: PersonInput) => void; submitting?: boolean; submitLabel?: string }) {
  const form = useForm<PersonFormValues>({
    defaultValues: {
      name: person?.name ?? '', gender: person?.gender ?? '', age: person?.age ?? 0, maritalStatus: person?.maritalStatus ?? '',
      nationality: person?.nationality ?? 'Somali', phone: person?.phone ?? '', address: person?.address ?? '', city: person?.city ?? '',
      education: person?.education ?? '', disabilityType: person?.disabilityType ?? '', causeOfDisability: person?.causeOfDisability ?? '',
      amputeeBodyStatus: person?.amputeeBodyStatus ?? 'No Amputation', handSide: person?.handSide ?? 'None', legSide: person?.legSide ?? 'None', notes: person?.notes ?? '',
    },
  });
  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
  const select = (name: keyof PersonFormValues) => ({ value: String(watch(name) ?? ''), onChange: (value: string) => setValue(name, value as never) });
  return (
    <form onSubmit={handleSubmit((data) => onSubmit({ ...data, age: Number(data.age) }))} className="space-y-8" data-testid="form-person">
      <section>
        <SectionTitle number="01" title="Identity & contact" />
        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <label className="space-y-2 lg:col-span-2"><span className="text-xs font-semibold">Full name <em className="text-destructive">*</em></span><Input {...register('name', { required: 'Name is required' })} placeholder="Enter full name" data-testid="input-person-name" />{errors.name && <ErrorText text={errors.name.message} />}</label>
          <label className="space-y-2"><span className="text-xs font-semibold">Age <em className="text-destructive">*</em></span><Input type="number" min="0" max="130" {...register('age', { required: true, min: 0, max: 130, valueAsNumber: true })} data-testid="input-person-age" /></label>
          <SelectField label="Gender" {...select('gender')} options={values.gender} testId="select-person-gender" />
          <SelectField label="Marital status" {...select('maritalStatus')} options={values.maritalStatus} testId="select-person-marital-status" />
          <label className="space-y-2"><span className="text-xs font-semibold">Nationality</span><Input {...register('nationality', { required: true })} data-testid="input-person-nationality" /></label>
          <label className="space-y-2"><span className="text-xs font-semibold">Phone number</span><Input {...register('phone', { required: true })} placeholder="+252..." data-testid="input-person-phone" /></label>
          <label className="space-y-2 md:col-span-2"><span className="text-xs font-semibold">Address</span><Input {...register('address', { required: true })} placeholder="Village, district or street" data-testid="input-person-address" /></label>
          <label className="space-y-2"><span className="text-xs font-semibold">City / region</span><Input {...register('city', { required: true })} data-testid="input-person-city" /></label>
        </div>
      </section>
      <section className="border-t border-border pt-8">
        <SectionTitle number="02" title="Education & disability" />
        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <SelectField label="Education level" {...select('education')} options={values.education} testId="select-person-education" />
          <SelectField label="Disability type" {...select('disabilityType')} options={values.disabilityType} testId="select-person-disability-type" />
          <SelectField label="Cause of disability" {...select('causeOfDisability')} options={values.causeOfDisability} testId="select-person-cause" />
          <SelectField label="Amputee body status" {...select('amputeeBodyStatus')} options={values.amputeeBodyStatus} testId="select-person-amputee-status" />
          <SelectField label="Hand side" {...select('handSide')} options={values.handSide} testId="select-person-hand-side" />
          <SelectField label="Leg side" {...select('legSide')} options={values.legSide} testId="select-person-leg-side" />
          <label className="space-y-2 md:col-span-2 lg:col-span-3"><span className="text-xs font-semibold">Notes</span><Textarea {...register('notes')} placeholder="Add context useful to the programme team" className="min-h-24 resize-y" data-testid="textarea-person-notes" /></label>
        </div>
      </section>
      <div className="flex flex-col justify-end gap-3 border-t border-border pt-6 sm:flex-row">
        <Button type="submit" size="lg" disabled={submitting} data-testid="button-submit-person"><Save className="mr-2 size-4" />{submitting ? 'Saving record…' : submitLabel}</Button>
      </div>
    </form>
  );
}

function SectionTitle({ number, title }: { number: string; title: string }) {
  return <div className="flex items-center gap-3"><span className="font-mono text-xs font-bold text-primary">{number}</span><h2 className="font-display text-xl font-semibold">{title}</h2><span className="h-px flex-1 bg-border" /></div>;
}

function ErrorText({ text }: { text?: string }) { return <span className="text-xs text-destructive">{text ?? 'This field is required'}</span>; }