import axios from 'axios';

// 🟢 Configuración del cliente API
// Asegúrate de que esta URL base coincida con la URL donde se ejecuta tu servidor Express.
const API_BASE_URL = 'http://localhost:3001/api'; 

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para inyectar el token de autenticación en cada petición
api.interceptors.request.use(config => {
    // 1. Obtener el token del almacenamiento local (usado en Login.jsx)
    const token = localStorage.getItem('token');
    
    // 2. Si existe un token, adjuntarlo al encabezado de Autorización
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
}, error => {
    // Manejar errores de petición
    return Promise.reject(error);
});

// Nota: Puedes añadir un interceptor de respuesta aquí para manejar 401 (Unauthorized) 
// y redirigir al usuario al login si su token ha expirado.
