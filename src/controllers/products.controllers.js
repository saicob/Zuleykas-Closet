import { getConnection } from "../database/connection.js"
import sql from "mssql"

export const getProducts = async (req, res) => {
    const pool = await getConnection()
    const result = await pool.request().query("SELECT * FROM producto")
    console.log(result)
    res.send("Obteniendo productos")
}

export const getProductByName = async (req, res) => {
    try {
        const { nombre } = req.params
        const pool = await getConnection()
        const result = await pool
            .request()
            .input("nombre", sql.VarChar, nombre)
            .query(`
                SELECT p.nombre, p.descripcion, p.precio, p.precio_compra, p.stock, p.talla,
                       p.categoria,
                       pr.nombre AS proveedor,
                       m.nombre AS marca,
                       p.fecha_caducidad,
                       p.fecha_fabricacion,
                       ISNULL(i.ruta, '/placeholder.svg?height=50&width=50') AS imagen,
                       p.codigo_tienda,
                       -- Campos dinámicos
                       p.material, p.color, p.tallas, p.composicion, p.tipo_ajuste, p.tipo, p.textura, p.acabado
                FROM producto p
                LEFT JOIN proveedor pr ON p.codigo_proveedor = pr.codigo_proveedor
                LEFT JOIN marca m ON p.codigo_marca = m.codigo_marca
                LEFT JOIN imagen i ON p.codigo_imagen = i.codigo_imagen
                WHERE p.nombre = @nombre
            `)

        if (result.recordset.length > 0) {
            res.json(result.recordset[0])
        } else {
            res.status(404).json({ error: "Producto no encontrado" })
        }
    } catch (error) {
        console.error("Error al obtener el producto:", error)
        res.status(500).json({ error: "Error del servidor" })
    }
}

export const getProductsJSON = async (req, res) => {
    try {
        const pool = await getConnection()
        const result = await pool.request().query(`
            SELECT 
                p.codigo_producto,
                p.nombre, 
                p.descripcion, 
                p.precio_compra,
                p.precio,
                p.stock,
                p.categoria,
                p.talla,
                p.fecha_fabricacion,
                p.fecha_caducidad,
                ISNULL(pr.nombre, 'Sin proveedor') AS proveedor,
                ISNULL(m.nombre, 'Sin marca') AS marca,
                ISNULL(i.ruta, '/placeholder.svg?height=50&width=50') AS imagen,
                p.codigo_tienda
            FROM producto p
            LEFT JOIN proveedor pr ON p.codigo_proveedor = pr.codigo_proveedor
            LEFT JOIN marca m ON p.codigo_marca = m.codigo_marca
            LEFT JOIN imagen i ON p.codigo_imagen = i.codigo_imagen
            WHERE p.estado = 1
            ORDER BY p.codigo_producto DESC
        `)

        console.log("Productos obtenidos:", result.recordset.length)
        res.json(result.recordset)
    } catch (error) {
        console.error("Error al obtener los productos:", error.message, error.stack)
        res.status(500).json({ error: "Error al obtener los productos: " + error.message })
    }
}

