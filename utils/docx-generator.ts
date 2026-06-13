import fs from "fs"
import path from "path"
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
  HorizontalPositionRelativeFrom,
  HorizontalPositionAlign,
  VerticalPositionRelativeFrom,
  VerticalPositionAlign,
  TextWrappingType,
} from "docx"

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
  division: string
  carrera: string
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
}

const FONT_FAMILY = "Arial"
const TITLE_SIZE = 28 // 14 pts
const SUBTITLE_SIZE = 24 // 12 pts
const BODY_SIZE = 22 // 11 pts

// Escape XML special characters to prevent document corruption
const escapeXml = (text: string | undefined | null): string => {
  if (!text) return ""
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

const base64ToBuffer = (base64: string): Buffer => {
  const base64Data = base64.replace(/^data:image\/[a-z]+;base64,/, "")
  return Buffer.from(base64Data, "base64")
}

const shouldUseCriteriosBimestre = (formData: FormData): boolean => {
  if (formData.criterios_bimestre.length > 1) return true;
  const primerBimestre = formData.criterios_bimestre[0];
  if (primerBimestre && primerBimestre.criterios.some((c) => c.criterio.trim() || c.porcentaje.trim())) return true;
  if (formData.criterios.some((c) => c.criterio.trim() || c.porcentaje.trim())) return false;
  return false;
}

const createModuleTable = (rows: { label: string, value: string }[]) => {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      ...rows.map(row => new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: escapeXml(row.label), bold: true })] })],
          }),
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun(escapeXml(row.value))] })],
          }),
        ],
      })),
    ],
  });
};

const createSubtitle = (text: string) => {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: SUBTITLE_SIZE })],
    spacing: { before: 200, after: 100 },
  });
};

// Dimensiones estándar de página Letter en puntos (pt)
const PAGE_WIDTH = 792;  // 8.5 pulgadas * 72 pt
const PAGE_HEIGHT = 1121; // 11 pulgadas * 72 pt

