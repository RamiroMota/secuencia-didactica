# Contexto y Rol
Actúa como un Ingeniero de Software Senior experto en TypeScript, Next.js (App Router), y manipulación de archivos OpenXML. 

## Objetivo Principal
Debes **analizar, comprender y solucionar un error crítico** en nuestro sistema. El portal web permite a los usuarios ingresar datos en un formulario, procesa la información en el backend de Next.js, genera un documento Word (`.docx`) y lo envía automáticamente por correo electrónico usando Nodemailer. 

**El problema:** El correo llega correctamente con el archivo adjunto, pero al intentar abrir el archivo `.docx` en Microsoft Word, aparece el siguiente error de corrupción: 
*"Word encontró contenido no legible en [nombre_del_archivo].docx. ¿Desea recuperar el contenido de este documento? Si confía en el origen de este documento, haga clic en Sí."*

## Stack Tecnológico Utilizado (Extraído del package.json)
Para resolver este problema, debes basarte estrictamente en las siguientes versiones de nuestro proyecto:
- **Framework:** Next.js `^14.2.30` (React `^18`)
- **Librería de Word:** `docx` (versión `latest`)
- **Envío de Correos:** `nodemailer` `^7.0.5` con tipos `@types/nodemailer` `^6.4.17`
- **Validación/Formularios:** `zod` `^3.24.1` y `react-hook-form` `^7.54.1`
- **Lenguaje:** TypeScript `^5` con `@types/node` `^22`

---

## Directrices Técnicas para la Solución

Al analizar el código que te proporcionaré a continuación, debes buscar e implementar las siguientes correcciones obligatorias:

1. **Manejo Correcto de Búferes (La causa más probable):**
   - Asegúrate de que el documento de la librería `docx` se empaquete utilizando estrictamente `Packer.toBuffer(doc)`.
   - Evita el uso de métodos como `Packer.toBlob()`, `Packer.toBase64String()` o conversiones erróneas a strings de texto que corrompen el archivo binario al pasar por el backend de Next.js.
   - En la configuración del objeto `attachments` de Nodemailer, el campo `content` debe recibir directamente el buffer generado, y se debe explicitar el `contentType` oficial de Word: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`.

2. **Sanitización de Entradas contra Corrupción XML:**
   - La librería `docx` inyecta texto directamente en archivos XML internos de Word. Si el usuario ingresa caracteres especiales como `&`, `<`, `>`, `"` o `'`, el XML se rompe inmediatamente y Word lo detecta como corrupto.
   - Implementa una función utilitaria de escape (`escapeXml`) para limpiar de forma segura cualquier string proveniente del usuario antes de asignarlo a un objeto `TextRun` o propiedad de texto de la librería.

3. **Ciclo de Vida del Archivo y Respuestas HTTP:**
   - Verifica que el flujo asíncrono (`async/await`) esté correctamente controlado para que el correo no se envíe con un buffer incompleto o vacío.

---

## Tu Tarea

1. Lee detenidamente el código de mi API Route / Componente.
2. Identifica dónde se está corrompiendo el archivo o dónde falta sanitizar los datos del usuario.
3. Devuélveme el **código completamente corregido, optimizado, con tipado fuerte de TypeScript y listo para producción**.
4. Explícame brevemente qué línea causaba el fallo.
