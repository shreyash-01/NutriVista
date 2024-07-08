import { AnimatePresence } from "framer-motion";
import { Route, Routes } from "react-router-dom";
import Home from "./components/Home Page/Home";
import Products from "./components/Products Page/Products";
import Product from "./components/Product Page/Product";
function App() {
  return (
    <AnimatePresence>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category/:category" element={<Products />} />
        <Route path="/products/:product" element={<Product />} />
        
      </Routes>
    </AnimatePresence>
  );
}

export default App;
