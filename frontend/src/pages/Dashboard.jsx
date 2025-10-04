// src/pages/Dashboard.jsx (VERSIÓN CON CIERRE DE CAJA, CORRECCIÓN DE DUPLICADOS Y SNACKBAR)

import React, { useEffect, useState, useCallback, useMemo } from "react"; 
import { useNavigate } from 'react-router-dom';

// RUTAS CRUCIALES: Modales para CRUD y Perfil
import ProductModal from "../components/ProductModal.jsx";
import SaleModal from "../components/SaleModal.jsx";
import ProfileModal from "../components/ProfileModal.jsx"; 
import UserModal from "../components/UserModal.jsx"; 

// --- Material UI Imports ---
import {
    Box, AppBar, Toolbar, IconButton, Typography, Button, CircularProgress, CssBaseline, 
    Alert, Container, Tooltip, Avatar, Menu, MenuItem, Tabs, Tab, 
    Stack, Divider, Grid, Card, CardContent,
    TextField, 
    InputAdornment, 
    List, ListItem, ListItemText, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
    // AGREGADO: Snackbar para notificaciones temporales
    Snackbar, 
} from "@mui/material";

// Iconos
import MenuIcon from "@mui/icons-material/Menu";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from "@mui/icons-material/Add";
import InventoryIcon from '@mui/icons-material/Inventory';
import DeleteIcon from "@mui/icons-material/Delete"; 
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search"; 
import { History, PeopleAlt, PersonAdd, PersonRemove, AccountCircle } from '@mui/icons-material'; 
import LogoutIcon from '@mui/icons-material/Logout'; 
// Icono adicional para Cierre de Caja
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';


// Función de accesibilidad para pestañas de Material UI
function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

// Colores Personalizados
const PRIMARY_COLOR = '#0B305E'; 
const SECONDARY_COLOR = '#FFC107'; 

// --- Contenido de la Vista "Home" ---
// Componente que muestra el resumen de ventas, productos e ingresos.
const HomeView = ({ sales, products }) => {
    const totalProducts = products.length;
    const totalSales = sales.length;
    // Calcula el total de ingresos de las ventas actuales (desde el último cierre de caja)
    const totalRevenue = sales.reduce((sum, sale) => sum + (parseFloat(sale.total) || 0), 0);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Resumen del Dashboard
            </Typography>
            <Grid container spacing={4}>
                <Grid item xs={12} sm={6} md={4}>
                    <Card elevation={5}>
                        <CardContent>
                            <InventoryIcon sx={{ fontSize: 40, color: PRIMARY_COLOR }} />
                            <Typography color="text.secondary" gutterBottom sx={{ mt: 1 }}>
                                Total de Productos
                            </Typography>
                            <Typography variant="h3" component="div" fontWeight="bold">
                                {totalProducts}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Card elevation={5}>
                        <CardContent>
                            <History sx={{ fontSize: 40, color: 'success.main' }} />
                            <Typography color="text.secondary" gutterBottom sx={{ mt: 1 }}>
                                Ventas Registradas (Período Actual)
                            </Typography>
                            <Typography variant="h3" component="div" fontWeight="bold">
                                {totalSales}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                    <Card elevation={5}>
                        <CardContent>
                            <MonetizationOnIcon sx={{ fontSize: 40, color: SECONDARY_COLOR }} />
                            <Typography color="text.secondary" gutterBottom sx={{ mt: 1 }}>
                                Ingresos Totales (Período Actual)
                            </Typography>
                            <Typography variant="h3" component="div" fontWeight="bold">
                                Q{totalRevenue.toFixed(2)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            
            <Alert severity="success" sx={{ mt: 4 }}>
                <Typography variant="body1">
                    ✅ La lógica de persistencia con el API está activa. Los datos se están cargando correctamente.
                </Typography>
            </Alert>
        </Container>
    );
};


