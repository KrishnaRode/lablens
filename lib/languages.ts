/**
 * Languages LabLens can explain a report in. `promptName` is what we tell the
 * model to write in; `locale` is a BCP-47 tag for browser text-to-speech
 * (Web Speech API) so a future "Listen" button picks the right voice.
 */
export interface Language {
  /** Our short key, e.g. "hi". */
  code: string;
  /** English name, e.g. "Hindi". */
  label: string;
  /** Native name, e.g. "हिन्दी". */
  native: string;
  /** How we instruct the model, e.g. "Hindi (हिन्दी)". */
  promptName: string;
  /** BCP-47 locale for speech synthesis, e.g. "hi-IN". */
  locale: string;
  /** Text direction; only set for right-to-left scripts. */
  dir?: "rtl";
}

export const LANGUAGES: Language[] = [
  { code: "en", label: "English", native: "English", promptName: "English", locale: "en-IN" },
  { code: "hi", label: "Hindi", native: "हिन्दी", promptName: "Hindi (हिन्दी)", locale: "hi-IN" },
  { code: "bn", label: "Bengali", native: "বাংলা", promptName: "Bengali (বাংলা)", locale: "bn-IN" },
  { code: "mr", label: "Marathi", native: "मराठी", promptName: "Marathi (मराठी)", locale: "mr-IN" },
  { code: "te", label: "Telugu", native: "తెలుగు", promptName: "Telugu (తెలుగు)", locale: "te-IN" },
  { code: "ta", label: "Tamil", native: "தமிழ்", promptName: "Tamil (தமிழ்)", locale: "ta-IN" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી", promptName: "Gujarati (ગુજરાતી)", locale: "gu-IN" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ", promptName: "Kannada (ಕನ್ನಡ)", locale: "kn-IN" },
  { code: "ml", label: "Malayalam", native: "മലയാളം", promptName: "Malayalam (മലയാളം)", locale: "ml-IN" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ", promptName: "Punjabi (ਪੰਜਾਬੀ)", locale: "pa-IN" },
  { code: "or", label: "Odia", native: "ଓଡ଼ିଆ", promptName: "Odia (ଓଡ଼ିଆ)", locale: "or-IN" },
  { code: "ur", label: "Urdu", native: "اردو", promptName: "Urdu (اردو)", locale: "ur-IN", dir: "rtl" },
];

export const DEFAULT_LANGUAGE = "en";

/** Safe lookup — falls back to English for any unknown/missing code. */
export function getLanguage(code: string | undefined): Language {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}
