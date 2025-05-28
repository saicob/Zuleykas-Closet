import { realizarVenta } from "../services/realizarventa.js"
import { getConnection } from "../database/connection.js"

// Crear una venta
export const crearVenta = async (req, res) => {
    console.log("=== RECIBIENDO PETICIÓN DE VENTA ===")
    console.log("Body recibido:", req.body)

    const { productos } = req.body

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
        const result = await realizarVenta(productos)
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
        res.status(500).json({
            success: false,
            message: "Error al obtener el historial de ventas.",
            error: error.message,
        })
    }
}


// Obtener detalles de una venta 
export const getDetalleVenta = async (req, res) => {
    try {
        const codigo_factura = req.params.id;

        // Obtener datos de la factura
        const facturaResult = await pool.query('SELECT * FROM factura WHERE codigo_factura = @codigo_factura', {
            codigo_factura
        });

        // Obtener productos de la factura
        const productosResult = await pool.query(`
            SELECT pf.*, p.nombre, c.nombre AS categoria, m.nombre AS marca
            FROM producto_factura pf
            INNER JOIN producto p ON pf.codigo_producto = p.codigo_producto
            LEFT JOIN marca m ON p.codigo_marca = m.codigo_marca
            WHERE pf.codigo_factura = @codigo_factura
        `, {
            codigo_factura
        });

        if (facturaResult.recordset.length === 0) {
            return res.status(404).json({ mensaje: 'Factura no encontrada' });
        }

        res.json({
            factura: facturaResult.recordset[0],
            productos: productosResult.recordset
        });
    } catch (error) {
        console.error('Error al obtener detalles de la venta:', error.message);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}