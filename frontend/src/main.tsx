import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css";

const router = getRouter();

function App() {
  return <RouterProvider router={router} />;
}

const rootElement = document.getElementById("root")!;
createRoot(rootElement).render(<App />);
