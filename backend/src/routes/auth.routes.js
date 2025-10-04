import { Router } from 'express';
import { createUser, authenticate, forgotPassword, resetPassword } from '../controllers/auth.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Rutas de autenticación
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: francoalbiniyolocheita@gmail.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 */
router.post("/login", authenticate);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: francoalbiniyolocheita@gmail.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 */
router.post('/register', createUser);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Solicitar recuperación de contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Link de recuperación enviado
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada con éxito
 */
router.post('/reset-password', resetPassword);

export default router;
