"use client";

import React, { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  DIVISIONES, 
  CAREER_MAPPING, 
  PROGRAM_MAPPING, 
  sequenceSchema, 
  SequenceFormValues 
} from "@/lib/schemas/sequence";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { saveSequenceAction } from "@/app/actions/sequence";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export function GeneralInformationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SequenceFormValues>({
    resolver: zodResolver(sequenceSchema),
    defaultValues: {
      division: undefined,
      career: "",
      program: "",
    },
  });

  const selectedDivision = useWatch({
    control: form.control,
    name: "division",
  });

  const selectedCareer = useWatch({
    control: form.control,
    name: "career",
  });

  // Reset career and program when division changes
  useEffect(() => {
    form.setValue("career", "");
    form.setValue("program", "");
  }, [selectedDivision, form]);

  // Reset program when career changes
  useEffect(() => {
    form.setValue("program", "");
  }, [selectedCareer, form]);

  async function onSubmit(values: SequenceFormValues) {
    setIsSubmitting(true);
    toast.info("Guardando secuencia y enviando por correo electrónico... Por favor, espera.");
    
    try {
      const result = await saveSequenceAction(values);
      if (result.success) {
        toast.success("Secuencia guardada y enviada exitosamente.");
        form.reset();
      } else {
        toast.error(result.error || "Ocurrió un error al procesar la solicitud.");
      }
    } catch (error) {
      toast.error("Error de conexión con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const careers = selectedDivision ? CAREER_MAPPING[selectedDivision] : [];
  const programs = selectedCareer ? PROGRAM_MAPPING[selectedCareer] || [] : [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
        <div className="space-y-4">
          {/* Division Select */}
          <FormField
            control={form.control}
            name="division"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección de división</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una división" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DIVISIONES.map((div) => (
                      <SelectItem key={div} value={div}>
                        {div}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Career Select */}
          <FormField
            control={form.control}
            name="career"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección de carrera</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value} 
                  disabled={!selectedDivision}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedDivision ? "Seleccione una carrera" : "Primero seleccione una división"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {careers.map((career) => (
                      <SelectItem key={career} value={career}>
                        {career}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Program Select */}
          <FormField
            control={form.control}
            name="program"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Programa educativo</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value} 
                  disabled={!selectedCareer}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedCareer ? "Seleccione un programa" : "Primero seleccione una carrera"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {programs.map((program) => (
                      <SelectItem key={program} value={program}>
                        {program}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Guardar y Enviar Secuencia"
          )}
        </Button>
      </form>
    </Form>
  );
}
