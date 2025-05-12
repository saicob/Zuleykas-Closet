import { getConnection } from "../database/connection.js";
import sql from 'mssql';

export const getProducts = async (req, res) => { 
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM producto')

    console.log(result) 
    res.send("Obteniendo productos")
}

export const getProductByName = async (req, res) => {
    try {
        const { nombre } = req.params;
        const pool = await getConnection();
        const result = await pool.request()
            .input('nombre', sql.VarChar, nombre)
            .query(`
                SELECT nombre, descripcion, precio, stock, talla,
                       CASE WHEN estado = 1 THEN 'Activo' ELSE 'Inactivo' END AS estado,
                       fecha_caducidad
                FROM producto
                WHERE nombre = @nombre
            `);

        if (result.recordset.length > 0) {
            res.json(result.recordset[0]); // Return the product details
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
    const {
      nombre,
      descripcion,
      precio,
      stock,
      estado,
      codigo_tienda,
      codigo_imagen,
      codigo_categoria,
      tipo_producto,
      datos_tipo,
      codigo_marca,
      fecha_caducidad
    } = req.body;

    // Insertar en producto
    const result = await pool.query(`
      INSERT INTO producto (nombre, descripcion, precio, stock, estado, codigo_tienda, codigo_imagen, codigo_categoria, fecha_caducidad)
      OUTPUT INSERTED.codigo_producto
      VALUES (@nombre, @descripcion, @precio, @stock, @estado, @codigo_tienda, @codigo_imagen, @codigo_categoria, @fecha_caducidad)
    `, {
      nombre,
      descripcion,
      precio,
      stock,
      estado,
      codigo_tienda,
      codigo_imagen,
      codigo_categoria,
      fecha_caducidad
    });

    const codigo_producto = result.recordset[0].codigo_producto;

    // Insertar según tipo
    if (tipo_producto === 'ropa') {
      await pool.query(`
        INSERT INTO ropa (codigo_talla, codigo_producto, codigo_marca)
        VALUES (@codigo_talla, @codigo_producto, @codigo_marca)
      `, {
        codigo_talla: datos_tipo.codigo_talla,
        codigo_producto,
        codigo_marca
      });
    } else if (tipo_producto === 'accesorio') {
      await pool.query(`
        INSERT INTO accesorio (medida, material, codigo_marca, codigo_producto)
        VALUES (@medida, @material, @codigo_marca, @codigo_producto)
      `, {
        medida: datos_tipo.medida,
        material: datos_tipo.material,
        codigo_marca,
        codigo_producto
      });
    } else if (tipo_producto === 'cosmetico') {
      await pool.query(`
        INSERT INTO cosmetico (fecha_fabricacion, fecha_caducidad, codigo_producto, codigo_marca)
        VALUES (@fecha_fabricacion, @fecha_caducidad, @codigo_producto, @codigo_marca)
      `, {
        fecha_fabricacion: datos_tipo.fecha_fabricacion,
        fecha_caducidad: datos_tipo.fecha_caducidad,
        codigo_producto,
        codigo_marca
      });
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
        const { nombre, descripcion, precio_compra, precio_venta, cantidad, descripcion: newDescripcion } = req.body;

        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, id)
            .input('nombre', sql.VarChar, nombre)
            .input('descripcion', sql.Text, newDescripcion)
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
            SELECT nombre, descripcion, precio, stock, talla,
                   CASE WHEN estado = 1 THEN 'Activo' ELSE 'Inactivo' END AS estado,
                   fecha_caducidad
            FROM producto
        `);
        res.json(result.recordset); // Enviar los productos como JSON
    } catch (error) {
        res.status(500).send('Error al obtener los productos');
    }
};