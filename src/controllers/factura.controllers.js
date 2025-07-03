import { getConnection } from "../database/connection.js"
import sql from "mssql"

// Obtener detalles de una factura específica
export const getFacturaDetalles = async (req, res) => {
    try {
        const { codigo_factura } = req.params
        const pool = await getConnection()

        // Obtener información de la factura
        const facturaResult = await pool
            .request()
            .input("codigo_factura", sql.Int, codigo_factura)
            .query(`
                SELECT codigo_factura, fecha, total 
                FROM factura 
                WHERE codigo_factura = @codigo_factura
            `)

        if (facturaResult.recordset.length === 0) {
            return res.status(404).json({ error: "Factura no encontrada" })
        }

        // Obtener productos de la factura
        const productosResult = await pool
            .request()
            .input("codigo_factura", sql.Int, codigo_factura)
            .query(`
                SELECT 
                    p.nombre,
                    p.descripcion,
                    p.categoria,
                    m.nombre AS marca,
                    pf.cantidad,
                    pf.descuento,
                    pf.subtotal / pf.cantidad AS precio_unitario,
                    pf.subtotal,
                    ISNULL(i.ruta, '/placeholder.svg?height=50&width=50') AS imagen_url
                FROM producto_factura pf
                INNER JOIN producto p ON pf.codigo_producto = p.codigo_producto
                LEFT JOIN marca m ON p.codigo_marca = m.codigo_marca
                LEFT JOIN imagen i ON p.codigo_imagen = i.codigo_imagen
                WHERE pf.codigo_factura = @codigo_factura
            `)

        res.json({
            factura: facturaResult.recordset[0],
            productos: productosResult.recordset,
        })
    } catch (error) {
        console.error("Error al obtener detalles de factura:", error)
        res.status(500).json({ error: "Error del servidor" })
    }
}
