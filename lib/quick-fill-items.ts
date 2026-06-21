export interface QuickFillItem {
  label: string;
  description: string;
  hsn_code: string;
  unit: string;
  default_rate: number;
}

export const QUICK_FILL_ITEMS: QuickFillItem[] = [
  {
    label: "CCTV Camera (2MP Bullet)",
    description: "CCTV Camera 2MP Bullet HD",
    hsn_code: "8525",
    unit: "Nos",
    default_rate: 1800,
  },
  {
    label: "CCTV Camera (5MP Dome)",
    description: "CCTV Camera 5MP Dome HD",
    hsn_code: "8525",
    unit: "Nos",
    default_rate: 2800,
  },
  {
    label: "DVR 4 Channel",
    description: "DVR 4 Channel Recording Device",
    hsn_code: "8521",
    unit: "Nos",
    default_rate: 4500,
  },
  {
    label: "NVR 8 Channel",
    description: "NVR 8 Channel IP Recording Device",
    hsn_code: "8521",
    unit: "Nos",
    default_rate: 7500,
  },
  {
    label: "Hard Disk 1TB",
    description: "Surveillance Grade Hard Disk 1TB",
    hsn_code: "8471",
    unit: "Nos",
    default_rate: 4200,
  },
  {
    label: "Cabling Work",
    description: "CABLING FOR CCTV & CAMERA INSTALLATION",
    hsn_code: "8544",
    unit: "Mtr",
    default_rate: 1500,
  },
  {
    label: "Camera Repairing Charges",
    description: "CCTV Camera & Equipment Repairing Charges",
    hsn_code: "998713",
    unit: "Job",
    default_rate: 800,
  },
  {
    label: "Power Supply Unit",
    description: "12V DC Power Supply / SMPS",
    hsn_code: "8543",
    unit: "Nos",
    default_rate: 650,
  },
  {
    label: "BNC Connector & Accessories",
    description: "BNC Connectors & Cable Accessories",
    hsn_code: "8517",
    unit: "Set",
    default_rate: 250,
  },
];

export const HSN_CODE_HINTS: Record<string, string> = {
  "8544": "Wires / Cables",
  "8525": "CCTV / Security Cameras",
  "8521": "DVR / NVR / Recording Devices",
  "8471": "Computer / Hard Disk",
  "8517": "Network Switches / Routers",
  "8543": "Electronic Devices NEC",
  "998713": "Maintenance / Repair Services",
};

export const UNIT_OPTIONS = ["Nos", "Pcs", "Mtr", "Set", "Job", "Hr", "Day", "Box"];

export const TAX_RATE_OPTIONS = [0, 5, 12, 18, 28];
