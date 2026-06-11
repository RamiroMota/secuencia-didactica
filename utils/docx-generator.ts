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
const TITLE_SIZE = 32 
const SUBTITLE_SIZE = 24 
const BODY_SIZE = 22 

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

const createModuleTable = (title: string, rows: { label: string, value: string }[]) => {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: title, bold: true, size: 24 })] })],
            columnSpan: 2,
            shading: { fill: "E0E0E0" },
          }),
        ],
      }),
      ...rows.map(row => new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: row.label, bold: true })] })],
          }),
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun(row.value)] })],
          }),
        ],
      })),
    ],
  });
};

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
        children: [
          // MEMBRETE INSTITUCIONAL (imagen inline al inicio del documento)
          ...(imageBuffer ? [
            new Paragraph({
              children: [
                new ImageRun({
                  data: imageBuffer,
                  transformation: {
                    width: 612,
                    height: 150,
                  },
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
          ] : []),

          new Paragraph({
            children: [new TextRun({ text: "SECUENCIA DIDÁCTICA", bold: true, size: 32 })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 400 },
          }),

          // Module 1: General Information
          createModuleTable("INFORMACIÓN GENERAL", [
            { label: "División", value: formData.division || "No especificado" },
            { label: "Carrera", value: formData.carrera || "No especificado" },
            { label: "Programa", value: formData.programa || "No especificado" },
            { label: "Ciclo", value: formData.ciclo || "No especificado" },
            { label: "Semestre", value: formData.semestre || "No especificado" },
            { label: "Nombre del Archivo", value: formData.titulo || "No especificado" },
          ]),
          new Paragraph({ spacing: { after: 200 } }),

          // Module 2: Teacher Info
          createModuleTable("INFORMACIÓN DEL DOCENTE", [
            { label: "Nombre", value: formData.nombre || "No especificado" },
            { label: "Perfil", value: formData.perfil || "No especificado" },
            { label: "Posgrado", value: formData.posgrado || "No especificado" },
          ]),
          new Paragraph({ spacing: { after: 200 } }),

          // Module 3: Academic Info
          createModuleTable("INFORMACIÓN ACADÉMICA", [
            { label: "Asignatura", value: formData.asignatura || "No especificado" },
            { label: "Horas", value: formData.horas || "No especificado" },
            { label: "Aprendizajes", value: formData.aprendizajes || "No especificado" },
            { label: "Impacto", value: formData.impacto || "No especificado" },
            { label: "Competencia", value: formData.competencia || "No especificado" },
          ]),
          new Paragraph({ spacing: { after: 400 } }),

          // Module 4: Evaluation Criteria
          new Paragraph({ children: [new TextRun({ text: "CRITERIOS DE EVALUACIÓN", bold: true, size: 24 })], spacing: { before: 200, after: 200 } }),
          ...(usarCriteriosBimestre 
            ? formData.criterios_bimestre.flatMap((bimestre, idx) => [
                new Paragraph({ children: [new TextRun({ text: bimestre.nombre || `Bimestre ${idx + 1}`, bold: true, size: 20 })], spacing: { before: 200, after: 100 } }),
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
                        new TableCell({ children: [new Paragraph(c.criterio || "")] }),
                        new TableCell({ children: [new Paragraph(`${c.porcentaje}%`)] }),
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
                        new TableCell({ children: [new Paragraph(c.criterio || "")] }),
                        new TableCell({ children: [new Paragraph(`${c.porcentaje}%`)] }),
                      ],
                    })),
                  ],
                }),
              ]
          ),
          new Paragraph({ spacing: { after: 400 } }),

          // Module 5: Course Content
          new Paragraph({ children: [new TextRun({ text: "CONTENIDO DEL CURSO", bold: true, size: 24 })], spacing: { before: 200, after: 200 } }),
          new Paragraph({ children: [new TextRun({ text: "Contextualización:", bold: true })], spacing: { after: 100 } }),
          new Paragraph({ children: [new TextRun(formData.contextualizacion || "No especificado")], spacing: { after: 400 } }),

          // Units
          ...formData.unidades.flatMap((unidad, idx) => [
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      columnSpan: 2,
                      children: [new Paragraph({ children: [new TextRun({ text: `UNIDAD ${idx + 1}: ${unidad.tema}`, bold: true, size: 20 })] })],
                      shading: { fill: "F0F0F0" },
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Objetivo", bold: true })] })] }),
                    new TableCell({ children: [new Paragraph(unidad.objetivo || "")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Subtemas", bold: true })] })] }),
                    new TableCell({ 
                      children: [new Paragraph(unidad.subtemas.map((s, sidx) => `${sidx + 1}. ${s.subtema1} ${s.subtema2}`).join("\n"))] 
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Actividades", bold: true })] })] }),
                    new TableCell({ 
                      children: [new Paragraph(unidad.actividades.map((a, aidx) => `Act. ${aidx + 1}: ${a.actividad_inicio} / ${a.actividad_desarrollo} / ${a.actividad_cierre}`).join("\n\n"))] 
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Evidencia", bold: true })] })] }),
                    new TableCell({ children: [new Paragraph(unidad.evidencia || "")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Instrumento", bold: true })] })] }),
                    new TableCell({ children: [new Paragraph(unidad.instrumento || "")] }),
                  ],
                }),
              ],
            }),
            new Paragraph({ spacing: { after: 200 } }),
          ]),

          // Final Activities
          new Paragraph({ children: [new TextRun({ text: "ACTIVIDADES FINALES", bold: true, size: 24 })], spacing: { before: 200, after: 200 } }),
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
                  new TableCell({ children: [new Paragraph(af.actividad_final || "")] }),
                  new TableCell({ children: [new Paragraph(af.criterios_finales || "")] }),
                  new TableCell({ children: [new Paragraph(af.instrumentos_finales || "")] }),
                ],
              })),
            ],
          }),
          new Paragraph({ spacing: { after: 400 } }),

          // Signatures
          new Paragraph({ children: [new TextRun({ text: "FIRMAS Y VALIDACIONES", bold: true, size: 24 })], spacing: { before: 200, after: 200 } }),
          new Paragraph({ children: [new TextRun({ text: "Firma del Docente:", bold: true })], spacing: { after: 100 } }),
          new Paragraph({ children: [new TextRun(formData.nombre_firma || "No especificado")], spacing: { after: 200 } }),
          
          ...(formData.qr_nombre_firma ? [
            new Paragraph({ children: [new TextRun({ text: "Firma Digital (QR):", bold: true })], spacing: { after: 100 } }),
            new Paragraph({
              children: [
                new ImageRun({
                  data: base64ToBuffer(formData.qr_nombre_firma),
                  transformation: { width: 100, height: 100 },
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
          ] : []),
          
          new Paragraph({ children: [new TextRun("_".repeat(40))], alignment: AlignmentType.CENTER }),
          new Paragraph({ children: [new TextRun("Sello y Firma de la Dirección")], alignment: AlignmentType.CENTER }),
        ],
      },
    ],
  })

  return doc
}
