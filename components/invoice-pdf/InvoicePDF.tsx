"use client";

import { memo } from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { CompanySettings, InvoiceItem, TaxType } from "@/types/invoice";
import {
  formatCurrencyPlain,
  numberToWords,
  calculateTotals,
} from "@/lib/invoice-utils";

export interface InvoicePDFData {
  invoice_no: string;
  date: string;
  due_date?: string;

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

const COLORS = {
  primary: "#1e40af",
  primaryLight: "#dbeafe",
  primaryDark: "#0f1829",
  text: "#0f172a",
  textMuted: "#475569",
  border: "#cbd5e1",
  borderLight: "#e2e8f0",
  rowAlt: "#f8fafc",
  white: "#ffffff",
};

// Create styles factory for dynamic template colors
function createStyles(colors: typeof COLORS) {
  return StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: colors.text,
    flexDirection: "column",
  },
  // ----- Header (dark blue) -----
  header: {
    backgroundColor: colors.primary,
    color: colors.white,
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: { flexDirection: "row", flex: 1, gap: 12 },
  logoBox: {
    width: 52,
    height: 52,
    borderRadius: 4,
    backgroundColor: colors.white,
    color: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoImg: { width: 52, height: 52, objectFit: "contain" },
  logoLetter: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
  },
  companyName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
    marginBottom: 2,
  },
  companyTagline: { fontSize: 8.5, color: colors.primaryLight, marginBottom: 4 },
  companyMeta: { fontSize: 8, color: colors.primaryLight, lineHeight: 1.5 },
  headerRight: { alignItems: "flex-end" },
  headerInvoiceLabel: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
    letterSpacing: 2,
  },
  headerInvoiceSub: {
    fontSize: 8,
    color: colors.primaryLight,
    marginTop: 2,
    letterSpacing: 1,
  },

  // ----- Meta strip (light blue) -----
  metaStrip: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  metaCell: { flex: 1 },
  metaLabel: {
    fontSize: 7,
    color: colors.primary,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaValue: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: colors.text },

  // ----- Body -----
  body: {
    paddingHorizontal: 24,
    paddingTop: 14,
    flexGrow: 1,
  },
  twoCol: { flexDirection: "row", gap: 10 },
  partyBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 3,
    padding: 8,
  },
  partyLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  partyName: { fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 3 },
  partyText: { fontSize: 8.5, color: colors.textMuted, lineHeight: 1.45 },
  partyGst: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    marginTop: 4,
    color: colors.text,
  },

  // ----- Items table -----
  table: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    color: colors.white,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderLight,
    minHeight: 22,
  },
  tableRowAlt: { backgroundColor: colors.rowAlt },
  th: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
    letterSpacing: 0.4,
  },
  td: { fontSize: 9, color: colors.text },

  // column widths
  colSr: { width: "5%", textAlign: "center" },
  colDesc: { width: "38%", paddingHorizontal: 4 },
  colHsn: { width: "11%", textAlign: "center" },
  colQty: { width: "8%", textAlign: "right" },
  colUnit: { width: "8%", textAlign: "center" },
  colRate: { width: "15%", textAlign: "right" },
  colAmt: { width: "15%", textAlign: "right", paddingRight: 4 },

  // ----- Totals row -----
  totalsRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },
  wordsBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 3,
    padding: 8,
  },
  wordsBadge: {
    backgroundColor: colors.primary,
    color: colors.white,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    alignSelf: "flex-start",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  wordsText: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: colors.text,
    lineHeight: 1.4,
  },
  notesLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: colors.textMuted,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: 8.5,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 1.4,
  },
  totalsBox: {
    width: 220,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  totalsLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderLight,
  },
  totalsLabel: { fontSize: 9, color: colors.textMuted },
  totalsValue: { fontSize: 9, fontFamily: "Helvetica-Bold", color: colors.text },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: colors.primary,
  },
  grandTotalLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
    letterSpacing: 1,
  },
  grandTotalValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
  },

  // ----- Bank + signature -----
  bankSig: { flexDirection: "row", marginTop: 12, gap: 10 },
  bankBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 3,
    padding: 8,
  },
  signBox: {
    width: 220,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 3,
    padding: 8,
    alignItems: "center",
    justifyContent: "space-between",
  },
  bankLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  bankRow: { flexDirection: "row", marginBottom: 2 },
  bankK: { fontSize: 8, color: colors.textMuted, width: 70 },
  bankV: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: colors.text },

  signatureImg: { width: 100, height: 40, objectFit: "contain" },
  signatureFor: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    marginBottom: 28,
    textAlign: "center",
    color: colors.text,
  },
  signatureLabel: {
    fontSize: 7.5,
    color: colors.textMuted,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    paddingTop: 3,
    marginTop: 3,
    letterSpacing: 0.4,
    textAlign: "center",
    width: "100%",
  },

  // ----- Terms + declaration -----
  termsBox: {
    marginTop: 10,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
    paddingVertical: 4,
  },
  termsLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    marginBottom: 3,
    letterSpacing: 0.5,
  },
  termsText: {
    fontSize: 7.5,
    color: colors.textMuted,
    lineHeight: 1.4,
  },
  declaration: {
    fontSize: 7.5,
    color: colors.textMuted,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 24,
  },

  // ----- Footer -----
  footer: {
    backgroundColor: colors.primaryDark,
    color: colors.white,
    paddingVertical: 6,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  footerText: { fontSize: 7.5, color: "#cbd5e1" },
  });
}

