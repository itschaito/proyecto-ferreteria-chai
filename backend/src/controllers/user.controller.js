// backend/src/controllers/user.controller.js (CORREGIDO PROACTIVAMENTE)

import { db } from "../database/database.js"; 
// ❌ ELIMINAMOS la definición global: const User = db.User;

export const getUsers = async (req, res) => {
    // 💡 CRÍTICO: Definición del modelo DENTRO de la función.
    const User = db.User; 
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener usuarios.' });
    }
};

export const getUserById = async (req, res) => {
    // 💡 CRÍTICO: Definición del modelo DENTRO de la función.
    const User = db.User; 
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
        res.json(user);
    } catch (error) {
        console.error('Error al obtener usuario por ID:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

export const createUser = async (req, res) => {
    // 💡 CRÍTICO: Definición del modelo DENTRO de la función.
    const User = db.User; 
    try {
        const newUser = await User.create(req.body);
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor al crear usuario.' });
    }
};

export const updateUser = async (req, res) => {
    // 💡 CRÍTICO: Definición del modelo DENTRO de la función.
    const User = db.User; 
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
        await user.update(req.body);
        res.json(user);
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar usuario.' });
    }
};

export const deleteUser = async (req, res) => {
    // 💡 CRÍTICO: Definición del modelo DENTRO de la función.
    const User = db.User; 
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
        await user.destroy();
        res.json({ message: "Usuario eliminado" });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar usuario.' });
    }
};