export const createProduct = async (req, res) => {
    try {
        const pool = await getConnection()
        const {
            nombre,
            descripcion,
            precio_compra,
            precio_venta,
            cantidad,
            categoria,
            local,
            proveedor,
            marca,
            talla,
            // Campos dinámicos del frontend
            material_ropa,
            color_ropa,
            tallas_ropa,
            composicion_ropa,
            ajuste_ropa,
            textura_cosmetico,
            tipo_cosmetico,
            color_cosmetico,
            acabado_cosmetico,
            fecha_fabricacion_cosmetico,
            fecha_caducidad_cosmetico,
            material_accesorio,
            color_accesorio,
            tallas_accesorio,
            fecha_fabricacion,
            fecha_caducidad
        } = req.body

        // Validaciones básicas
        if (!nombre || !precio_venta || !cantidad || !categoria) {
            return res.status(400).json({
                error: "Los campos nombre, precio, stock y categoría son obligatorios",
            })
        }

        // Mapeo de campos dinámicos a columnas reales
        let material = null, color = null, tallas = null, composicion = null, tipo_ajuste = null;
        let tipo = null, textura = null, acabado = null;
        let fechaFab = null, fechaCad = null;
        if (categoria === 'Ropa') {
            material = material_ropa;
            color = color_ropa;
            tallas = tallas_ropa;
            composicion = composicion_ropa;
            tipo_ajuste = ajuste_ropa;
            fechaFab = fecha_fabricacion || null;
            fechaCad = fecha_caducidad || null;
        } else if (categoria === 'Cosmetico') {
            textura = textura_cosmetico;
            tipo = tipo_cosmetico;
            color = color_cosmetico;
            acabado = acabado_cosmetico;
            fechaFab = fecha_fabricacion_cosmetico || null;
            fechaCad = fecha_caducidad_cosmetico || null;
        } else if (categoria === 'Accesorio') {
            material = material_accesorio;
            color = color_accesorio;
            tallas = tallas_accesorio;
            fechaFab = fecha_fabricacion || null;
            fechaCad = fecha_caducidad || null;
        }

        // 1. Subir la imagen si se envió
        let codigo_imagen = null
        if (req.file) {
            const rutaRelativa = `/imagenes/${req.file.filename}`
            const imagenResult = await pool
                .request()
                .input("ruta", sql.NVarChar, rutaRelativa)
                .query(`
                    INSERT INTO imagen (ruta)
                    OUTPUT INSERTED.codigo_imagen
                    VALUES (@ruta)
                `)
            codigo_imagen = imagenResult.recordset[0].codigo_imagen
        }

        // 2. Obtener o crear proveedor
        let codigo_proveedor = null
        if (proveedor && proveedor.trim()) {
            const proveedorResult = await pool
                .request()
                .input("nombre", sql.VarChar, proveedor.trim())
                .query("SELECT codigo_proveedor FROM proveedor WHERE nombre = @nombre")

            if (proveedorResult.recordset.length > 0) {
                codigo_proveedor = proveedorResult.recordset[0].codigo_proveedor
            } else {
                // Crear nuevo proveedor
                const nuevoProveedorResult = await pool
                    .request()
                    .input("nombre", sql.VarChar, proveedor.trim())
                    .input("estado", sql.Bit, true)
                    .query(`
                        INSERT INTO proveedor (nombre, estado)
                        OUTPUT INSERTED.codigo_proveedor
                        VALUES (@nombre, @estado)
                    `)
                codigo_proveedor = nuevoProveedorResult.recordset[0].codigo_proveedor
            }
        } else {
            // Usar proveedor por defecto si no se especifica
            const defaultProveedorResult = await pool
                .request()
                .query("SELECT TOP 1 codigo_proveedor FROM proveedor WHERE estado = 1")

            if (defaultProveedorResult.recordset.length > 0) {
                codigo_proveedor = defaultProveedorResult.recordset[0].codigo_proveedor
            } else {
                return res.status(400).json({
                    error: "No hay proveedores disponibles. Por favor, agregue un proveedor primero.",
                })
            }
        }

        // 3. Obtener o crear marca
        let codigo_marca = null
        if (marca && marca.trim()) {
            const marcaResult = await pool
                .request()
                .input("nombre", sql.VarChar, marca.trim())
                .query("SELECT codigo_marca FROM marca WHERE nombre = @nombre")

            if (marcaResult.recordset.length > 0) {
                codigo_marca = marcaResult.recordset[0].codigo_marca
            } else {
                // Crear nueva marca
                const nuevaMarcaResult = await pool
                    .request()
                    .input("nombre", sql.VarChar, marca.trim())
                    .input("estado", sql.Bit, true)
                    .query(`
                        INSERT INTO marca (nombre, estado)
                        OUTPUT INSERTED.codigo_marca
                        VALUES (@nombre, @estado)
                    `)
                codigo_marca = nuevaMarcaResult.recordset[0].codigo_marca
            }
        } else {
            // Usar marca por defecto si no se especifica
            const defaultMarcaResult = await pool.request().query("SELECT TOP 1 codigo_marca FROM marca WHERE estado = 1")

            if (defaultMarcaResult.recordset.length > 0) {
                codigo_marca = defaultMarcaResult.recordset[0].codigo_marca
            } else {
                return res.status(400).json({
                    error: "No hay marcas disponibles. Por favor, agregue una marca primero.",
                })
            }
        }

        // 4. Insertar producto
        const productoResult = await pool
            .request()
            .input("nombre", sql.VarChar, nombre.trim())
            .input("descripcion", sql.Text, descripcion || "")
            .input("precio_compra", sql.Decimal(10, 2), Number.parseFloat(precio_compra) || 0)
            .input("precio", sql.Decimal(10, 2), Number.parseFloat(precio_venta))
            .input("stock", sql.Int, Number.parseInt(cantidad))
            .input("estado", sql.Bit, true)
            .input("categoria", sql.VarChar, categoria)
            .input("codigo_tienda", sql.Int, Number.parseInt(local) || 1)
            .input("codigo_imagen", sql.Int, codigo_imagen)
            .input("codigo_proveedor", sql.Int, codigo_proveedor)
            .input("codigo_marca", sql.Int, codigo_marca)
            .input("fecha_fabricacion", sql.Date, fechaFab)
            .input("fecha_caducidad", sql.Date, fechaCad)
            .input("talla", sql.NVarChar, talla || null)
            // Campos reales
            .input("material", sql.VarChar, material || null)
            .input("color", sql.VarChar, color || null)
            .input("tallas", sql.VarChar, tallas || null)
            .input("composicion", sql.VarChar, composicion || null)
            .input("tipo_ajuste", sql.VarChar, tipo_ajuste || null)
            .input("tipo", sql.VarChar, tipo || null)
            .input("textura", sql.VarChar, textura || null)
            .input("acabado", sql.VarChar, acabado || null)
            .query(`
                INSERT INTO producto 
                    (nombre, descripcion, precio_compra, precio, stock, estado, categoria, codigo_tienda, 
                     codigo_imagen, codigo_proveedor, codigo_marca, fecha_fabricacion, 
                     fecha_caducidad, talla, material, color, tallas, composicion, tipo_ajuste, tipo, textura, acabado)
                OUTPUT INSERTED.codigo_producto
                VALUES 
                    (@nombre, @descripcion, @precio_compra, @precio, @stock, @estado, @categoria, 
                     @codigo_tienda, @codigo_imagen, @codigo_proveedor, @codigo_marca, 
                     @fecha_fabricacion, @fecha_caducidad, @talla, @material, @color, @tallas, @composicion, @tipo_ajuste, @tipo, @textura, @acabado)
            `)

        const codigo_producto = productoResult.recordset[0].codigo_producto

        res.status(201).json({
            message: "Producto agregado exitosamente",
            codigo_producto,
            imagen_subida: !!req.file,
        })
    } catch (error) {
        console.error("Error al agregar producto:", error)
        res.status(500).json({
            error: "Error del servidor al agregar el producto: " + error.message,
        })
    }
}

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params
        const {
            nombre, descripcion, precio_compra, precio_venta, cantidad, categoria, local, proveedor, marca, talla,
            material_ropa, color_ropa, tallas_ropa, composicion_ropa, ajuste_ropa,
            textura_cosmetico, tipo_cosmetico, color_cosmetico, acabado_cosmetico,
            fecha_fabricacion_cosmetico, fecha_caducidad_cosmetico,
            material_accesorio, color_accesorio, tallas_accesorio,
            fecha_fabricacion, fecha_caducidad
        } = req.body
        // Mapeo de campos dinámicos a columnas reales
        let material = null, color = null, tallas = null, composicion = null, tipo_ajuste = null;
        let tipo = null, textura = null, acabado = null;
        let fechaFab = null, fechaCad = null;
        if (categoria === 'Ropa') {
            material = material_ropa;
            color = color_ropa;
            tallas = tallas_ropa;
            composicion = composicion_ropa;
            tipo_ajuste = ajuste_ropa;
            fechaFab = fecha_fabricacion || null;
            fechaCad = fecha_caducidad || null;
        } else if (categoria === 'Cosmetico') {
            textura = textura_cosmetico;
            tipo = tipo_cosmetico;
            color = color_cosmetico;
            acabado = acabado_cosmetico;
            fechaFab = fecha_fabricacion_cosmetico || null;
            fechaCad = fecha_caducidad_cosmetico || null;
        } else if (categoria === 'Accesorio') {
            material = material_accesorio;
            color = color_accesorio;
            tallas = tallas_accesorio;
            fechaFab = fecha_fabricacion || null;
            fechaCad = fecha_caducidad || null;
        }
        const pool = await getConnection()
        await pool
            .request()
            .input("id", sql.Int, id)
            .input("nombre", sql.VarChar, nombre)
            .input("descripcion", sql.Text, descripcion)
            .input("precio_compra", sql.Decimal(10,2), precio_compra)
            .input("precio", sql.Decimal(10,2), precio_venta)
            .input("stock", sql.Int, cantidad)
            .input("categoria", sql.VarChar, categoria)
            .input("codigo_tienda", sql.Int, local)
            .input("talla", sql.NVarChar, talla)
            .input("fecha_fabricacion", sql.Date, fechaFab)
            .input("fecha_caducidad", sql.Date, fechaCad)
            // Campos reales
            .input("material", sql.VarChar, material || null)
            .input("color", sql.VarChar, color || null)
            .input("tallas", sql.VarChar, tallas || null)
            .input("composicion", sql.VarChar, composicion || null)
            .input("tipo_ajuste", sql.VarChar, tipo_ajuste || null)
            .input("tipo", sql.VarChar, tipo || null)
            .input("textura", sql.VarChar, textura || null)
            .input("acabado", sql.VarChar, acabado || null)
            .query(`
                UPDATE producto
                SET nombre = @nombre,
                    descripcion = @descripcion,
                    precio_compra = @precio_compra,
                    precio = @precio,
                    stock = @stock,
                    categoria = @categoria,
                    codigo_tienda = @codigo_tienda,
                    talla = @talla,
                    fecha_fabricacion = @fecha_fabricacion,
                    fecha_caducidad = @fecha_caducidad,
                    material = @material,
                    color = @color,
                    tallas = @tallas,
                    composicion = @composicion,
                    tipo_ajuste = @tipo_ajuste,
                    tipo = @tipo,
                    textura = @textura,
                    acabado = @acabado
                WHERE codigo_producto = @id
            `)
        res.status(200).json({ message: "Producto actualizado exitosamente" })
    } catch (error) {
        console.error("Error al actualizar producto:", error)
        res.status(500).json({ error: "Error del servidor" })
    }
}
