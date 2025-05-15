import { Router } from "express"
import { getConnection } from "../database/connection.js"
import sql from "mssql"

const router = Router()

// Obtener resumen de datos para el dashboard
router.get("/resumen", async (req, res) => {
    try {
        const pool = await getConnection()

        // Total de ventas
        const ventasResult = await pool.request().query(`
      SELECT SUM(total) as totalVentas 
      FROM factura
    `)

        // Productos en stock
        const stockResult = await pool.request().query(`
      SELECT SUM(stock) as totalStock 
      FROM producto 
      WHERE estado = 1
    `)

        // Proveedores activos
        const proveedoresResult = await pool.request().query(`
      SELECT COUNT(*) as totalProveedores 
      FROM proveedor 
      WHERE estado = 1
    `)

        res.json({
            totalVentas: ventasResult.recordset[0].totalVentas || 0,
            totalStock: stockResult.recordset[0].totalStock || 0,
            totalProveedores: proveedoresResult.recordset[0].totalProveedores || 0,
        })
    } catch (error) {
        console.error("Error al obtener resumen del dashboard:", error)
        res.status(500).json({ error: "Error al obtener datos del dashboard" })
    }
})

// Obtener ventas por período
router.get("/ventas-periodo", async (req, res) => {
    try {
        const { inicio, fin } = req.query
        const pool = await getConnection()

        let query = `
      SELECT CONVERT(varchar, fecha, 23) as fecha, SUM(total) as total
      FROM factura
    `

        if (inicio && fin) {
            query += ` WHERE fecha BETWEEN @inicio AND @fin`
        }

        query += ` GROUP BY CONVERT(varchar, fecha, 23)
               ORDER BY CONVERT(varchar, fecha, 23)`

        const request = pool.request()

        if (inicio && fin) {
            request.input("inicio", sql.Date, inicio)
            request.input("fin", sql.Date, fin)
        }

        const result = await request.query(query)

        res.json(result.recordset)
    } catch (error) {
        console.error("Error al obtener ventas por período:", error)
        res.status(500).json({ error: "Error al obtener ventas por período" })
    }
})

// Obtener productos más vendidos
router.get("/productos-mas-vendidos", async (req, res) => {
    try {
        const pool = await getConnection()

        const result = await pool.request().query(`
      SELECT TOP 5 p.nombre, SUM(pf.cantidad) as cantidad_vendida, SUM(pf.subtotal) as total_ventas
      FROM producto p
      JOIN producto_factura pf ON p.codigo_producto = pf.codigo_producto
      GROUP BY p.nombre
      ORDER BY cantidad_vendida DESC
    `)

        res.json(result.recordset)
    } catch (error) {
        console.error("Error al obtener productos más vendidos:", error)
        res.status(500).json({ error: "Error al obtener productos más vendidos" })
    }
})

// Obtener ventas por categoría
router.get("/ventas-por-categoria", async (req, res) => {
    try {
        const pool = await getConnection()

        const result = await pool.request().query(`
      SELECT p.categoria, SUM(pf.cantidad) as cantidad_vendida, SUM(pf.subtotal) as total_ventas
      FROM producto p
      JOIN producto_factura pf ON p.codigo_producto = pf.codigo_producto
      GROUP BY p.categoria
      ORDER BY total_ventas DESC
    `)

        res.json(result.recordset)
    } catch (error) {
        console.error("Error al obtener ventas por categoría:", error)
        res.status(500).json({ error: "Error al obtener ventas por categoría" })
    }
})

// Obtener proveedores activos con sus productos
router.get("/proveedores-activos", async (req, res) => {
    try {
        const pool = await getConnection()

        const result = await pool.request().query(`
      SELECT pr.nombre as proveedor, COUNT(p.codigo_producto) as total_productos
      FROM proveedor pr
      JOIN producto p ON pr.codigo_proveedor = p.codigo_proveedor
      WHERE pr.estado = 1
      GROUP BY pr.nombre
      ORDER BY total_productos DESC
    `)

        res.json(result.recordset)
    } catch (error) {
        console.error("Error al obtener proveedores activos:", error)
        res.status(500).json({ error: "Error al obtener proveedores activos" })
    }
})

// Obtener rentabilidad por marca
router.get("/rentabilidad-por-marca", async (req, res) => {
    try {
        const pool = await getConnection()

        const result = await pool.request().query(`
      SELECT m.nombre as marca, 
             SUM(pf.subtotal) as ventas_totales,
             SUM(pp.precio_de_abastecimiento * pf.cantidad) as costo_total,
             SUM(pf.subtotal) - SUM(ISNULL(pp.precio_de_abastecimiento, 0) * pf.cantidad) as ganancia
      FROM marca m
      JOIN producto p ON m.codigo_marca = p.codigo_marca
      JOIN producto_factura pf ON p.codigo_producto = pf.codigo_producto
      LEFT JOIN proveedor_producto pp ON p.codigo_producto = pp.codigo_producto
      GROUP BY m.nombre
      ORDER BY ganancia DESC
    `)

        res.json(result.recordset)
    } catch (error) {
        console.error("Error al obtener rentabilidad por marca:", error)
        res.status(500).json({ error: "Error al obtener rentabilidad por marca" })
    }
})

export default router
