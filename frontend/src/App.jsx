import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import MyFooter from "./components/MyFooter";
import ScrollToTop from "./components/Scrolltotop";  // match exact filename;
import FirstVisitBranchPrompt from "./components/FirstVisitBranchPrompt";

function App() {
  return (
    <>
      <ScrollToTop />
      <FirstVisitBranchPrompt />
      <Navbar />
      <div className="gigo-layout min-h-screen">
        <Outlet />
      </div>
      <MyFooter />
    </>
  );
}

export default App;
