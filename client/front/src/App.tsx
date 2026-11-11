import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import ProductDetail from "./pages/ProductDetail";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/producto/:id" element={<ProductDetail />} />
      </Routes>
    </HashRouter>
  );
}