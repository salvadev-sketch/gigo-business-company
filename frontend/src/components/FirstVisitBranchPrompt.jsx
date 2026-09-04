import { useContext } from "react";
import { BranchContext } from "../contexts/BranchContext";
import { LanguageContext } from "../contexts/LanguageContext";

const FirstVisitBranchPrompt = () => {
  const { hasChosenBranch, branches, setBranch } = useContext(BranchContext);
  const { t } = useContext(LanguageContext);

  if (hasChosenBranch) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl text-center">
        <div className="text-4xl mb-3">📍</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{t("chooseBranchTitle")}</h2>
        <p className="text-sm text-gray-500 mb-6">{t("chooseBranchSubtitle")}</p>
        <div className="grid grid-cols-2 gap-3">
          {branches.map((b) => (
            <button
              key={b}
              onClick={() => setBranch(b)}
              className="rounded-xl border border-gray-200 bg-gray-50 hover:bg-orange-50 hover:border-orange-400 px-4 py-4 font-semibold text-gray-800 transition-colors"
            >
              {b}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FirstVisitBranchPrompt;
