import express from 'express';
import { realizarVenta } from '../database/connection.js';

const router = express.Router();

router.post('/realizarventa', async (req, res) => {
    try {
        const { cliente, productos } = req.body;

        if (!productos || productos.length === 0) {
            return res.status(400).json({ success: false, message: 'No se enviaron productos.' });
        }

        const result = await realizarVenta(cliente, productos);

        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Error en la ruta /realizarventa:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.', error: error.message });
    }
});

export default router;
