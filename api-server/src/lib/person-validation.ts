import { CreatePersonBody } from "@workspace/api-zod";

export const GENDERS = ["Male", "Female", "Other"] as const;
export const MARITAL_STATUSES = ["Single", "Married", "Divorced", "Widowed", "Separated"] as const;
export const EDUCATION_LEVELS = ["No Formal Education", "Primary", "Secondary", "Diploma", "Bachelor's Degree", "Master's Degree", "PhD", "Vocational/Technical", "Other"] as const;
export const DISABILITY_TYPES = ["Physical", "Visual", "Hearing", "Intellectual", "Psychosocial", "Multiple", "Other"] as const;
export const CAUSES = ["Natural/Congenital", "Accident", "Landmine", "Explosion", "Bullet/Gunshot", "Other/Unknown"] as const;
export const BODY_STATUSES = ["No Amputation", "Double Hand", "Double Leg", "Single Hand Right", "Single Hand Left", "Single Leg Right", "Single Leg Left", "One Hand + One Leg"] as const;
export const SIDES = ["None", "Right", "Left", "Both"] as const;

export type PersonInput = {
  name: string;
  gender: string;
  age: number;
  maritalStatus: string;
  nationality: string;
  phone: string;
  address: string;
  city: string;
  education: string;
  disabilityType: string;
  causeOfDisability: string;
  amputeeBodyStatus: string;
  handSide: string;
  legSide: string;
  notes?: string;
};

export function validatePersonValues(input: PersonInput): string | null {
  if (!GENDERS.includes(input.gender as (typeof GENDERS)[number])) return "Gender must be Male, Female, or Other.";
  if (!MARITAL_STATUSES.includes(input.maritalStatus as (typeof MARITAL_STATUSES)[number])) return "Marital status is invalid.";
  if (!EDUCATION_LEVELS.includes(input.education as (typeof EDUCATION_LEVELS)[number])) return "Education value is invalid.";
  if (!DISABILITY_TYPES.includes(input.disabilityType as (typeof DISABILITY_TYPES)[number])) return "Disability type is invalid.";
  if (!CAUSES.includes(input.causeOfDisability as (typeof CAUSES)[number])) return "Cause of disability is invalid.";
  if (!BODY_STATUSES.includes(input.amputeeBodyStatus as (typeof BODY_STATUSES)[number])) return "Body status is invalid.";
  if (!SIDES.includes(input.handSide as (typeof SIDES)[number])) return "Hand side is invalid.";
  if (!SIDES.includes(input.legSide as (typeof SIDES)[number])) return "Leg side is invalid.";
  return null;
}

export function normalizedPersonInput(input: PersonInput): PersonInput {
  let handSide = input.handSide;
  let legSide = input.legSide;
  if (input.amputeeBodyStatus === "No Amputation") {
    handSide = "None";
    legSide = "None";
  } else if (input.amputeeBodyStatus === "Double Hand") {
    handSide = "Both";
  } else if (input.amputeeBodyStatus === "Double Leg") {
    legSide = "Both";
  } else if (input.amputeeBodyStatus === "Single Hand Right") {
    handSide = "Right";
  } else if (input.amputeeBodyStatus === "Single Hand Left") {
    handSide = "Left";
  } else if (input.amputeeBodyStatus === "Single Leg Right") {
    legSide = "Right";
  } else if (input.amputeeBodyStatus === "Single Leg Left") {
    legSide = "Left";
  }
  return {
    ...input,
    name: input.name.trim(),
    nationality: input.nationality.trim(),
    phone: input.phone.trim(),
    address: input.address.trim(),
    city: input.city.trim(),
    notes: input.notes ?? "",
    handSide,
    legSide,
  };
}