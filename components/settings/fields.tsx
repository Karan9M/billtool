"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { UseFormRegister, FieldErrors, Path } from "react-hook-form";
import type { CompanySettingsInput } from "@/lib/validators";

type FieldName = Path<CompanySettingsInput>;

interface TextFieldProps {
  name: FieldName;
  label: string;
  register: UseFormRegister<CompanySettingsInput>;
  errors: FieldErrors<CompanySettingsInput>;
  type?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

export function TextField({
  name,
  label,
  register,
  errors,
  type = "text",
  placeholder,
  className,
  inputClassName,
}: TextFieldProps) {
  const err = errors[name];
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
        {...register(name, type === "number" ? { valueAsNumber: true } : {})}
      />
      {err?.message ? (
        <p className="text-xs text-destructive font-medium">{String(err.message)}</p>
      ) : null}
    </div>
  );
}

interface TextAreaFieldProps {
  name: FieldName;
  label: string;
  register: UseFormRegister<CompanySettingsInput>;
  errors: FieldErrors<CompanySettingsInput>;
  rows?: number;
  placeholder?: string;
  className?: string;
}

export function TextAreaField({
  name,
  label,
  register,
  errors,
  rows = 4,
  placeholder,
  className,
}: TextAreaFieldProps) {
  const err = errors[name];
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
