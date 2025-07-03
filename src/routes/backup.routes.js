import { Router } from "express"
import { createBackup, getBackups, restoreBackup, deleteBackup } from "../controllers/backup.controllers.js"

const router = Router()

// Crear backup
router.post("/create", createBackup)

// Obtener lista de backups
router.get("/list", getBackups)

// Restaurar backup
router.post("/restore", restoreBackup)

// Eliminar backup
router.delete("/delete/:filename", deleteBackup)

export default router
