"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  DIVISION_CARRERAS,
  CARRERA_PROGRAMAS,
  type Division,
  type Carrera,
} from "./lib/academic-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Save,
  FileText,
  User,
  GraduationCap,
  Target,
  CheckCircle,
  TrendingUp,
  PenTool,
  FileEdit,
  Fingerprint,
  Plus,
  Minus,
  BookOpen,
  Clock,
  Trash2,
  AlertCircle,
} from "lucide-react";
import QRCode from "qrcode";
import LoadingModal from "@/components/ui/loading-modal";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

interface Unidad {
  tema: string;
  subtemas: Array<{
    subtema1: string;
    subtema2: string;
  }>;
  objetivo: string;
  actividades: Array<{
    actividad_inicio: string;
    actividad_desarrollo: string;
    actividad_cierre: string;
  }>;
  evidencia: string;
  instrumento: string;
}

interface CriterioBimestre {
  nombre: string;
  criterios: Array<{
    criterio: string;
    porcentaje: string;
  }>;
}

interface FormData {
  // Información General
  division: string;
  carrera: string;
  programa: string;
  ciclo: string;
  titulo: string;
  semestre: string;

  // Información del Docente
  nombre: string;
  perfil: string;
  posgrado: string;

  // Información Académica
  asignatura: string;
  aprendizajes: string;
  horas: string;
  impacto: string;
  competencia: string;

  // Criterios de Evaluación (dinámicos)
  criterios: Array<{
    criterio: string;
    porcentaje: string;
  }>;

  // Criterios por Bimestre (nuevo)
  criterios_bimestre: CriterioBimestre[];

  // Contenido del Curso
  contextualizacion: string;

  // Unidades dinámicas
  unidades: Unidad[];
  actividades_finales: Array<{
    actividad_final: string;
    criterios_finales: string;
    instrumentos_finales: string;
  }>;

  // Firmas
  nombre_firma: string;
  correo_institucional: string;
  firma_academia: string;
  
  // QR Code
  qr_nombre_firma?: string;
}

interface StoredFormData {
  data: FormData;
  timestamp: number;
}

const initialUnidad: Unidad = {
  tema: "",
  subtemas: [
    { subtema1: "", subtema2: "" },
    { subtema1: "", subtema2: "" },
  ],
  objetivo: "",
  actividades: [
    { actividad_inicio: "", actividad_desarrollo: "", actividad_cierre: "" },
    { actividad_inicio: "", actividad_desarrollo: "", actividad_cierre: "" },
    { actividad_inicio: "", actividad_desarrollo: "", actividad_cierre: "" },
  ],
  evidencia: "",
  instrumento: "",
};

const initialFormData: FormData = {
  division: "",
  carrera: "",
  programa: "",
  ciclo: "",
  titulo: "",
  semestre: "",
  nombre: "",
  perfil: "",
  posgrado: "",
  asignatura: "",
  aprendizajes: "",
  horas: "",
  impacto: "",
  competencia: "",
  criterios: [
    { criterio: "", porcentaje: "" },
    { criterio: "", porcentaje: "" },
    { criterio: "", porcentaje: "" },
    { criterio: "", porcentaje: "" },
  ],
  criterios_bimestre: [
    {
      nombre: "1er Bimestre",
      criterios: [
        { criterio: "", porcentaje: "" },
        { criterio: "", porcentaje: "" },
        { criterio: "", porcentaje: "" },
        { criterio: "", porcentaje: "" },
      ],
    },
  ],
  contextualizacion: "",
  unidades: [{ ...initialUnidad }],
  actividades_finales: [
    { actividad_final: "", criterios_finales: "", instrumentos_finales: "" },
  ],
  nombre_firma: "",
  correo_institucional: "", // Nuevo campo
  firma_academia: "",
};

const programas = [
  "Licenciatura en Administración de empresas globales (Escolarizada)",
  "Licenciatura en Contaduría pública (Escolarizada)",
  "Licenciatura en Mercadotecnia y comunicación gráfica (Escolarizada)",
  "Licenciatura en Administración de empresas (Mixto)",
  "Licenciatura en Administración financiera y sistemas (Mixto)",
  "Licenciatura en Contaduría pública (Mixto)",
  "Licenciatura en Derecho (Escolarizada)",
  "Licenciatura en Derecho (Mixto)",
  "Licenciatura en Pedagogía (Escolarizada)",
  "Licenciatura en Educación física y deportiva (Escolarizada)",
  "Licenciatura en Educación física y deportiva (Mixto)",
  "Licenciatura en Enfermería (Escolarizada)",
  "Licenciatura en Enfermería (Mixto)",
  "Licenciatura en Arquitectura (Escolarizada)",
  "Ingeniería en Animación y diseño de contenidos digitales (Escolarizada)",
  "Licenciatura en Inglés (Mixto)",
  "Licenciatura en Nutrición (Escolarizada)",
  "Licenciatura en Psicología clínica (Escolarizada)",
  "Licenciatura en Psicología (Escolarizada)",
  "Licenciatura en Psicología (Mixto)",
  "Licenciatura en Químico farmacobiólogo (Escolarizada)",
  "Licenciatura en Médico cirujano (Escolarizada)",
  "Licenciatura en Cirujano odontólogo (Escolarizada)",
];

const ciclos = ["FJ-2626"];

const semestre = [
  "1er. Semestre",
  "2do. Semestre",
  "3er. Semestre",
  "4to. Semestre",
  "5to. Semestre",
  "6to. Semestre",
  "7mo. Semestre",
  "8vo. Semestre",
];

// Constantes para localStorage
const STORAGE_KEY = "secuencia-didactica-form";
const STORAGE_EXPIRY_HOURS = 1;
const STORAGE_EXPIRY_MS = STORAGE_EXPIRY_HOURS * 60 * 60 * 1000; // 1 hora en milisegundos

const generalInfoSchema = z.object({
  division: z.string().min(1, "La dirección de división es requerida"),
  carrera: z.string().min(1, "La dirección de carrera es requerida"),
  programa: z.string().min(1, "El programa educativo es requerido"),
  ciclo: z.string().min(1, "El ciclo es requerido"),
  titulo: z.string().min(1, "El nombre del archivo es requerido"),
  semestre: z.string().min(1, "El semestre es requerido"),
});

