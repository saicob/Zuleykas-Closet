import { Router } from "express"
import * as pc from "../controllers/products.controllers.js"
import multer from "multer"
import path from "path"
import fs from "fs"
// authentication removed - routes are public

const router = Router()

// Asegurar que el directorio existe
const uploadDir = "static/imagenes"
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Configuración de almacenamiento para imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // Generar nombre único para evitar conflictos
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const extension = path.extname(file.originalname)
    cb(null, "producto-" + uniqueSuffix + extension)
  },
})

// Filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb(new Error("Solo se permiten archivos de imagen (jpeg, jpg, png, gif, webp)"))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
})

// 📦 Rutas para productos
router.get("/products", pc.getProductsJSON)
router.get("/products/:id", pc.getProductById)
router.get("/products/nombre/:nombre", pc.getProductByName)
// Only admin can create/update products
router.post("/products", upload.single("imagen"), pc.createProduct)
router.put("/products/:id", upload.single("imagen"), pc.updateProduct)

export default router
