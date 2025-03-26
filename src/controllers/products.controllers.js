import { getConnection } from "../database/connection.js";

export const getProducts = async (req, res) => { 
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM producto')

    console.log(result) 
    res.send("Obteniendo productos")
}