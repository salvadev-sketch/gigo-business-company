import React, { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { LanguageContext } from "../contexts/LanguageContext";
import { BranchContext } from "../contexts/BranchContext";
import { BRANCHES } from "../dashboard/dashboardUtils";
import { useNavigate, useLocation, Link } from "react-router-dom";

const Signup = () => {
  const { createUser, loginwithGoogle } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const branchCtx = useContext(BranchContext) || {};
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [branch, setBranch] = useState(branchCtx.branch || "");
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSignUp = async (event) => {
    event.preventDefault();
    const form = event.target;
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;
    setError("");
    setLoading(true);
    try {
      const result = await createUser(email, password);
      const user = result.user;
      const idToken = await user.getIdToken();
      await fetch(`${import.meta.env.VITE_API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` },
        body: JSON.stringify({ name: name || user.displayName || email.split("@")[0], email: user.email, photoURL: user.photoURL || "", role: "customer", branch }),
      });
      alert(t("signupSuccess"));
      navigate(from, { replace: true });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!branch) {
      setError(t("signupBranchRequired") || "Please select your branch before continuing.");
      return;
    }
    try {
      const result = await loginwithGoogle();
      const user = result.user;
      const idToken = await user.getIdToken();
      await fetch(`${import.meta.env.VITE_API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` },
        body: JSON.stringify({ name: user.displayName || user.email.split("@")[0], email: user.email, photoURL: user.photoURL || "", role: "customer", branch }),
      });
      alert(`${t("signupWelcome")} ${user.displayName || user.email}`);
      navigate(from, { replace: true });
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        setError(t("signupGoogleClosed"));
      } else {
        setError(error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-700">GIGO COMPANY LIMITED</h1>
            <p className="text-gray-600 mt-2">{t("signupSubtitle")}</p>
          </div>
          <form onSubmit={handleSignUp} className="space-y-5">
            <input type="text" name="name" required placeholder={t("signupName")} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="email" name="email" required placeholder={t("signupEmail")} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="password" name="password" required placeholder={t("signupPassword")} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select name="branch" required value={branch} onChange={(e) => setBranch(e.target.value)} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700">
              <option value="" disabled>{t("signupSelectBranch") || "Select your branch"}</option>
              {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <button type="submit" disabled={loading} className="w-full bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-800 transition">
              {loading ? t("signupLoading") : t("signupSubmit")}
            </button>
          </form>
          <div className="my-5 flex items-center">
            <div className="flex-grow border-t"></div>
            <span className="px-3 text-gray-500">{t("signupOr")}</span>
            <div className="flex-grow border-t"></div>
          </div>
          <button onClick={handleGoogleSignup} className="flex items-center justify-center w-full border rounded-lg py-3 hover:bg-gray-50">
            <img src="/assets/google-logo.svg" alt="Google" className="w-5 h-5 mr-2" />
            {t("signupGoogle")}
          </button>
          <p className="text-center text-gray-600 mt-6">
            {t("signupHaveAccount")}{" "}
            <Link to="/login" className="text-blue-700 font-semibold hover:underline">{t("signupLoginHere")}</Link>
          </p>
          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        </div>
      </div>
    </div>
  );
};
export default Signup;
