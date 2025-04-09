import { dbSettings } from '../database/connection.js';
import sql from 'mssql';

export const crearVenta=('/crear-venta', async (req, res) => {
    const { id_empleado, id_cliente, productos, total, id_tienda } = req.body;

    try {
        const pool = await sql.connect(dbSettings);

        const fecha = new Date().toISOString();

        // 1. Insertar la factura
        const resultFactura = await pool.request()
            .input('id_empleado', sql.Int, id_empleado)
            .input('id_cliente', sql.Int, id_cliente)
            .input('fecha', sql.DateTime, fecha)
            .input('total', sql.Decimal(10, 2), total)
            .input('id_tienda', sql.Int, id_tienda)
            .query(`
        INSERT INTO factura (id_empleado, id_cliente, fecha, total, id_tienda)
        OUTPUT INSERTED.id_factura
        VALUES (@id_empleado, @id_cliente, @fecha, @total, @id_tienda)
      `);

        const id_factura = resultFactura.recordset[0].id_factura;

        // 2. Insertar cada producto en producto_factura y actualizar stock
        for (const prod of productos) {
            const { codigo_producto, cantidad, precio_unitario } = prod;
            const subtotal = cantidad * precio_unitario;

            await pool.request()
                .input('id_factura', sql.Int, id_factura)
                .input('codigo_producto', sql.Int, codigo_producto)
                .input('cantidad', sql.Int, cantidad)
                .input('precio_unitario', sql.Decimal(10, 2), precio_unitario)
                .input('subtotal', sql.Decimal(10, 2), subtotal)
                .query(`
          INSERT INTO producto_factura (id_factura, codigo_producto, cantidad, precio_unitario, subtotal)
          VALUES (@id_factura, @codigo_producto, @cantidad, @precio_unitario, @subtotal)
        `);

            await pool.request()
                .input('codigo_producto', sql.Int, codigo_producto)
                .input('cantidad', sql.Int, cantidad)
                .query(`
          UPDATE producto SET stock = stock - @cantidad WHERE codigo_producto = @codigo_producto
        `);
        }

        res.status(200).json({ message: 'Venta registrada correctamente.' });

    } catch (err) {
        console.error('Error al registrar venta:', err);
        res.status(500).json({ error: 'Error interno al registrar la venta.' });
    }
});


