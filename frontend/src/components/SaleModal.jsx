// frontend/src/components/SaleModal.jsx (Confirmado para descuento de stock)

import React, { useState, useEffect, useMemo } from "react";
import {
  Modal, Box, Typography, TextField, Button, Alert,
  MenuItem, List, ListItem, ListItemText, Divider, IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: '90%', md: 600 }, 
  maxHeight: '90vh',
  overflowY: 'auto',
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

// Se requiere la lista de productos para el dropdown
export default function SaleModal({ open, handleClose, products, handleSave }) {
  // Estado para la factura (Sale)
  const [clientName, setClientName] = useState("");
  // Estado para la lista de items en la factura: [{ productId, name, quantity, unitPrice, subtotal }]
  const [saleItems, setSaleItems] = useState([]); 

  // Estados para añadir un nuevo item
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantityToAdd, setQuantityToAdd] = useState(1);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Resetear estados al abrir el modal
  useEffect(() => {
    setClientName("");
    setSaleItems([]);
    setSelectedProductId("");
    setQuantityToAdd(1);
    setMessage(null);
  }, [open]);

  // Producto seleccionado actualmente para añadir
  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Cálculo del total de la factura
  const total = useMemo(() => {
    return saleItems.reduce((sum, item) => sum + item.subtotal, 0);
  }, [saleItems]);

  const handleAddItem = () => {
    if (!selectedProduct || quantityToAdd <= 0) {
      setMessage("Seleccione un producto y una cantidad válida.");
      return;
    }
    
    const quantity = parseInt(quantityToAdd, 10);
    
    // Validar stock (importante para facturación)
    const availableStock = selectedProduct.stock;
    if (quantity > availableStock) {
        setMessage(`No hay suficiente stock para ${selectedProduct.name}. Stock disponible: ${availableStock}.`);
        return;
    }
    
    // Si el producto ya existe en la lista, sumar la cantidad
    const existingItemIndex = saleItems.findIndex(item => item.productId === selectedProductId);
    
    if (existingItemIndex > -1) {
        const updatedItems = [...saleItems];
        const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
        
        // Re-validar stock con la nueva cantidad total
        if (newQuantity > availableStock) {
            setMessage(`La cantidad total de ${selectedProduct.name} excede el stock. Disponible: ${availableStock}.`);
            return;
        }

        updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: newQuantity,
            subtotal: newQuantity * selectedProduct.price
        };
        setSaleItems(updatedItems);

    } else {
        // Añadir nuevo item
        const newItem = {
            productId: selectedProduct.id,
            name: selectedProduct.name,
            quantity: quantity,
            unitPrice: selectedProduct.price,
            subtotal: quantity * selectedProduct.price,
        };
        setSaleItems([...saleItems, newItem]);
    }

    // Resetear campos de adición
    setSelectedProductId("");
    setQuantityToAdd(1);
    setMessage(null);
  };
  
  const handleRemoveItem = (productId) => {
    setSaleItems(saleItems.filter(item => item.productId !== productId));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (saleItems.length === 0) {
        setMessage("La factura debe tener al menos un producto.");
        setLoading(false);
        return;
    }

    // Datos finales para enviar al backend
    const dataToSend = {
      clientName: clientName || "Consumidor Final",
      // Mapeamos los items para enviar solo los datos esenciales al backend
      // El backend usará 'productId' y 'quantity' para descontar el stock.
      items: saleItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice, 
      })),
      total: total, 
    };

    try {
      // handleSave llama al API en Dashboard.jsx
      await handleSave(dataToSend);
      setMessage("Factura registrada con éxito!");
      setTimeout(handleClose, 1000); 

    } catch (error) {
      const msg = error.response?.data?.message || "Error al registrar la venta. Verifique el stock y la conexión.";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style} component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" component="h2" gutterBottom>
          Generar Nueva Factura (Venta)
        </Typography>

        {message && (
          <Alert severity={message.includes("éxito") ? "success" : "error"} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}
        
        {/* Campo de Cliente */}
        <TextField
            label="Nombre del Cliente (Opcional)"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            fullWidth
            margin="normal"
            sx={{ mb: 3 }}
        />

        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
            Agregar Productos a la Factura
        </Typography>

        {/* Formulario para añadir Item */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <TextField
                select
                label="Producto"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                sx={{ flexGrow: 3 }}
            >
                {products.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                        {option.name} (Stock: {option.stock})
                    </MenuItem>
                ))}
            </TextField>
            <TextField
                label="Cant."
                type="number"
                value={quantityToAdd}
                onChange={(e) => setQuantityToAdd(e.target.value)}
                sx={{ width: 80 }}
                inputProps={{ min: "1", max: selectedProduct ? selectedProduct.stock : 1 }}
            />
            <Button 
                onClick={handleAddItem} 
                variant="contained" 
                startIcon={<AddIcon />}
                disabled={!selectedProductId || quantityToAdd < 1}
                sx={{ flexGrow: 1 }}
            >
                Añadir
            </Button>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {/* Listado de Items en la Factura */}
        <Typography variant="subtitle1" fontWeight="bold">
            Items de Factura ({saleItems.length})
        </Typography>
        <List dense sx={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 1, mb: 2 }}>
            {saleItems.length === 0 ? (
                <ListItem>
                    <ListItemText primary="No hay productos agregados a la factura." />
                </ListItem>
            ) : (
                saleItems.map((item, index) => (
                    <React.Fragment key={item.productId}>
                        <ListItem 
                            secondaryAction={
                                <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveItem(item.productId)}>
                                    <DeleteIcon color="error" fontSize="small" />
                                </IconButton>
                            }
                        >
                            <ListItemText 
                                primary={`${item.name} (${item.quantity} x Q${item.unitPrice.toFixed(2)})`}
                                secondary={`Subtotal: Q${item.subtotal.toFixed(2)}`}
                            />
                        </ListItem>
                        {index < saleItems.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                ))
            )}
        </List>


        {/* Total Final */}
        <Typography variant="h5" sx={{ mt: 2, mb: 2, fontWeight: 'bold', textAlign: 'right', color: 'primary.main' }}>
            TOTAL DE FACTURA: Q{total.toFixed(2)}
        </Typography>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={handleClose} color="error" variant="outlined" disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="outlined" color="primary" disabled={loading}>
              {loading ? "Registrando..." : "Generar Factura"}
            </Button>
        </Box>
      </Box>
    </Modal>
  );
}