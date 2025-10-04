// // src/components/SaleDetailModal.jsx (VERSIÓN MÁS ROBUSTA)

// import React from "react";
// import {
//   Modal, Box, Typography, Button, Divider, List, ListItem, ListItemText, Paper, Grid, CircularProgress
// } from "@mui/material";
// import HistoryIcon from '@mui/icons-material/History';
// import PersonIcon from '@mui/icons-material/Person';
// import ReceiptIcon from '@mui/icons-material/Receipt';

// const style = {
//   position: "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   width: { xs: '95%', sm: 600, md: 700 },
//   maxHeight: '90vh',
//   overflowY: 'auto',
//   bgcolor: "background.paper",
//   boxShadow: 24,
//   p: 4,
//   borderRadius: 2,
// };

// /**
//  * Muestra los detalles de una venta específica (cliente, vendedor (email), items, total).
//  */
// export default function SaleDetailModal({ open, handleClose, sale }) {

//   // 1. COMPROBACIÓN DE SEGURIDAD ABSOLUTA
//   if (!sale) return null; 

//   // --- Procesamiento Defensivo de Datos ---
  
//   // 2. Fecha con comprobación
//   const timestamp = sale.createdAt && sale.createdAt.seconds 
//       ? sale.createdAt.seconds * 1000 
//       : sale.createdAt ? new Date(sale.createdAt).getTime() : Date.now();
  
//   const date = new Date(timestamp).toLocaleString('es-ES', { 
//     year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
//   }); 

//   // 3. Info del Vendedor con comprobación
//   const sellerInfo = sale.userEmail || sale.sellerEmail || `ID: ${sale.userId || 'N/A'}`; 
  
//   // 4. Lista de Items con comprobación de Array
//   const itemsList = Array.isArray(sale.items) ? sale.items : [];
  
//   // 5. Estado de carga: Si no hay items Y el objeto 'sale' no tiene la propiedad 'items' (aún no ha llegado el fetch)
//   // Pero si tiene la propiedad y está vacía (items: []), entonces no está cargando.
//   const isItemsLoading = itemsList.length === 0 && sale.id && (sale.items === undefined || sale.items === null);

//   return (
//     <Modal open={open} onClose={handleClose}>
//       <Box sx={style}>
//         <Typography variant="h4" component="h2" gutterBottom fontWeight="bold" sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
//           <ReceiptIcon sx={{ mr: 1 }} /> Detalle de Venta #{sale.id ? String(sale.id).substring(0, 8) : 'N/A'}
//         </Typography>
        
//         <Divider sx={{ mb: 2 }} />

//         {/* --- Información General de la Venta --- */}
//         <Grid container spacing={2} sx={{ mb: 3 }}>
//           <Grid item xs={12} sm={6}>
//             <Typography variant="body1" fontWeight="bold">
//               <PersonIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} /> Cliente:
//             </Typography>
//             {/* Uso de encadenamiento opcional para seguridad */}
//             <Typography variant="h6">{sale.clientName || 'Cliente Desconocido'}</Typography>
//           </Grid>
//           <Grid item xs={12} sm={6}>
//             <Typography variant="body1" fontWeight="bold">
//               <HistoryIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} /> Vendedor:
//             </Typography>
//             <Typography variant="h6" sx={{ wordBreak: 'break-word' }}>{sellerInfo}</Typography>
//           </Grid>
//           <Grid item xs={12}>
//             <Typography variant="body2" color="text.secondary">Fecha y Hora: {date}</Typography>
//           </Grid>
//         </Grid>

//         <Divider sx={{ mb: 2 }} />
        
//         {/* --- Items de la Venta (Lista de Productos) --- */}
//         <Typography variant="h5" gutterBottom fontWeight="bold">
//           Productos Vendidos ({itemsList.length})
//         </Typography>
        
//         <Paper elevation={1} sx={{ maxHeight: 250, overflowY: 'auto', mb: 2 }}>
//             <List disablePadding>
//                 {isItemsLoading ? (
//                     // Muestra un indicador de carga
//                     <ListItem sx={{ py: 2, justifyContent: 'center' }}>
//                       <CircularProgress size={24} sx={{ mr: 2 }} />
//                       <ListItemText primary="Cargando detalles de productos..." />
//                     </ListItem>
//                 ) : itemsList.length > 0 ? (
//                     // Muestra la lista de productos
//                     itemsList.map((item, index) => (
//                         <React.Fragment key={item.productId || index}>
//                             <ListItem>
//                                 <ListItemText
//                                     primary={item.name || `Producto ID: ${item.productId || 'N/A'}`}
//                                     // Aseguramos que unitPrice y quantity existan
//                                     secondary={`Cód: ${item.productId || 'N/A'} | ${item.quantity || 0} und. x Q${parseFloat(item.unitPrice || 0).toFixed(2)}`}
//                                 />
//                                 <Typography variant="subtitle1" fontWeight="bold" color="success.main">
//                                     Q{((item.subtotal || (item.unitPrice * item.quantity)) || 0).toFixed(2)}
//                                 </Typography>
//                             </ListItem>
//                             {index < itemsList.length - 1 && <Divider component="li" />}
//                         </React.Fragment>
//                     ))
//                 ) : (
//                     // Muestra mensaje si no hay productos
//                     <ListItem>
//                       <ListItemText 
//                         primary="Detalles de productos no disponibles." 
//                         secondary="Verifique que el API de '/api/sales/:id' devuelva la propiedad 'items'." 
//                       />
//                     </ListItem>
//                 )}
//             </List>
//         </Paper>

//         {/* --- Total Final --- */}
//         <Box sx={{ mt: 3, textAlign: 'right', borderTop: '2px solid #ddd', pt: 2 }}>
//             <Typography variant="h5" fontWeight="bold" color="error.main">
//                 TOTAL DE VENTA: Q{(sale.total ? parseFloat(sale.total) : 0).toFixed(2)}
//             </Typography>
//         </Box>
        
//         <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
//             <Button onClick={handleClose} variant="contained" color="primary">
//               Cerrar
//             </Button>
//         </Box>
//       </Box>
//     </Modal>
//   );
// }