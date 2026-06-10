import { z } from "zod";

export const DIVISIONES = [
  "Dirección de división Salud",
  "Dirección de división de Medicina",
  "Dirección de división Profesionales",
] as const;

export type Division = (typeof DIVISIONES)[number];

export const CAREER_MAPPING: Record<Division, string[]> = {
  "Dirección de división Salud": [
    "Dirección de la Licenciatura en Nutrición",
    "Dirección de la Licenciatura en Cirujano Odontólogo",
    "Dirección de Psicología",
    "Dirección Químico Farmacobiólogo",
    "Dirección de la Licenciatura en Enfermería",
  ],
  "Dirección de división de Medicina": [
    "Dirección de Medicina",
  ],
  "Dirección de división Profesionales": [
    "Dirección del Área de Ciencias en Negocios",
    "Dirección de Ingeniería",
    "Dirección de LEFyP",
    "Dirección del Área de Idiomas",
    "Dirección de Derecho",
  ],
};

export type Career = string;

export const PROGRAM_MAPPING: Record<Career, string[]> = {
  "Dirección de la Licenciatura en Nutrición": ["Licenciatura en Nutrición (Escolarizada)"],
  "Dirección de la Licenciatura en Cirujano Odontólogo": ["Licenciatura en Cirujano odontólogo (Escolarizada)"],
  "Dirección de Psicología": [
    "Licenciatura en Psicología clínica (Escolarizada)",
    "Licenciatura en Psicología (Escolarizada)",
    "Licenciatura en Psicología (Mixto)",
  ],
  "Dirección Químico Farmacobiólogo": ["Licenciatura en Químico farmacobiólogo (Escolarizada)"],
  "Dirección de la Licenciatura en Enfermería": [
    "Licenciatura en Enfermería (Escolarizada)",
    "Licenciatura en Enfermería (Mixto)",
  ],
  "Dirección de Medicina": ["Licenciatura en Médico cirujano (Escolarizada)"],
  "Dirección del Área de Ciencias en Negocios": [
    "Licenciatura en Administración de empresas globales (Escolarizada)",
    "Licenciatura en Contaduría pública (Escolarizada)",
    "Licenciatura en Mercadotecnia y comunicación gráfica (Escolarizada)",
    "Licenciatura en Administración de empresas (Mixto)",
    "Licenciatura en Administración financiera y sistemas (Mixto)",
    "Licenciatura en Contaduría pública (Mixto)",
  ],
  "Dirección de Ingeniería": [
    "Licenciatura en Arquitectura (Escolarizada)",
    "Ingeniería en Animación y diseño de contenidos digitales (Escolarizada)",
  ],
  "Dirección de LEFyP": [
    "Licenciatura en Pedagogía (Escolarizada)",
    "Licenciatura en Educación física y deportiva (Escolarizada)",
    "Licenciatura en Educación física y deportiva (Mixto)",
  ],
  "Dirección del Área de Idiomas": ["Licenciatura en Inglés (Mixto)"],
  "Dirección de Derecho": [
    "Licenciatura en Derecho (Escolarizada)",
    "Licenciatura en Derecho (Mixto)",
  ],
};

export type Program = string;

export const sequenceSchema = z.object({
  division: z.enum(DIVISIONES),
  career: z.string().min(1, "La dirección de carrera es obligatoria"),
  program: z.string().min(1, "El programa educativo es obligatorio"),
  // Adding other potential fields for a "General Information" form, 
  // although not explicitly listed in the dropdown requirements, 
  // they are usually present. I'll stick to what was requested.
});

export type SequenceFormValues = z.infer<typeof sequenceSchema>;
