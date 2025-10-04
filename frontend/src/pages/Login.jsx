// src/pages/Login.jsx (Versión sin la opción de 'Crear Cuenta')

import React, { useState } from 'react';
// 🟢 La ruta es correcta, pero el archivo 'api.js' ahora existe para resolver el error de compilación.
import { api } from '../services/api'; 
import { useNavigate } from 'react-router-dom';
import {
    Container, 
    Box, 
    Typography, 
    TextField, 
    Button, 
    CircularProgress, 
    Alert,
    CssBaseline, 
    Paper,
    // ❌ Link se elimina porque ya no se usa
} from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Llama al endpoint de login; el backend debe devolver { token, role, email, userId }
            const response = await api.post('/auth/login', { email, password });
            
            // 🟢 IMPORTANTE: Se asume que el backend devuelve 'userId'
            const { token, role, email: userEmail, userId } = response.data; 
            
            if (token && role) {
                // 1. ALMACENAR DATOS CRÍTICOS EN LOCALSTORAGE ANTES DE NAVEGAR
                localStorage.setItem('token', token);
                localStorage.setItem('role', role);
                // 🟢 Se guarda el email real
                localStorage.setItem('email', userEmail); 
                // 🟢 Se guarda el ID de usuario real
                localStorage.setItem('userId', userId); 

                // 2. Navegar a la página principal
                navigate('/dashboard', { replace: true });
            } else {
                setError('La respuesta del servidor fue incompleta.');
            }
        } catch (err) {
            // Manejo de errores de la API
            const errorMessage = err.response?.data?.message || 'Error de conexión o credenciales inválidas.';
            setError(errorMessage);
            console.error('Login Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box 
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                backgroundColor: '#f0f2f5',
                padding: 2,
            }}
        >
            <CssBaseline />
            <Container component="main" maxWidth="xs">
                <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
                    <LockOpenIcon sx={{ m: 1, color: '#1976d2', fontSize: 40 }} />
                    <Typography component="h1" variant="h5" fontWeight="bold" color="#1976d2" mb={1}>
                        Iniciar Sesión
                    </Typography>
                    <Typography component="h2" variant="body2" color="text.secondary" mb={3}>
                        Ingresa tus credenciales para acceder.
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1, width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Correo Electrónico"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Contraseña"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{
                                mt: 1.5,
                                mb: 2,
                                py: 1.2,
                                fontWeight: 'bold',
                                borderRadius: 1.5,
                                backgroundColor: '#1976d2',
                                '&:hover': {
                                    backgroundColor: '#115293',
                                },
                            }}
                            disabled={loading || !email || !password}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'INGRESAR'}
                        </Button>
                        
                        {/* ❌ Se elimina el enlace de "Crear Cuenta" */}
                        
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Login;