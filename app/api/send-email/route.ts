import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const correo_institucional = formData.get("correo_institucional") as string
    const nombre = formData.get("nombre") as string
    const asignatura = formData.get("asignatura") as string
    const programa = formData.get("programa") as string
    const ciclo = formData.get("ciclo") as string
    const titulo = formData.get("titulo") as string
    const documento = formData.get("documento") as File

    // Configurar el transportador de nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ramiro.mota.tb@gmail.com", // Reemplazar con el email desde el cual se enviará
        pass: "tzvm okcr annz ajbv", // Contraseña de aplicación proporcionada
      },
    })

    // Convertir el archivo a buffer para el adjunto
    const documentoBuffer = Buffer.from(await documento.arrayBuffer())

    // Configurar el contenido del email
    const mailOptions = {
      from: "ramiro.mota.tb@gmail.com", // Reemplazar con el email desde el cual se enviará
      to: "ddocente.daa@upgch.edu.mx",
      subject: `Secuencia Didáctica Reglamentaria sin validar para Revisión - ${asignatura}`,
      html: `
           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
             <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
               Nueva Secuencia Didáctica para Revisión
             </h2>
             
             <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
               <h3 style="color: #1e40af; margin-top: 0;">Información General</h3>
               <table style="width: 100%; border-collapse: collapse;">
                 <tr>
                   <td style="padding: 8px 0; font-weight: bold; color: #374151;">Docente:</td>
                   <td style="padding: 8px 0; color: #6b7280;">${nombre}</td>
                 </tr>
                 <tr>
                   <td style="padding: 8px 0; font-weight: bold; color: #374151;">Correo Institucional:</td>
                   <td style="padding: 8px 0; color: #6b7280;">${correo_institucional}</td>
                 </tr>
                 <tr>
                   <td style="padding: 8px 0; font-weight: bold; color: #374151;">Programa:</td>
                   <td style="padding: 8px 0; color: #6b7280;">${programa}</td>
                 </tr>
                 <tr>
                   <td style="padding: 8px 0; font-weight: bold; color: #374151;">Ciclo:</td>
                   <td style="padding: 8px 0; color: #6b7280;">${ciclo}</td>
                 </tr>
                 <tr>
                   <td style="padding: 8px 0; font-weight: bold; color: #374151;">Asignatura:</td>
                   <td style="padding: 8px 0; color: #6b7280;">${asignatura}</td>
                 </tr>
                 <tr>
                   <td style="padding: 8px 0; font-weight: bold; color: #374151;">Nombre del Archivo:</td>
                   <td style="padding: 8px 0; color: #6b7280;">${titulo}</td>
                 </tr>
               </table>
             </div>

             <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
               <p style="margin: 0; color: #065f46;">
                 <strong>📋 Solicitud de Revisión</strong><br>
                 Se ha completado una nueva secuencia didáctica y está lista para su revisión. 
                 El docente ha proporcionado toda la información requerida y solicita la validación correspondiente.
               </p>
             </div>

             <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
               <p style="margin: 0; color: #92400e;">
                 <strong>📎 Documento Adjunto</strong><br>
                 El documento completo de la secuencia didáctica se encuentra adjunto a este correo en formato DOCX.
               </p>
             </div>

             <div style="margin: 30px 0; text-align: center;">
               <p style="color: #6b7280; font-size: 14px;">
                 Este correo fue generado automáticamente desde el sistema de gestión de secuencias didácticas.
               </p>
             </div>

             <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
               <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                 Universidad Pablo Guardado Chávez<br>
                 Portal Academico - UPGCH
               </p>
             </div>
           </div>
         `,
      attachments: [
        {
          filename: documento.name,
          content: documentoBuffer,
          contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        },
      ],
    }

    // Enviar el email
    await transporter.sendMail(mailOptions)

    return NextResponse.json({ success: true, message: "Email enviado exitosamente con documento adjunto" })
  } catch (error) {
    console.error("Error enviando email:", error)
    return NextResponse.json({ success: false, message: "Error al enviar el email" }, { status: 500 })
  }
}
