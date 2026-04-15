import "./index.css";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "./context/theme";
import { BrowserRouter as Router } from "react-router-dom";
import { NotificationBridge } from "./context/notification-bridge.tsx";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <NotificationBridge />
    <Router>
      <App />
    </Router>
  </ThemeProvider>,
);
