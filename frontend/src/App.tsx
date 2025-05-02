import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import { ToastContainer } from "react-toastify";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Newsletter from "./components/Newsletter";
import Upload from "./pages/Upload";
import HowItWorks from "./pages/HowItWorks";
import ScrollToTop from "./components/ScrollToTop";

const App = () => {
  const location = useLocation();
  return (
    <div className="">
      <ToastContainer />
      <Navbar />
      <ScrollToTop />
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
      </Routes>
      <Newsletter />
      <Footer />
    </div>
  )
}

export default App