import { GeneralInformationForm } from "@/components/forms/GeneralInformationForm";

export default function GeneralInformationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Información General
          </h1>
          <p className="text-gray-600">
            Llenado de datos para la secuencia académica
          </p>
        </div>
        <GeneralInformationForm />
      </div>
    </div>
  );
}
