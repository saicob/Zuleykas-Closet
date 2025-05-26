import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

export const dbSettings = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: 'Zuleykas',
    port: parseInt(process.env.DB_PORT, 10),
    options: {
        encrypt: false,
        trustServerCertificate: true,
    }
};

let pool; // Pool global para reutilizar la conexión

export const getConnection = async () => {
    try {
        if (pool) {
            return pool;
        }
        pool = await sql.connect(dbSettings);
        return pool;
    } catch (error) {
        console.error('Error de conexión:', error);
        throw error;
    }
};

export const realizarVenta = async (productos) => {
    // El parámetro 'cliente' se elimina porque no se usa en la lógica actual
    let transaction;
    try {
        const pool = await sql.connect(dbSettings);
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Crear la factura
        const facturaResult = await transaction.request()
            .query(`
                INSERT INTO factura (fecha, total) 
                OUTPUT INSERTED.codigo_factura 
                VALUES (GETDATE(), 0);
            `);
        const facturaId = facturaResult.recordset[0].codigo_factura;

        let totalFactura = 0;

        // Procesar productos
        for (const producto of productos) {
            const { nombre, cantidad, subtotal } = producto;

            if (!nombre || cantidad <= 0 || subtotal <= 0) {
                throw new Error(`Datos inválidos para el producto: ${nombre}`);
            }

            const productoResult = await transaction.request()
                .input('nombre', sql.VarChar, nombre)
                .query('SELECT codigo_producto FROM producto WHERE nombre = @nombre');

            if (productoResult.recordset.length === 0) {
                throw new Error(`El producto "${nombre}" no existe en la base de datos.`);
            }

            const codigoProducto = productoResult.recordset[0].codigo_producto;

            // Actualizar stock del producto
            await transaction.request()
                .input('codigoProducto', sql.Int, codigoProducto)
                .input('cantidad', sql.Int, cantidad)
                .query('UPDATE producto SET stock = stock - @cantidad WHERE codigo_producto = @codigoProducto');

            // Insertar detalles de la venta
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

        // Confirmar transacción
        await transaction.commit();

        return { success: true, message: 'Venta realizada con éxito', facturaId };
    } catch (error) {
        console.error('Error al realizar la venta:', error);
        if (transaction) await transaction.rollback();
        return { success: false, message: 'Error al realizar la venta', error: error.message };
    }
};
