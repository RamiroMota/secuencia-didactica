"use server";

import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Header, 
  ImageRun, 
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from "docx";
import fs from "fs/promises";
import path from "path";
import { sendEmailWithGmail } from "@/lib/gmail";

// We use 'any' here to avoid importing the huge FormData interface from the client component
// which can sometimes cause issues in server actions if not exported correctly.
export async function saveSequenceAction(data: any) {
  try {
    // Map Career to Email
    const EMAIL_MAPPING: Record<string, string> = {
      "Dirección de la Licenciatura en Nutrición": "direccion.nutricion@upgch.edu.mx",
      "Dirección de la Licenciatura en Cirujano Odontólogo": "direccion.lco@upgch.edu.mx",
      "Dirección de Psicología": "direccion.psico@upgch.edu.mx",
      "Dirección Químico Farmacobiólogo": "director.qfb@upgch.edu.mx",
      "Dirección de la Licenciatura en Enfermería": "direccion.enfria@upgch.edu.mx",
      "Dirección de Medicina": "direccion.lmc@upgch.edu.mx",
      "Dirección del Área de Ciencias en Negocios": "direccion.negocios@upgch.edu.mx",
      "Dirección de Ingeniería": "direccion.ingenierias@upgch.edu.mx",
      "Dirección de LEFyP": "direccion.educativas@upgch.edu.mx",
      "Dirección del Área de Idiomas": "direccion.idiomas@upgch.edu.mx",
      "Dirección de Derecho": "direccion.derecho@upgch.edu.mx",
    };

    const targetEmail = EMAIL_MAPPING[data.carrera];

    if (!targetEmail) {
      return { success: false, error: "No se encontró un correo asociado a la dirección de carrera." };
    }

    // Load the letterhead image
    const imagePath = path.join(process.cwd(), "public", "Membrete Secuencia.png");
    const imageBuffer = await fs.readFile(imagePath);

    // Helper to create a simple table for each module
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

    const doc = new Document({
      sections: [
        {
          children: [
            // MEMBRETE IMPLEMENTADO COMO BANNER SUPERIOR (Sustituye al Header para asegurar visibilidad)
            new Paragraph({
              children: [
                new ImageRun({
                  data: imageBuffer,
                  transformation: {
                    width: 612, // Ancho exacto de página Letter
                    height: 160,
                  },
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 0, after: 400 },
            }),

            new Paragraph({
              children: [new TextRun({ text: "SECUENCIA DIDÁCTICA", bold: true, size: 32 })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 400 },
            }),

            // Module 1: General Information

            createModuleTable("INFORMACIÓN GENERAL", [
              { label: "División", value: data.division },
              { label: "Carrera", value: data.carrera },
              { label: "Programa", value: data.programa },
              { label: "Ciclo", value: data.ciclo },
              { label: "Semestre", value: data.semestre },
              { label: "Nombre del Archivo", value: data.titulo },
            ]),
            new Paragraph({ spacing: { after: 200 } }),

            // Module 2: Docente
            createModuleTable("INFORMACIÓN DEL DOCENTE", [
              { label: "Nombre", value: data.nombre },
              { label: "Perfil", value: data.perfil },
              { label: "Posgrado", value: data.posgrado },
            ]),
            new Paragraph({ spacing: { after: 200 } }),

            // Module 3: Academic Information
            createModuleTable("INFORMACIÓN ACADÉMICA", [
              { label: "Asignatura", value: data.asignatura },
              { label: "Horas", value: data.horas },
              { label: "Aprendizajes", value: data.aprendizajes },
              { label: "Impacto", value: data.impacto },
              { label: "Competencia", value: data.competencia },
            ]),
            new Paragraph({ spacing: { after: 200 } }),

            // Module 4: Evaluation Criteria
            new Paragraph({ children: [new TextRun({ text: "CRITERIOS DE EVALUACIÓN", bold: true, size: 24 })], spacing: { before: 200, after: 200 } }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Criterio", bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Porcentaje", bold: true })] })] }),
                  ],
                }),
                ...(data.criterios || []).map((c: any) => new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph(c.criterio)] }),
                    new TableCell({ children: [new Paragraph(c.porcentaje + "%")] }),
                  ],
                })),
              ],
            }),
            new Paragraph({ spacing: { after: 400 } }),

            // Module 5: Course Content
            new Paragraph({ children: [new TextRun({ text: "CONTENIDO DEL CURSO", bold: true, size: 24 })], spacing: { before: 200, after: 200 } }),
            new Paragraph({ children: [new TextRun({ text: "Contextualización:", bold: true })], spacing: { after: 100 } }),
            new Paragraph({ children: [new TextRun(data.contextualizacion || "")] }),
            new Paragraph({ spacing: { after: 400 } }),

            // Units
            (data.unidades || []).map((unidad: any, index: number) => {
              return new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        columnSpan: 2,
                        children: [new Paragraph({ children: [new TextRun({ text: `UNIDAD ${index + 1}: ${unidad.tema}`, bold: true, size: 20 })] })],
                        shading: { fill: "F0F0F0" },
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Objetivo", bold: true })] })] }),
                      new TableCell({ children: [new Paragraph(unidad.objetivo)] }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Subtemas", bold: true })] })] }),
                      new TableCell({ 
                        children: [
                          new Paragraph(unidad.subtemas.map((s: any) => `${s.subtema1} ${s.subtema2}`).join("\n"))
                        ] 
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Actividades", bold: true })] })] }),
                      new TableCell({ 
                        children: [
                          new Paragraph(unidad.actividades.map((a: any) => `Inicio: ${a.actividad_inicio}\nDesarrollo: ${a.actividad_desarrollo}\nCierre: ${a.actividad_cierre}`).join("\n\n"))
                        ] 
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Evidencia", bold: true })] })] }),
                      new TableCell({ children: [new Paragraph(unidad.evidencia)] }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Instrumento", bold: true })] })] }),
                      new TableCell({ children: [new Paragraph(unidad.instrumento)] }),
                    ],
                  }),
                ],
              });
            }),
            new Paragraph({ spacing: { after: 400 } }),

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
                ...(data.actividades_finales || []).map((af: any) => new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph(af.actividad_final)] }),
                    new TableCell({ children: [new Paragraph(af.criterios_finales)] }),
                    new TableCell({ children: [new Paragraph(af.instrumentos_finales)] }),
                  ],
                })),
              ],
            }),
          ],
        },
      ],
    });

    const docBuffer = await Packer.toBuffer(doc);

    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

    await sendEmailWithGmail({
      to: targetEmail,
      subject: `Nueva Secuencia Académica - ${data.programa}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            Nueva Secuencia Didáctica para Revisión
          </h2>
          <p>Se ha generado una nueva secuencia académica para el programa <strong>${data.programa}</strong>.</p>
          <p>Adjunto encontrará el documento DOCX con la secuencia didáctica completa.</p>
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; margin-top: 30px;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Universidad Pablo Guardado Chávez<br>
              Portal Academico - UPGCH
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: "secuencia.docx",
          content: docBuffer,
          contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        },
      ],
    });

    return { success: true };
  } catch (error) {
    console.error("Error in saveSequenceAction:", error);
    return { success: false, error: "Error interno del servidor al generar o enviar la secuencia." };
  }
}
