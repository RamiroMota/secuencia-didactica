import { z } from "zod";

export type Division =
  | "Dirección de división Salud"
  | "Dirección de división PB"
  | "Dirección de división de Medicina"
  | "Dirección de división Profesionales";

export type Carrera =
  | "Dirección de la Licenciatura en Nutrición"
  | "Dirección de la Licenciatura en PB"
  | "Dirección de la Licenciatura en Cirujano Odontólogo"
  | "Dirección de Psicología"
  | "Dirección Químico Farmacobiólogo"
  | "Dirección de la Licenciatura en Enfermería"
  | "Dirección de Medicina"
  | "Dirección del Área de Ciencias en Negocios"
  | "Dirección de Ingeniería"
  | "Dirección de LEFyP"
  | "Dirección de Derecho";

export const DIVISION_CARRERAS: Record<Division, Carrera[]> = {
  "Dirección de división Salud": [
    "Dirección de la Licenciatura en Nutrición",
    "Dirección de la Licenciatura en PB",
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
    "Dirección de Derecho",
  ],
};

export const CARRERA_PROGRAMAS: Record<Carrera, string[]> = {
  "Dirección de la Licenciatura en Nutrición": [
    "Licenciatura en Nutrición (Escolarizada)",
  ],
  "Dirección de la Licenciatura en PB": [
    "Licenciatura en PB (Escolarizada)",
  ],
  "Dirección de la Licenciatura en Cirujano Odontólogo": [
    "Licenciatura en Cirujano odontólogo (Escolarizada)",
  ],
  "Dirección de Psicología": [
    "Licenciatura en Psicología clínica (Escolarizada)",
    "Licenciatura en Psicología (Escolarizada)",
    "Licenciatura en Psicología (Mixto)",
  ],
  "Dirección Químico Farmacobiólogo": [
    "Licenciatura en Químico farmacobiólogo (Escolarizada)",
  ],
  "Dirección de la Licenciatura en Enfermería": [
    "Licenciatura en Enfermería (Escolarizada)",
    "Licenciatura en Enfermería (Mixto)",
  ],
  "Dirección de Medicina": [
    "Licenciatura en Médico cirujano (Escolarizada)",
  ],
  "Dirección del Área de Ciencias en Negocios": [
    "Licenciatura en Administración de empresas globales (Escolarizada)",
    "Licenciatura en Contaduría pública (Escolarizada)",
    "Licenciatura en Mercadotecnia y comunicación gráfica (Escolarizada)",
    "Licenciatura en Administración de empresas (Escolarizada)",
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
    "Licenciatura en Inglés (Mixto)",
    "Licenciatura en Enseñanza del Inglés (Escolarizada)",
    "Licenciatura en Ciencia de la Actividad Física y el Deporte (Escolarizada)",
    "Licenciatura en Ciencia de la Actividad Física y el Deporte (Mixto)",    
  ],
  "Dirección de Derecho": [
    "Licenciatura en Derecho (Escolarizada)",
    "Licenciatura en Derecho (Mixto)",
  ],
};

export const CARRERA_EMAILS: Record<Carrera, string[]> = {
  "Dirección de la Licenciatura en Nutrición": ["direccion.nutricion@upgch.edu.mx"],
  "Dirección de la Licenciatura en PB": ["indicadores.daa@upgch.edu.mx"],
  "Dirección de la Licenciatura en Cirujano Odontólogo": ["direccion.lco@upgch.edu.mx"],
  "Dirección de Psicología": ["direccion.psico@upgch.edu.mx"],
  "Dirección Químico Farmacobiólogo": ["director.qfb@upgch.edu.mx"],
  "Dirección de la Licenciatura en Enfermería": ["direccion.enfria@upgch.edu.mx"],
  "Dirección de Medicina": ["direccion.lmc@upgch.edu.mx", "coordacademicayadistancia.lmc@upgch.edu.mx"],
  "Dirección del Área de Ciencias en Negocios": ["direccion.negocios@upgch.edu.mx"],
  "Dirección de Ingeniería": ["direccion.ingenierias@upgch.edu.mx"],
  "Dirección de LEFyP": ["direccion.educativas@upgch.edu.mx"],
  "Dirección de Derecho": ["direccion.derecho@upgch.edu.mx"],
};

const UnidadSchema = z.object({
  tema: z.string().optional(),
  subtemas: z.array(z.object({
    subtema1: z.string().optional(),
    subtema2: z.string().optional(),
  })),
  objetivo: z.string().optional(),
  actividades: z.array(z.object({
    actividad_inicio: z.string().optional(),
    actividad_desarrollo: z.string().optional(),
    actividad_cierre: z.string().optional(),
  })),
  evidencia: z.string().optional(),
  instrumento: z.string().optional(),
});

const CriterioBimestreSchema = z.object({
  nombre: z.string().optional(),
  criterios: z.array(z.object({
    criterio: z.string().optional(),
    porcentaje: z.string().optional(),
  })),
});

export const sequenceFormSchema = z.object({
  division: z.string({ required_error: "La dirección de división es requerida" }),
  carrera: z.string({ required_error: "La dirección de carrera es requerida" }),
  programa: z.string({ required_error: "El programa educativo es requerido" }),
  ciclo: z.string({ required_error: "El ciclo es requerido" }),
  titulo: z.string().min(1, "El nombre del archivo es requerido"),
  semestre: z.string({ required_error: "El semestre es requerido" }),

  nombre: z.string().min(1, "El nombre del docente es requerido"),
  perfil: z.string().optional(),
  posgrado: z.string().optional(),

  asignatura: z.string().min(1, "La asignatura es requerida"),
  aprendizajes: z.string().optional(),
  horas: z.string().min(1, "Las horas son requeridas"),
  impacto: z.string().optional(),
  competencia: z.string().optional(),

  criterios: z.array(z.object({
    criterio: z.string().optional(),
    porcentaje: z.string().optional(),
  })),
  criterios_bimestre: z.array(CriterioBimestreSchema),
  contextualizacion: z.string().optional(),
  unidades: z.array(UnidadSchema),
  actividades_finales: z.array(z.object({
    actividad_final: z.string().optional(),
    criterios_finales: z.string().optional(),
    instrumentos_finales: z.string().optional(),
  })),
  nombre_firma: z.string().optional(),
  correo_institucional: z.string().min(1, "El correo institucional es requerido").email("El formato del correo electrónico no es válido"),
  firma_academia: z.string().optional(),
});

