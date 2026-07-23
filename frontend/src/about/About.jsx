import { useContext } from "react";
import { LanguageContext } from "../contexts/LanguageContext";

const About = () => {
  const { t } = useContext(LanguageContext);
  return (
    <div className="min-h-screen bg-gray-50 px-4 lg:px-24 py-16">
      <section className="text-center mb-16">
        <h1 className="text-4xl lg:text-5xl font-bold text-blue-700 mb-4">{t("aboutTitle")}</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">{t("aboutIntro")}</p>
      </section>
      <section className="text-center mb-16">
        <h2 className="text-3xl lg:text-4xl font-semibold text-blue-700 mb-4">{t("aboutMissionTitle")}</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t("aboutMissionIntro")}</p>
        <ul className="list-disc list-inside text-lg text-gray-600 mt-4 mx-auto max-w-2xl text-left">
          <li>{t("aboutM1")}</li>
          <li>{t("aboutM2")}</li>
          <li>{t("aboutM3")}</li>
          <li>{t("aboutM4")}</li>
        </ul>
      </section>
      <section className="bg-blue-100 py-12 px-6 rounded-lg mb-16">
        <h2 className="text-3xl lg:text-4xl font-semibold text-blue-700 text-center mb-8">{t("aboutWhyTitle")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { title: t("aboutF1Title"), desc: t("aboutF1Desc") },
            { title: t("aboutF2Title"), desc: t("aboutF2Desc") },
            { title: t("aboutF3Title"), desc: t("aboutF3Desc") },
            { title: t("aboutF4Title"), desc: t("aboutF4Desc") },
          ].map((f, i) => (
            <div key={i} className="space-y-4">
              <h3 className="text-xl font-bold text-blue-700">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="text-center">
        <h2 className="text-3xl lg:text-4xl font-semibold text-blue-700 mb-4">{t("aboutJoinTitle")}</h2>
        <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">{t("aboutJoinDesc")}</p>
        <button className="bg-blue-700 text-white font-semibold px-8 py-3 rounded-full hover:bg-blue-800 transition-all duration-300">
          {t("aboutJoinBtn")}
        </button>
      </section>
    </div>
  );
};
export default About;
