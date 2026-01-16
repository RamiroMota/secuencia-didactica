import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ImageRun,
  Header,
  Footer,
  VerticalAlign,
  ShadingType,
} from "docx"

// --- INTERFACES ---

interface Unidad {
  tema: string
  subtemas: Array<{
    subtema1: string
    subtema2: string
  }>
  objetivo: string
  actividades: Array<{
    actividad_inicio: string
    actividad_desarrollo: string
    actividad_cierre: string
  }>
  evidencia: string
  instrumento: string
}

interface CriterioBimestre {
  nombre: string
  criterios: Array<{
    criterio: string
    porcentaje: string
  }>
}

interface FormData {
  programa: string
  ciclo: string
  titulo: string
  semestre: string
  nombre: string
  perfil: string
  posgrado: string
  asignatura: string
  aprendizajes: string
  horas: string
  impacto: string
  competencia: string
  criterios: Array<{
    criterio: string
    porcentaje: string
  }>
  criterios_bimestre: CriterioBimestre[]
  contextualizacion: string
  unidades: Unidad[]
  actividades_finales: Array<{
    actividad_final: string
    criterios_finales: string
    instrumentos_finales: string
  }>
  nombre_firma: string
  correo_institucional: string
  firma_academia: string
  qr_nombre_firma?: string
  // NUEVOS CAMPOS PARA IMÁGENES DE ENCABEZADO Y PIE (Base64)
  logo_header?: string 
  logo_footer?: string
}

// --- CONSTANTES DE ESTILO ---

const FONT_FAMILY = "Montserrat" // Cambiado según tu diseño, asegúrate de que el usuario tenga la fuente o usa Arial como fallback
const TITLE_SIZE = 20
const SUBTITLE_SIZE = 20
const BODY_SIZE = 18

// Colores extraídos de MiDocumentoReplicado.tsx (sin el # para docx)
const COLORS = {
  ORANGE: "FF7F50",
  DARK_GRAY: "36454F",
  LIGHT_GRAY: "A9A9A9",
  BORDER_GRAY: "E5E4E2"
}

// --- UTILIDADES ---

const base64ToBuffer = (base64: string): Buffer => {
  const base64Data = base64.replace(/^data:image\/[a-z]+;base64,/, "")
  return Buffer.from(base64Data, "base64")
}

const shouldUseCriteriosBimestre = (formData: FormData): boolean => {
  if (formData.criterios_bimestre.length > 1) return true
  const primerBimestre = formData.criterios_bimestre[0]
  if (primerBimestre && primerBimestre.criterios.some((c) => c.criterio.trim() || c.porcentaje.trim())) return true
  if (formData.criterios.some((c) => c.criterio.trim() || c.porcentaje.trim())) return false
  return false
}

// --- GENERADOR ---

