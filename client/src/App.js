import { AnimatePresence } from "framer-motion";
import { Route, Routes } from "react-router-dom";
import Home from "./components/Home Page/Home";

function App() {
  return (
    <AnimatePresence>
      <Routes>
        <Route path="/" element={<Home />} />
        
      </Routes>
    </AnimatePresence>
  );
}

export default App;
