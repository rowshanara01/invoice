import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { InvoiceEditorPage } from "./pages/InvoiceEditorPage";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/invoices/new" element={<InvoiceEditorPage />} />
        <Route path="/invoices/:id" element={<InvoiceEditorPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
