export type InvoiceStatus = "draft" | "sent" | "paid" | "cancelled";
export type TaxType = "CGST_SGST" | "IGST";

export interface InvoiceItem {
  id: string;
  description: string;
  hsn_code: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoice_no: string;
  date: string;
  due_date: string | null;

  buyer_name: string;
  buyer_address: string;
  buyer_city: string;
  buyer_state: string;
  buyer_pincode: string;
  buyer_gst: string;
  buyer_phone: string;
  buyer_email: string;

  items: InvoiceItem[];

  tax_type: TaxType;
  cgst_rate: number;
  sgst_rate: number;
  igst_rate: number;

  subtotal: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  round_off: number;
  total: number;

  amount_in_words: string;
  notes: string;
  delivery_note: string;

  status: InvoiceStatus;
  created_at: string;
  updated_at: string;
}

export interface CompanySettings {
  id: number;
  name: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gst_number: string;
  phone: string;
  email: string;
  logo_url: string | null;
  signature_url: string | null;
  signature_scale: number;
  bank_name: string;
  bank_branch: string;
  account_number: string;
  ifsc_code: string;
  invoice_prefix: string;
  current_number: number;
  invoice_template: string;
  terms: string;
  updated_at: string;
}

export interface InvoiceTotals {
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  roundOff: number;
  total: number;
}

export interface InvoiceFormValues {
  invoice_no: string;
  date: string;
  due_date: string;

  buyer_name: string;
  buyer_address: string;
  buyer_city: string;
  buyer_state: string;
  buyer_pincode: string;
  buyer_gst: string;
  buyer_phone: string;
  buyer_email: string;

  items: InvoiceItem[];

  tax_type: TaxType;
  tax_rate: number;

  notes: string;
  delivery_note: string;
}
