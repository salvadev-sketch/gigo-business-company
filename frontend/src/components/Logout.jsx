import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { BsBoxArrowRight } from "react-icons/bs";

const Logout = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const confirmLogout = window.confirm(
      "Woba ushaka gusohoka muri sisiteme?"
    );
    if (!confirmLogout) return;
    try {
      await logout();
      alert("Musohotse neza muri sisiteme.");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      alert("Habaye ikibazo mu gusohoka.");
    }
  };

  return (
    <div className="flex justify-center items-center mt-5">
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300"
      >
        <BsBoxArrowRight />
        Gusohoka
      </button>
    </div>
  );
};

export default Logout;
