import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set the document title
document.title = "METACHROME - Advanced Crypto Trading Platform";

createRoot(document.getElementById("root")!).render(<App />);
