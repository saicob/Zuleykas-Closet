import { getConnection } from "../database/connection.js";
import sql from 'mssql';
import path from 'path';
import fs from 'fs';

export const getProducts = async (req, res) => { 
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM producto');
    console.log(result);
    res.send("Obteniendo productos");
}

export const getProductByName = async (req, res) => {
    try {
        const { nombre } = req.params;
        const pool = await getConnection();
        const result = await pool.request()
            .input('nombre', sql.VarChar, nombre)
            .query(`
                SELECT p.nombre, p.descripcion, p.precio, p.stock, p.talla,
                       pr.nombre AS proveedor,
                       m.nombre AS marca,
                       p.fecha_caducidad,
                       p.codigo_tienda
                FROM producto p
                LEFT JOIN proveedor pr ON p.codigo_proveedor = pr.codigo_proveedor
                LEFT JOIN marca m ON p.codigo_marca = m.codigo_marca
                WHERE p.nombre = @nombre
            `);

        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener el producto:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

export const createProduct = async (req, res) => {
    try {
        const pool = await getConnection();

        const {
            nombre,
            descripcion,
            precio,
            stock,
            estado,
            codigo_tienda,
            codigo_categoria,
            tipo_producto,
            datos_tipo,
            codigo_marca,
            codigo_proveedor,
            fecha_caducidad
            
        } = req.body;

        // 1. Subir la imagen si se envió (con multer previamente configurado)
        let codigo_imagen = null;

        if (req.file) {
            const rutaRelativa = `/imagenes/${req.file.filename}`;
            const imagenResult = await pool.request()
                .input('ruta', sql.NVarChar, rutaRelativa)
                .query(`
                    INSERT INTO imagen (ruta)
                    OUTPUT INSERTED.codigo_imagen
                    VALUES (@ruta)
                `);
            codigo_imagen = imagenResult.recordset[0].codigo_imagen;
        }

        // 2. Insertar producto
        const productoResult = await pool.request()
            .input('nombre', sql.VarChar, nombre)
            .input('descripcion', sql.Text, descripcion)
            .input('precio', sql.Decimal, precio)
            .input('stock', sql.Int, stock)
            .input('estado', sql.Bit, estado)
            .input('codigo_tienda', sql.Int, codigo_tienda)
            .input('codigo_imagen', sql.Int, codigo_imagen)
            .input('codigo_categoria', sql.Int, codigo_categoria)
            .input('fecha_caducidad', sql.Date, fecha_caducidad)
            .input('codigo_proveedor', sql.Int, codigo_proveedor)
            .input('codigo_marca', sql.Int, codigo_marca)
            .query(`
                INSERT INTO producto 
                    (nombre, descripcion, precio, stock, estado, codigo_tienda, codigo_imagen, codigo_categoria, fecha_caducidad, codigo_proveedor, codigo_marca)
                OUTPUT INSERTED.codigo_producto
                VALUES 
                    (@nombre, @descripcion, @precio, @stock, @estado, @codigo_tienda, @codigo_imagen, @codigo_categoria, @fecha_caducidad, @codigo_proveedor, @codigo_marca)
            `);

        const codigo_producto = productoResult.recordset[0].codigo_producto;

        // 3. Insertar según tipo
        if (tipo_producto === 'ropa') {
            await pool.request()
                .input('codigo_talla', sql.VarChar, datos_tipo.codigo_talla)
                .input('codigo_producto', sql.Int, codigo_producto)
                .input('codigo_marca', sql.Int, codigo_marca)
                .query(`
                    INSERT INTO ropa (codigo_talla, codigo_producto, codigo_marca)
                    VALUES (@codigo_talla, @codigo_producto, @codigo_marca)
                `);
        } else if (tipo_producto === 'accesorio') {
            await pool.request()
                .input('medida', sql.VarChar, datos_tipo.medida)
                .input('material', sql.VarChar, datos_tipo.material)
                .input('codigo_producto', sql.Int, codigo_producto)
                .input('codigo_marca', sql.Int, codigo_marca)
                .query(`
                    INSERT INTO accesorio (medida, material, codigo_marca, codigo_producto)
                    VALUES (@medida, @material, @codigo_marca, @codigo_producto)
                `);
        } else if (tipo_producto === 'cosmetico') {
            await pool.request()
                .input('fecha_fabricacion', sql.Date, datos_tipo.fecha_fabricacion)
                .input('fecha_caducidad', sql.Date, datos_tipo.fecha_caducidad)
                .input('codigo_producto', sql.Int, codigo_producto)
                .input('codigo_marca', sql.Int, codigo_marca)
                .query(`
                    INSERT INTO cosmetico (fecha_fabricacion, fecha_caducidad, codigo_producto, codigo_marca)
                    VALUES (@fecha_fabricacion, @fecha_caducidad, @codigo_producto, @codigo_marca)
                `);
        }

        res.status(201).json({ message: 'Producto agregado exitosamente', codigo_producto });

    } catch (error) {
        console.error('Error al agregar producto:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio_compra, precio_venta, cantidad } = req.body;

        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, id)
            .input('nombre', sql.VarChar, nombre)
            .input('descripcion', sql.Text, descripcion)
            .input('precio_compra', sql.Decimal, precio_compra)
            .input('precio_venta', sql.Decimal, precio_venta)
            .input('cantidad', sql.Int, cantidad)
            .query(`
                UPDATE producto
                SET nombre = @nombre,
                    descripcion = @descripcion,
                    precio = @precio_venta,
                    stock = @cantidad
                WHERE codigo_producto = @id
            `);

        res.status(200).json({ message: 'Producto actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

export const getProductsJSON = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT 
                p.nombre, 
                p.descripcion, 
                p.precio, 
                p.stock,
                ISNULL(pr.nombre, '') AS proveedor,
                ISNULL(m.nombre, '') AS marca,
                p.fecha_caducidad,
                i.ruta AS imagen,
                p.talla,
                p.codigo_imagen,
                p.codigo_tienda
            FROM producto p
            LEFT JOIN proveedor pr ON p.codigo_proveedor = pr.codigo_proveedor
            LEFT JOIN marca m ON p.codigo_marca = m.codigo_marca
            LEFT JOIN imagen i ON p.codigo_imagen = i.codigo_imagen
        `);
        console.log("Productos obtenidos:", result.recordset);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error al obtener los productos:', error.message, error.stack);
        res.status(500).send('Error al obtener los productos: ' + error.message);
    }
};