export const generateDocx = async (formData: FormData): Promise<Document> => {
  const usarCriteriosBimestre = shouldUseCriteriosBimestre(formData)

  let imageBuffer: Buffer | null = null;
  try {
    const imgPath = path.join(process.cwd(), "public", "Membrete Secuencia.png");
    imageBuffer = fs.readFileSync(imgPath);
  } catch (err) {
    console.error("Error reading letterhead image:", err);
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT_FAMILY,
            size: BODY_SIZE,
          },
        },
      },
    },
    sections: [
      {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  imageBuffer ? new ImageRun({
                    data: imageBuffer,
                    transformation: {
                      width: PAGE_WIDTH,
                      height: PAGE_HEIGHT,
                    },
                    floating: {
                      horizontalPosition: {
                        relative: HorizontalPositionRelativeFrom.PAGE,
                        align: HorizontalPositionAlign.CENTER,
                      },
                      verticalPosition: {
                        relative: VerticalPositionRelativeFrom.PAGE,
                        align: VerticalPositionAlign.TOP,
                      },
                      wrap: {
                        type: TextWrappingType.NONE,
                      },
                      behindText: true, // ESTO HACE QUE SEA UNA PLANTILLA DE FONDO
                    },
                  }) : new TextRun(""),
                ],
              }),
            ],
          }),
        },
        children: [
          new Paragraph({
            children: [new TextRun({ text: "SECUENCIA DIDÁCTICA", bold: true, size: TITLE_SIZE })],
            alignment: AlignmentType.CENTER
          }),

          // Module 1: General Information
          createSubtitle("INFORMACIÓN GENERAL"),
          createModuleTable([
            { label: "División", value: escapeXml(formData.division) || "No especificado" },
            { label: "Carrera", value: escapeXml(formData.carrera) || "No especificado" },
            { label: "Programa", value: escapeXml(formData.programa) || "No especificado" },
            { label: "Ciclo", value: escapeXml(formData.ciclo) || "No especificado" },
            { label: "Semestre", value: escapeXml(formData.semestre) || "No especificado" },
          ]),
          new Paragraph({ spacing: { after: 200 } }),

          // Module 2: Teacher Info
          createSubtitle("INFORMACIÓN DEL DOCENTE"),
          createModuleTable([
            { label: "Nombre", value: escapeXml(formData.nombre) || "No especificado" },
            { label: "Perfil", value: escapeXml(formData.perfil) || "No especificado" },
            { label: "Posgrado", value: escapeXml(formData.posgrado) || "No especificado" },
          ]),
          new Paragraph({ spacing: { after: 200 } }),

          // Module 3: Academic Info
          createSubtitle("INFORMACIÓN ACADÉMICA"),
          createModuleTable([
            { label: "Asignatura", value: escapeXml(formData.asignatura) || "No especificado" },
            { label: "Horas", value: escapeXml(formData.horas) || "No especificado" },
          ]),
          new Paragraph({ spacing: { after: 200 } }),
          new Paragraph({ children: [new TextRun({ text: "Aprendizajes:", bold: true })], spacing: { after: 100 } }),
          new Paragraph({ children: [new TextRun(escapeXml(formData.aprendizajes) || "No especificado")], spacing: { after: 200 } }),
          new Paragraph({ children: [new TextRun({ text: "Impacto:", bold: true })], spacing: { after: 100 } }),
          new Paragraph({ children: [new TextRun(escapeXml(formData.impacto) || "No especificado")], spacing: { after: 200 } }),
          new Paragraph({ children: [new TextRun({ text: "Competencia:", bold: true })], spacing: { after: 100 } }),
          new Paragraph({ children: [new TextRun(escapeXml(formData.competencia) || "No especificado")], spacing: { after: 400 } }),

          // Module 4: Evaluation Criteria
          new Paragraph({ children: [new TextRun({ text: "CRITERIOS DE EVALUACIÓN", bold: true, size: SUBTITLE_SIZE })], spacing: { before: 200, after: 200 } }),
          ...(usarCriteriosBimestre 
            ? formData.criterios_bimestre.flatMap((bimestre, idx) => [
                new Paragraph({ children: [new TextRun({ text: escapeXml(bimestre.nombre) || `Bimestre ${idx + 1}`, bold: true, size: BODY_SIZE })], spacing: { before: 200, after: 100 } }),
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Criterio", bold: true })] })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Porcentaje", bold: true })] })] }),
                      ],
                    }),
                    ...bimestre.criterios.map(c => new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph(escapeXml(c.criterio) || "")] }),
                        new TableCell({ children: [new Paragraph(`${escapeXml(c.porcentaje)}%`)] }),
                      ],
                    })),
                  ],
                }),
              ])
            : [
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Criterio", bold: true })] })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Porcentaje", bold: true })] })] }),
                      ],
                    }),
                    ...formData.criterios.map(c => new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph(escapeXml(c.criterio) || "")] }),
                        new TableCell({ children: [new Paragraph(`${escapeXml(c.porcentaje)}%`)] }),
                      ],
                    })),
                  ],
                }),
              ]
          ),
          new Paragraph({ spacing: { after: 400 } }),

          // Module 5: Course Content
          new Paragraph({ children: [new TextRun({ text: "CONTENIDO DEL CURSO", bold: true, size: SUBTITLE_SIZE })], spacing: { before: 200, after: 200 } }),
          new Paragraph({ children: [new TextRun({ text: "Contextualización:", bold: true })], spacing: { after: 100 } }),
          new Paragraph({ children: [new TextRun(escapeXml(formData.contextualizacion) || "No especificado")], spacing: { after: 400 } }),

          // Units
          ...formData.unidades.flatMap((unidad, idx) => [
            // Título de la Unidad
            new Paragraph({ children: [new TextRun({ text: `UNIDAD ${idx + 1}:`, bold: true, size: SUBTITLE_SIZE })], spacing: { before: 200, after: 100 } }),
            new Paragraph({ children: [new TextRun({ text: "Tema principal:", bold: true })], spacing: { after: 100 } }),
            new Paragraph({ children: [new TextRun(escapeXml(unidad.tema) || "")], spacing: { after: 200 } }),
            new Paragraph({ children: [new TextRun({ text: "Objetivo:", bold: true })], spacing: { after: 100 } }),
            new Paragraph({ children: [new TextRun(escapeXml(unidad.objetivo) || "")], spacing: { after: 200 } }),
            new Paragraph({ children: [new TextRun({ text: "Subtemas:", bold: true })], spacing: { after: 100 } }),
            ...unidad.subtemas.flatMap((s, i) => [
              new Paragraph({ children: [new TextRun(`${i * 2 + 1}. ${escapeXml(s.subtema1) || ""}`)], spacing: { after: 50 } }),
              new Paragraph({ children: [new TextRun(`${i * 2 + 2}. ${escapeXml(s.subtema2) || ""}`)], spacing: { after: 100 } }),
            ]),
            new Paragraph({ spacing: { after: 200 } }),
            // Actividades - Texto independiente con tabla por actividad
            new Paragraph({ children: [new TextRun({ text: "ACTIVIDADES DE APRENDIZAJE", bold: true, size: SUBTITLE_SIZE })], spacing: { before: 100, after: 100 } }),
            ...unidad.actividades.flatMap((a, i) => [
              new Paragraph({ children: [new TextRun({ text: `Actividad ${i + 1}:`, bold: true })], spacing: { after: 100 } }),
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({ width: { size: 33, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Inicio", bold: true })] })] }),
                      new TableCell({ width: { size: 34, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Desarrollo", bold: true })] })] }),
                      new TableCell({ width: { size: 33, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Cierre", bold: true })] })] }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ width: { size: 33, type: WidthType.PERCENTAGE }, children: [new Paragraph(escapeXml(a.actividad_inicio) || "")] }),
                      new TableCell({ width: { size: 34, type: WidthType.PERCENTAGE }, children: [new Paragraph(escapeXml(a.actividad_desarrollo) || "")] }),
                      new TableCell({ width: { size: 33, type: WidthType.PERCENTAGE }, children: [new Paragraph(escapeXml(a.actividad_cierre) || "")] }),
                    ],
                  }),
                ],
              }),
              new Paragraph({ spacing: { after: 100 } }),
            ]),
            new Paragraph({ spacing: { after: 200 } }),
            // Tabla de Evaluación (Evidencia + Instrumento unidos)
            new Paragraph({ children: [new TextRun({ text: "Evaluación:", bold: true, size: SUBTITLE_SIZE })], spacing: { before: 100, after: 100 } }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Evidencia de aprendizaje", bold: true })] })] }),
                    new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Instrumento de evaluación", bold: true })] })] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: [new Paragraph(escapeXml(unidad.evidencia) || "")] }),
                    new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: [new Paragraph(escapeXml(unidad.instrumento) || "")] }),
                  ],
                }),
              ],
            }),
            new Paragraph({ spacing: { after: 200 } }),
          ]),

          // Final Activities
          new Paragraph({ children: [new TextRun({ text: "ACTIVIDADES FINALES", bold: true, size: SUBTITLE_SIZE })], spacing: { before: 200, after: 200 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Actividad", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Criterios", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Instrumentos", bold: true })] })] }),
                ],
              }),
              ...formData.actividades_finales.map(af => new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(escapeXml(af.actividad_final) || "")] }),
                  new TableCell({ children: [new Paragraph(escapeXml(af.criterios_finales) || "")] }),
                  new TableCell({ children: [new Paragraph(escapeXml(af.instrumentos_finales) || "")] }),
                ],
              })),
            ],
          }),
          new Paragraph({ spacing: { after: 400 } }),

          // Signatures
          new Paragraph({ children: [new TextRun({ text: "FIRMAS Y VALIDACIONES", bold: true, size: SUBTITLE_SIZE })], spacing: { before: 200, after: 200 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                      bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                    },
                    children: [
                      ...(formData.qr_nombre_firma ? [
                        new Paragraph({
                          children: [
                            new ImageRun({
                              data: base64ToBuffer(formData.qr_nombre_firma),
                              transformation: { width: 100, height: 100 },
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                          spacing: { after: 100 },
                        }),
                      ] : []),
                      new Paragraph({ children: [new TextRun(escapeXml(formData.nombre_firma) || "No especificado")], alignment: AlignmentType.CENTER, spacing: { after: 100 } }),
                      new Paragraph({ children: [new TextRun("_".repeat(30))], alignment: AlignmentType.CENTER, spacing: { after: 50 } }),
                      new Paragraph({ children: [new TextRun({ text: "Firma Digital", bold: true })], alignment: AlignmentType.CENTER }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                      bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                    },
                    children: [
                      new Paragraph({
                        children: [],
                        spacing: { after: 100 },
                      }),
                      new Table({
                        width: { size: 1502, type: WidthType.DXA },
                        rows: [
                          new TableRow({
                            height: { value: 1502, rule: "exact" },
                            children: [
                              new TableCell({
                                width: { size: 1502, type: WidthType.DXA },
                                borders: {
                                  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                                  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                                  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                                  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                                },
                                children: [new Paragraph("")],
                              }),
                            ],
                          }),
                        ],
                      }),
                      new Paragraph({ children: [new TextRun("_".repeat(30))], alignment: AlignmentType.CENTER, spacing: { after: 50 } }),
                      new Paragraph({ children: [new TextRun({ text: "Sello de aprobación", bold: true })], alignment: AlignmentType.CENTER }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  })

  return doc
}
