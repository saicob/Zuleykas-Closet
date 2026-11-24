import { getConnection } from '../database/connection.js';
import sql from 'mssql';

// Obtener todos los proveedores
export const getProveedoresJSON = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM proveedor');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).send('Error del servidor al obtener las proveedores');
  }
};

// Obtener un proveedor por nombre
export const getProveedorByName = async (req, res) => {
  try {
    const { nombre } = req.params;
    const pool = await getConnection();
    const result = await pool.request()
      .input('nombre', sql.VarChar, nombre)
      .query('SELECT * FROM proveedor WHERE nombre = @nombre');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error al obtener proveedor por nombre:', error);
    res.status(500).send('Error del servidor');
  }
};

// Crear un nuevo proveedor
export const createProveedor = async (req, res) => {
    const { nombre, estado } = req.body;

    if (!nombre || estado === undefined) {
        return res.status(400).json({ success: false, message: 'Nombre y estado son requeridos.' });
    }

    try {
        const pool = await getConnection();
        await pool.request()
            .input('nombre', sql.VarChar, nombre)
            .input('estado', sql.Bit, estado)
            .query('INSERT INTO proveedor (nombre, estado) VALUES (@nombre, @estado)');

        res.json({ success: true, message: 'Proveedor agregado con éxito.' });
    } catch (error) {
        console.error('Error al agregar el proveedor:', error);
        res.status(500).json({ success: false, message: 'Error al agregar el proveedor.', error: error.message });
    }
};

// Actualizar un proveedor existente
export const updateProveedor = async (req, res) => {
    try {
        const { codigo_proveedor } = req.params;
        const { nombre, estado } = req.body;

        if (!nombre || estado === undefined) {
            return res.status(400).json({ success: false, message: 'Nombre y estado son requeridos.' });
        }

        const pool = await getConnection();
        const result = await pool.request()
            .input('codigo_proveedor', sql.Int, codigo_proveedor)
            .input('nombre', sql.VarChar, nombre)
            .input('estado', sql.Bit, estado)
            .query(`
                UPDATE proveedor
                SET nombre = @nombre, estado = @estado
                WHERE codigo_proveedor = @codigo_proveedor
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ success: false, message: 'Proveedor no encontrado.' });
        }

        res.json({ success: true, message: 'Proveedor actualizado con éxito.' });
    } catch (error) {
        console.error('Error al actualizar proveedor:', error);
        res.status(500).json({ success: false, message: 'Error del servidor.', error: error.message });
    }
};
// Eliminar un proveedor
export const deleteProveedor = async (req, res) => {
  try {
    const { codigo_proveedor } = req.params;

    const pool = await getConnection();
    const result = await pool.request()
      .input('codigo_proveedor', sql.Int, codigo_proveedor)
      .query('DELETE FROM proveedor WHERE codigo_proveedor = @codigo_proveedor');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    res.json({ message: 'Proveedor eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};
