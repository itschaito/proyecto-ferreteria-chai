// backend/src/controllers/auth.controller.js (FINAL Y CORREGIDO)

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// Importar 'db' solo para acceder a los modelos
import { db } from "../database/database.js";

// ❌ ELIMINAR ESTA LÍNEA QUE CAUSABA EL ERROR: const User = db.User;

const ADMIN_EMAIL = "esladelpro@gmail.com";
const JWT_SECRET = process.env.JWT_SECRET || "tu_secreto_seguro"; 

// Crear usuario (createUser)
export async function createUser(req, res, next) {
    // 💡 SOLUCIÓN CRÍTICA: Definir User dentro de la función.
    const User = db.User; 
    
    try {
        const { name, email, password } = req.body; 
        
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "El usuario ya existe" });
        }

        const role = email === ADMIN_EMAIL ? 'Administrador' : 'Vendedor';
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({ 
            name: name || 'Nuevo Usuario', 
            email, 
            password: hashedPassword, 
            role 
        });

        res.status(201).json({ message: "Usuario creado correctamente", id: newUser.id, email: newUser.email, role: newUser.role });

    } catch (err) {
        console.error('Error en createUser:', err);
        if (err.name.includes('Sequelize')) {
            return res.status(400).json({ message: err.errors?.[0]?.message || 'Error de validación de la base de datos.' });
        }
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
}

// Login (authenticate)
export async function authenticate(req, res, next) {
    // 💡 SOLUCIÓN CRÍTICA: Definir User dentro de la función.
    const User = db.User; 

    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ where: { email } });
        // ... (resto de la lógica) ...
        
        if (!user) {
            return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
        }

        const match = await bcrypt.compare(password, user.password);
        
        if (!match) {
            return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
        }

        const role = user.role; 
        
        const token = jwt.sign(
            { id: user.id, email: user.email, role: role },
            JWT_SECRET,
            { expiresIn: "1h" }
        ); 

        res.json({ token, email: user.email, role: role, id: user.id });

    } catch (err) {
        console.error('Error en authenticate:', err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
}

// Forgot password (requiere usar User.findOne)
export async function forgotPassword(req, res, next) {
    // 💡 SOLUCIÓN CRÍTICA: Definir User dentro de la función.
    const User = db.User; 
    
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });
        
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: "15m",
        });
        
        // ... (resto de la lógica) ...
        const resetLink = `${req.protocol}://${req.get(
          "host"
        )}/reset-password?token=${token}`;
        
        console.log(`Simulando envío de correo a ${user.email}: ${resetLink}`);
        
        res.json({
            message: `Se envió un link de recuperación al correo ${user.email}`,
            resetLink,
        });
    } catch (err) {
        console.error('Error en forgotPassword:', err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
}

// Reset password (requiere usar User.findByPk y user.update)
export async function resetPassword(req, res, next) {
    // 💡 SOLUCIÓN CRÍTICA: Definir User dentro de la función.
    const User = db.User; 

    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) return res.status(400).json({ message: "Faltan datos" });

        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch {
            return res.status(401).json({ message: "Token inválido o expirado" });
        }

        const user = await User.findByPk(decoded.id); 
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: "Contraseña actualizada con éxito" });
    } catch (err) {
        console.error('Error en resetPassword:', err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
}