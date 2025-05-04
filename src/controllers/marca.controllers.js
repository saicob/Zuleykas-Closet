import { getConnection } from "../database/connection.js";
import sql from 'mssql';

// Obtener todas las marcas
export const getMarcasJSON = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM marca');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener marcas:', error);
    res.status(500).send('Error del servidor al obtener las marcas');
  }
};

// Obtener una marca por nombre
export const getMarcaByName = async (req, res) => {
  try {
    const { nombre } = req.params;
    const pool = await getConnection();
    const result = await pool.request()
      .input('nombre', sql.VarChar, nombre)
      .query('SELECT * FROM marca WHERE nombre = @nombre');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Marca no encontrada' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error al obtener marca por nombre:', error);
    res.status(500).send('Error del servidor');
  }
};

// Crear una nueva marca
export const createMarca = async (req, res) => {
  try {
    const { nombre, estado } = req.body;

    const pool = await getConnection();
    const result = await pool.request()
      .input('nombre', sql.VarChar, nombre)
      .input('estado', sql.Bit, estado)
      .query(`
        INSERT INTO marca (nombre, estado)
        OUTPUT INSERTED.codigo_marca
        VALUES (@nombre, @estado)
      `);

    res.status(201).json({
      message: 'Marca creada exitosamente',
      codigo_marca: result.recordset[0].codigo_marca
    });
  } catch (error) {
    console.error('Error al crear marca:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Actualizar una marca existente
export const updateMarca = async (req, res) => {
  try {
    const { codigo_marca } = req.params;
    const { nombre, estado } = req.body;

    const pool = await getConnection();
    const result = await pool.request()
      .input('codigo_marca', sql.Int, codigo_marca)
      .input('nombre', sql.VarChar, nombre)
      .input('estado', sql.Bit, estado)
      .query(`
        UPDATE marca
        SET nombre = @nombre, estado = @estado
        WHERE codigo_marca = @codigo_marca
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Marca no encontrada' });
    }

    res.json({ message: 'Marca actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar marca:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Eliminar una marca
export const deleteMarca = async (req, res) => {
  try {
    const { codigo_marca } = req.params;

    const pool = await getConnection();
    const result = await pool.request()
      .input('codigo_marca', sql.Int, codigo_marca)
      .query('DELETE FROM marca WHERE codigo_marca = @codigo_marca');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Marca no encontrada' });
    }

    res.json({ message: 'Marca eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar marca:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};
