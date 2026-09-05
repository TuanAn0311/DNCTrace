import { BrowserRouter as Router } from "react-router-dom";

import Footer from "./components/Footer";
import Header from "./components/Header";
import { ToastProvider } from "./components/ToastProvider";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <Router>
      <ToastProvider>
        <Header />
        <main className="app-shell">
          <AppRoutes />
        </main>
        <Footer />
      </ToastProvider>
    </Router>
  );
}

export default App;
