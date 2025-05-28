import express from "express"
import { getFacturaDetalles } from "../controllers/factura.controllers.js"
import { getConnection } from "../database/connection.js"

const router = express.Router()

// Obtener detalles de una factura específica
router.get("/detalles/:codigo_factura", getFacturaDetalles)

// Obtener empleados activos del primer local
router.get("/empleados/tienda1", async (req, res) => {
    try {
        const pool = await getConnection()
        const result = await pool.request().query(`SELECT codigo_empleado, nombre, apellido 
              FROM empleado 
              WHERE estado = 1 AND codigo_tienda = 1`)
        res.json(result.recordset)
    } catch (error) {
        console.error("Error al obtener empleados:", error)
        res.status(500).send("Error al obtener empleados")
    }
})

// Obtener productos activos del primer local
router.get("/productos/tienda1", async (req, res) => {
    try {
        const pool = await getConnection()
        const result = await pool.request().query(`SELECT codigo_producto, nombre, precio, stock 
              FROM producto 
              WHERE estado = 1 AND codigo_tienda = 1`)
        res.json(result.recordset)
    } catch (error) {
        console.error("Error al obtener productos:", error)
        res.status(500).send("Error al obtener productos")
    }
})

export default router
