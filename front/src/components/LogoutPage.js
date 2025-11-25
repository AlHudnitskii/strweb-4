import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import axiosInstance from "../axiosInstance";

function LogoutPage() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await axiosInstance.get("/auth/logout");
      } catch (error) {
        console.error("Ошибка при выходе:", error);
      } finally {
        logout();
        navigate("/login");
      }
    };

    performLogout();
  }, [logout, navigate]);

  return (
    <div className="container">
      <h2>Выход из системы...</h2>
    </div>
  );
}

export default LogoutPage;
