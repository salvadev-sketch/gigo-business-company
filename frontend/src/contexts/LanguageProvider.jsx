import { useState, useEffect, useRef } from "react";
import { LanguageContext } from "./LanguageContext";
import { translations } from "./translations";

const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(
    () => localStorage.getItem("gigo_lang") || "fr"
  );
  // Tracks whether the person has ever explicitly picked a language
  // themselves (via the language switcher), as opposed to a branch-based
  // default being applied for them. Seeded to true for returning visitors
  // who already have a saved preference, so that preference is never
  // silently overwritten.
  const manualRef = useRef(localStorage.getItem("gigo_lang") !== null);

  useEffect(() => {
    localStorage.setItem("gigo_lang", language);
  }, [language]);

  const setLanguage = (lang, { isDefault = false } = {}) => {
    if (!isDefault) manualRef.current = true;
    setLanguageState(lang);
  };

  const t = (key) => {
    return translations[language]?.[key] ?? translations.fr?.[key] ?? translations.en?.[key] ?? key;
  };

  const languageInfo = {
    language,
    setLanguage,
    hasManualLanguage: () => manualRef.current,
    t,
    translations,
  };

  return (
    <LanguageContext.Provider value={languageInfo}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
