import React, { useContext, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AuthContext, AuthProvider } from "./AuthContext";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import ClientsPage from "./components/ClientsPage";
import NewsPage from "./components/NewsPage";
import PropertiesPage from "./components/PropertiesPage";
import ProfilePage from "./components/ProfilePage";
import LogoutPage from "./components/LogoutPage";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import queryString from "query-string";
import { jwtDecode } from "jwt-decode";
import CreatePropertyPage from "./components/CreatePropertyPage";
import EditPropertyPage from "./components/EditPropertyPage";
import ViewPropertyPage from "./components/ViewPropertyPage";
import CatImage from "./components/CatImage";
import DogImage from "./components/DogImage";
import DemonstrationPage from "./components/DemonstrationPage";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login } = useContext(AuthContext);

  useEffect(() => {
    const parsed = queryString.parse(window.location.search);
    if (parsed.token) {
      localStorage.setItem("token", parsed.token);
      try {
        const decoded = jwtDecode(parsed.token);
        login({ username: decoded.username, id: decoded.id });
      } catch (error) {
        console.error("Invalid token:", error);
        alert("Ошибка аутентификации. Пожалуйста, попробуйте снова.");
      }
      navigate("/clients");
    }
  }, [location.search, login, navigate]);

  return (
    <div>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <div className="animal-container">
              <CatImage />
              <DogImage />
            </div>
          }
        />
        <Route path="/demonstration" element={<DemonstrationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/properties/create" element={<CreatePropertyPage />} />
        <Route path="/properties/edit/:id" element={<EditPropertyPage />} />
        <Route path="/properties/view/:id" element={<ViewPropertyPage />} />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route path="/auth/logout" element={<LogoutPage />} />
      </Routes>
    </div>
  );
}

export default function WrappedApp() {
  return (
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  );
}
