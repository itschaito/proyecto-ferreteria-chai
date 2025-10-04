// user.routes.js (MODIFICADO)
import { Router } from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";

// Importar los middlewares
import { verifyToken, requireAdmin } from "../middlewares/auth.js";

const router = Router();
// ... (omito el código de Swagger para ser conciso, pero se mantiene) ...

// Todas estas rutas ahora requieren autenticación (verifyToken) y ser Admin (requireAdmin)
router.post("/", verifyToken, requireAdmin, createUser);
router.get("/", verifyToken, requireAdmin, getUsers);
router.get("/:id", verifyToken, requireAdmin, getUserById); // Solo admin puede ver perfiles de otros
router.put("/:id", verifyToken, requireAdmin, updateUser);
router.delete("/:id", verifyToken, requireAdmin, deleteUser);

export default router;
