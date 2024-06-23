import { AnimatePresence } from "framer-motion";
import { Route, Routes } from "react-router-dom";
import Home from "./components/Home Page/Home";
import Products from "./components/Products Page/Products";
function App() {
  return (
    <AnimatePresence>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category/:category" element={<Products />} />
        
      </Routes>
    </AnimatePresence>
  );
}

export default App;
