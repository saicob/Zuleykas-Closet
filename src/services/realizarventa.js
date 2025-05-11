import sql from 'mssql';
import { dbSettings } from '../database/connection.js';

export const realizarVenta = async (productos) => {
    let transaction;
    try {
        const pool = await sql.connect(dbSettings);
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Crear la factura (inicialmente con total = 0)
        const facturaResult = await transaction.request()
            .query(`
                INSERT INTO factura (fecha, total) 
                OUTPUT INSERTED.codigo_factura 
                VALUES (CAST(GETDATE() AS date), 0);
            `);
        const facturaId = facturaResult.recordset[0].codigo_factura;

        let totalFactura = 0;

        // Recorrer los productos y procesarlos
        for (const producto of productos) {
            const { nombre, cantidad, subtotal } = producto;

            if (!nombre) {
                throw new Error('El nombre del producto es inválido o está vacío.');
            }

            if (!Number.isInteger(cantidad) || cantidad <= 0) {
                throw new Error(`La cantidad del producto "${nombre}" no es válida: ${cantidad}`);
            }


            // Obtener el código del producto
            const productoResult = await transaction.request()
                .input('nombre', sql.VarChar, nombre)
                .query('SELECT codigo_producto FROM producto WHERE nombre = @nombre');

            if (productoResult.recordset.length === 0) {
                throw new Error(`El producto "${nombre}" no existe en la base de datos.`);
            }

            const codigoProducto = productoResult.recordset[0].codigo_producto;

            // Actualizar el stock del producto
            await transaction.request()
                .input('codigoProducto', sql.Int, codigoProducto)
                .input('cantidad', sql.Int, cantidad)
                .query('UPDATE producto SET stock = stock - @cantidad WHERE codigo_producto = @codigoProducto');

            // Insertar en la tabla producto_factura
            await transaction.request()
                .input('cantidad', sql.Int, cantidad)
                .input('subtotal', sql.Decimal(10, 2), subtotal)
                .input('codigoProducto', sql.Int, codigoProducto)
                .input('facturaId', sql.Int, facturaId)
                .query(`
                    INSERT INTO producto_factura (cantidad, subtotal, codigo_producto, codigo_factura)
                    VALUES (@cantidad, @subtotal, @codigoProducto, @facturaId);
                `);

            totalFactura += subtotal;
        }

        // Actualizar el total de la factura
        await transaction.request()
            .input('facturaId', sql.Int, facturaId)
            .input('total', sql.Decimal(10, 2), totalFactura)
            .query('UPDATE factura SET total = @total WHERE codigo_factura = @facturaId');

        // Confirmar la transacción
        await transaction.commit();

        return { success: true, message: 'Venta realizada con éxito', facturaId };
    } catch (error) {
        console.error('Error al realizar la venta:', error);
        if (transaction) await transaction.rollback();
        return { success: false, message: 'Error al realizar la venta', error: error.message };
    }
};
