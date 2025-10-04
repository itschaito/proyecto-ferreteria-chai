// backend/routes/products.route.js

import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { verifyToken, requireAdmin } from "../middlewares/auth.js";

const router = Router();

// GET /products (Público: usa verifyToken para cargar la lista, pero no requiere token)
router.get("/", verifyToken, getProducts); 

// GET /products/:id (Público)
router.get("/:id", verifyToken, getProductById); 

// POST /products (Protegido por Admin)
router.post("/", verifyToken, requireAdmin, createProduct); 

// PUT /products/:id (Protegido por Admin)
router.put("/:id", verifyToken, requireAdmin, updateProduct); 

// DELETE /products/:id (Protegido por Admin)
router.delete("/:id", verifyToken, requireAdmin, deleteProduct); 

export default router;
