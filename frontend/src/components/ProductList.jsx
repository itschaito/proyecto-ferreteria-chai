import React from "react";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

export default function ProductList({ products }) {
  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Precio</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} align="center">No hay productos aún</TableCell>
            </TableRow>
          ) : (
            products.map(p => (
              <TableRow key={p.id}>
                <TableCell>{p.id}</TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>${p.price}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
