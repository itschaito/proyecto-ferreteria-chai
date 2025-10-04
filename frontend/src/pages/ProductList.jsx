// frontend/src/components/ProductList.jsx (MODIFICADO)

import React from "react";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Box } from "@mui/material";

// *** MODIFICACIÓN: Aceptar la prop 'isAdmin' ***
export default function ProductList({ products, isAdmin }) { 
  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Precio</TableCell>
            {/* Mostrar la columna "Acciones" solo si es Admin */}
            {isAdmin && <TableCell>Acciones</TableCell>} 
          </TableRow>
        </TableHead>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              {/* Ajustar el colspan si se muestra la columna de acciones */}
              <TableCell colSpan={isAdmin ? 4 : 3} align="center">No hay productos aún</TableCell> 
            </TableRow>
          ) : (
            products.map(p => (
              <TableRow key={p.id}>
                <TableCell>{p.id}</TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>${p.price}</TableCell>
                
                {/* *** Mostrar botones de acción solo si es Admin *** */}
                {isAdmin && (
                  <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button size="small" variant="contained" color="warning">
                              Editar
                          </Button>
                          <Button size="small" variant="contained" color="error">
                              Eliminar
                          </Button>
                      </Box>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}