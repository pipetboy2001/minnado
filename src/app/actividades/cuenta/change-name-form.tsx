"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Save, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconInput } from "@/components/ui/icon-input";
import { Label } from "@/components/ui/label";

const changeNameSchema = z.object({
  name: z.string().trim().min(1, "El nombre no puede estar vacío").max(100),
});

type ChangeNameValues = z.infer<typeof changeNameSchema>;

export function ChangeNameForm({ currentName }: { currentName: string }) {
  const { update } = useSession();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangeNameValues>({
    resolver: zodResolver(changeNameSchema),
    defaultValues: { name: currentName },
  });

  async function onSubmit(values: ChangeNameValues) {
    const response = await fetch("/api/account/name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: values.name }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      toast.error(data?.error ?? "No se pudo actualizar el nombre.");
      return;
    }

    // The JWT still has the old name baked in until we push the update
    // through useSession(), then re-render server components that read
    // auth() (progreso, repaso, etc.) so they pick up the new value too.
    await update({ name: values.name });
    router.refresh();
    toast.success("Nombre actualizado.");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
      <Label htmlFor="name">Nombre</Label>
      <div className="flex gap-2">
        <IconInput
          icon={UserCircle}
          id="name"
          autoComplete="name"
          className="flex-1"
          {...register("name")}
        />
        <Button
          type="submit"
          size="icon"
          disabled={isSubmitting}
          aria-label="Guardar nombre"
        >
          <Save />
        </Button>
      </div>
      {errors.name && (
        <p className="text-sm text-destructive">{errors.name.message}</p>
      )}
    </form>
  );
}
