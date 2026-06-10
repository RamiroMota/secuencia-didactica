# Contexto y Rol del Asistente
Actúa como un Ingeniero de Software Senior Full Stack experto en Next.js 14, TypeScript y Diseño UI/UX. Tu objetivo es diseñar e implementar un formulario dinámico de "Información General" para el llenado de secuencias académicas. Debes desarrollar la solución utilizando estrictamente el siguiente stack tecnológico basado en mis dependencias actuales:

* **Framework**: Next.js 14 (React 18 + TypeScript)
* **Estilos y Componentes**: Tailwind CSS + Radix UI Select (`@radix-ui/react-select`)
* **Manejo de Formularios**: `react-hook-form` con validación mediante `zod` y `@hookform/resolvers`
* **Generación de Documentos (Backend/Server Actions/API Routes)**: Librería `docx` (Node.js)
* **Envío de Correos**: `nodemailer` con soporte para archivos adjuntos

---

# Requerimientos de Interfaz (UI) y Lógica Front-End

## 1. Menús Desplegables Condicionales (`select` de Radix)
Implementa tres selectores anidados controlados a través de `react-hook-form`. Las opciones deben estar tipadas estrictamente en TypeScript. Al cambiar la selección del nivel superior, se deben resetear y re-filtrar inmediatamente las opciones de los niveles inferiores de forma reactiva:

### Nivel 1: Dirección de división
Opciones base del primer menú:
* Dirección de división Salud
* Dirección de división de Medicina
* Dirección de división Profesionales

### Nivel 2: Dirección de carrera (Depende de Nivel 1)
* **Si elige "Dirección de división Salud":**
  * Dirección de la Licenciatura en Nutrición
  * Dirección de la Licenciatura en Cirujano Odontólogo
  * Dirección de Psicología
  * Dirección Químico Farmacobiólogo
  * Dirección de la Licenciatura en Enfermería
* **Si elige "Dirección de división de Medicina":**
  * Dirección de Medicina
* **Si elige "Dirección de división Profesionales":**
  * Dirección del Área de Ciencias en Negocios
  * Dirección de Ingeniería
  * Dirección de LEFyP
  * Dirección del Área de Idiomas
  * Dirección de Derecho

### Nivel 3: Programa educativo (Depende de Nivel 2)
* **Asociados a Dirección de división Salud:**
  * *Dirección de la Licenciatura en Nutrición:* Licenciatura en Nutrición (Escolarizada)
  * *Dirección de la Licenciatura en Cirujano Odontólogo:* Licenciatura en Cirujano odontólogo (Escolarizada)
  * *Dirección de Psicología:* Licenciatura en Psicología clínica (Escolarizada) | Licenciatura en Psicología (Escolarizada) | Licenciatura en Psicología (Mixto)
  * *Dirección Químico Farmacobiólogo:* Licenciatura en Químico farmacobiólogo (Escolarizada)
  * *Dirección de la Licenciatura en Enfermería:* Licenciatura en Enfermería (Escolarizada) | Licenciatura en Enfermería (Mixto)
* **Asociados a Dirección de división de Medicina:**
  * *Dirección de Medicina:* Licenciatura en Médico cirujano (Escolarizada)
* **Asociados a Dirección de división Profesionales:**
  * *Dirección del Área de Ciencias en Negocios:* Licenciatura en Administración de empresas globales (Escolarizada) | Licenciatura en Contaduría pública (Escolarizada) | Licenciatura en Mercadotecnia y comunicación gráfica (Escolarizada) | Licenciatura en Administración de empresas (Mixto) | Licenciatura en Administración financiera y sistemas (Mixto) | Licenciatura en Contaduría pública (Mixto)
  * *Dirección de Ingeniería:* Licenciatura en Arquitectura (Escolarizada) | Ingeniería en Animación y diseño de contenidos digitales (Escolarizada)
  * *Dirección de LEFyP:* Licenciatura en Pedagogía (Escolarizada) | Licenciatura en Educación física y deportiva (Escolarizada) | Licenciatura en Educación física y deportiva (Mixto)
  * *Dirección del Área de Idiomas:* Licenciatura en Inglés (Mixto)
  * *Dirección de Derecho:* Licenciatura en Derecho (Escolarizada) | Licenciatura en Derecho (Mixto)

