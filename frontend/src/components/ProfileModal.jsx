// src/components/ProfileModal.jsx

import React from "react";
import {
  Modal, Box, Typography, Button, Divider, Stack
} from "@mui/material";
import { AccountCircle, Email, PeopleAlt } from '@mui/icons-material';

const style = {
  position: "absolute",
  top: "50%",
  left: "55%", // Ajuste la posición ligeramente para mejor visualización
  transform: "translate(-50%, -50%)",
  width: { xs: '90%', sm: 400 },
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 3,
  textAlign: 'center',
};

/**
 * Modal para mostrar la información del usuario logeado (Rol y Correo).
 * Se ha omitido el ID para mantener la vista limpia.
 */
export default function ProfileModal({ open, handleClose, userData }) {
    
    // Si userData no existe o no tiene los campos esperados, usa valores por defecto
    const { userEmail = 'No disponible', userRole = 'Visitante' } = userData || {};

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
                <AccountCircle color="primary" sx={{ fontSize: 80, mb: 2 }} />
                
                <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
                    Mi Perfil de Usuario
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Stack spacing={2} alignItems="flex-start" sx={{ mb: 3 }}>
                    
                    {/* Rol */}
                    <Box display="flex" alignItems="center" width="100%">
                        <PeopleAlt color="secondary" sx={{ mr: 2 }} />
                        <Typography fontWeight="bold" variant="body1">
                            Rol:
                        </Typography>
                        <Typography variant="body1" sx={{ ml: 1, flexGrow: 1, textAlign: 'right' }}>
                            {userRole}
                        </Typography>
                    </Box>

                    {/* Correo */}
                    <Box display="flex" alignItems="center" width="100%">
                        <Email color="action" sx={{ mr: 2 }} />
                        <Typography fontWeight="bold" variant="body1">
                            Correo:
                        </Typography>
                        <Typography variant="body1" sx={{ ml: 1, flexGrow: 1, textAlign: 'right', overflowWrap: 'break-word' }}>
                            {userEmail}
                        </Typography>
                    </Box>

                </Stack>
                
                <Button 
                    onClick={handleClose} 
                    variant="contained" 
                    fullWidth 
                    sx={{ mt: 2 }}
                >
                    CERRAR
                </Button>
            </Box>
        </Modal>
    );
}