// backend/middlewares/auth.js

import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "tu_secreto_seguro"; 

/**
 * Middleware para verificar si el token es válido y adjuntar la info del usuario (incluyendo el rol) al request.
 * 🟢 CRÍTICO: Ahora es OPCIONAL. Si no hay token, asigna un rol 'Vendedor' anónimo y continúa.
 */
export function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    
    // Si NO hay header o no empieza con Bearer, o si es demasiado corto, se trata como anónimo.
    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ').length < 2) {
        req.user = { id: null, email: 'anonymous@ferreteria.com', role: 'Vendedor' }; // Rol por defecto
        return next();
    }

    const token = authHeader.split(' ')[1]; 

    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded; // Adjuntamos el payload (id, email, role) al request
        next();
    } catch (err) {
        // Si el token EXISTE pero es inválido o expiró, lo ignoramos y actuamos como anónimo.
        console.warn("Token presente pero inválido/expirado. Procesando como usuario anónimo.");
        req.user = { id: null, email: 'anonymous@ferreteria.com', role: 'Vendedor' }; 
        next();
    }
}

/**
 * Middleware para restringir el acceso solo a usuarios con rol 'Administrador'.
 */
export function requireAdmin(req, res, next) {
    // Si el usuario no está autenticado O su rol no es Administrador, denegar.
    // req.user.id === null implica que es un usuario anónimo (de verifyToken)
    if (!req.user || req.user.role !== 'Administrador' || req.user.id === null) {
        return res.status(403).json({ message: "Permiso denegado. Solo para Administradores." });
    }
    next();
}

/**
 * Middleware para restringir el acceso a roles específicos.
 */
export function requireRole(allowedRoles) {
    return (req, res, next) => {
        // Si no está autenticado (req.user.id es null), el rol por defecto es Vendedor.
        // Solo verificamos si el rol (incluso el anónimo) está en la lista permitida.
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Permiso denegado por rol." });
        }
        
        // Excepción: si la ruta requiere Vendedor/Admin, debemos asegurarnos que req.user.id NO sea null
        // para prevenir que un usuario completamente anónimo (sin haber hecho login) haga una venta.
        if (req.user.id === null && (allowedRoles.includes('Vendedor') || allowedRoles.includes('Administrador'))) {
             return res.status(401).json({ message: "Se requiere iniciar sesión para realizar esta acción." });
        }
        
        next();
    };
}
