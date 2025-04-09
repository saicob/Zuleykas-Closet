import { getConnection } from "../database/connection.js";
import sql from 'mssql'

export const getEmpleados = async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT codigo_empleado, nombre FROM empleado')

    console.log(result)
    res.send(result.recordset)
}
