-- ============================================================================
-- BillTool — GST Invoicing schema
-- Run this in your Supabase SQL editor (Project → SQL → New query → paste → run)
-- Idempotent: safe to re-run.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. company_settings (singleton row, id=1)
-- ----------------------------------------------------------------------------
create table if not exists public.company_settings (
  id              int primary key default 1,
  name            text not null default '',
  tagline         text not null default '',
  address         text not null default '',
  city            text not null default '',
  state           text not null default '',
  pincode         text not null default '',
  gst_number      text not null default '',
  phone           text not null default '',
  email           text not null default '',
  logo_url        text,
  signature_url   text,
  signature_scale numeric(3,2) not null default 1.0,
  bank_name       text not null default '',
  bank_branch     text not null default '',
  account_number  text not null default '',
  ifsc_code       text not null default '',
  invoice_prefix  text not null default 'GST',
  current_number  int  not null default 0,
  invoice_template text not null default 'modern',
  terms           text not null default '',
  updated_at      timestamptz not null default now(),
  constraint company_settings_singleton check (id = 1)
);

-- Single-user app: RLS disabled.
alter table public.company_settings disable row level security;

-- Add new columns if they don't exist
alter table public.company_settings
  add column if not exists signature_scale numeric(3,2) not null default 1.0;

alter table public.company_settings
  add column if not exists invoice_template text not null default 'modern';

-- Seed default company data for SAI COMMUNICATION SYSTEM
insert into public.company_settings (
  id, name, tagline, address, city, state, pincode, gst_number, phone,
  bank_name, bank_branch, account_number, ifsc_code,
  invoice_prefix, current_number, invoice_template,
  terms
) values (
  1,
  'SAI COMMUNICATION SYSTEM',
  'CCTV & Security System Specialists',
  '17, Mangleshwar Society, Nr. Chandrika Park, Ishanpur Road',
  'Ahmedabad',
  'Gujarat',
  '380050',
  '24AFFPM8113C1ZW',
  '98252 86526',
  'Maninagar Co.op. Bank Ltd',
  'Maninagar',
  '251111101004003',
  'HDFC0CMCPBL',
  'GST',
  39,
  'modern',
  E'1. Goods once sold will not be taken back.\n2. Payment due within 15 days from invoice date.\n3. Subject to Ahmedabad jurisdiction only.\n4. Interest @ 18% p.a. will be charged on delayed payments.'
)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- 2. invoices
-- ----------------------------------------------------------------------------
create table if not exists public.invoices (
  id                uuid primary key default gen_random_uuid(),
  invoice_no        text not null unique,
  date              date not null default current_date,
  due_date          date,

  buyer_name        text not null default '',
  buyer_address     text not null default '',
  buyer_city        text not null default '',
  buyer_state       text not null default '',
  buyer_pincode     text not null default '',
  buyer_gst         text not null default '',
  buyer_phone       text not null default '',
  buyer_email       text not null default '',

  items             jsonb not null default '[]'::jsonb,

  tax_type          text not null default 'CGST_SGST'
                    check (tax_type in ('CGST_SGST', 'IGST')),
  cgst_rate         numeric(5,2) not null default 0,
  sgst_rate         numeric(5,2) not null default 0,
  igst_rate         numeric(5,2) not null default 0,

  subtotal          numeric(12,2) not null default 0,
  cgst_amount       numeric(12,2) not null default 0,
  sgst_amount       numeric(12,2) not null default 0,
  igst_amount       numeric(12,2) not null default 0,
  round_off         numeric(6,2)  not null default 0,
  total             numeric(12,2) not null default 0,

  amount_in_words   text not null default '',
  notes             text not null default '',
  delivery_note     text not null default '',

  status            text not null default 'draft'
                    check (status in ('draft','sent','paid','cancelled')),

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.invoices disable row level security;

create index if not exists invoices_created_at_idx on public.invoices (created_at desc);
create index if not exists invoices_status_idx     on public.invoices (status);
create index if not exists invoices_buyer_idx      on public.invoices (buyer_name);

-- ----------------------------------------------------------------------------
-- 3. updated_at trigger
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_invoices_updated_at on public.invoices;
create trigger trg_invoices_updated_at
  before update on public.invoices
  for each row execute function public.set_updated_at();

drop trigger if exists trg_company_settings_updated_at on public.company_settings;
create trigger trg_company_settings_updated_at
  before update on public.company_settings
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 4. Atomic invoice-number allocator
-- Returns the NEXT invoice number (current_number + 1) and increments the
-- counter in the same transaction. Use this from the API route on submit.
-- ----------------------------------------------------------------------------
create or replace function public.increment_invoice_number()
returns int
language plpgsql
as $$
declare
  next_num int;
begin
  update public.company_settings
     set current_number = current_number + 1
   where id = 1
   returning current_number into next_num;

  if next_num is null then
    raise exception 'company_settings row (id=1) not found. Did the seed insert fail?';
  end if;

  return next_num;
end $$;

-- ----------------------------------------------------------------------------
-- 5. Storage bucket for logo + signature
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('company-assets', 'company-assets', true)
on conflict (id) do update set public = true;

-- Note: Storage policies can be configured in Supabase dashboard under:
-- Storage → company-assets → Policies
-- Allow public read and write for single-user app
