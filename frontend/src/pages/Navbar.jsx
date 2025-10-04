// fileName: Navbar.jsx (MODIFICADO)

import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const email = localStorage.getItem("email");
  // *** CAMBIO CLAVE 2: LEER EL ROL ***
  const role = localStorage.getItem("role"); 

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <AppBar position="static">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* *** CAMBIO CLAVE 3: MOSTRAR EMAIL Y ROL *** */}
        <Typography variant="h6">
          Bienvenido, {email} ({role})
        </Typography>
        <Button color="inherit" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </Toolbar>
    </AppBar>
  );
}