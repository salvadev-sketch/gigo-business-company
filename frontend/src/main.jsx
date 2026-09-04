import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./routers/router";
import AuthProvider from "./contexts/AuthProvider";
import LanguageProvider from "./contexts/LanguageProvider";
import BranchProvider from "./contexts/BranchProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <BranchProvider>
          <RouterProvider router={router} />
        </BranchProvider>
      </LanguageProvider>
    </AuthProvider>
  </React.StrictMode>
);
