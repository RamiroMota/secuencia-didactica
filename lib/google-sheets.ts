import { google } from "googleapis"
import path from "path"
import fs from "fs"

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

const SPREADSHEET_ID = "1S_utJGezPUhh2Gt0klgp6xA_UAWfFYH4v1J56Lj9ggE"
const SHEET_NAME = "Registro General"

interface SequenceLogData {
  division: string
  carrera: string
  programa: string
  semestre: string
  asignatura: string
  nombre: string
}

async function getAuth() {
  const keyPath = path.join(process.cwd(), "credentials", "service-account.json")
  
  if (!fs.existsSync(keyPath)) {
    throw new Error("Service account key file not found")
  }

  const keyFile = JSON.parse(fs.readFileSync(keyPath, "utf-8"))

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: keyFile.client_email,
      private_key: keyFile.private_key,
    },
    scopes: SCOPES,
  })

  return auth
}

export async function logSequenceToSheets(data: SequenceLogData): Promise<void> {
  try {
    const auth = await getAuth()
    const sheets = google.sheets({ version: "v4", auth })

    const fecha = new Date().toISOString().split("T")[0]

    const row = [
      fecha,
      data.nombre,
      data.division,
      data.carrera,
      data.programa,
      data.semestre,
      data.asignatura,
      "Crear Secuencia Didáctica",
      "En revisión",
    ]

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:I`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [row],
      },
    })

    console.log("Sequence logged to Google Sheets successfully")
  } catch (error) {
    console.error("Error logging to Google Sheets:", error)
    throw error
  }
}
