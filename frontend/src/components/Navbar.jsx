import React from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  
  // LEER el email y el rol del localStorage
  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role"); 

  const handleLogout = () => {
    // Limpiar todas las claves de autenticación
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role"); 
    navigate("/login");
  };

  return (
    <div style={{ backgroundColor: "#1976d2", color: "#fff", padding: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      {/* Mostrar el email y el rol */}
      <h2 style={{ margin: 0 }}>
        Ferretería 
        {email && role && (
            <span style={{ fontSize: '0.9em', marginLeft: '15px', fontWeight: 'normal' }}>
                ({email} - Rol: {role})
            </span>
        )}
      </h2>
      <button onClick={handleLogout} style={{ background: "#fff", color: "#1976d2", border: "none", padding: "8px 15px", cursor: "pointer", borderRadius: '4px', fontWeight: 'bold' }}>
        Cerrar sesión
      </button>
    </div>
  );
}