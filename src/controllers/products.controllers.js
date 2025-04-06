import { getConnection } from "../database/connection.js";
import sql from 'mssql';

export const getProducts = async (req, res) => { 
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM producto')

    console.log(result) 
    res.send("Obteniendo productos")
}

export const getProductByName = async (req, res) => { 
    const { nombre } = req.params; // Obtener el nombre del producto desde los parámetros de la ruta
    const pool = await getConnection();
    const result = await pool.request()
        .input('nombre', sql.VarChar, nombre) // Usar sql.VarChar para el tipo de dato
        .query('SELECT * FROM producto WHERE nombre = @nombre')
    
    console.log(result)
    res.send("Obteniendo un producto")
}

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
      codigo_marca
    } = req.body;

    // Insertar en producto
    const result = await pool.query(`
      INSERT INTO producto (nombre, descripcion, precio, stock, estado, codigo_tienda, codigo_imagen, codigo_categoria)
      OUTPUT INSERTED.codigo_producto
      VALUES (@nombre, @descripcion, @precio, @stock, @estado, @codigo_tienda, @codigo_imagen, @codigo_categoria)
    `, {
      nombre,
      descripcion,
      precio,
      stock,
      estado,
      codigo_tienda,
      codigo_imagen,
      codigo_categoria
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


export const getProductsJSON = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM producto');
        res.json(result.recordset); // Enviar los productos como JSON
    } catch (error) {
        res.status(500).send('Error al obtener los productos');
    }
};