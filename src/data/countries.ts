export interface Country { code: string; name: string; flag: string }

/** Auswahl gängiger Länder (Herkunft). Erweiterbar. */
export const COUNTRIES: Country[] = [
  { code: "DE", name: "Deutschland", flag: "🇩🇪" },
  { code: "AT", name: "Österreich", flag: "🇦🇹" },
  { code: "CH", name: "Schweiz", flag: "🇨🇭" },
  { code: "FR", name: "Frankreich", flag: "🇫🇷" },
  { code: "IT", name: "Italien", flag: "🇮🇹" },
  { code: "ES", name: "Spanien", flag: "🇪🇸" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "NL", name: "Niederlande", flag: "🇳🇱" },
  { code: "BE", name: "Belgien", flag: "🇧🇪" },
  { code: "SE", name: "Schweden", flag: "🇸🇪" },
  { code: "NO", name: "Norwegen", flag: "🇳🇴" },
  { code: "DK", name: "Dänemark", flag: "🇩🇰" },
  { code: "FI", name: "Finnland", flag: "🇫🇮" },
  { code: "PL", name: "Polen", flag: "🇵🇱" },
  { code: "GB", name: "Großbritannien", flag: "🇬🇧" },
  { code: "IE", name: "Irland", flag: "🇮🇪" },
  { code: "US", name: "USA", flag: "🇺🇸" },
  { code: "CA", name: "Kanada", flag: "🇨🇦" },
  { code: "BR", name: "Brasilien", flag: "🇧🇷" },
  { code: "MX", name: "Mexiko", flag: "🇲🇽" },
  { code: "AR", name: "Argentinien", flag: "🇦🇷" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "ZA", name: "Südafrika", flag: "🇿🇦" },
  { code: "EG", name: "Ägypten", flag: "🇪🇬" },
  { code: "TR", name: "Türkei", flag: "🇹🇷" },
  { code: "IN", name: "Indien", flag: "🇮🇳" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "Südkorea", flag: "🇰🇷" },
  { code: "SG", name: "Singapur", flag: "🇸🇬" },
  { code: "AU", name: "Australien", flag: "🇦🇺" },
  { code: "OTHER", name: "Anderes Land", flag: "🌍" },
];

export const countryByCode = (code: string | null) => COUNTRIES.find((c) => c.code === code);

export const DEPARTMENTS = [
  "Engineering", "Product", "Design", "Marketing", "Sales", "Data",
  "People / HR", "Operations", "Finance", "Customer Success", "Sonstiges",
];
