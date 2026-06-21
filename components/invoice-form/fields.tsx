"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type {
  UseFormRegister,
  FieldErrors,
  Path,
  FieldValues,
} from "react-hook-form";

interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  type?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

export function FormField<T extends FieldValues>({
  name,
  label,
  register,
  errors,
  type = "text",
  placeholder,
  className,
  inputClassName,
}: FormFieldProps<T>) {
  const err = name.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as object)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, errors) as { message?: string } | undefined;
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={name} className="text-xs text-muted-foreground font-medium">
        {label}
      </Label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        aria-invalid={!!err}
        className={cn("h-9 text-sm bg-background", inputClassName)}
        {...register(
          name,
          type === "number" ? { valueAsNumber: true } : undefined
        )}
      />
      {err?.message ? (
        <p className="text-xs text-destructive font-medium">{String(err.message)}</p>
      ) : null}
    </div>
  );
}

interface FormTextAreaProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  rows?: number;
  placeholder?: string;
  className?: string;
}

export function FormTextArea<T extends FieldValues>({
  name,
  label,
  register,
  errors,
  rows = 4,
  placeholder,
  className,
}: FormTextAreaProps<T>) {
  const err = name.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as object)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, errors) as { message?: string } | undefined;
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={name} className="text-xs text-muted-foreground font-medium">
        {label}
      </Label>
      <Textarea
        id={name}
        rows={rows}
        placeholder={placeholder}
        aria-invalid={!!err}
        className="text-sm bg-background"
        {...register(name)}
      />
      {err?.message ? (
        <p className="text-xs text-destructive font-medium">{String(err.message)}</p>
      ) : null}
    </div>
  );
}
