// backend/src/routes/closure.routes.js

import { Router } from 'express';
import { closeCashRegister } from '../controllers/closure.controller.js';

// 💡 CORRECCIÓN CRÍTICA: Importar requireAdmin en lugar de isAdmin
import { verifyToken, requireAdmin } from '../middlewares/auth.js'; 

const router = Router();

// Endpoint: POST /api/closure/cash-register
// 💡 CORRECCIÓN: Usar el nombre correcto del middleware: requireAdmin
router.post('/cash-register', verifyToken, requireAdmin, closeCashRegister);

export default router;