import express from 'express';
import sql from 'mssql';
import { getConnection } from '../database/connection.js'; // tu config de conexión

const router = express.Router();

// Obtener empleados activos del local 1
router.get('/empleados/local1', async (req, res) => {
    try {
        const pool = await sql.connect(getConnection);
        const result = await pool.request()
            .query(`SELECT codigo_empleado, nombre, apellido 
              FROM empleado 
              WHERE estado = 1 AND codigo_tienda = 1`);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error al obtener empleados:', error);
        res.status(500).send('Error al obtener empleados');
    }
});

// Obtener productos activos del local 1
router.get('/productos/local1', async (req, res) => {
    try {
        const pool = await sql.connect(getConnection);
        const result = await pool.request()
            .query(`SELECT codigo_producto, nombre, precio, stock 
              FROM producto 
              WHERE estado = 1 AND codigo_tienda = 1`);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).send('Error al obtener productos');
    }
});

export default router;
