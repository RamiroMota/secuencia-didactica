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
const TITLE_SIZE = 20 // 16pt en half-points
const SUBTITLE_SIZE = 20 // 14pt en half-points
const BODY_SIZE = 18 // 12pt en half-points

// Función para convertir base64 a buffer
const base64ToBuffer = (base64: string): Buffer => {
  const base64Data = base64.replace(/^data:image\/[a-z]+;base64,/, "")
  return Buffer.from(base64Data, "base64")
}

// Función para determinar si usar criterios generales o por bimestre
const shouldUseCriteriosBimestre = (formData: FormData): boolean => {
  // Si hay más de un bimestre, usar criterios por bimestre
  if (formData.criterios_bimestre.length > 1) {
    return true
  }

  // Si el primer bimestre tiene datos significativos, usar criterios por bimestre
  const primerBimestre = formData.criterios_bimestre[0]
  if (primerBimestre && primerBimestre.criterios.some((c) => c.criterio.trim() || c.porcentaje.trim())) {
    return true
  }

  // Si los criterios generales tienen datos, usar criterios generales
  if (formData.criterios.some((c) => c.criterio.trim() || c.porcentaje.trim())) {
    return false
  }

  // Por defecto, usar criterios generales
  return false
}

export const generateDocx = async (formData: FormData): Promise<Document> => {
  const usarCriteriosBimestre = shouldUseCriteriosBimestre(formData)

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
        properties: {
          page: {
            size: {
              width: 8.5 * 1440, // 8.5 inches in twips (letter width)
              height: 11 * 1440, // 11 inches in twips (letter height)
            },
            margin: {
              top: 1440, // 1 inch
              right: 1700.78, // 1.1811 inches (1.1811 * 914.4 = 1080 twips)
              bottom: 1440, // 1 inch
              left: 1700.78, // 1.1811 inches (1.1811 * 914.4 = 1080 twips)
            },
          },
        },
        children: [
          // Título principal
          new Paragraph({
            children: [
              new TextRun({
                text: "SECUENCIA DIDÁCTICA",
                bold: true,
                size: TITLE_SIZE,
                font: FONT_FAMILY,
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
              }),
            ],
            spacing: { before: 400, after: 300 },
          }),

          // Tabla de información general
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

          // Información del Docente
          new Paragraph({
            children: [
              new TextRun({
                text: "INFORMACIÓN DEL DOCENTE",
                bold: true,
                size: TITLE_SIZE,
                font: FONT_FAMILY,
              }),
            ],
            spacing: { before: 600, after: 300 },
          }),

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
                            text: "Nombre completo:",
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
                            text: formData.nombre,
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
                            text: "Perfil Académico:",
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
                            text: formData.perfil,
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
                            text: "Posgrado:",
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
                            text: formData.posgrado,
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

          // Información Académica
          new Paragraph({
            children: [
              new TextRun({
                text: "INFORMACIÓN ACADÉMICA",
                bold: true,
                size: TITLE_SIZE,
                font: FONT_FAMILY,
              }),
            ],
            spacing: { before: 600, after: 300 },
          }),

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
                            text: "Asignatura:",
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
                            text: formData.asignatura,
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
                            text: "Total de horas en el semestre:",
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
                            text: formData.horas,
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

          // Campos de texto largo para información académica
          new Paragraph({
            children: [
              new TextRun({
                text: "Aprendizajes Esperados:",
                bold: true,
                size: SUBTITLE_SIZE,
                font: FONT_FAMILY,
              }),
            ],
            spacing: { before: 300, after: 150 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: formData.aprendizajes || "No especificado",
                size: BODY_SIZE,
                font: FONT_FAMILY,
              }),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Impacto en el perfil de egreso:",
                bold: true,
                size: SUBTITLE_SIZE,
                font: FONT_FAMILY,
              }),
            ],
            spacing: { after: 150 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: formData.impacto || "No especificado",
                size: BODY_SIZE,
                font: FONT_FAMILY,
              }),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Competencia sello:",
                bold: true,
                size: SUBTITLE_SIZE,
                font: FONT_FAMILY,
              }),
            ],
            spacing: { after: 150 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: formData.competencia || "No especificado",
                size: BODY_SIZE,
                font: FONT_FAMILY,
              }),
            ],
            spacing: { after: 400 },
          }),

          // Criterios de Evaluación - Dinámico según el modo
          new Paragraph({
            children: [
              new TextRun({
                text: "CRITERIOS DE EVALUACIÓN",
                bold: true,
                size: TITLE_SIZE,
                font: FONT_FAMILY,
              }),
            ],
            spacing: { before: 600, after: 300 },
          }),

          // Generar criterios según el modo seleccionado
          ...(usarCriteriosBimestre
            ? // Criterios por Bimestre
              formData.criterios_bimestre.flatMap((bimestre, bimestreIndex) => [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: bimestre.nombre || `${bimestreIndex + 1}er Bimestre`,
                      bold: true,
                      size: SUBTITLE_SIZE,
                      font: FONT_FAMILY,
                    }),
                  ],
                  spacing: { before: bimestreIndex > 0 ? 400 : 0, after: 200 },
                }),

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
                                  text: "Criterio",
                                  bold: true,
                                  size: SUBTITLE_SIZE,
                                  font: FONT_FAMILY,
                                }),
                              ],
                              alignment: AlignmentType.CENTER,
                            }),
                          ],
                          width: { size: 70, type: WidthType.PERCENTAGE },
                        }),
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: "Porcentaje",
                                  bold: true,
                                  size: SUBTITLE_SIZE,
                                  font: FONT_FAMILY,
                                }),
                              ],
                              alignment: AlignmentType.CENTER,
                            }),
                          ],
                          width: { size: 30, type: WidthType.PERCENTAGE },
                        }),
                      ],
                    }),
                    ...bimestre.criterios.map(
                      (criterio) =>
                        new TableRow({
                          children: [
                            new TableCell({
                              children: [
                                new Paragraph({
                                  children: [
                                    new TextRun({
                                      text: criterio.criterio || "No especificado",
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
                                      text: `${criterio.porcentaje}%`,
                                      size: BODY_SIZE,
                                      font: FONT_FAMILY,
                                    }),
                                  ],
                                  alignment: AlignmentType.CENTER,
                                }),
                              ],
                            }),
                          ],
                        }),
                    ),
                  ],
                }),
              ])
            : // Criterios Generales
              [
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
                                  text: "Criterio",
                                  bold: true,
                                  size: SUBTITLE_SIZE,
                                  font: FONT_FAMILY,
                                }),
                              ],
                              alignment: AlignmentType.CENTER,
                            }),
                          ],
                          width: { size: 70, type: WidthType.PERCENTAGE },
                        }),
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: "Porcentaje",
                                  bold: true,
                                  size: SUBTITLE_SIZE,
                                  font: FONT_FAMILY,
                                }),
                              ],
                              alignment: AlignmentType.CENTER,
                            }),
                          ],
                          width: { size: 30, type: WidthType.PERCENTAGE },
                        }),
                      ],
                    }),
                    ...formData.criterios.map(
                      (criterio) =>
                        new TableRow({
                          children: [
                            new TableCell({
                              children: [
                                new Paragraph({
                                  children: [
                                    new TextRun({
                                      text: criterio.criterio || "No especificado",
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
                                      text: `${criterio.porcentaje}%`,
                                      size: BODY_SIZE,
                                      font: FONT_FAMILY,
                                    }),
                                  ],
                                  alignment: AlignmentType.CENTER,
                                }),
                              ],
                            }),
                          ],
                        }),
                    ),
                  ],
                }),
              ]),

          // Contenido del Curso
          new Paragraph({
            children: [
              new TextRun({
                text: "CONTENIDO DEL CURSO",
                bold: true,
                size: TITLE_SIZE,
                font: FONT_FAMILY,
              }),
            ],
            spacing: { before: 600, after: 300 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Contextualización:",
                bold: true,
                size: SUBTITLE_SIZE,
                font: FONT_FAMILY,
              }),
            ],
            spacing: { after: 150 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: formData.contextualizacion || "No especificado",
                size: BODY_SIZE,
                font: FONT_FAMILY,
              }),
            ],
            spacing: { after: 200 },
          }),

          // Unidades
          ...formData.unidades.flatMap((unidad, unidadIndex) => [
            new Paragraph({
              children: [
                new TextRun({
                  text: `UNIDAD ${unidadIndex + 1}`,
                  bold: true,
                  size: TITLE_SIZE,
                  font: FONT_FAMILY,
                }),
              ],
              spacing: { before: 600, after: 300 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Tema Principal:",
                  bold: true,
                  size: SUBTITLE_SIZE,
                  font: FONT_FAMILY,
                }),
              ],
              spacing: { after: 150 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: unidad.tema || "No especificado",
                  size: BODY_SIZE,
                  font: FONT_FAMILY,
                }),
              ],
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Subtemas:",
                  bold: true,
                  size: SUBTITLE_SIZE,
                  font: FONT_FAMILY,
                }),
              ],
              spacing: { after: 150 },
            }),

            ...unidad.subtemas.flatMap((subtema, subtemaIndex) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${subtemaIndex * 2 + 1}. ${subtema.subtema1 || "No especificado"}`,
                    size: BODY_SIZE,
                    font: FONT_FAMILY,
                  }),
                ],
                spacing: { after: 100 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${subtemaIndex * 2 + 2}. ${subtema.subtema2 || "No especificado"}`,
                    size: BODY_SIZE,
                    font: FONT_FAMILY,
                  }),
                ],
                spacing: { after: 100 },
              }),
            ]),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Objetivo:",
                  bold: true,
                  size: SUBTITLE_SIZE,
                  font: FONT_FAMILY,
                }),
              ],
              spacing: { before: 200, after: 150 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: unidad.objetivo || "No especificado",
                  size: BODY_SIZE,
                  font: FONT_FAMILY,
                }),
              ],
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Actividades de Aprendizaje:",
                  bold: true,
                  size: SUBTITLE_SIZE,
                  font: FONT_FAMILY,
                }),
              ],
              spacing: { after: 150 },
            }),

            // Generar tabla para cada actividad
            ...unidad.actividades.flatMap((actividad, actividadIndex) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Actividad ${actividadIndex + 1}:`,
                    bold: true,
                    size: BODY_SIZE,
                    font: FONT_FAMILY,
                  }),
                ],
                spacing: { before: 200, after: 100 },
              }),

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
                                text: "Actividad de Inicio",
                                bold: true,
                                size: SUBTITLE_SIZE,
                                font: FONT_FAMILY,
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                        width: { size: 33.33, type: WidthType.PERCENTAGE },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "Actividad de Desarrollo",
                                bold: true,
                                size: SUBTITLE_SIZE,
                                font: FONT_FAMILY,
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                        width: { size: 33.33, type: WidthType.PERCENTAGE },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "Actividad de Cierre",
                                bold: true,
                                size: SUBTITLE_SIZE,
                                font: FONT_FAMILY,
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                        width: { size: 33.33, type: WidthType.PERCENTAGE },
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
                                text: actividad.actividad_inicio || "No especificado",
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
                                text: actividad.actividad_desarrollo || "No especificado",
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
                                text: actividad.actividad_cierre || "No especificado",
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
            ]),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Evaluación:",
                  bold: true,
                  size: SUBTITLE_SIZE,
                  font: FONT_FAMILY,
                }),
              ],
              spacing: { before: 300, after: 150 },
            }),

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
                              text: "Evidencia de aprendizaje",
                              bold: true,
                              size: SUBTITLE_SIZE,
                              font: FONT_FAMILY,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 50, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "Instrumento de evaluación",
                              bold: true,
                              size: SUBTITLE_SIZE,
                              font: FONT_FAMILY,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 50, type: WidthType.PERCENTAGE },
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
                              text: unidad.evidencia || "No especificado",
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
                              text: unidad.instrumento || "No especificado",
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
          ]),

          // Actividad Final
          new Paragraph({
            children: [
              new TextRun({
                text: "ACTIVIDADES FINALES Y EVALUACIÓN",
                bold: true,
                size: TITLE_SIZE,
                font: FONT_FAMILY,
              }),
            ],
            spacing: { before: 600, after: 300 },
          }),

          ...formData.actividades_finales.flatMap((actividad, index) => [
            new Paragraph({
              children: [
                new TextRun({
                  text: `Actividad Final ${index + 1}:`,
                  bold: true,
                  size: SUBTITLE_SIZE,
                  font: FONT_FAMILY,
                }),
              ],
              spacing: { before: 300, after: 150 },
            }),

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
                              text: "Actividad Final",
                              bold: true,
                              size: SUBTITLE_SIZE,
                              font: FONT_FAMILY,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 33.33, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "Criterios",
                              bold: true,
                              size: SUBTITLE_SIZE,
                              font: FONT_FAMILY,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 33.33, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "Instrumentos",
                              bold: true,
                              size: SUBTITLE_SIZE,
                              font: FONT_FAMILY,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 33.33, type: WidthType.PERCENTAGE },
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
                              text: actividad.actividad_final || "No especificado",
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
                              text: actividad.criterios_finales || "No especificado",
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
                              text: actividad.instrumentos_finales || "No especificado",
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
          ]),

          // Firmas
          new Paragraph({
            children: [
              new TextRun({
                text: "FIRMAS Y VALIDACIONES",
                bold: true,
                size: TITLE_SIZE,
                font: FONT_FAMILY,
              }),
            ],
            spacing: { before: 600, after: 300 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Nombre y firma del docente:",
                bold: true,
                size: SUBTITLE_SIZE,
                font: FONT_FAMILY,
              }),
            ],
            spacing: { after: 150 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: formData.nombre_firma || "No especificado",
                size: BODY_SIZE,
                font: FONT_FAMILY,
              }),
            ],
            spacing: { after: 200 },
          }),

          // Agregar QR code si existe
          ...(formData.qr_nombre_firma
            ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Código QR - Firma Digital:",
                      bold: true,
                      size: BODY_SIZE,
                      font: FONT_FAMILY,
                    }),
                  ],
                  spacing: { before: 200, after: 100 },
                }),
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: base64ToBuffer(formData.qr_nombre_firma),
                      transformation: {
                        width: 150,
                        height: 150,
                      },
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 400 },
                }),
              ]
            : []),

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
