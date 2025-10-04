// src/components/UserModal.jsx

import React, { useState, useEffect } from "react";
import {
  Modal, Box, Typography, TextField, Button, Alert, MenuItem, CircularProgress
} from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: '90%', sm: 400 },
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const roles = [
    { value: 'Administrador', label: 'Administrador' },
    { value: 'Vendedor', label: 'Vendedor' },
];

/**
 * Modal para que el Administrador cree nuevas cuentas de usuario.
 */
export default function UserModal({ open, handleClose, handleCreateUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Vendedor"); // Rol por defecto
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (open) {
      setEmail("");
      setPassword("");
      setRole("Vendedor");
      setMessage(null);
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!email || !password || !role) {
      setMessage("Todos los campos son obligatorios.");
      setLoading(false);
      return;
    }

    try {
      await handleCreateUser({ email, password, role });
      setMessage(`Usuario "${email}" creado con éxito.`);
      // No cerramos inmediatamente, damos tiempo para leer el mensaje
      setTimeout(handleClose, 1500); 
    } catch (error) {
      setMessage(error.message || "Fallo al crear el usuario.");
      console.error("Error al crear usuario:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style} component="form" onSubmit={handleSubmit}>
        <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
          Crear Nuevo Usuario
        </Typography>

        {message && (
          <Alert severity={message.includes("éxito") ? "success" : "error"} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <TextField
          label="Correo Electrónico"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Contraseña Temporal"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          select
          label="Rol del Usuario"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          fullWidth
          margin="normal"
          required
        >
          {roles.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={handleClose} color="error" variant="outlined" disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="outlined" color="primary" disabled={loading || !email || !password}>
              {loading ? <CircularProgress size={20} color="inherit" /> : "Crear Cuenta"}
            </Button>
        </Box>
      </Box>
    </Modal>
  );
}