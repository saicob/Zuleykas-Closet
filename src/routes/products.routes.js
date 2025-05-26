import { Router } from "express";
import * as pc from "../controllers/products.controllers.js"; // ✅ nombre correcto del archivo

import multer from 'multer';
import path from 'path';

const router = Router(); // ✅ Declaración correcta

// Configuración de almacenamiento para imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'static/imagenes'); // ✅ Carpeta donde se guardan
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// 📦 Rutas para productos
router.get('/products', pc.getProductsJSON);
router.get('/products/:nombre', pc.getProductByName);
router.post('/products', upload.single('imagen'), pc.createProduct);
router.put('/products/:id', pc.updateProduct);
router.delete('/products/:id', (req, res) => {
  res.send('DELETE products (aún no implementado)');
});

export default router;
