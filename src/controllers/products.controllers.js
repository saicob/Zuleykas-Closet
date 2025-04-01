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
    const { nombre, precio, stock } = req.body; // Obtener los datos del producto desde el cuerpo de la solicitud
    const pool = await getConnection();
    const result = await pool.request()
        .input('nombre', sql.VarChar, nombre) // Usar sql.VarChar para el tipo de dato
        .input('precio', sql.Decimal(10, 2), precio) // Usar sql.Decimal para el tipo de dato
        .input('stock', sql.Int, stock) // Usar sql.Int para el tipo de dato
        .query('INSERT INTO producto (nombre, precio, stock) VALUES (@nombre, @precio, @stock)')
    
    console.log(result)
    res.send("Creando un producto")
}

export const getProductsJSON = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM producto');
        res.json(result.recordset); // Enviar los productos como JSON
    } catch (error) {
        res.status(500).send('Error al obtener los productos');
    }
};