import { useState, useEffect } from "react";
import { LanguageContext } from "./LanguageContext";
import { translations } from "./translations";

const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("gigo_lang") || "fr"
  );

  useEffect(() => {
    localStorage.setItem("gigo_lang", language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] ?? translations.fr?.[key] ?? translations.en?.[key] ?? key;
  };

  const languageInfo = {
    language,
    setLanguage,
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
