import { useState, useContext } from "react";
import { BranchContext } from "./BranchContext";
import { LanguageContext } from "./LanguageContext";
import { BRANCHES } from "../dashboard/dashboardUtils";

const BRANCH_KEY = "gigo_branch";

const BranchProvider = ({ children }) => {
  const [branch, setBranchState] = useState(() => localStorage.getItem(BRANCH_KEY) || "");
  const { setLanguage, hasManualLanguage } = useContext(LanguageContext) || {};

  // Called when the visitor picks a branch (first-visit prompt, or later
  // via a branch switcher if one is added). Persists the choice and, only
  // if the visitor hasn't already manually chosen a language themselves,
  // applies the branch's default language: French for Bujumbura HQ,
  // English for every other branch.
  const selectBranch = (b) => {
    localStorage.setItem(BRANCH_KEY, b);
    setBranchState(b);
    if (setLanguage && hasManualLanguage && !hasManualLanguage()) {
      setLanguage(b === "Bujumbura HQ" ? "fr" : "en", { isDefault: true });
    }
  };

  const branchInfo = {
    branch,
    setBranch: selectBranch,
    branches: BRANCHES,
    hasChosenBranch: Boolean(branch),
  };

  return (
    <BranchContext.Provider value={branchInfo}>
      {children}
    </BranchContext.Provider>
  );
};

export default BranchProvider;
