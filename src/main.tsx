import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// Let the prerenderer know the page is ready
setTimeout(() => {
  document.dispatchEvent(new Event('render-event'));
}, 1000);
