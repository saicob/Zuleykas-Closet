import { realizarVenta } from "../services/realizarventa.js"
import { getConnection } from "../database/connection.js"
import sql from "mssql"

// Crear una venta
export const crearVenta = async (req, res) => {
    console.log("=== RECIBIENDO PETICIÓN DE VENTA ===")
    console.log("Body recibido:", req.body)

    const { productos, delivery, descuento_global, costo_delivery } = req.body

    if (!productos || !Array.isArray(productos) || productos.length === 0) {
        console.error("No se proporcionaron productos válidos")
        return res.status(400).json({
            success: false,
            message: "No se proporcionaron productos válidos.",
        })
    }

    // Validar cada producto
    for (const p of productos) {
        console.log("Validando producto:", p)

        if (!p.nombre || typeof p.nombre !== "string") {
            console.error("Producto con nombre inválido:", p)
            return res.status(400).json({
                success: false,
                message: `Producto con nombre inválido: ${JSON.stringify(p)}`,
            })
        }

        if (!Number.isInteger(p.cantidad) || p.cantidad <= 0) {
            console.error("Producto con cantidad inválida:", p)
            return res.status(400).json({
                success: false,
                message: `Producto con cantidad inválida: ${JSON.stringify(p)}`,
            })
        }

        if (typeof p.subtotal !== "number" || p.subtotal <= 0) {
            console.error("Producto con subtotal inválido:", p)
            return res.status(400).json({
                success: false,
                message: `Producto con subtotal inválido: ${JSON.stringify(p)}`,
            })
        }
    }

    try {
        console.log("Llamando a realizarVenta...")
        const result = await realizarVenta(productos, delivery, costo_delivery)
        console.log("Resultado de realizarVenta:", result)

        if (result.success) {
            res.status(200).json({
                success: true,
                message: result.message,
                facturaId: result.facturaId,
            })
        } else {
            res.status(500).json({
                success: false,
                message: result.message,
            })
        }
    } catch (error) {
        console.error("Error al realizar la venta:", error)
        res.status(500).json({
            success: false,
            message: "Error interno del servidor.",
            error: error.message,
        })
    }
}

// Obtener el historial de ventas
export const getVentas = async (req, res) => {
    try {
        const pool = await getConnection()
        const result = await pool.request().query("SELECT codigo_factura, fecha, total FROM factura ORDER BY fecha DESC")
        res.json(result.recordset)
    } catch (error) {
        console.error("Error al obtener el historial de ventas:", error)
        // Log detallado para depuración
        if (error.precedingErrors) {
            error.precedingErrors.forEach((e) => console.error("SQL preceding error:", e))
        }
        res.status(500).json({
            success: false,
            message: "Error al obtener el historial de ventas.",
            error: error.message,
            sql: error.sql || null,
            stack: error.stack,
        })
    }
}

// Obtener detalles de una venta
export const getDetalleVenta = async (req, res) => {
    try {
        let codigo_factura = req.params.id
        console.log("Valor recibido para codigo_factura:", codigo_factura, "Tipo:", typeof codigo_factura)
        // Validar que sea un número entero
        if (!codigo_factura || isNaN(codigo_factura)) {
            return res.status(400).json({ mensaje: "El código de factura debe ser un número válido." })
        }
        codigo_factura = Number.parseInt(codigo_factura, 10)
        const pool = await getConnection()

        // Obtener datos de la factura
        const facturaResult = await pool
            .request()
            .input("codigo_factura", sql.Int, codigo_factura)
            .query("SELECT * FROM factura WHERE codigo_factura = @codigo_factura")

        // Obtener productos de la factura
        const productosResult = await pool
            .request()
            .input("codigo_factura", sql.Int, codigo_factura)
            .query(`
                SELECT pf.*, p.nombre, p.categoria, m.nombre AS marca, ISNULL(i.ruta, '/placeholder.svg?height=50&width=50') AS imagen_url
                FROM producto_factura pf
                INNER JOIN producto p ON pf.codigo_producto = p.codigo_producto
                LEFT JOIN marca m ON p.codigo_marca = m.codigo_marca
                LEFT JOIN imagen i ON p.codigo_imagen = i.codigo_imagen
                WHERE pf.codigo_factura = @codigo_factura
            `)

        if (facturaResult.recordset.length === 0) {
            return res.status(404).json({ mensaje: "Factura no encontrada" })
        }

        res.json({
            factura: facturaResult.recordset[0],
            productos: productosResult.recordset,
        })
    } catch (error) {
        console.error("Error al obtener detalles de la venta:", error.message)
        res.status(500).json({ mensaje: "Error interno del servidor" })
    }
}