interface Props {
  data: InvoicePDFData;
  company: CompanySettings;
  signatureScale?: number;
}

function InvoicePDFComponent({ data, company, signatureScale = 1 }: Props) {
  const totals = calculateTotals(data.items, data.tax_type, data.tax_rate);
  const itemsToShow = [...data.items];
  const padCount = Math.max(0, 4 - itemsToShow.length);

  const placeOfSupply = company.state || "Gujarat";
  const taxLabel =
    data.tax_type === "CGST_SGST"
      ? `CGST ${(data.tax_rate / 2).toFixed(1)}% / SGST ${(data.tax_rate / 2).toFixed(1)}%`
      : `IGST ${data.tax_rate.toFixed(1)}%`;

  const initial = (company.name || "S").trim().charAt(0).toUpperCase();
  const scaledSignatureWidth = 100 * signatureScale;
  const scaledSignatureHeight = 40 * signatureScale;

  // Template color scheme
  const template = company.invoice_template || "modern";
  const templateColors: Record<string, typeof COLORS> = {
    modern: COLORS,
    classic: {
      ...COLORS,
      primary: "#64748b",
      primaryLight: "#e2e8f0",
      primaryDark: "#1e293b",
    },
    minimal: {
      ...COLORS,
      primary: "#000000",
      primaryLight: "#f5f5f5",
      primaryDark: "#000000",
    },
  };

  const colors = templateColors[template] || COLORS;

  const styles = createStyles(colors);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header} fixed>
          <View style={styles.headerLeft}>
            <View style={styles.logoBox}>
              {company.logo_url ? (
                <Image src={company.logo_url} style={styles.logoImg} />
              ) : (
                <Text style={styles.logoLetter}>{initial}</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.companyName}>{company.name}</Text>
              {company.tagline ? (
                <Text style={styles.companyTagline}>{company.tagline}</Text>
              ) : null}
              <Text style={styles.companyMeta}>{company.address}</Text>
              <Text style={styles.companyMeta}>
                {[company.city, company.state, company.pincode]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
              <Text style={styles.companyMeta}>
                {company.phone ? `Phone: ${company.phone}` : ""}
                {company.email ? `   Email: ${company.email}` : ""}
              </Text>
              {company.gst_number ? (
                <Text style={[styles.companyMeta, { marginTop: 2 }]}>
                  GSTIN: {company.gst_number}
                </Text>
              ) : null}
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerInvoiceLabel}>INVOICE</Text>
            <Text style={styles.headerInvoiceSub}>TAX INVOICE (ORIGINAL)</Text>
          </View>
        </View>

        {/* META STRIP */}
        <View style={styles.metaStrip}>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>INVOICE NO.</Text>
            <Text style={styles.metaValue}>{data.invoice_no}</Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>DATE</Text>
            <Text style={styles.metaValue}>{formatDate(data.date)}</Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>DUE DATE</Text>
            <Text style={styles.metaValue}>
              {data.due_date ? formatDate(data.due_date) : "—"}
            </Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>PLACE OF SUPPLY</Text>
            <Text style={styles.metaValue}>{placeOfSupply}</Text>
          </View>
        </View>

        {/* BODY */}
        <View style={styles.body}>
          {/* Bill From / Bill To */}
          <View style={styles.twoCol}>
            <View style={styles.partyBox}>
              <Text style={styles.partyLabel}>BILL FROM</Text>
              <Text style={styles.partyName}>{company.name}</Text>
              <Text style={styles.partyText}>{company.address}</Text>
              <Text style={styles.partyText}>
                {[company.city, company.state, company.pincode]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
              {company.phone ? (
                <Text style={styles.partyText}>Phone: {company.phone}</Text>
              ) : null}
              {company.gst_number ? (
                <Text style={styles.partyGst}>GSTIN: {company.gst_number}</Text>
              ) : null}
            </View>
            <View style={styles.partyBox}>
              <Text style={styles.partyLabel}>BILL TO</Text>
              <Text style={styles.partyName}>
                {data.buyer_name || "—"}
              </Text>
              {data.buyer_address ? (
                <Text style={styles.partyText}>{data.buyer_address}</Text>
              ) : null}
              <Text style={styles.partyText}>
                {[data.buyer_city, data.buyer_state, data.buyer_pincode]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
              {data.buyer_phone ? (
                <Text style={styles.partyText}>Phone: {data.buyer_phone}</Text>
              ) : null}
              {data.buyer_email ? (
                <Text style={styles.partyText}>Email: {data.buyer_email}</Text>
              ) : null}
              {data.buyer_gst ? (
                <Text style={styles.partyGst}>GSTIN: {data.buyer_gst}</Text>
              ) : null}
            </View>
          </View>

          {/* Items table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, styles.colSr]}>#</Text>
              <Text style={[styles.th, styles.colDesc]}>DESCRIPTION</Text>
              <Text style={[styles.th, styles.colHsn]}>HSN/SAC</Text>
              <Text style={[styles.th, styles.colQty]}>QTY</Text>
              <Text style={[styles.th, styles.colUnit]}>UNIT</Text>
              <Text style={[styles.th, styles.colRate]}>RATE</Text>
              <Text style={[styles.th, styles.colAmt]}>AMOUNT</Text>
            </View>
            {itemsToShow.map((it, i) => (
              <View
                key={it.id || `r-${i}`}
                style={[
                  styles.tableRow,
                  i % 2 === 1 ? styles.tableRowAlt : {},
                ]}
              >
                <Text style={[styles.td, styles.colSr]}>{i + 1}</Text>
                <Text style={[styles.td, styles.colDesc]}>
                  {it.description}
                </Text>
                <Text style={[styles.td, styles.colHsn]}>{it.hsn_code}</Text>
                <Text style={[styles.td, styles.colQty]}>
                  {Number(it.quantity || 0).toFixed(2)}
                </Text>
                <Text style={[styles.td, styles.colUnit]}>{it.unit}</Text>
                <Text style={[styles.td, styles.colRate]}>
                  {formatCurrencyPlain(Number(it.rate || 0))}
                </Text>
                <Text style={[styles.td, styles.colAmt]}>
                  {formatCurrencyPlain(Number(it.amount || 0))}
                </Text>
              </View>
            ))}
            {Array.from({ length: padCount }).map((_, i) => {
              const idx = itemsToShow.length + i;
              return (
                <View
                  key={`pad-${i}`}
                  style={[
                    styles.tableRow,
                    idx % 2 === 1 ? styles.tableRowAlt : {},
                  ]}
                >
                  <Text style={[styles.td, styles.colSr]}> </Text>
                  <Text style={[styles.td, styles.colDesc]}> </Text>
                  <Text style={[styles.td, styles.colHsn]}> </Text>
                  <Text style={[styles.td, styles.colQty]}> </Text>
                  <Text style={[styles.td, styles.colUnit]}> </Text>
                  <Text style={[styles.td, styles.colRate]}> </Text>
                  <Text style={[styles.td, styles.colAmt]}> </Text>
                </View>
              );
            })}
          </View>

          {/* Totals row */}
          <View style={styles.totalsRow}>
            <View style={styles.wordsBox}>
              <Text style={styles.wordsBadge}>AMOUNT IN WORDS</Text>
              <Text style={styles.wordsText}>
                {numberToWords(totals.total)}
              </Text>
              {data.notes ? (
                <>
                  <Text style={styles.notesLabel}>NOTES</Text>
                  <Text style={styles.notesText}>{data.notes}</Text>
                </>
              ) : null}
              {data.delivery_note ? (
                <>
                  <Text style={styles.notesLabel}>DELIVERY NOTE</Text>
                  <Text style={styles.notesText}>{data.delivery_note}</Text>
                </>
              ) : null}
            </View>
            <View style={styles.totalsBox}>
              <View style={styles.totalsLine}>
                <Text style={styles.totalsLabel}>Subtotal</Text>
                <Text style={styles.totalsValue}>
                  {formatCurrencyPlain(totals.subtotal)}
                </Text>
              </View>
              {data.tax_type === "CGST_SGST" ? (
                <>
                  <View style={styles.totalsLine}>
                    <Text style={styles.totalsLabel}>
                      CGST {(data.tax_rate / 2).toFixed(1)}%
                    </Text>
                    <Text style={styles.totalsValue}>
                      {formatCurrencyPlain(totals.cgst)}
                    </Text>
                  </View>
                  <View style={styles.totalsLine}>
                    <Text style={styles.totalsLabel}>
                      SGST {(data.tax_rate / 2).toFixed(1)}%
                    </Text>
                    <Text style={styles.totalsValue}>
                      {formatCurrencyPlain(totals.sgst)}
                    </Text>
                  </View>
                </>
              ) : (
                <View style={styles.totalsLine}>
                  <Text style={styles.totalsLabel}>
                    IGST {data.tax_rate.toFixed(1)}%
                  </Text>
                  <Text style={styles.totalsValue}>
                    {formatCurrencyPlain(totals.igst)}
                  </Text>
                </View>
              )}
              <View style={styles.totalsLine}>
                <Text style={styles.totalsLabel}>Round Off</Text>
                <Text style={styles.totalsValue}>
                  {totals.roundOff >= 0 ? "+" : ""}
                  {formatCurrencyPlain(totals.roundOff)}
                </Text>
              </View>
              <View style={styles.grandTotal}>
                <Text style={styles.grandTotalLabel}>TOTAL</Text>
                <Text style={styles.grandTotalValue}>
                  ₹{formatCurrencyPlain(totals.total)}
                </Text>
              </View>
            </View>
          </View>

          {/* Bank + signature */}
          <View style={styles.bankSig}>
            <View style={styles.bankBox}>
              <Text style={styles.bankLabel}>BANK DETAILS</Text>
              <View style={styles.bankRow}>
                <Text style={styles.bankK}>Bank Name</Text>
                <Text style={styles.bankV}>{company.bank_name || "—"}</Text>
              </View>
              <View style={styles.bankRow}>
                <Text style={styles.bankK}>Branch</Text>
                <Text style={styles.bankV}>{company.bank_branch || "—"}</Text>
              </View>
              <View style={styles.bankRow}>
                <Text style={styles.bankK}>A/C No.</Text>
                <Text style={styles.bankV}>
                  {company.account_number || "—"}
                </Text>
              </View>
              <View style={styles.bankRow}>
                <Text style={styles.bankK}>IFSC Code</Text>
                <Text style={styles.bankV}>{company.ifsc_code || "—"}</Text>
              </View>
              <Text style={[styles.bankLabel, { marginTop: 6 }]}>
                TAX SUMMARY
              </Text>
              <Text style={styles.partyText}>{taxLabel}</Text>
            </View>
            <View style={styles.signBox}>
              <Text style={styles.signatureFor}>FOR {company.name}</Text>
              {company.signature_url ? (
                <Image
                  src={company.signature_url}
                  style={{
                    width: scaledSignatureWidth,
                    height: scaledSignatureHeight,
                    objectFit: "contain",
                  }}
                />
              ) : (
                <View style={{ height: scaledSignatureHeight }} />
              )}
              <Text style={styles.signatureLabel}>AUTHORISED SIGNATORY</Text>
            </View>
          </View>

          {/* Terms */}
          {company.terms ? (
            <View style={styles.termsBox}>
              <Text style={styles.termsLabel}>TERMS & CONDITIONS</Text>
              <Text style={styles.termsText}>{company.terms}</Text>
            </View>
          ) : null}

          {/* Declaration */}
          <Text style={styles.declaration}>
            We declare that this invoice shows the actual price of the goods
            described and that all particulars are true and correct.
          </Text>
        </View>

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            This is a Computer Generated Invoice
          </Text>
          <Text style={styles.footerText}>
            {company.gst_number ? `GSTIN: ${company.gst_number}` : ""}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export const InvoicePDF = memo(InvoicePDFComponent);

function formatDate(s: string): string {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