export default function CreateSequenceModule() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrNombreFirma, setQrNombreFirma] = useState<string>("");
  const [qrFirmaAcademia, setQrFirmaAcademia] = useState<string>("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [hasStoredData, setHasStoredData] = useState(false);
  const [storageInfo, setStorageInfo] = useState<{
    savedAt: Date;
    expiresAt: Date;
  } | null>(null);
  const [criteriosMode, setCriteriosMode] = useState<"generales" | "bimestre">(
    "generales"
  );
  const [isCriteriaValid, setIsCriteriaValid] = useState(false);
  const [showCriteriaModal, setShowCriteriaModal] = useState(false);

  // Initialize React Hook Form
  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors: hookErrors },
  } = useForm({
    resolver: zodResolver(generalInfoSchema),
    defaultValues: {
      division: formData.division,
      carrera: formData.carrera,
      programa: formData.programa,
      ciclo: formData.ciclo,
      titulo: formData.titulo,
      semestre: formData.semestre,
    },
  });

  const watchedDivision = watch("division");
  const watchedCarrera = watch("carrera");
  const watchedPrograma = watch("programa");
  const watchedCiclo = watch("ciclo");
  const watchedTitulo = watch("titulo");
  const watchedSemestre = watch("semestre");

  const availableCarreras = watchedDivision
    ? DIVISION_CARRERAS[watchedDivision as Division] || []
    : [];
  const availableProgramas = watchedCarrera
    ? CARRERA_PROGRAMAS[watchedCarrera as Carrera] || []
    : [];

  // Keep react-hook-form values in sync with local storage load/reset
  useEffect(() => {
    setValue("division", formData.division || "");
    setValue("carrera", formData.carrera || "");
    setValue("programa", formData.programa || "");
    setValue("ciclo", formData.ciclo || "");
    setValue("titulo", formData.titulo || "");
    setValue("semestre", formData.semestre || "");
  }, [
    formData.division,
    formData.carrera,
    formData.programa,
    formData.ciclo,
    formData.titulo,
    formData.semestre,
    setValue,
  ]);

  // Handle nested reactive state updates
  useEffect(() => {
    if (watchedDivision && watchedDivision !== formData.division) {
      setValue("carrera", "");
      setValue("programa", "");
      setFormData((prev) => ({
        ...prev,
        division: watchedDivision,
        carrera: "",
        programa: "",
      }));
    }
  }, [watchedDivision, setValue, formData.division]);

  useEffect(() => {
    if (watchedCarrera && watchedCarrera !== formData.carrera) {
      setValue("programa", "");
      setFormData((prev) => ({
        ...prev,
        carrera: watchedCarrera,
        programa: "",
      }));
    }
  }, [watchedCarrera, setValue, formData.carrera]);

  // Sync general changes to main formData state
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      division: watchedDivision || "",
      carrera: watchedCarrera || "",
      programa: watchedPrograma || "",
      ciclo: watchedCiclo || "",
      titulo: watchedTitulo || "",
      semestre: watchedSemestre || "",
    }));
  }, [
    watchedDivision,
    watchedCarrera,
    watchedPrograma,
    watchedCiclo,
    watchedTitulo,
    watchedSemestre,
  ]);

  // Función para guardar datos en localStorage
  const saveToStorage = useCallback((data: FormData) => {
    if (typeof window === "undefined") return;

    try {
      const storageData: StoredFormData = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));

      const savedAt = new Date();
      const expiresAt = new Date(savedAt.getTime() + STORAGE_EXPIRY_MS);
      setStorageInfo({ savedAt, expiresAt });
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, []);

  // Función para cargar datos desde localStorage
  const loadFromStorage = useCallback((): FormData | null => {
    if (typeof window === "undefined") return null;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const storageData: StoredFormData = JSON.parse(stored);
      const now = Date.now();
      const isExpired = now - storageData.timestamp > STORAGE_EXPIRY_MS;

      if (isExpired) {
        localStorage.removeItem(STORAGE_KEY);
        setStorageInfo(null);
        return null;
      }

      const savedAt = new Date(storageData.timestamp);
      const expiresAt = new Date(storageData.timestamp + STORAGE_EXPIRY_MS);
      setStorageInfo({ savedAt, expiresAt });
      setHasStoredData(true);

      return storageData.data;
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }, []);

  // Función para limpiar datos del localStorage
  const clearStorage = useCallback(() => {
    if (typeof window === "undefined") return;

    localStorage.removeItem(STORAGE_KEY);
    setHasStoredData(false);
    setStorageInfo(null);
  }, []);

  // Función para restaurar datos guardados
  const restoreStoredData = useCallback(() => {
    const storedData = loadFromStorage();
    if (storedData) {
      setFormData(storedData);
      setHasStoredData(false); // Ocultar el mensaje después de restaurar
    }
  }, [loadFromStorage]);

  // Efecto para cargar datos al montar el componente
  useEffect(() => {
    setIsMounted(true);

    // Cargar datos guardados si existen y no han expirado
    const storedData = loadFromStorage();
    if (storedData) {
      // No cargar automáticamente, solo mostrar la opción
      setHasStoredData(true);
    }
  }, [loadFromStorage]);

  // Efecto para guardar datos automáticamente cuando cambian
  useEffect(() => {
    if (!isMounted) return;

    // Verificar si hay datos significativos antes de guardar
    const hasSignificantData =
      formData.titulo.trim() ||
      formData.programa ||
      formData.nombre.trim() ||
      formData.asignatura.trim() ||
      formData.aprendizajes.trim() ||
      formData.contextualizacion.trim();

    if (hasSignificantData) {
      // Debounce para evitar guardar en cada keystroke
      const timeoutId = setTimeout(() => {
        saveToStorage(formData);
      }, 1000); // Guardar después de 1 segundo de inactividad

      return () => clearTimeout(timeoutId);
    }
  }, [formData, isMounted, saveToStorage]);

  const generateQRCode = async (text: string): Promise<string> => {
    try {
      if (!text.trim()) return "";
      const qrDataURL = await QRCode.toDataURL(text, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      return qrDataURL;
    } catch (error) {
      console.error("Error generating QR code:", error);
      return "";
    }
  };

  const handleCriterioChange = (
    index: number,
    field: "criterio" | "porcentaje",
    value: string
  ) => {
    const newCriterios = [...formData.criterios];
    newCriterios[index][field] = value;
    setFormData((prev) => ({ ...prev, criterios: newCriterios }));
    setIsCriteriaValid(false);

    if (errors.porcentajes) {
      setErrors((prev) => ({ ...prev, porcentajes: "" }));
    }
  };

  const addCriterio = () => {
    if (formData.criterios.length < 4) {
      setFormData((prev) => ({
        ...prev,
        criterios: [...prev.criterios, { criterio: "", porcentaje: "" }],
      }));
      setIsCriteriaValid(false);
    }
  };

  const removeCriterio = (index: number) => {
    if (formData.criterios.length > 4) {
      const newCriterios = formData.criterios.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, criterios: newCriterios }));
      setIsCriteriaValid(false);
    }
  };

  const handleCriterioBimestreChange = (
    bimestreIndex: number,
    criterioIndex: number,
    field: "criterio" | "porcentaje",
    value: string
  ) => {
    const newCriteriosBimestre = [...formData.criterios_bimestre];
    newCriteriosBimestre[bimestreIndex].criterios[criterioIndex][field] = value;
    setFormData((prev) => ({
      ...prev,
      criterios_bimestre: newCriteriosBimestre,
    }));
    setIsCriteriaValid(false);
  };

  const handleNombreBimestreChange = (bimestreIndex: number, value: string) => {
    const newCriteriosBimestre = [...formData.criterios_bimestre];
    newCriteriosBimestre[bimestreIndex].nombre = value;
    setFormData((prev) => ({
      ...prev,
      criterios_bimestre: newCriteriosBimestre,
    }));
  };

  const addCriterioBimestre = (bimestreIndex: number) => {
    const newCriteriosBimestre = [...formData.criterios_bimestre];
    if (newCriteriosBimestre[bimestreIndex].criterios.length < 4) {
      newCriteriosBimestre[bimestreIndex].criterios.push({
        criterio: "",
        porcentaje: "",
      });
      setFormData((prev) => ({
        ...prev,
        criterios_bimestre: newCriteriosBimestre,
      }));
      setIsCriteriaValid(false);
    }
  };

  const removeCriterioBimestre = (
    bimestreIndex: number,
    criterioIndex: number
  ) => {
    const newCriteriosBimestre = [...formData.criterios_bimestre];
    if (newCriteriosBimestre[bimestreIndex].criterios.length > 4) {
      newCriteriosBimestre[bimestreIndex].criterios = newCriteriosBimestre[
        bimestreIndex
      ].criterios.filter((_, i) => i !== criterioIndex);
      setFormData((prev) => ({
        ...prev,
        criterios_bimestre: newCriteriosBimestre,
      }));
      setIsCriteriaValid(false);
    }
  };

  const switchToBimestreMode = () => {
    setCriteriosMode("bimestre");
    setIsCriteriaValid(false);
    setFormData((prev) => ({
      ...prev,
      criterios_bimestre: [
        {
          nombre: "1er Bimestre",
          criterios: [
            { criterio: "", porcentaje: "" },
            { criterio: "", porcentaje: "" },
            { criterio: "", porcentaje: "" },
            { criterio: "", porcentaje: "" },
          ],
        },
        {
          nombre: "2do Bimestre",
          criterios: [
            { criterio: "", porcentaje: "" },
            { criterio: "", porcentaje: "" },
            { criterio: "", porcentaje: "" },
            { criterio: "", porcentaje: "" },
          ],
        },
        {
          nombre: "3er Bimestre",
          criterios: [
            { criterio: "", porcentaje: "" },
            { criterio: "", porcentaje: "" },
            { criterio: "", porcentaje: "" },
            { criterio: "", porcentaje: "" },
          ],
        },
      ],
    }));
  };

  const handleUnidadChange = (
    unidadIndex: number,
    field: keyof Unidad,
    value: string
  ) => {
    const newUnidades = [...formData.unidades];
    newUnidades[unidadIndex] = { ...newUnidades[unidadIndex], [field]: value };
    setFormData((prev) => ({ ...prev, unidades: newUnidades }));
  };

  const handleSubtemaChange = (
    unidadIndex: number,
    subtemaIndex: number,
    field: "subtema1" | "subtema2",
    value: string
  ) => {
    const newUnidades = [...formData.unidades];
    const newSubtemas = [...newUnidades[unidadIndex].subtemas];
    newSubtemas[subtemaIndex][field] = value;
    newUnidades[unidadIndex] = {
      ...newUnidades[unidadIndex],
      subtemas: newSubtemas,
    };
    setFormData((prev) => ({ ...prev, unidades: newUnidades }));
  };

  const addSubtema = (unidadIndex: number) => {
    const newUnidades = [...formData.unidades];
    if (newUnidades[unidadIndex].subtemas.length < 10) {
      newUnidades[unidadIndex] = {
        ...newUnidades[unidadIndex],
        subtemas: [
          ...newUnidades[unidadIndex].subtemas,
          { subtema1: "", subtema2: "" },
        ],
      };
      setFormData((prev) => ({ ...prev, unidades: newUnidades }));
    }
  };

  const removeSubtema = (unidadIndex: number, subtemaIndex: number) => {
    const newUnidades = [...formData.unidades];
    if (newUnidades[unidadIndex].subtemas.length > 2) {
      newUnidades[unidadIndex] = {
        ...newUnidades[unidadIndex],
        subtemas: newUnidades[unidadIndex].subtemas.filter(
          (_, i) => i !== subtemaIndex
        ),
      };
      setFormData((prev) => ({ ...prev, unidades: newUnidades }));
    }
  };

  const addUnidad = () => {
    if (formData.unidades.length < 6) {
      setFormData((prev) => ({
        ...prev,
        unidades: [
          ...prev.unidades,
          {
            tema: "",
            subtemas: [
              { subtema1: "", subtema2: "" },
              { subtema1: "", subtema2: "" },
            ],
            objetivo: "",
            actividades: [
              { actividad_inicio: "", actividad_desarrollo: "", actividad_cierre: "" },
              { actividad_inicio: "", actividad_desarrollo: "", actividad_cierre: "" },
              { actividad_inicio: "", actividad_desarrollo: "", actividad_cierre: "" },
            ],
            evidencia: "",
            instrumento: "",
          },
        ],
      }));
    }
  };

  const removeUnidad = (index: number) => {
    if (formData.unidades.length > 1) {
      const newUnidades = formData.unidades.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, unidades: newUnidades }));
    }
  };

  const handleInputChange = async (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Generar QR codes para los campos de firma con todos los datos
    if (field === "nombre_firma" || field === "firma_academia") {
      const fechaEnvio = new Date().toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const qrData = [
        `Docente: ${formData.nombre}`,
        `Ciclo: ${formData.ciclo}`,
        `Asignatura: ${formData.asignatura}`,
        `Fecha de envío: ${fechaEnvio}`,
      ].join("\n");

      const qr = await generateQRCode(qrData);
      if (field === "nombre_firma") {
        setQrNombreFirma(qr);
      } else {
        setQrFirmaAcademia(qr);
      }
    }
  };

  const validateCriteria = () => {
    let isValid = true;

    if (criteriosMode === "generales") {
      const criteriaCount = formData.criterios.length;
      const filledCriteria = formData.criterios.filter(
        (c) => c.criterio.trim() !== "" && c.porcentaje.trim() !== ""
      );

      if (criteriaCount < 4 || filledCriteria.length < 4) {
        isValid = false;
      }

      const totalPorcentaje = formData.criterios.reduce((sum, criterio) => {
        return sum + (Number.parseInt(criterio.porcentaje) || 0);
      }, 0);

      if (totalPorcentaje !== 100) {
        isValid = false;
      }
    } else {
      formData.criterios_bimestre.forEach((bimestre) => {
        const criteriaCount = bimestre.criterios.length;
        const filledCriteria = bimestre.criterios.filter(
          (c) => c.criterio.trim() !== "" && c.porcentaje.trim() !== ""
        );

        if (criteriaCount < 4 || filledCriteria.length < 4) {
          isValid = false;
        }

        const totalPorcentajeBimestre = bimestre.criterios.reduce(
          (sum, criterio) => {
            return sum + (Number.parseInt(criterio.porcentaje) || 0);
          },
          0
        );

        if (totalPorcentajeBimestre !== 100) {
          isValid = false;
        }
      });
    }

    if (!isValid) {
      setShowCriteriaModal(true);
      setIsCriteriaValid(false);
    } else {
      setIsCriteriaValid(true);
      toast.success("Criterios validados correctamente. Puede continuar.");
    }

    return isValid;
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validaciones básicas
    if (!formData.division) newErrors.division = "La dirección de división es requerida";
    if (!formData.carrera) newErrors.carrera = "La dirección de carrera es requerida";
    if (!formData.titulo.trim()) newErrors.titulo = "El título es requerido";
    if (!formData.programa) newErrors.programa = "El programa es requerido";
    if (!formData.ciclo) newErrors.ciclo = "El ciclo es requerido";
    if (!formData.nombre.trim())
      newErrors.nombre = "El nombre del docente es requerido";
    if (!formData.asignatura.trim())
      newErrors.asignatura = "La asignatura es requerida";
    if (!formData.horas.trim()) newErrors.horas = "Las horas son requeridas";
    if (!formData.correo_institucional.trim())
      newErrors.correo_institucional = "El correo institucional es requerido";

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      formData.correo_institucional &&
      !emailRegex.test(formData.correo_institucional)
    ) {
      newErrors.correo_institucional =
        "El formato del correo electrónico no es válido";
    }

    // Validar que haya 4 criterios y estén llenos
    if (criteriosMode === "generales") {
      const criteriaCount = formData.criterios.length;
      const filledCriteria = formData.criterios.filter(
        (c) => c.criterio.trim() !== "" && c.porcentaje.trim() !== ""
      );

      if (criteriaCount < 4 || filledCriteria.length < 4) {
        toast.error(
          "Es obligatorio rellenar los 4 criterios con sus respectivos porcentajes en Criterios Generales"
        );
        newErrors.criterios_generales = "Se requieren 4 criterios completos";
      }

      const totalPorcentaje = formData.criterios.reduce((sum, criterio) => {
        return sum + (Number.parseInt(criterio.porcentaje) || 0);
      }, 0);

      if (totalPorcentaje !== 100) {
        newErrors.porcentajes =
          "Los porcentajes de los criterios generales deben sumar 100%";
      }
    } else {
      formData.criterios_bimestre.forEach((bimestre, index) => {
        const criteriaCount = bimestre.criterios.length;
        const filledCriteria = bimestre.criterios.filter(
          (c) => c.criterio.trim() !== "" && c.porcentaje.trim() !== ""
        );

        if (criteriaCount < 4 || filledCriteria.length < 4) {
          toast.error(
            `Es obligatorio rellenar los 4 criterios con sus respectivos porcentajes en ${bimestre.nombre}`
          );
          newErrors[
            `criterios_bimestre_${index}`
          ] = `Se requieren 4 criterios completos en ${bimestre.nombre}`;
        }

        const totalPorcentajeBimestre = bimestre.criterios.reduce(
          (sum, criterio) => {
            return sum + (Number.parseInt(criterio.porcentaje) || 0);
          },
          0
        );

        if (totalPorcentajeBimestre !== 100) {
          newErrors[
            `porcentajes_bimestre_${index}`
          ] = `Los porcentajes para ${bimestre.nombre} deben sumar 100%`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setShowErrors(true);
      return;
    }

    setShowErrors(false);
    setIsSubmitting(true);

    // Generar QR con los datos completos
    const fechaEnvio = new Date().toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const qrData = [
      `Docente: ${formData.nombre}`,
      `Ciclo: ${formData.ciclo}`,
      `Asignatura: ${formData.asignatura}`,
      `Fecha de envío: ${fechaEnvio}`,
    ].join("\n");

    const qrGenerated = await generateQRCode(qrData);

    const loadingToastId = toast.loading("Generando documento DOCX y enviando por correo electrónico a tu director de carrera... Por favor, espera.");

    try {
      const dataToSend = {
        ...formData,
        qr_nombre_firma: qrGenerated,
      };

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("¡Documento generado y enviado a tu director de carrera satisfactoriamente!", { id: loadingToastId });
        setSubmitSuccess(true);
        clearStorage();
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        console.error("Error al enviar email:", result.message);
        toast.error(`Error al enviar la secuencia: ${result.message || "Error desconocido"}`, { id: loadingToastId });
      }
    } catch (error) {
      console.error("Error al generar o enviar documento:", error);
      toast.error("Ocurrió un error inesperado al generar el documento o enviar el correo.", { id: loadingToastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const volverACriteriosGenerales = () => {
    setCriteriosMode("generales");
    setIsCriteriaValid(false);
    // Resetear criterios por bimestre al estado inicial
    setFormData((prev) => ({
      ...prev,
      criterios_bimestre: [
        {
          nombre: "1er Bimestre",
          criterios: [
            { criterio: "", porcentaje: "" },
            { criterio: "", porcentaje: "" },
          ],
        },
      ],
    }));
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setErrors({});
    setSubmitSuccess(false);
    setQrNombreFirma("");
    setQrFirmaAcademia("");
    setCriteriosMode("generales"); // Resetear el modo
    setIsCriteriaValid(false);
    clearStorage(); // Limpiar datos guardados al resetear
    // Resetear campos de react-hook-form
    setValue("division", "");
    setValue("carrera", "");
    setValue("programa", "");
    setValue("ciclo", "");
    setValue("titulo", "");
    setValue("semestre", "");
  };

  const handleActividadChange = (
    unidadIndex: number,
    actividadIndex: number,
    field: "actividad_inicio" | "actividad_desarrollo" | "actividad_cierre",
    value: string
  ) => {
    const newUnidades = [...formData.unidades];
    const newActividades = [...newUnidades[unidadIndex].actividades];
    newActividades[actividadIndex][field] = value;
    newUnidades[unidadIndex] = {
      ...newUnidades[unidadIndex],
      actividades: newActividades,
    };
    setFormData((prev) => ({ ...prev, unidades: newUnidades }));
  };

  const addActividad = (unidadIndex: number) => {
    const newUnidades = [...formData.unidades];
    if (newUnidades[unidadIndex].actividades.length < 5) {
      newUnidades[unidadIndex] = {
        ...newUnidades[unidadIndex],
        actividades: [
          ...newUnidades[unidadIndex].actividades,
          {
            actividad_inicio: "",
            actividad_desarrollo: "",
            actividad_cierre: "",
          },
        ],
      };
      setFormData((prev) => ({ ...prev, unidades: newUnidades }));
    }
  };

  const removeActividad = (unidadIndex: number, actividadIndex: number) => {
    const newUnidades = [...formData.unidades];
    if (newUnidades[unidadIndex].actividades.length > 3) {
      newUnidades[unidadIndex] = {
        ...newUnidades[unidadIndex],
        actividades: newUnidades[unidadIndex].actividades.filter(
          (_, i) => i !== actividadIndex
        ),
      };
      setFormData((prev) => ({ ...prev, unidades: newUnidades }));
    }
  };

  const handleActividadFinalChange = (
    index: number,
    field: "actividad_final" | "criterios_finales" | "instrumentos_finales",
    value: string
  ) => {
    const newActividades = [...formData.actividades_finales];
    newActividades[index][field] = value;
    setFormData((prev) => ({ ...prev, actividades_finales: newActividades }));
  };

  const addActividadFinal = () => {
    if (formData.actividades_finales.length < 3) {
      setFormData((prev) => ({
        ...prev,
        actividades_finales: [
          ...prev.actividades_finales,
          {
            actividad_final: "",
            criterios_finales: "",
            instrumentos_finales: "",
          },
        ],
      }));
    }
  };

  const removeActividadFinal = (index: number) => {
    if (formData.actividades_finales.length > 1) {
      const newActividades = formData.actividades_finales.filter(
        (_, i) => i !== index
      );
      setFormData((prev) => ({ ...prev, actividades_finales: newActividades }));
    }
  };

  if (!isMounted) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto p-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Crear Secuencia Didáctica
          </h2>
          <p className="text-gray-600 mt-2">Cargando formulario...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 max-w-6xl mx-auto p-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Crear Secuencia Didáctica
          </h2>
          <p className="text-gray-600 mt-2">
            Completa el formato para crear una nueva secuencia didáctica
          </p>
          <p className="text-blue-600 font-bold mt-2">
            Nota: Escriba utilizando mayúsculas y minúsculas de manera correcta
            en todo el formato.
          </p>
        </div>

        {/* Alerta de datos guardados */}
        {hasStoredData && (
          <Alert className="bg-blue-50 border-blue-200">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    Se encontraron datos guardados anteriormente
                  </p>
                  {storageInfo && (
                    <p className="text-sm text-blue-600 mt-1">
                      Guardado: {storageInfo.savedAt.toLocaleString()} | Expira:{" "}
                      {storageInfo.expiresAt.toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    type="button"
                    size="sm"
                    onClick={restoreStoredData}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Restaurar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      clearStorage();
                      setHasStoredData(false);
                    }}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Descartar
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Información de guardado automático */}
        {storageInfo && !hasStoredData && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">
                    Datos guardados automáticamente | Expira:{" "}
                    {storageInfo.expiresAt.toLocaleString()}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={clearStorage}
                  className="border-green-300 text-green-700 hover:bg-green-50 bg-transparent"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Limpiar
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {submitSuccess && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ¡Documento generado y enviado a tu director de carrera satisfactoriamente! 
              El archivo DOCX ha sido generado con el membrete institucional y enviado 
              por correo electrónico para su revisión.
            </AlertDescription>
          </Alert>
        )}

        {isSubmitting && <LoadingModal />}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información General */}
          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Información General
              </CardTitle>
              <CardDescription>
                Datos básicos de la secuencia didáctica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Nivel 1: Dirección de división */}
                <div className="space-y-2">
                  <Label htmlFor="division">Dirección de división *</Label>
                  <Controller
                    name="division"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(val) => {
                          field.onChange(val);
                        }}
                      >
                        <SelectTrigger
                          id="division"
                          className={errors.division ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Selecciona división" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dirección de división Salud">
                            Dirección de división Salud
                          </SelectItem>
                          <SelectItem value="Dirección de división de Medicina">
                            Dirección de división de Medicina
                          </SelectItem>
                          <SelectItem value="Dirección de división Profesionales">
                            Dirección de división Profesionales
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.division && (
                    <p className="text-sm text-red-500">{errors.division}</p>
                  )}
                </div>

                {/* Nivel 2: Dirección de carrera */}
                <div className="space-y-2">
                  <Label htmlFor="carrera">Dirección de carrera *</Label>
                  <Controller
                    name="carrera"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(val) => {
                          field.onChange(val);
                        }}
                        disabled={!watchedDivision}
                      >
                        <SelectTrigger
                          id="carrera"
                          className={errors.carrera ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Selecciona carrera" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCarreras.map((carrera) => (
                            <SelectItem key={carrera} value={carrera}>
                              {carrera}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.carrera && (
                    <p className="text-sm text-red-500">{errors.carrera}</p>
                  )}
                </div>

                {/* Nivel 3: Programa educativo */}
                <div className="space-y-2">
                  <Label htmlFor="programa">Programa educativo *</Label>
                  <Controller
                    name="programa"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(val) => {
                          field.onChange(val);
                        }}
                        disabled={!watchedCarrera}
                      >
                        <SelectTrigger
                          id="programa"
                          className={errors.programa ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Selecciona programa" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableProgramas.map((prog) => (
                            <SelectItem key={prog} value={prog}>
                              {prog}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.programa && (
                    <p className="text-sm text-red-500">{errors.programa}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ciclo">Ciclo *</Label>
                  <Controller
                    name="ciclo"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(val) => {
                          field.onChange(val);
                        }}
                      >
                        <SelectTrigger
                          id="ciclo"
                          className={errors.ciclo ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Selecciona un ciclo" />
                        </SelectTrigger>
                        <SelectContent>
                          {ciclos.map((cic) => (
                            <SelectItem key={cic} value={cic}>
                              {cic}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.ciclo && (
                    <p className="text-sm text-red-500">{errors.ciclo}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="titulo">Nombre del archivo *</Label>
                  <Controller
                    name="titulo"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="titulo"
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                        }}
                        placeholder="Ej: Secuencia-didactica-matemáticas-2025"
                        className={errors.titulo ? "border-red-500" : ""}
                      />
                    )}
                  />
                  {errors.titulo && (
                    <p className="text-sm text-red-500">{errors.titulo}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="semestre">Semestre *</Label>
                  <Controller
                    name="semestre"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(val) => {
                          field.onChange(val);
                        }}
                      >
                        <SelectTrigger
                          id="semestre"
                          className={errors.semestre ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Selecciona un semestre" />
                        </SelectTrigger>
                        <SelectContent>
                          {semestre.map((sem) => (
                            <SelectItem key={sem} value={sem}>
                              {sem}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.semestre && (
                    <p className="text-sm text-red-500">{errors.semestre}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información del Docente */}
          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Información del Docente
              </CardTitle>
              <CardDescription>Datos del docente responsable</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre completo del docente *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) =>
                      handleInputChange("nombre", e.target.value)
                    }
                    placeholder="Nombre completo del docente"
                    className={errors.nombre ? "border-red-500" : ""}
                  />
                  {errors.nombre && (
                    <p className="text-sm text-red-500">{errors.nombre}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="perfil">
                    Perfil Académico o Licenciatura cursada
                  </Label>
                  <Input
                    id="perfil"
                    value={formData.perfil}
                    onChange={(e) =>
                      handleInputChange("perfil", e.target.value)
                    }
                    placeholder="Ej: Licenciatura en Educación"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="posgrado">Posgrado cursado</Label>
                <Input
                  id="posgrado"
                  value={formData.posgrado}
                  onChange={(e) =>
                    handleInputChange("posgrado", e.target.value)
                  }
                  placeholder="Ej: Doctorado en Ciencias de la Educación"
                />
              </div>
            </CardContent>
          </Card>

          {/* Información Académica */}
          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="h-5 w-5" />
                Información Académica
              </CardTitle>
              <CardDescription>
                Detalles académicos de la secuencia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="asignatura">Asignatura *</Label>
                  <Input
                    id="asignatura"
                    value={formData.asignatura}
                    onChange={(e) =>
                      handleInputChange("asignatura", e.target.value)
                    }
                    placeholder="Nombre de la asignatura"
                    className={errors.asignatura ? "border-red-500" : ""}
                  />
                  {errors.asignatura && (
                    <p className="text-sm text-red-500">{errors.asignatura}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horas">Total de horas en el semestre *</Label>
                  <Input
                    id="horas"
                    type="number"
                    value={formData.horas}
                    onChange={(e) => handleInputChange("horas", e.target.value)}
                    placeholder="Número de horas"
                    className={errors.horas ? "border-red-500" : ""}
                  />
                  {errors.horas && (
                    <p className="text-sm text-red-500">{errors.horas}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aprendizajes">Aprendizajes Esperados</Label>
                <Textarea
                  id="aprendizajes"
                  value={formData.aprendizajes}
                  onChange={(e) =>
                    handleInputChange("aprendizajes", e.target.value)
                  }
                  placeholder="Describe los aprendizajes esperados..."
                  className="min-h-[80px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="impacto">Impacto en el perfil de egreso</Label>
                <Textarea
                  id="impacto"
                  value={formData.impacto}
                  onChange={(e) => handleInputChange("impacto", e.target.value)}
                  placeholder="Describe el impacto esperado..."
                  className="min-h-[80px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="competencia">Competencia sello</Label>
                <Textarea
                  id="competencia"
                  value={formData.competencia}
                  onChange={(e) =>
                    handleInputChange("competencia", e.target.value)
                  }
                  placeholder="Describe las competencias a desarrollar..."
                  className="min-h-[80px] resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Criterios de Evaluación */}
          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="h-5 w-5" />
                Criterios de Evaluación
              </CardTitle>
              <CardDescription>
                Los criterios de evaluación deben sumar 100%, considerando que
                en correspondencia al modelo educativo el examen escrito debe de
                valer maximo 50%
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {criteriosMode === "generales" ? (
                // Criterios Generales
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-base flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Criterios Generales
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={switchToBimestreMode}
                      className="flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                    >
                      <Plus className="h-4 w-4" />
                      Cambiar a Criterios por Bimestre
                    </Button>
                  </div>

                  {errors.porcentajes && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.porcentajes}</AlertDescription>
                    </Alert>
                  )}

                  {formData.criterios.map((criterio, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50"
                    >
                      <div className="space-y-2">
                        <Label htmlFor={`criterio-${index}`}>
                          Criterio {index + 1}
                        </Label>
                        <Input
                          id={`criterio-${index}`}
                          value={criterio.criterio}
                          onChange={(e) =>
                            handleCriterioChange(
                              index,
                              "criterio",
                              e.target.value
                            )
                          }
                          placeholder={`Ej: ${
                            index === 0 ? "Evaluación continua" : "Examen final"
                          }`}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`porcentaje-${index}`}>
                            Porcentaje {index + 1} (%)
                          </Label>
                          {formData.criterios.length > 2 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeCriterio(index)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <Input
                          id={`porcentaje-${index}`}
                          type="number"
                          min="0"
                          max="100"
                          value={criterio.porcentaje}
                          onChange={(e) =>
                            handleCriterioChange(
                              index,
                              "porcentaje",
                              e.target.value
                            )
                          }
                          placeholder={index === 0 ? "50" : "50"}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-gray-600">
                      Total:{" "}
                      {formData.criterios.reduce(
                        (sum, criterio) =>
                          sum + (Number.parseInt(criterio.porcentaje) || 0),
                        0
                      )}
                      %
                    </div>

                    {formData.criterios.length < 4 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addCriterio}
                        className="flex items-center gap-2 bg-transparent"
                      >
                        <Plus className="h-4 w-4" />
                        Agregar Criterio
                      </Button>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 mt-2">
                    Son obligatorios 4 criterios con sus respectivos porcentajes
                  </div>
                </div>
              ) : (
                // Criterios por Bimestre
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-base flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Criterios por Bimestre
                    </h4>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={volverACriteriosGenerales}
                        className="flex items-center gap-2 bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                      >
                        <Target className="h-4 w-4" />
                        Volver a Criterios Generales
                      </Button>
                    </div>
                  </div>

                  {formData.criterios_bimestre.map(
                    (bimestre, bimestreIndex) => (
                      <Card
                        key={bimestreIndex}
                        className="border-l-4 border-l-green-500"
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="space-y-2 flex-1">
                              <Label
                                htmlFor={`nombre-bimestre-${bimestreIndex}`}
                              >
                                Nombre del Bimestre
                              </Label>
                              <Input
                                id={`nombre-bimestre-${bimestreIndex}`}
                                value={bimestre.nombre}
                                onChange={(e) =>
                                  handleNombreBimestreChange(
                                    bimestreIndex,
                                    e.target.value
                                  )
                                }
                                placeholder={`${bimestreIndex + 1}er Bimestre`}
                                className="max-w-xs"
                              />
                            </div>
                            {formData.criterios_bimestre.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  removeBloqueBimestre(bimestreIndex)
                                }
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Minus className="h-4 w-4 mr-1" />
                                Eliminar Bimestre
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {showErrors &&
                            errors[`porcentajes_bimestre_${bimestreIndex}`] && (
                              <Alert variant="destructive" className="mb-4">
                                <AlertDescription>
                                  {
                                    errors[
                                      `porcentajes_bimestre_${bimestreIndex}`
                                    ]
                                  }
                                </AlertDescription>
                              </Alert>
                            )}
                          {bimestre.criterios.map((criterio, criterioIndex) => (
                            <div
                              key={criterioIndex}
                              className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-green-50"
                            >
                              <div className="space-y-2">
                                <Label
                                  htmlFor={`criterio-bimestre-${bimestreIndex}-${criterioIndex}`}
                                >
                                  Criterio {criterioIndex + 1}
                                </Label>
                                <Input
                                  id={`criterio-bimestre-${bimestreIndex}-${criterioIndex}`}
                                  value={criterio.criterio}
                                  onChange={(e) =>
                                    handleCriterioBimestreChange(
                                      bimestreIndex,
                                      criterioIndex,
                                      "criterio",
                                      e.target.value
                                    )
                                  }
                                  placeholder={`Ej: ${
                                    criterioIndex === 0
                                      ? "Tareas"
                                      : "Examen parcial"
                                  }`}
                                />
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label
                                    htmlFor={`porcentaje-bimestre-${bimestreIndex}-${criterioIndex}`}
                                  >
                                    Porcentaje {criterioIndex + 1} (%)
                                  </Label>
                                  {bimestre.criterios.length > 2 && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        removeCriterioBimestre(
                                          bimestreIndex,
                                          criterioIndex
                                        )
                                      }
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                                <Input
                                  id={`porcentaje-bimestre-${bimestreIndex}-${criterioIndex}`}
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={criterio.porcentaje}
                                  onChange={(e) =>
                                    handleCriterioBimestreChange(
                                      bimestreIndex,
                                      criterioIndex,
                                      "porcentaje",
                                      e.target.value
                                    )
                                  }
                                  placeholder={
                                    criterioIndex === 0 ? "50" : "50"
                                  }
                                />
                              </div>
                            </div>
                          ))}

                          <div className="flex items-center justify-between pt-4">
                            <div className="text-sm text-gray-600">
                              Total {bimestre.nombre}:{" "}
                              {bimestre.criterios.reduce(
                                (sum, criterio) =>
                                  sum +
                                  (Number.parseInt(criterio.porcentaje) || 0),
                                0
                              )}
                              %
                            </div>

                            {bimestre.criterios.length < 4 && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  addCriterioBimestre(bimestreIndex)
                                }
                                className="flex items-center gap-2 bg-transparent"
                              >
                                <Plus className="h-4 w-4" />
                                Agregar Criterio
                              </Button>
                            )}
                          </div>

                          <div className="text-xs text-gray-500 mt-2">
                            Son obligatorios 4 criterios con sus respectivos
                            porcentajes por bimestre
                          </div>
                        </CardContent>
                      </Card>
                    )
                  )}

                  <div className="text-xs text-gray-500 text-center">
                    Mínimo 1 bimestre, máximo 3 bimestres. Actualmente:{" "}
                    {formData.criterios_bimestre.length} bimestre(s)
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t">
                <Button
                  type="button"
                  onClick={validateCriteria}
                  className={`${
                    isCriteriaValid
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white flex items-center gap-2 transition-colors`}
                >
                  {isCriteriaValid ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Criterios Validados
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Validar Criterios y Continuar
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Modal de Alerta */}
          <AlertDialog
            open={showCriteriaModal}
            onOpenChange={setShowCriteriaModal}
          >
            <AlertDialogContent className="bg-white">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Falta llenar un campo
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600">
                  Por favor, complete satisfactoriamente el proceso de los
                  criterios (deben ser 4 criterios y sumar 100%) antes de
                  continuar al siguiente módulo.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white">
                  Entendido
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Secciones siguientes bloqueadas hasta validar criterios */}
          {isCriteriaValid && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
              {/* Contenido del Curso */}
              <Card className="shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5" />
                    Contenido del Curso
                  </CardTitle>
                  <CardDescription>
                    Estructura y contenido de la secuencia didáctica
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contextualizacion">
                      Contextualización de la asignatura
                    </Label>
                    <Textarea
                      id="contextualizacion"
                      value={formData.contextualizacion}
                      onChange={(e) =>
                        handleInputChange("contextualizacion", e.target.value)
                      }
                      placeholder="Contextualización del curso..."
                      className="min-h-[80px] resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Unidades Dinámicas */}
              {formData.unidades.map((unidad, unidadIndex) => (
                <Card
                  key={unidadIndex}
                  className="shadow-2xl border-l-4 border-l-blue-500"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <BookOpen className="h-5 w-5" />
                        Unidad {unidadIndex + 1}
                      </CardTitle>
                      {formData.unidades.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeUnidad(unidadIndex)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Minus className="h-4 w-4 mr-1" />
                          Eliminar Unidad
                        </Button>
                      )}
                    </div>
                    <CardDescription>
                      Contenido y actividades de la unidad {unidadIndex + 1}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Tema de la Unidad */}
                    <div className="space-y-2">
                      <Label htmlFor={`tema-${unidadIndex}`}>
                        Tema Principal
                      </Label>
                      <Input
                        id={`tema-${unidadIndex}`}
                        value={unidad.tema}
                        onChange={(e) =>
                          handleUnidadChange(
                            unidadIndex,
                            "tema",
                            e.target.value
                          )
                        }
                        placeholder="Tema principal de la unidad"
                      />
                    </div>

                    {/* Subtemas */}
                    <div className="space-y-4">
                      <Label>Subtemas</Label>
                      {unidad.subtemas.map((subtema, subtemaIndex) => (
                        <div
                          key={subtemaIndex}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50"
                        >
                          <div className="space-y-2">
                            <Label
                              htmlFor={`subtema1-${unidadIndex}-${subtemaIndex}`}
                            >
                              Subtema {subtemaIndex * 2 + 1}
                            </Label>
                            <Input
                              id={`subtema1-${unidadIndex}-${subtemaIndex}`}
                              value={subtema.subtema1}
                              onChange={(e) =>
                                handleSubtemaChange(
                                  unidadIndex,
                                  subtemaIndex,
                                  "subtema1",
                                  e.target.value
                                )
                              }
                              placeholder={`Subtema ${subtemaIndex * 2 + 1}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label
                                htmlFor={`subtema2-${unidadIndex}-${subtemaIndex}`}
                              >
                                Subtema {subtemaIndex * 2 + 2}
                              </Label>
                              {unidad.subtemas.length > 2 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    removeSubtema(unidadIndex, subtemaIndex)
                                  }
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <Input
                              id={`subtema2-${unidadIndex}-${subtemaIndex}`}
                              value={subtema.subtema2}
                              onChange={(e) =>
                                handleSubtemaChange(
                                  unidadIndex,
                                  subtemaIndex,
                                  "subtema2",
                                  e.target.value
                                )
                              }
                              placeholder={`Subtema ${subtemaIndex * 2 + 2}`}
                            />
                          </div>
                        </div>
                      ))}

                      <div className="flex items-center justify-between pt-2">
                        <div className="text-sm text-gray-600">
                          Total de subtemas: {unidad.subtemas.length * 2}
                        </div>
                        {unidad.subtemas.length < 5 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => addSubtema(unidadIndex)}
                            className="flex items-center gap-2 bg-transparent"
                          >
                            <Plus className="h-4 w-4" />
                            Agregar Subtemas
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Objetivo */}
                    <div className="space-y-2">
                      <Label htmlFor={`objetivo-${unidadIndex}`}>
                        Objetivo
                      </Label>
                      <Textarea
                        id={`objetivo-${unidadIndex}`}
                        value={unidad.objetivo}
                        onChange={(e) =>
                          handleUnidadChange(
                            unidadIndex,
                            "objetivo",
                            e.target.value
                          )
                        }
                        placeholder="Objetivo de la unidad..."
                        className="min-h-[80px] resize-none"
                      />
                    </div>

                    <Separator />

                    {/* Actividades */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Actividades
                      </h4>
                      {unidad.actividades.map((actividad, actividadIndex) => (
                        <div
                          key={actividadIndex}
                          className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50"
                        >
                          <div className="space-y-2">
                            <Label
                              htmlFor={`actividad_inicio-${unidadIndex}-${actividadIndex}`}
                            >
                              Actividad de Inicio {actividadIndex + 1}
                            </Label>
                            <Input
                              id={`actividad_inicio-${unidadIndex}-${actividadIndex}`}
                              value={actividad.actividad_inicio}
                              onChange={(e) =>
                                handleActividadChange(
                                  unidadIndex,
                                  actividadIndex,
                                  "actividad_inicio",
                                  e.target.value
                                )
                              }
                              placeholder="Describe la actividad de inicio..."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor={`actividad_desarrollo-${unidadIndex}-${actividadIndex}`}
                            >
                              Actividad de Desarrollo {actividadIndex + 1}
                            </Label>
                            <Input
                              id={`actividad_desarrollo-${unidadIndex}-${actividadIndex}`}
                              value={actividad.actividad_desarrollo}
                              onChange={(e) =>
                                handleActividadChange(
                                  unidadIndex,
                                  actividadIndex,
                                  "actividad_desarrollo",
                                  e.target.value
                                )
                              }
                              placeholder="Describe la actividad de desarrollo..."
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label
                                htmlFor={`actividad_cierre-${unidadIndex}-${actividadIndex}`}
                              >
                                Actividad de Cierre {actividadIndex + 1}
                              </Label>
                              {unidad.actividades.length > 3 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    removeActividad(unidadIndex, actividadIndex)
                                  }
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <Input
                              id={`actividad_cierre-${unidadIndex}-${actividadIndex}`}
                              value={actividad.actividad_cierre}
                              onChange={(e) =>
                                handleActividadChange(
                                  unidadIndex,
                                  actividadIndex,
                                  "actividad_cierre",
                                  e.target.value
                                )
                              }
                              placeholder="Describe la actividad de cierre..."
                            />
                          </div>
                        </div>
                      ))}

                      <div className="flex items-center justify-between pt-2">
                        <div className="text-sm text-gray-600">
                          Total de actividades: {unidad.actividades.length}
                        </div>
                        {unidad.actividades.length < 5 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => addActividad(unidadIndex)}
                            className="flex items-center gap-2 bg-transparent"
                          >
                            <Plus className="h-4 w-4" />
                            Agregar Actividad
                          </Button>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Mínimo 3 actividades, máximo 5 actividades
                      </div>
                    </div>

                    <Separator />

                    {/* Evaluación */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg flex items-center gap-2">
                        <PenTool className="h-4 w-4" />
                        Evaluación
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`evidencia-${unidadIndex}`}>
                            Evidencia de aprendizaje
                          </Label>
                          <Textarea
                            id={`evidencia-${unidadIndex}`}
                            value={unidad.evidencia}
                            onChange={(e) =>
                              handleUnidadChange(
                                unidadIndex,
                                "evidencia",
                                e.target.value
                              )
                            }
                            placeholder="Describe las evidencias de aprendizaje..."
                            className="min-h-[80px] resize-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`instrumento-${unidadIndex}`}>
                            Instrumento de evaluación
                          </Label>
                          <Textarea
                            id={`instrumento-${unidadIndex}`}
                            value={unidad.instrumento}
                            onChange={(e) =>
                              handleUnidadChange(
                                unidadIndex,
                                "instrumento",
                                e.target.value
                              )
                            }
                            placeholder="Describe los instrumentos de evaluación..."
                            className="min-h-[80px] resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Botón para agregar unidades */}
              <div className="flex justify-center">
                {formData.unidades.length < 6 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addUnidad}
                    className="flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar Nueva Unidad
                  </Button>
                )}
              </div>

              <div className="text-xs text-gray-500 text-center">
                Mínimo 1 unidad, máximo 6 unidades. Actualmente:{" "}
                {formData.unidades.length} unidad(es)
              </div>

              {/* Actividad Final */}
              <Card className="shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileEdit className="h-5 w-5" />
                    Actividad Final y Evaluación
                  </CardTitle>
                  <CardDescription>
                    Actividades finales y criterios de evaluación general
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.actividades_finales.map((actividad, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50"
                    >
                      <div className="space-y-2">
                        <Label htmlFor={`actividad_final-${index}`}>
                          Actividad final {index + 1}
                        </Label>
                        <Input
                          id={`actividad_final-${index}`}
                          value={actividad.actividad_final}
                          onChange={(e) =>
                            handleActividadFinalChange(
                              index,
                              "actividad_final",
                              e.target.value
                            )
                          }
                          placeholder="Describe la actividad final..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`criterios_finales-${index}`}>
                          Criterios {index + 1}
                        </Label>
                        <Input
                          id={`criterios_finales-${index}`}
                          value={actividad.criterios_finales}
                          onChange={(e) =>
                            handleActividadFinalChange(
                              index,
                              "criterios_finales",
                              e.target.value
                            )
                          }
                          placeholder="Describe los criterios..."
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`instrumentos_finales-${index}`}>
                            Instrumentos {index + 1}
                          </Label>
                          {formData.actividades_finales.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeActividadFinal(index)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <Input
                          id={`instrumentos_finales-${index}`}
                          value={actividad.instrumentos_finales}
                          onChange={(e) =>
                            handleActividadFinalChange(
                              index,
                              "instrumentos_finales",
                              e.target.value
                            )
                          }
                          placeholder="Describe los instrumentos..."
                        />
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-gray-600">
                      Total de actividades finales:{" "}
                      {formData.actividades_finales.length}
                    </div>
                    {formData.actividades_finales.length < 3 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addActividadFinal}
                        className="flex items-center gap-2 bg-transparent"
                      >
                        <Plus className="h-4 w-4" />
                        Agregar Actividad Final
                      </Button>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Mínimo 1 actividad final, máximo 3 actividades finales
                  </div>
                </CardContent>
              </Card>

              {/* Firmas y Validaciones */}
              <Card className="shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Fingerprint className="h-5 w-5" />
                    Firmas y Validaciones
                  </CardTitle>
                  <CardDescription>
                    Información de firmas digitales y contacto
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombre y Firma */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombre_firma">
                          Nombre y firma del docente
                        </Label>
                        <Input
                          id="nombre_firma"
                          value={formData.nombre_firma}
                          onChange={(e) =>
                            handleInputChange("nombre_firma", e.target.value)
                          }
                          placeholder="Escribe tu nombre completo"
                        />
                      </div>
                      {isMounted && qrNombreFirma && (
                        <div className="flex flex-col items-center space-y-2">
                          <p className="text-sm text-gray-600">
                            Código QR - Firma Personal
                          </p>
                          <img
                            src={qrNombreFirma || "/placeholder.svg"}
                            alt="QR Code Nombre y Firma"
                            className="border rounded-lg shadow-sm"
                            suppressHydrationWarning
                          />
                        </div>
                      )}
                    </div>

                    {/* Correo Institucional */}
                    <div className="space-y-2">
                      <Label htmlFor="correo_institucional">
                        Correo institucional *
                      </Label>
                      <Input
                        id="correo_institucional"
                        type="email"
                        value={formData.correo_institucional}
                        onChange={(e) =>
                          handleInputChange(
                            "correo_institucional",
                            e.target.value
                          )
                        }
                        placeholder="ejemplo@upgch.mx"
                        className={
                          errors.correo_institucional ? "border-red-500" : ""
                        }
                      />
                      {errors.correo_institucional && (
                        <p className="text-sm text-red-500">
                          {errors.correo_institucional}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Este correo se utilizará para notificaciones sobre el
                        estado de la secuencia didáctica y para recibir las
                        respectivas observaciones de su secuencia didactica.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Botones de Acción */}
              {showErrors && Object.keys(errors).length > 0 && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>
                    <p className="font-bold">
                      Por favor, corrige los siguientes errores:
                    </p>
                    <ul className="list-disc pl-5">
                      {Object.values(errors).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              <p className="text-sm font-bold text-blue-600">
                Nota: Al hacer clic en Guardar y Enviar Secuencia, el documento
                será generado y enviado directamente por correo electrónico a la
                Dirección de Carrera correspondiente para su revisión. La descarga
                local ha sido deshabilitada.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none sm:min-w-[200px]"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting
                    ? "Generando y enviando..."
                    : "Guardar y Enviar Secuencia"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1 sm:flex-none sm:min-w-[150px] border border-gray-300 bg-transparent"
                >
                  Limpiar Formulario
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
      <Toaster />
    </>
  );
}