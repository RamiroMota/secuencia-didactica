# Agent Instructions: Secuencia Didáctica

## Tech Stack
- **Framework**: Next.js 14 (App Router), TypeScript, Tailwind CSS.
- **Form Handling**: `react-hook-form` with `zod` validation.
- **UI Components**: Radix UI, Lucide React, Sonner (toasts).
- **Backend/Utilities**: `docx` (document generation), `nodemailer` (email).

## Key Workflows & Constraints
- **Document Generation**: 
  - Use `docx` to generate Word files.
  - Must include `public/Membrete Secuencia.png` as a background/header image.
  - Documents must be generated as Buffers in memory (`Packer.toBuffer`).
- **Email Routing**: 
  - Documents are sent as attachments via `nodemailer`.
  - **Constraint**: Disable local downloads (`Content-Disposition: attachment`). All processing happens on the server.
  - Email destinations are mapped via `CARRERA_EMAILS` in `lib/academic-data.ts`.
- **UI Patterns**:
  - Nested conditional selects are driven by `DIVISION_CARRERAS` and `CARRERA_PROGRAMAS` in `lib/academic-data.ts`.
  - The main form in `create-sequence-module.tsx` implements `localStorage` for draft persistence (1-hour expiry).
  - Use Sonner for loading/success feedback during the "Guardar y Enviar" process.

## Developer Commands
- `npm run dev`: Start development server.
- `npm run build`: Build for production.
- `npm run lint`: Run linting.
- `npm run start`: Start production server.

## Project Structure
- `app/`: Next.js App Router pages and API routes.
- `components/`: Shared UI components.
- `lib/`: Core library logic. `lib/academic-data.ts` is the source of truth for academic hierarchy, email mappings, and Zod schemas.
- `utils/`: Helper functions.
- `hooks/`: Custom React hooks.
- `public/`: Static assets (contains mandatory `Membrete Secuencia.png`).
- `create-sequence-module.tsx`: Core form component for sequence creation (currently located in root).