// --- Lógica Principal del Dashboard ---
export default function Dashboard() {
    
    const navigate = useNavigate(); 
    
    // --- LOCAL DATA STATE ---
    const [products, setProducts] = useState([]); 
    const [sales, setSales] = useState([]);
    const [users, setUsers] = useState([]); 
    
    const [isLoadingData, setIsLoadingData] = useState(true); 
    const [globalError, setGlobalError] = useState(null); 
    const [searchTerm, setSearchTerm] = useState(''); 

    // ESTADO PARA DATOS DE USUARIO DINÁMICOS
    const [userData, setUserData] = useState({
        userId: '',
        userEmail: '',
        userRole: '',
        isAuthReady: false,
    });
    
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false); 
    
    // ESTADO PARA NOTIFICACIONES PERSONALIZADAS (MUI Snackbar/Alert)
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'info', // 'success', 'error', 'warning', 'info'
    });
    
    
    // --- LÓGICA DE CIERRE DE SESIÓN ---
    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('email');
        localStorage.removeItem('userId'); 
        console.log("Cerrando Sesión. Redirigiendo a /login..."); 
        navigate('/login', { replace: true });
    }, [navigate]);

    // --- UTILITY: AUTH HEADERS ---
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        };
    };

    // --- DATA FETCHING HANDLERS ---
    
    const fetchUsers = useCallback(async (currentRole) => {
        if (!currentRole || currentRole !== 'Administrador') {
             setUsers([]); 
             return; 
        }

        try {
            const usersResponse = await fetch('/api/users', { 
                headers: getAuthHeaders(),
            });
            
            if (usersResponse.status === 401) {
                handleLogout(); 
                return; 
            }

            if (!usersResponse.ok) {
                throw new Error(`Error ${usersResponse.status} al cargar usuarios.`);
            }
            const usersData = await usersResponse.json();
            setUsers(usersData);

        } catch (err) {
            console.error("Fallo al cargar usuarios:", err);
            setGlobalError(err.message || "Fallo al cargar la lista de usuarios.");
        }
    }, [handleLogout]);

    const fetchInitialData = useCallback(async (role) => {
        if (!role) return; 

        setIsLoadingData(true);
        setGlobalError(null); 

        try {
            const [productsResponse, salesResponse] = await Promise.all([
                fetch('/api/products', { headers: getAuthHeaders() }),
                fetch('/api/sales', { headers: getAuthHeaders() }),
            ]);

            if (productsResponse.status === 401 || salesResponse.status === 401) {
                handleLogout(); 
                return; 
            }
            
            if (!productsResponse.ok) throw new Error(`Error ${productsResponse.status} al cargar productos.`);
            if (!salesResponse.ok) throw new Error(`Error ${salesResponse.status} al cargar ventas.`);
            
            const [productsData, salesData] = await Promise.all([
                productsResponse.json(), 
                salesResponse.json()
            ]);
            
            setProducts(productsData);
            setSales(salesData);
            
            fetchUsers(role);

        } catch (err) {
            console.error("Fallo al cargar datos iniciales:", err);
            setGlobalError(err.message || "No se pudieron cargar los datos. Verifique su conexión y el backend.");
        } finally {
            setIsLoadingData(false);
        }
    }, [handleLogout, fetchUsers]); 

    // EFECTO: Cargar datos de usuario al inicio
    useEffect(() => {
        const role = localStorage.getItem('role');
        const email = localStorage.getItem('email');
        const userId = localStorage.getItem('userId');
        
        const initialUserData = {
            userId: userId || 'N/A',
            userEmail: email || 'usuario.temporal@ferreteria.com',
            userRole: role || 'Visitante',
            isAuthReady: true,
        };
        
        setUserData(initialUserData);
        
        if (role) {
             fetchInitialData(role);
        } else {
             setIsLoadingData(false); 
        }

    }, [fetchInitialData]); 

    const { userId, userEmail, userRole, isAuthReady } = userData;
    
    // Bandera de permiso
    const isAdmin = userRole === 'Administrador';

    // Determina los elementos de la barra de navegación según el rol
    const navItems = useMemo(() => {
        const baseItems = ["Home", "Productos", "Ventas"];
        if (isAdmin) {
            baseItems.push("Usuarios");
        }
        return baseItems;
    }, [isAdmin]);
    
    // Constantes de UI Dinámicas para el menú de usuario (Incluyendo Cierre de Caja)
    const userSettings = useMemo(() => {
        const baseSettings = ['Perfil', 'Configuración', 'Cerrar Sesión'];
        if (isAdmin) {
            baseSettings.splice(1, 0, 'Cierre de Caja'); // Inserta "Cierre de Caja" después de "Perfil"
        }
        baseSettings.push('Eliminar Cuenta'); // 'Eliminar Cuenta' siempre al final
        return baseSettings;
    }, [isAdmin]);
    
    // UI States
    const [currentView, setCurrentView] = useState("Home");
    const [anchorElNav, setAnchorElNav] = useState(null); 
    const [anchorElUser, setAnchorElUser] = useState(null); 
    
    // ESTADOS PARA MODALES
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false); 
    const [productToEdit, setProductToEdit] = useState(null); 
    const [isRegisterSaleModalOpen, setIsRegisterSaleModalOpen] = useState(false);


    // --- CRUD ACTION HANDLERS ---
    
    // Función para que el Administrador cree nuevos usuarios.
    const handleCreateUser = useCallback(async ({ email, password, role }) => {
        if (!isAdmin) {
            throw new Error("Permiso denegado. Solo los administradores pueden crear usuarios.");
        }

        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ email, password, role }),
        });

        if (response.status === 401) {
            handleLogout();
            throw new Error("Sesión expirada.");
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Error ${response.status} de servidor.` }));
            const error = new Error(errorData.message || `Error ${response.status} al crear el usuario.`);
            error.response = { data: { message: errorData.message }, status: response.status };
            throw error;
        }

        await fetchUsers(userRole);
    }, [fetchUsers, handleLogout, isAdmin, getAuthHeaders, userRole]);

    // Guarda (crea o edita) un producto.
    const handleSaveProduct = useCallback(async (data, productId) => {
        if (!isAdmin) {
             throw new Error("Permiso denegado. Solo los administradores pueden modificar productos.");
        }

        // CORRECCIÓN: Usar 'let' en lugar de 'const' para poder reasignar a 'PUT' en caso de duplicado
        let method = productId ? 'PUT' : 'POST'; 
        let url = productId ? `/api/products/${productId}` : '/api/products';
        let requestBody = { ...data, userId };
        let actionMessage = productId ? 'guardar las modificaciones del producto' : 'crear el producto';
        
        // --- LÓGICA: Manejo de Duplicados (Solo para creación 'POST') ---
        let existingProduct = null;
        if (method === 'POST') {
             existingProduct = products.find(
                 // Búsqueda insensible a mayúsculas/minúsculas y asegurando que las propiedades existan
                 p => p.name && data.name && p.name.toLowerCase() === data.name.toLowerCase()
             );

             if (existingProduct) {
                 // Si existe, cambiamos la operación a PUT/Actualización de stock
                 method = 'PUT'; 
                 url = `/api/products/${existingProduct.id}`;
                 actionMessage = `sumar el stock al producto existente "${existingProduct.name}"`;
                 
                 // Aseguramos que el stock a añadir sea un número entero
                 const newStockValue = (data.stock ? parseInt(data.stock, 10) : 0);
                 
                 // Sumar el stock nuevo al existente
                 requestBody = {
                     ...existingProduct, // Usamos los datos existentes (incluyendo ID)
                     stock: existingProduct.stock + newStockValue, // Sumamos el nuevo stock
                     userId, // Mantener el userId
                 };
                 
                 // --- CORRECCIÓN: USAR NOTIFICACIÓN MUI EN LUGAR DE ALERT ---
                 const alertMessage = `El producto "${existingProduct.name}" ya existe (código: ${existingProduct.id}). Se han sumado ${newStockValue} unidades. Nuevo stock total: ${requestBody.stock}.`;
                 
                 setNotification({
                     open: true,
                     message: alertMessage,
                     severity: 'warning', // Usamos 'warning' para notificar la suma de stock.
                 });
                 // ------------------------------------------------------------------
             }
        }
        // ----------------------------------------------------------------------


        const response = await fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(requestBody),
        });

        if (response.status === 401) {
            handleLogout();
            throw new Error("Sesión expirada.");
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Error ${response.status} de servidor.` }));
            const error = new Error(errorData.message || `Error ${response.status} al ${actionMessage}.`);
            error.response = { data: { message: errorData.message }, status: response.status };
            throw error;
        }

        // Opcional: Mostrar una notificación de éxito después de crear/actualizar si NO fue un duplicado
        if (!existingProduct && method === 'POST') {
             setNotification({
                 open: true,
                 message: `Producto "${data.name}" creado exitosamente.`,
                 severity: 'success', 
             });
        }
        
        // Opcional: Mostrar una notificación de éxito después de editar
        if (productId && method === 'PUT') {
            setNotification({
                 open: true,
                 message: `Producto "${data.name}" modificado exitosamente.`,
                 severity: 'success', 
             });
        }


        await fetchInitialData(userRole);
    }, [fetchInitialData, userId, handleLogout, isAdmin, userRole, getAuthHeaders, products]);

    // Elimina un producto por ID.
    const handleDeleteProduct = useCallback(async (productId, productName) => {
        if (!isAdmin) {
             alert("Permiso denegado. Solo los administradores pueden eliminar productos.");
             return;
        }

        const confirmed = window.confirm(`¿Está seguro de que desea eliminar el producto "${productName}"?`);
        if (!confirmed) return;
        try {
            const response = await fetch(`/api/products/${productId}`, { method: 'DELETE', headers: getAuthHeaders() });

            if (response.status === 401) {
                handleLogout();
                throw new Error("Sesión expirada.");
            }

            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || `Error ${response.status} al eliminar el producto.`);
            }
            
            setNotification({
                open: true,
                message: `Producto "${productName}" eliminado exitosamente.`,
                severity: 'success', 
            });

            await fetchInitialData(userRole);
        } catch (error) {
            alert(`Fallo al eliminar el producto: ${error.message}`);
        }
    }, [fetchInitialData, handleLogout, isAdmin, userRole, getAuthHeaders]);

    // Registra una nueva venta.
    const handleRegisterSale = useCallback(async (saleData) => {
        const response = await fetch('/api/sales', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ ...saleData, userId }),
        });

        if (response.status === 401) {
            handleLogout();
            throw new Error("Sesión expirada.");
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Error ${response.status} de servidor.` }));
            const error = new Error(errorData.message || `Error ${response.status} al registrar la venta.`);
            error.response = { data: { message: errorData.message }, status: response.status };
            throw error;
        }
        
        setNotification({
            open: true,
            message: `¡Venta registrada exitosamente por Q${parseFloat(saleData.total).toFixed(2)}!`,
            severity: 'success', 
        });

        await fetchInitialData(userRole);
        return await response.json();
    }, [fetchInitialData, userId, handleLogout, userRole, getAuthHeaders]);

    // Elimina un usuario.
    const handleDeleteUser = useCallback(async (userIdToDelete, userEmailToDelete) => {
        if (!isAdmin) {
             alert("Permiso denegado. Solo los administradores pueden eliminar usuarios.");
             return;
        }

        const confirmed = window.confirm(`¿Está seguro de que desea eliminar al usuario "${userEmailToDelete}"? Esta acción es irreversible.`);
        if (!confirmed) return;

        if (userIdToDelete === userId) {
            alert("No puedes eliminar tu propia cuenta desde la vista de gestión. Usa la opción 'Eliminar Cuenta' en el menú de usuario.");
            return;
        }

        try {
            const response = await fetch(`/api/users/${userIdToDelete}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (response.status === 401) {
                handleLogout();
                throw new Error("Sesión expirada. Redirigiendo a login...");
            }

            if (!response.ok) {
                 const errorData = await response.json().catch(() => ({ message: `Error ${response.status} de servidor.` }));
                 throw new Error(errorData.message || `Error ${response.status} al eliminar el usuario.`);
            }

            setNotification({
                open: true,
                message: `El usuario ${userEmailToDelete} ha sido eliminado con éxito.`,
                severity: 'success', 
            });

            await fetchUsers(userRole);

        } catch (error) {
            alert(`Fallo al eliminar el usuario: ${error.message}`);
        }
    }, [fetchUsers, handleLogout, userId, userRole, isAdmin, getAuthHeaders]);

    // Permite al usuario eliminar su propia cuenta.
    const handleDeleteAccount = useCallback(async () => {
        const confirmMsg = `ADVERTENCIA: ¿Está seguro de que desea ELIMINAR su cuenta (${userEmail})? Esta acción es PERMANENTE.`;
        if (!window.confirm(confirmMsg)) return;

        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            if (response.status === 401) {
                handleLogout();
                throw new Error("Sesión expirada.");
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Error ${response.status} de servidor.` }));
                throw new Error(errorData.message || `Fallo al eliminar la cuenta.`);
            }

            alert(`La cuenta de ${userEmail} ha sido eliminada con éxito.`);
            handleLogout();

        } catch (error) {
            alert(`Error al eliminar la cuenta: ${error.message}`);
            console.error(error);
        }
    }, [handleLogout, userId, userEmail, getAuthHeaders]);

    
    // --- LÓGICA DE CIERRE DE CAJA (NUEVA FUNCIÓN) ---
    const handleCloseCashRegister = useCallback(async () => {
        if (!isAdmin) {
             alert("Permiso denegado. Solo los administradores pueden realizar el cierre de caja.");
             return;
        }

        const confirmed = window.confirm(`¿Está seguro de realizar el Cierre de Caja? Esto guardará las ventas del período actual (${sales.length} ventas) e iniciará un nuevo período con Q0.00.`);
        if (!confirmed) return;

        try {
            const response = await fetch('/api/closure/cash-register', { 
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ userId }),
            });

            if (response.status === 401) {
                handleLogout();
                throw new Error("Sesión expirada.");
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Error ${response.status} de servidor.` }));
                throw new Error(errorData.message || `Fallo al realizar el cierre de caja.`);
            }

            const result = await response.json();
            const closedRevenue = result.totalClosedRevenue ? parseFloat(result.totalClosedRevenue).toFixed(2) : 'N/A';
            
            setNotification({
                open: true,
                message: `Cierre de Caja exitoso. Ingresos cerrados: Q${closedRevenue}.`,
                severity: 'success', 
            });

            // Recargar datos
            await fetchInitialData(userRole);

        } catch (error) {
            alert(`Error durante el Cierre de Caja: ${error.message}`);
            console.error(error);
        }
    }, [fetchInitialData, handleLogout, userId, userRole, isAdmin, getAuthHeaders, sales.length]);

    // --- UI HANDLERS ---

    const handleEditProductOpen = (product) => {
        if (!isAdmin) {
             alert("Permiso denegado. Solo los administradores pueden editar productos.");
             return;
        }
        setProductToEdit(product);
        setIsEditProductModalOpen(true);
    };

    const handleEditProductClose = () => {
        setIsEditProductModalOpen(false);
        setProductToEdit(null);
        setIsAddProductModalOpen(false);
    };

    const handleViewChange = (view) => {
        setCurrentView(view);
        setSearchTerm('');
        handleCloseNavMenu();
    };

    const handleTabChange = (event, newValue) => {
        const view = navItems[newValue];
        handleViewChange(view);
    };

    const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
    const handleCloseNavMenu = () => setAnchorElNav(null);

    const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
    const handleCloseUserMenu = () => setAnchorElUser(null);

    // Handler para cerrar la notificación (Snackbar)
    const handleCloseNotification = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setNotification({ ...notification, open: false });
    };

    // Ejecuta la acción seleccionada en el menú de usuario.
    const handleSettingClick = (setting) => {
        handleCloseUserMenu();
        if (setting === 'Cerrar Sesión') {
            handleLogout();
        } else if (setting === 'Eliminar Cuenta') {
            handleDeleteAccount();
        } else if (setting === 'Cierre de Caja') { // NUEVO MANEJADOR
             handleCloseCashRegister();
        } else if (setting === 'Perfil') {
            setIsProfileModalOpen(true);
        } else {
            console.log(`Acción para: ${setting} - Funcionalidad pendiente`);
        }
    };

    // --- CONTENT VIEWS ---

    // Renderiza la vista de gestión de productos (Inventario).
    const renderProductsView = () => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();

        const filteredProducts = products.filter(product => {
            if (!lowerCaseSearchTerm) return true;

            const productName = String(product.name || '').toLowerCase();
            const productId = String(product.id || '').toLowerCase();

            const matchesName = productName.includes(lowerCaseSearchTerm);
            const matchesId = productId.includes(lowerCaseSearchTerm);

            return matchesName || matchesId;
        });

        return (
            <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" fontWeight="bold">Inventario de Productos ({filteredProducts.length} de {products.length})</Typography>
                    {isAdmin && (
                        <Button
                            startIcon={<AddIcon />}
                            variant="contained"
                            sx={{ backgroundColor: PRIMARY_COLOR, '&:hover': { backgroundColor: '#0A2A4F' } }}
                            onClick={() => {
                                setProductToEdit(null);
                                setIsAddProductModalOpen(true);
                            }}
                        >
                            Añadir Producto
                        </Button>
                    )}
                </Stack>

                <Box sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        label="Buscar producto por Nombre o ID (código)..."
                        variant="outlined"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                <TableContainer component={Paper} elevation={3}>
                    <Table sx={{ minWidth: 700 }} size="medium" aria-label="tabla de productos">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: PRIMARY_COLOR }}>
                                <TableCell align="left" sx={{ fontWeight: 'bold', color: 'white' }}>ID (Código)</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Nombre</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'white' }}>Precio (Q)</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'white' }}>Stock</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', color: 'white' }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredProducts.length > 0 ? filteredProducts.map((p) => (
                                <TableRow
                                    key={p.id}
                                    hover
                                    sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}
                                >
                                    <TableCell align="left" sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 'bold' }}>{p.id}</TableCell>
                                    <TableCell component="th" scope="row">
                                        {p.name}
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Q{p.price ? parseFloat(p.price).toFixed(2) : '0.00'}</TableCell>
                                    <TableCell align="right">
                                        <Typography
                                            variant="body2"
                                            fontWeight="bold"
                                            color={p.stock > 10 ? 'success.main' : p.stock > 0 ? SECONDARY_COLOR : 'error.main'}
                                        >
                                            {p.stock}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <Tooltip title={isAdmin ? "Modificar Producto" : "Acción reservada para Administradores"}>
                                                <IconButton
                                                    aria-label="edit"
                                                    onClick={() => handleEditProductOpen(p)}
                                                    disabled={!isAdmin}
                                                >
                                                    <EditIcon sx={{ color: isAdmin ? SECONDARY_COLOR : 'disabled' }} fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={isAdmin ? "Eliminar Producto" : "Acción reservada para Administradores"}>
                                                <IconButton
                                                    aria-label="delete"
                                                    onClick={() => handleDeleteProduct(p.id, p.name)}
                                                    disabled={!isAdmin}
                                                >
                                                    <DeleteIcon color={isAdmin ? "error" : "disabled"} fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                        <Typography color="text.secondary">
                                            {products.length > 0 && searchTerm
                                                ? `No se encontraron productos con el nombre o ID "${searchTerm}".`
                                                : "No hay productos en el inventario."}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {!isAdmin && (
                    <Alert severity="info" sx={{ mt: 3 }}>
                        <Typography variant="body2" fontWeight="bold">
                            Solo los administradores pueden añadir, editar o eliminar productos.
                        </Typography>
                    </Alert>
                )}
            </Box>
        );
    };

    // Renderiza la vista de historial de ventas.
    const renderSalesView = () => (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="bold">Historial de Ventas (Período Actual: {sales.length})</Typography>
                <Button
                    startIcon={<ShoppingCartIcon />}
                    variant="contained"
                    color="success"
                    onClick={() => setIsRegisterSaleModalOpen(true)}
                >
                    Registrar Venta
                </Button>
            </Stack>

            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                    Las ventas mostradas corresponden al período desde el último **Cierre de Caja**.
                </Typography>
            </Alert>

            <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <List disablePadding>
                    {sales.length > 0 ? sales.map((s, index) => {
                        // Asume que s.createdAt es una cadena de fecha/hora ISO
                        const timestamp = s.createdAt 
                            ? new Date(s.createdAt).getTime()
                            : Date.now();

                        const date = new Date(timestamp).toLocaleString('es-ES', {
                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        });

                        return (
                            <React.Fragment key={s.id}>
                                <ListItem
                                    sx={{ '&:hover': { backgroundColor: '#f0f0f0' } }}
                                    secondaryAction={
                                        <Typography variant="h6" color="success.main" fontWeight="bold">
                                            Q{s.total ? parseFloat(s.total).toFixed(2) : '0.00'}
                                        </Typography>
                                    }
                                >
                                    <ListItemText
                                        primary={<Typography fontWeight="medium">{`Venta a: ${s.clientName || 'Cliente Desconocido'}`}</Typography>}
                                        secondary={`Fecha: ${date} | Vendedor ID: ${s.userId}`}
                                    />
                                </ListItem>
                                {index < sales.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        );
                    }) : (
                        <ListItem sx={{ py: 2 }}><ListItemText primary="No hay ventas registradas en el período actual." /></ListItem>
                    )}
                </List>
            </Paper>
        </Box>
    );

    // Renderiza la vista de gestión de usuarios (solo para Administradores).
    const renderUsersView = () => {

        if (!isAdmin) {
            return <Alert severity="error">Acceso denegado. Solo los **administradores** pueden gestionar usuarios.</Alert>;
        }

        return (
            <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" fontWeight="bold">Gestión de Usuarios ({users.length})</Typography>
                    <Button
                        startIcon={<PersonAdd />}
                        variant="contained"
                        sx={{
                            backgroundColor: SECONDARY_COLOR,
                            color: PRIMARY_COLOR,
                            fontWeight: 'bold',
                            '&:hover': { backgroundColor: '#FBC02D' }
                        }}
                        onClick={() => setIsAddUserModalOpen(true)}
                    >
                        Crear Nuevo Usuario
                    </Button>
                </Stack>

                <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <List disablePadding>
                        {users.length > 0 ? users.map((u, index) => (
                            <React.Fragment key={u.id}>
                                <ListItem
                                    sx={{ '&:hover': { backgroundColor: '#f0f0f0' } }}
                                    secondaryAction={
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography
                                                variant="body2"
                                                sx={{ color: u.role === 'Administrador' ? PRIMARY_COLOR : 'text.primary' }}
                                                fontWeight="bold"
                                            >
                                                {u.role}
                                            </Typography>
                                            <Tooltip title="Editar Usuario - Funcionalidad Pendiente">
                                                <IconButton edge="end" aria-label="edit" disabled>
                                                    <EditIcon color="disabled" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={u.id === userId ? "No puedes eliminar tu propia cuenta" : "Eliminar Usuario"}>
                                                <IconButton
                                                    edge="end"
                                                    aria-label="delete"
                                                    onClick={() => handleDeleteUser(u.id, u.email)}
                                                    disabled={u.id === userId}
                                                >
                                                    <DeleteIcon color="error" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    }
                                >
                                    <ListItemText
                                        primary={<Typography fontWeight="medium">{u.email}</Typography>}
                                        secondary={`ID: ${u.id}`}
                                    />
                                </ListItem>
                                {index < users.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        )) : (
                            <ListItem sx={{ py: 2 }}><ListItemText primary="No hay otros usuarios registrados en el sistema." /></ListItem>
                        )}
                    </List>
                </Paper>
            </Box>
        );
    };

    // Función que renderiza la vista activa según el estado `currentView`.
    const renderView = () => {

        if (!isAuthReady || isLoadingData) {
            return <Box display="flex" flexDirection="column" alignItems="center" mt={10}><CircularProgress /><Typography mt={2}>Cargando datos de sesión y del API...</Typography></Box>;
        }

        if (globalError) {
             return (
                <Container maxWidth="md" sx={{ mt: 5 }}>
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {globalError}
                    </Alert>
                </Container>
            );
        }

        switch (currentView) {
            case "Home":
                return <HomeView sales={sales} products={products} />;
            case "Productos":
                return renderProductsView();
            case "Ventas":
                return renderSalesView();
            case "Usuarios":
                return renderUsersView();
            default:
                if (!navItems.includes(currentView)) {
                     setCurrentView("Home");
                }
                return <HomeView sales={sales} products={products} />;
        }
    };

    // Componente de la barra de navegación (AppBar)
    const currentTabIndex = navItems.indexOf(currentView);
    const navBar = (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: PRIMARY_COLOR }}>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <InventoryIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="#"
                        onClick={() => handleViewChange('Home')}
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.1rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        FERRETERÍA
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="abrir menú de navegación"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                            keepMounted
                            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{ display: { xs: 'block', md: 'none' } }}
                        >
                            {navItems.map((item) => (
                                <MenuItem key={item} onClick={() => handleViewChange(item)}>
                                    <Typography textAlign="center" fontWeight={currentView === item ? 'bold' : 'normal'}>
                                        {item}
                                    </Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>

                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                        <Tabs
                            value={currentTabIndex}
                            onChange={handleTabChange}
                            textColor="inherit"
                            indicatorColor="primary"
                            sx={{
                                '& .MuiTabs-indicator': { backgroundColor: SECONDARY_COLOR },
                            }}
                        >
                            {navItems.map((item, index) => (
                                <Tab
                                    key={item}
                                    label={item}
                                    onClick={() => handleViewChange(item)}
                                    {...a11yProps(index)}
                                    sx={{
                                        color: 'white',
                                        fontWeight: 600,
                                        opacity: currentTabIndex === index ? 1 : 0.9,
                                        '&.Mui-selected': { color: SECONDARY_COLOR }
                                    }}
                                />
                            ))}
                        </Tabs>
                    </Box>

                    <Box sx={{ flexGrow: 0, ml: 2 }}>
                        <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'inline' }, mr: 1, color: 'white', fontWeight: 500 }}>
                            {userRole}
                        </Typography>
                        <Tooltip title={`Ver Perfil: ${userEmail} (${userRole})`}>
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <Avatar alt={userEmail} >
                                    {userEmail ? userEmail[0].toUpperCase() : 'U'}
                                </Avatar>
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px' }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            keepMounted
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            {/* Renderizado Dinámico de Opciones, incluyendo Cierre de Caja */}
                            {userSettings.map((setting) => (
                                <MenuItem key={setting} onClick={() => handleSettingClick(setting)}
                                    sx={{
                                        color: (setting === 'Eliminar Cuenta' || setting === 'Cerrar Sesión') ? 'error.main' : 'inherit',
                                        '&:hover': { backgroundColor: (setting === 'Eliminar Cuenta' || setting === 'Cerrar Sesión') ? 'error.light' : (setting === 'Cierre de Caja' ? 'success.light' : '#f0f0f0') }
                                    }}
                                >
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        {/* Icono de Cierre de Caja (Solo visible si está en la lista) */}
                                        {setting === 'Cierre de Caja' && <MonetizationOnIcon sx={{ fontSize: 20 }} color="success" />} 
                                        {setting === 'Eliminar Cuenta' && <PersonRemove sx={{ fontSize: 20 }} color="error" />}
                                        {setting === 'Perfil' && <AccountCircle sx={{ fontSize: 20, color: PRIMARY_COLOR }} />}
                                        {setting === 'Configuración' && <PeopleAlt sx={{ fontSize: 20, color: SECONDARY_COLOR }} />}
                                        {setting === 'Cerrar Sesión' && <LogoutIcon sx={{ fontSize: 20 }} color="error" />}
                                        <Typography textAlign="center" color={(setting === 'Cerrar Sesión' || setting === 'Eliminar Cuenta') ? 'error' : (setting === 'Cierre de Caja' ? 'success.main' : 'inherit')}>
                                            {setting}
                                        </Typography>
                                    </Stack>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );

    // Renderizado principal del componente.
    return (
        <Box sx={{ display: "flex", minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <CssBaseline />
            {navBar}

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, md: 4 },
                    width: '100%',
                    mt: { xs: 7, md: 8 }
                }}
            >
                {renderView()}
            </Box>

            {/* Modales Compartidos: Producto (Crear/Editar), Venta, Perfil y Usuario (Crear) */}
            <ProductModal
                open={isAddProductModalOpen || isEditProductModalOpen}
                handleClose={isAddProductModalOpen ? () => setIsAddProductModalOpen(false) : handleEditProductClose}
                productToEdit={isEditProductModalOpen ? productToEdit : null}
                handleSave={handleSaveProduct}
            />

            <SaleModal
                open={isRegisterSaleModalOpen}
                handleClose={() => setIsRegisterSaleModalOpen(false)}
                products={products}
                handleSave={handleRegisterSale}
            />

            <ProfileModal
                open={isProfileModalOpen}
                handleClose={() => setIsProfileModalOpen(false)}
                userData={userData}
            />

            <UserModal
                open={isAddUserModalOpen}
                handleClose={() => setIsAddUserModalOpen(false)}
                handleCreateUser={handleCreateUser}
            />

            {/* --- SNACKBAR DE NOTIFICACIÓN DE DUPLICADO / ÉXITO / ERROR --- */}
            <Snackbar
                open={notification.open}
                autoHideDuration={5000} // Desaparece después de 5 segundos
                onClose={handleCloseNotification}
                // Colocado en la parte superior central para que sea visible
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }} 
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    sx={{ width: '100%', minWidth: 400, boxShadow: 6 }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
            {/* ----------------------------------------------------- */}

        </Box>
    );
}