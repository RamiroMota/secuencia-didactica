import { type NextRequest, NextResponse } from "next/server"
import { logSequenceToSheets } from "../../../lib/google-sheets"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { division, carrera, programa, semestre, asignatura, nombre } = body

    if (!nombre || !carrera) {
      return NextResponse.json(
        { success: false, message: "Faltan datos requeridos para el registro" },
        { status: 400 }
      )
    }

    await logSequenceToSheets({
      division,
      carrera,
      programa,
      semestre,
      asignatura,
      nombre,
    })

    return NextResponse.json({ success: true, message: "Registro exitoso en Google Sheets" })
  } catch (error) {
    console.error("Error in log-sequence API:", error)
    return NextResponse.json(
      { success: false, message: "Error al registrar en Google Sheets" },
      { status: 500 }
    )
  }
}