export const generateDocx = async (formData: FormData): Promise<Document> => {
  const usarCriteriosBimestre = shouldUseCriteriosBimestre(formData)

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT_FAMILY,
            size: BODY_SIZE,
            color: COLORS.DARK_GRAY, // Color de texto por defecto del diseño
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 8.5 * 1440,
              height: 11 * 1440,
            },
            margin: {
              top: 1440, // Margen para dar espacio al encabezado
              right: 1080,
              bottom: 1440, // Margen para dar espacio al pie
              left: 1080,
            },
          },
        },
        // --- AQUÍ IMPLEMENTAMOS EL ENCABEZADO ---
        headers: {
          default: new Header({
            children: [
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: { // Sin bordes visibles para simular layout
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                  insideHorizontal: { style: BorderStyle.NONE },
                  insideVertical: { style: BorderStyle.NONE },
                },
                rows: [
                  new TableRow({
                    children: [
                      // Celda 1: Logo
                      new TableCell({
                        width: { size: 15, type: WidthType.PERCENTAGE },
                        verticalAlign: VerticalAlign.CENTER,
                        children: [
                          formData.logo_header ? new Paragraph({
                            children: [
                              new ImageRun({
                                data: base64ToBuffer(formData.logo_header),
                                transformation: { width: 50, height: 50 },
                              }),
                            ],
                          }) : new Paragraph({}),
                        ],
                      }),
                      // Celda 2: Texto Universidad
                      new TableCell({
                        width: { size: 85, type: WidthType.PERCENTAGE },
                        verticalAlign: VerticalAlign.CENTER,
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "UNIVERSIDAD",
                                bold: true,
                                color: COLORS.ORANGE,
                                font: FONT_FAMILY,
                                size: 20, // ~10pt
                              }),
                            ],
                          }),
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "PABLO GUARDADO CHÁVEZ",
                                color: COLORS.DARK_GRAY,
                                font: FONT_FAMILY,
                                size: 24, // ~12pt
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              // Línea divisoria decorativa (simulando las formas naranjas)
              new Paragraph({
                border: { bottom: { style: BorderStyle.SINGLE, size: 20, color: COLORS.ORANGE } },
                spacing: { after: 400 }, // Espacio después del encabezado
                children: [],
              })
            ],
          }),
        },
        // --- AQUÍ IMPLEMENTAMOS EL PIE DE PÁGINA ---
        footers: {
          default: new Footer({
            children: [
              // Línea divisoria decorativa superior del footer
              new Paragraph({
                border: { top: { style: BorderStyle.SINGLE, size: 20, color: COLORS.ORANGE } },
                spacing: { before: 200, after: 200 },
                children: [],
              }),
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                  insideHorizontal: { style: BorderStyle.NONE },
                  insideVertical: { style: BorderStyle.NONE },
                },
                rows: [
                  new TableRow({
                    children: [
                      // Columna 1: Dirección
                      new TableCell({
                        width: { size: 40, type: WidthType.PERCENTAGE },
                        verticalAlign: VerticalAlign.CENTER,
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun({
                                text: "Libramiento Nte. Ote. 3450,",
                                size: 16, // 8pt
                                color: COLORS.DARK_GRAY,
                              }),
                            ],
                          }),
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun({
                                text: "Amp las Palmas, Tuxtla Gutiérrez, Chis.",
                                size: 16,
                                color: COLORS.DARK_GRAY,
                              }),
                            ],
                          }),
                        ],
                      }),
                      // Columna 2: Contacto
                      new TableCell({
                        width: { size: 40, type: WidthType.PERCENTAGE },
                        verticalAlign: VerticalAlign.CENTER,
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun({
                                text: "Dirección Académica y Administrativa",
                                bold: true,
                                size: 16,
                                color: COLORS.DARK_GRAY,
                              }),
                            ],
                          }),
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun({
                                text: "961 614 1112 Ext. 1070",
                                size: 16,
                                color: COLORS.DARK_GRAY,
                              }),
                            ],
                          }),
                        ],
                      }),
                      // Columna 3: Logo Pie
                      new TableCell({
                        width: { size: 20, type: WidthType.PERCENTAGE },
                        verticalAlign: VerticalAlign.CENTER,
                        children: [
                          formData.logo_footer ? new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [
                              new ImageRun({
                                data: base64ToBuffer(formData.logo_footer),
                                transformation: { width: 100, height: 35 },
                              }),
                            ],
                          }) : new Paragraph({}),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // Título principal (Resto del contenido original se mantiene igual)
          new Paragraph({
            children: [
              new TextRun({
                text: "SECUENCIA DIDÁCTICA",
                bold: true,
                size: TITLE_SIZE,
                font: FONT_FAMILY,
                color: COLORS.DARK_GRAY,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
          }),

          // Información General
          new Paragraph({
            children: [
              new TextRun({
                text: "INFORMACIÓN GENERAL",
                bold: true,
                size: TITLE_SIZE,
                font: FONT_FAMILY,
                color: COLORS.DARK_GRAY,
              }),
            ],
            spacing: { before: 400, after: 300 },
          }),

          // Tabla de información general (REUTILIZANDO TU CÓDIGO ORIGINAL, SOLO CAMBIE FUENTES/COLORES SI ES NECESARIO)
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
              insideVertical: { style: BorderStyle.SINGLE, size: 1 },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Programa educativo:",
                            bold: true,
                            size: BODY_SIZE,
                            font: FONT_FAMILY,
                          }),
                        ],
                      }),
                    ],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: formData.programa,
                            size: BODY_SIZE,
                            font: FONT_FAMILY,
                          }),
                        ],
                      }),
                    ],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Ciclo:",
                            bold: true,
                            size: BODY_SIZE,
                            font: FONT_FAMILY,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: formData.ciclo,
                            size: BODY_SIZE,
                            font: FONT_FAMILY,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Semestre:",
                            bold: true,
                            size: BODY_SIZE,
                            font: FONT_FAMILY,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: formData.semestre || "No especificado",
                            size: BODY_SIZE,
                            font: FONT_FAMILY,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // ... (El resto del código del cuerpo se mantiene exactamente igual, solo asegúrate de pasar FONT_FAMILY)
          // NOTA: Para abreviar la respuesta no repetí las 700 líneas de contenido del cuerpo, 
          // pero DEBES mantener todo lo que estaba dentro de 'children: []' después del header.
          
          // AQUÍ CONTINÚA TU CÓDIGO ORIGINAL DE 'Información del Docente', 'Unidades', etc.
          // Solo asegúrate de cerrar correctamente los corchetes al final.
          
          // --- EJEMPLO DE CIERRE ---
           new Paragraph({
            children: [
              new TextRun({
                text: "_".repeat(50),
                size: BODY_SIZE,
                font: FONT_FAMILY,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Firma del docente",
                size: BODY_SIZE,
                font: FONT_FAMILY,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
        ],
      },
    ],
  })

  return doc
}