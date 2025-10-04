// frontend/src/components/ProductModal.jsx (Verificado)

import React, { useState, useEffect } from "react";
import {
  Modal, Box, Typography, TextField, Button, Alert, // 🟢 CRUCIAL: TextField está aquí
} from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

export default function ProductModal({ open, handleClose, productToEdit, handleSave }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || "");
      setPrice(productToEdit.price || "");
      setStock(productToEdit.stock || "");
    } else {
      setName("");
      setPrice("");
      setStock("");
    }
    setMessage(null);
  }, [productToEdit, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const data = {
      name,
      // Aseguramos que los valores sean números antes de enviar
      price: parseFloat(price) || 0, 
      stock: parseInt(stock, 10) || 0,
    };

    try {
      await handleSave(data, productToEdit ? productToEdit.id : null);
      setTimeout(handleClose, 1000); 

    } catch (error) {
      // *** CORRECCIÓN CLAVE: MUESTRA EL MENSAJE DE ERROR DEL BACKEND ***
      const status = error.response?.status;
      const backendMessage = error.response?.data?.message;
      
      let msg = 'Error desconocido al guardar el producto.';

      if (backendMessage) {
         msg = backendMessage;
      } else if (status === 403) {
         msg = "Permiso denegado. ¡Solo los Administradores pueden hacer esto!";
      } else if (status) {
         msg = `Error (${status}): Falla de conexión o servidor.`;
      }

      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style} component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" component="h2" gutterBottom>
          {productToEdit ? "Editar Producto" : "Crear Nuevo Producto"}
        </Typography>

        {message && (
          <Alert severity={message.includes("éxito") ? "success" : "error"} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {/* ... (campos de TextField) ... */}
        <TextField
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Precio"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          fullWidth
          margin="normal"
          required
          inputProps={{ step: "0.01", min: "0" }}
        />
        <TextField
          label="Stock (Cantidad)"
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          fullWidth
          margin="normal"
          required
          inputProps={{ min: "0" }}
        />
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={handleClose} color="error" variant="outlined" disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="outlined" color="primary" disabled={loading}>
              {loading ? "Guardando..." : productToEdit ? "Guardar Cambios" : "Crear Producto"}
            </Button>
        </Box>
      </Box>
    </Modal>
  );
}