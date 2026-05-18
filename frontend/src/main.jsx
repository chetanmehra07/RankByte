import React from "react";
import ReactDOM from "react-dom/client";

import { ClerkProvider } from "@clerk/clerk-react";

import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";

import "./index.css";

import ThemeProvider from "./context/ThemeProvider";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>,
);
