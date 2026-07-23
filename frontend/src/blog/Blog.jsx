import { useContext } from "react";
import { LanguageContext } from "../contexts/LanguageContext";

const Blog = () => {
  const { t } = useContext(LanguageContext);
  const posts = [
    { img: "/assets/awar.png",     titleKey: "blogPost1Title", descKey: "blogPost1Desc" },
    { img: "/assets/books.jpg",    titleKey: "blogPost2Title", descKey: "blogPost2Desc" },
    { img: "/assets/salvator.jpg", titleKey: "blogPost3Title", descKey: "blogPost3Desc" },
  ];
  return (
    <div className="min-h-screen bg-gray-50 px-4 lg:px-24 py-16">
      <section className="text-center mb-16">
        <h1 className="text-4xl lg:text-5xl font-bold text-blue-700 mb-4">{t("blogTitle")}</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">{t("blogIntro")}</p>
      </section>
      <section className="mb-16">
        <h2 className="text-3xl lg:text-4xl font-semibold text-blue-700 text-center mb-6">{t("blogLatestTitle")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-lg">
              <img src={post.img} alt={t(post.titleKey)} className="w-full h-48 object-cover rounded-lg mb-4" />
              <h3 className="text-2xl font-semibold text-blue-700 mb-2">{t(post.titleKey)}</h3>
              <p className="text-gray-600 mb-4">{t(post.descKey)}</p>
              <a href="#" className="text-blue-700 hover:text-blue-900 font-semibold">{t("blogReadMore")}</a>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-blue-100 py-12 text-center rounded-lg">
        <h2 className="text-3xl lg:text-4xl font-semibold text-blue-700 mb-4">{t("blogNewsletterTitle")}</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">{t("blogNewsletterDesc")}</p>
        <input type="email" placeholder={t("blogEmailPlaceholder")} className="px-6 py-3 rounded-full w-2/3 sm:w-1/2 text-lg mb-4 border-2 border-gray-300" />
        <div>
          <button className="bg-blue-700 text-white px-8 py-3 rounded-full hover:bg-blue-800 transition-all duration-300">
            {t("blogSubscribeBtn")}
          </button>
        </div>
      </section>
    </div>
  );
};
export default Blog;
