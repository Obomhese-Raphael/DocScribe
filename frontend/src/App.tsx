import { Route, Routes, useLocation, Navigate } from "react-router-dom";
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
import History from "./pages/History";
import { useUser } from "@clerk/clerk-react";
import { SignIn, SignUp } from "@clerk/clerk-react"; // Import SignUp
import Loader from "./components/Loader";
import SharedSummary from "./pages/SharedSummary";

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
};

// Public routes that don't require authentication
const publicRoutes = ["/sign-in", "/sign-up"];

const App = () => {
  const location = useLocation();
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <Loader />;
  }

  // Check if current route is public
  const isPublicRoute = publicRoutes.includes(location.pathname);

  return (
    <div className="">
      <ToastContainer />
      {/* Only show Navbar on authenticated routes or public routes */}
      {(user || isPublicRoute) && <Navbar />}
      <ScrollToTop />
      <Routes location={location} key={location.pathname}>
        {/* Public route for sign-in */}
        <Route
          path="/sign-in"
          element={
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
              <SignIn
                routing="path"
                path="/sign-in"
                fallbackRedirectUrl="/"
                signUpUrl="/sign-up"
              />
            </div>
          }
        />

        {/* Public route for sign-up */}
        <Route
          path="/sign-up"
          element={
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
              <SignUp
                routing="path"
                path="/sign-up"
                fallbackRedirectUrl="/"
                signInUrl="/sign-in"
              />
            </div>
          }
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contact"
          element={
            <ProtectedRoute>
              <Contact />
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <About />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/how-it-works"
          element={
            <ProtectedRoute>
              <HowItWorks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shared/:id"
          element={
            <ProtectedRoute>
              <SharedSummary />
            </ProtectedRoute>
          }
        />

        {/* Catch all route - redirect to sign-in if not authenticated */}
        <Route
          path="*"
          element={
            user ? <Navigate to="/" replace /> : <Navigate to="/sign-in" replace />
          }
        />
      </Routes>

      {/* Only show Newsletter and Footer on authenticated routes */}
      {user && (
        <>
          <Newsletter />
          <Footer />
        </>
      )}
    </div>
  )
}

export default App