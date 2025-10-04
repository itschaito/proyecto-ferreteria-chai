// backend/routes/sales.route.js

import { Router } from "express";
import { createSale, getSales, getSaleById } from "../controllers/sale.controller.js";
import { verifyToken, requireRole } from "../middlewares/auth.js"; 

const router = Router();

// GET /sales (Solo Vendedor/Admin logueado)
router.get("/", verifyToken, requireRole(['Administrador', 'Vendedor']), getSales); 

// GET /sales/:id (Solo Vendedor/Admin logueado)
router.get("/:id", verifyToken, requireRole(['Administrador', 'Vendedor']), getSaleById); 

// POST /sales (Solo Vendedor/Admin logueado)
router.post("/", verifyToken, requireRole(['Administrador', 'Vendedor']), createSale); 

export default router;
