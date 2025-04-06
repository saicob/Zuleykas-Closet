import { getConnection } from "../database/connection.js";
import sql from 'mssql';

export const getMarcas = async (req, res) => { 
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM marca')

    console.log(result) 
    res.send("Obteniendo marcas")
}