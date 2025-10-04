// frontend/src/pages/Register.jsx

import React, { useState } from 'react';
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
    Link
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await api.post('/auth/register', { email, password });
            
            if (response.status === 201) {
                setSuccess('Usuario creado con éxito. Redirigiendo a Login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }

        } catch (err) {
            console.error('Register error:', err);
            const message = err.response?.data?.message || 'Error de conexión. Intente de nuevo.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <Box 
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #4caf50 30%, #81c784 90%)',
            }}
        >
            <CssBaseline />
            <Container component="main" maxWidth="xs">
                <Paper elevation={12} sx={{ p: 4, borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <PersonAddIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                        Registro de Usuario
                    </Typography>
                    
                    {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{success}</Alert>}

                    <Box component="form" onSubmit={handleRegister} noValidate sx={{ width: '100%' }}>
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
                            variant="outlined"
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Contraseña"
                            type="password"
                            id="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            variant="outlined"
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
                                backgroundColor: '#4caf50',
                                '&:hover': {
                                    backgroundColor: '#388e3c',
                                },
                            }}
                            disabled={loading || !email || !password}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'REGISTRAR'}
                        </Button>
                        
                        <Box display="flex" justifyContent="center">
                            <Link href="/login" variant="body2" underline="hover">
                                ¿Ya tienes cuenta? Inicia Sesión
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Register;
