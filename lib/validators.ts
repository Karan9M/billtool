import { z } from "zod";

export const invoiceItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Description required"),
  hsn_code: z.string().min(1, "HSN required"),
  quantity: z.coerce.number().min(0),
  unit: z.string().min(1),
  rate: z.coerce.number().min(0),
  amount: z.coerce.number().min(0),
});

export const invoiceFormSchema = z.object({
  invoice_no: z.string().min(1),
  date: z.string().min(1),
  due_date: z.string().optional().default(""),

  buyer_name: z.string().min(1, "Buyer name required"),
  buyer_address: z.string().default(""),
  buyer_city: z.string().default(""),
  buyer_state: z.string().default(""),
  buyer_pincode: z.string().default(""),
  buyer_gst: z.string().default(""),
  buyer_phone: z.string().default(""),
  buyer_email: z.string().default(""),

  items: z.array(invoiceItemSchema).min(1, "At least one item required"),

  tax_type: z.enum(["CGST_SGST", "IGST"]),
  tax_rate: z.coerce.number().min(0).max(28),

  notes: z.string().default(""),
  delivery_note: z.string().default(""),
});

export const companySettingsSchema = z.object({
  name: z.string().min(1),
  tagline: z.string().default(""),
  address: z.string().default(""),
  city: z.string().default(""),
  state: z.string().default(""),
  pincode: z.string().default(""),
  gst_number: z.string().default(""),
  phone: z.string().default(""),
  email: z.string().default(""),
  bank_name: z.string().default(""),
  bank_branch: z.string().default(""),
  account_number: z.string().default(""),
  ifsc_code: z.string().default(""),
  invoice_prefix: z.string().min(1),
  current_number: z.coerce.number().min(0),
  terms: z.string().default(""),
});

export type InvoiceFormInput = z.infer<typeof invoiceFormSchema>;
export type CompanySettingsInput = z.infer<typeof companySettingsSchema>;
