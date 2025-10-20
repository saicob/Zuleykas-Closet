import { getConnection, dbSettings } from "../database/connection.js"
import sql from "mssql"

export const realizarVenta = async (productos, delivery = null, costoDelivery = 0) => {
    let transaction
    try {
        const pool = await sql.connect(dbSettings)
        transaction = new sql.Transaction(pool)
        await transaction.begin()

        // Calcular total de productos
        const totalProductos = productos.reduce((sum, p) => sum + p.subtotal, 0)
        const totalFinal = totalProductos + (costoDelivery || 0)

        // Crear la factura
        const facturaResult = await transaction.request().query(`
                INSERT INTO factura (fecha, total) 
                OUTPUT INSERTED.codigo_factura 
                VALUES (CAST(GETDATE() AS date), ${totalFinal});
            `)
        const facturaId = facturaResult.recordset[0].codigo_factura

        // Procesar productos
        for (const producto of productos) {
            const { nombre, cantidad, subtotal, descuento = 0 } = producto

            if (!nombre) {
                throw new Error("El nombre del producto es inválido o está vacío.")
            }

            if (!Number.isInteger(cantidad) || cantidad <= 0) {
                throw new Error(`La cantidad del producto "${nombre}" no es válida: ${cantidad}`)
            }

            // Obtener el código del producto
            const productoResult = await transaction
                .request()
                .input("nombre", sql.VarChar, nombre)
                .query("SELECT codigo_producto FROM producto WHERE nombre = @nombre")

            if (productoResult.recordset.length === 0) {
                throw new Error(`El producto "${nombre}" no existe en la base de datos.`)
            }

            const codigoProducto = productoResult.recordset[0].codigo_producto

            // Actualizar el stock del producto
            await transaction
                .request()
                .input("codigoProducto", sql.Int, codigoProducto)
                .input("cantidad", sql.Int, cantidad)
                .query("UPDATE producto SET stock = stock - @cantidad WHERE codigo_producto = @codigoProducto")

            // Insertar en la tabla producto_factura
            await transaction
                .request()
                .input("cantidad", sql.Int, cantidad)
                .input("subtotal", sql.Decimal(10, 2), subtotal)
                .input("codigoProducto", sql.Int, codigoProducto)
                .input("facturaId", sql.Int, facturaId)
                .input("descuento", sql.Int, descuento)
                .query(`
                    INSERT INTO producto_factura (cantidad, subtotal, codigo_producto, codigo_factura, descuento)
                    VALUES (@cantidad, @subtotal, @codigoProducto, @facturaId, @descuento);
                `)
        }

        // Si hay delivery, crear cliente y delivery en la misma transacción
        if (delivery && delivery.direccion && delivery.cliente) {
            // Buscar o crear cliente
            let clienteId = null
            const clienteResult = await transaction.request()
                .input("nombre", sql.NVarChar, delivery.cliente)
                .query("SELECT codigo_cliente FROM cliente WHERE nombre = @nombre")
            if (clienteResult.recordset.length > 0) {
                clienteId = clienteResult.recordset[0].codigo_cliente
            } else {
                // Crear cliente rápido solo con nombre
                const insertCliente = await transaction.request()
                    .input("nombre", sql.NVarChar, delivery.cliente)
                    .query("INSERT INTO cliente (nombre) OUTPUT INSERTED.codigo_cliente VALUES (@nombre)")
                clienteId = insertCliente.recordset[0].codigo_cliente
            }

            // Insertar en delivery
            await transaction.request()
                .input("direccion", sql.NVarChar, delivery.direccion)
                .input("costo", sql.Decimal(10, 2), delivery.costo || costoDelivery)
                .input("codigo_cliente", sql.Int, clienteId)
                .input("codigo_factura", sql.Int, facturaId)
                .query(`
                    INSERT INTO delivery (direccion, costo, codigo_cliente, codigo_factura)
                    VALUES (@direccion, @costo, @codigo_cliente, @codigo_factura)
                `)
        }

        // Confirmar la transacción
        await transaction.commit()

        return {
            success: true,
            message: delivery ? "Venta con delivery realizada con éxito" : "Venta realizada con éxito",
            facturaId,
        }
    } catch (error) {
        console.error("Error al realizar la venta:", error)
        if (transaction) await transaction.rollback()
        return { success: false, message: `Error al realizar la venta: ${error.message}`, error: error.message }
    }
}
