import { getConnection } from "../database/connection.js";
import sql from 'mssql';

export const getProveedor = async (req, res) => { 
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM proveedor')

    console.log(result) 
    res.send("Obteniendo proveedores")
}