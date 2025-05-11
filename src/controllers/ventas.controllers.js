import { realizarVenta } from '../services/realizarventa.js';

import { getConnection } from '../database/connection.js'; // para obtener historial de ventas

// Crear una venta
export const crearVenta = async (req, res) => {
    const { productos } = req.body;

    if (!productos || !Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({ success: false, message: 'No se proporcionaron productos.' });
    }

    for (const p of productos) {
        if (
            !p.nombre ||
            typeof p.nombre !== 'string' ||
            !Number.isInteger(p.cantidad) || p.cantidad <= 0 ||
            typeof p.subtotal !== 'number' || p.subtotal <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: `Producto inválido: ${JSON.stringify(p)}`
            });
        }
    }

    try {
        const result = await realizarVenta(productos);

        if (result.success) {
            res.status(200).json({ success: true, message: result.message, facturaId: result.facturaId });
        } else {
            res.status(500).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('Error al realizar la venta:', error);
        res.status(500).json({ success: false, message: 'Error al realizar la venta.', error: error.message });
    }
};


// Obtener el historial de ventas
export const getVentas = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT codigo_factura, fecha, total FROM factura ORDER BY fecha DESC');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error al obtener el historial de ventas:', error);
        res.status(500).json({ success: false, message: 'Error al obtener el historial de ventas.', error: error.message });
    }
};
