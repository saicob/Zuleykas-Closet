import sql from 'mssql';

export const dbSettings = {
    user: 'evans2',
    password: '1234',
    server: '127.0.0.1',  //pongan el nombre de su servidor o la dirección IP si no funciona el nombre
    database: 'Zuleykas',  //usar EXEC xp_readerrorlog 0, 1, N'Server is listening on'; en MSSQL para ver el ip y el puerto que usa
    port: 57794, //en mi caso el puerto es 57794, pero puede variar en cada caso 
                // configurar el puerto en el firewall de windows para que no lo bloquee
                //configurar en sql server para que acepte conexiones TCP/IP y poner el puerto que ocupa
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

export const getConnection = async () => {
    try {
        const pool = await sql.connect(dbSettings);
        const result = await pool.request().query('SELECT GETDATE() as fecha');
        console.log(result)
        return pool;
    } catch (error) {
        console.error('Error de conexión:', error);
        throw error;
    }
};

export const realizarVenta = async (cliente, productos) => {
    let transaction; // Declarar la variable fuera del bloque try
    try {
        const pool = await sql.connect(dbSettings);

        // Iniciar transacción
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Insertar factura y obtener el ID generado
        const facturaResult = await transaction.request()
            .input('cliente', sql.VarChar, cliente)
            .query(`
                INSERT INTO factura (fecha, total, codigo_cliente) 
                OUTPUT INSERTED.codigo_factura 
                VALUES (CAST(GETDATE() AS date), 0, NULL);
            `);
        const facturaId = facturaResult.recordset[0].codigo_factura;

        let totalFactura = 0;

        for (const producto of productos) {
            const { producto: nombre, cantidad, precio, subtotal } = producto;

            // Actualizar stock
            await transaction.request()
                .input('nombre', sql.VarChar, nombre)
                .input('cantidad', sql.Int, cantidad)
                .query('UPDATE producto SET stock = stock - @cantidad WHERE nombre = @nombre');

            // Insertar en producto_factura
            await transaction.request()
                .input('nombre', sql.VarChar, nombre) // Declarar @nombre aquí también
                .input('cantidad', sql.Int, cantidad)
                .input('subtotal', sql.Decimal(10, 2), subtotal)
                .input('facturaId', sql.Int, facturaId)
                .query(`
                    INSERT INTO producto_factura (cantidad, subtotal, codigo_producto, codigo_factura)
                    VALUES (@cantidad, @subtotal, 
                            (SELECT codigo_producto FROM producto WHERE nombre = @nombre), 
                            @facturaId);
                `);

            totalFactura += subtotal;
        }

        // Actualizar total en factura
        await transaction.request()
            .input('facturaId', sql.Int, facturaId)
            .input('total', sql.Decimal(10, 2), totalFactura)
            .query('UPDATE factura SET total = @total WHERE codigo_factura = @facturaId');

        // Confirmar transacción
        await transaction.commit();

        return { success: true, message: 'Venta realizada con éxito', facturaId };
    } catch (error) {
        console.error('Error al realizar la venta:', error);

        // Revertir transacción en caso de error
        if (transaction) await transaction.rollback();
        return { success: false, message: 'Error al realizar la venta', error: error.message };
    }
};