---

# Requerimientos de Backend (API Routes / Server Actions)

## 2. Lógica del Botón "Guardar y Enviar Secuencia"
Al hacer la petición `onSubmit` del formulario, el servidor de Next.js procesará los datos mediante las siguientes reglas obligatorias:

### A. Eliminación de Descarga Local
**Regla Estricta:** El endpoint del servidor ya no debe enviar cabeceras de descarga (`Content-Disposition: attachment`). La descarga en el navegador del cliente queda 100% deshabilitada. El flujo se procesa enteramente en memoria/servidor.

### B. Matriz de Enrutamiento de Correos (Nodemailer)
Asocia mediante un mapeo estricto de TypeScript la opción elegida en **Dirección de carrera** con su respectivo correo electrónico institucional de destino para configurar el campo `to` en Nodemailer:
* `direccion.nutricion@upgch.edu.mx` -> Dirección de la Licenciatura en Nutrición
* `direccion.lco@upgch.edu.mx` -> Dirección de la Licenciatura en Cirujano Odontólogo
* `direccion.psico@upgch.edu.mx` -> Dirección de Psicología
* `director.qfb@upgch.edu.mx` -> Dirección Químico Farmacobiólogo
* `direccion.enfria@upgch.edu.mx` -> Dirección de la Licenciatura en Enfermería
* `direccion.lmc@upgch.edu.mx` -> Dirección de Medicina
* `direccion.negocios@upgch.edu.mx` -> Dirección del Área de Ciencias en Negocios
* `direccion.ingenierias@upgch.edu.mx` -> Dirección de Ingeniería
* `direccion.educativas@upgch.edu.mx` -> Dirección de LEFyP
* `direccion.idiomas@upgch.edu.mx` -> Dirección del Área de Idiomas
* `direccion.derecho@upgch.edu.mx` -> Dirección de Derecho

### C. Generación de DOCX con Imagen de Membrete
* Recibirás un archivo de imagen (PNG/JPG) denominado **Membrete Secuencia.png** que representa el membrete institucional. Este archivo ya se encuentra en la carpeta `public` del proyecto.
* Usando la librería `docx`, genera el archivo de Word e integra la imagen del membrete de fondo en la sección de encabezado (`Header`) o mediante componentes gráficos de tamaño completo (`ImageRun` con ajuste absoluto o detrás del texto) para que abarque toda la hoja.
* Dibuja los textos y datos recopilados del formulario de manera limpia sobre el espacio del documento.
* Convierte el archivo DOCX resultante a un Buffer en memoria (`Packer.toBuffer`) y adjúntalo directamente al correo electrónico de Nodemailer (`attachments: [{ filename: 'secuencia.docx', content: buffer }]`).

---

# Entregables Solicitados

1. **Esquema de Zod y Tipos de TS:** Definición de tipos estructurados y el objeto de validación Zod que enlace la jerarquía relacional.
2. **Código del Componente Front-End:** El formulario React que maneje los tres componentes `<Select>` de Radix vinculados a `react-hook-form`, asegurando limpiar el estado de los hijos si cambia el padre.
3. **Código de Backend (Next.js Endpoint):** Lógica completa que use la librería `docx` para insertar la imagen del membrete de fondo, empaquetar el buffer y enviarlo mediante la configuración de `nodemailer` al correo mapeado.
4. **Propuesta UI/UX (Feedback de Carga):** Diseña un estado de carga interactivo para el botón (ej: deshabilitar el botón, mostrar un spinner o usar un componente `Toast` de Sonner/Radix) que informe al usuario: *"Guardando secuencia y enviando por correo electrónico... Por favor, espera."* y un mensaje de éxito claro, mitigando la confusión de que ya no se descargará el documento localmente.
