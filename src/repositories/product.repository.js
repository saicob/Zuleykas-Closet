import { getConnection } from "../database/connection.js";
import sql from "mssql";

class ProductRepository {
    async getAllProducts() {
        const pool = await getConnection();
        const result = await pool.request().query("SELECT * FROM producto");
        return result.recordset;
    }

    async getProductByName(nombre) {
        const pool = await getConnection();
        const result = await pool
            .request()
            .input("nombre", sql.VarChar, nombre)
            .query(`
                SELECT p.codigo_producto, p.nombre, p.descripcion, p.precio, p.precio_compra, p.stock, p.talla,
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
            `);
        return result.recordset;
    }

    async getActiveProductsGrouped() {
        const pool = await getConnection();
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
                ISNULL(m.nombre, 'Sin marca') AS marca_nombre,
                ISNULL(i.ruta, '/placeholder.svg?height=50&width=50') AS imagen_url,
                p.codigo_tienda
            FROM producto p
            LEFT JOIN proveedor pr ON p.codigo_proveedor = pr.codigo_proveedor
            LEFT JOIN marca m ON p.codigo_marca = m.codigo_marca
            LEFT JOIN imagen i ON p.codigo_imagen = i.codigo_imagen
            WHERE p.estado = 1
            ORDER BY p.nombre, marca_nombre, p.categoria, p.codigo_tienda, imagen_url, p.talla
        `);
        return result.recordset;
    }

    async insertImage(rutaRelativa) {
        const pool = await getConnection();
        const imagenResult = await pool
            .request()
            .input("ruta", sql.NVarChar, rutaRelativa)
            .query(`
                INSERT INTO imagen (ruta)
                OUTPUT INSERTED.codigo_imagen
                VALUES (@ruta)
            `);
        return imagenResult.recordset[0].codigo_imagen;
    }

    async getProviderByName(nombre) {
        const pool = await getConnection();
        const proveedorResult = await pool
            .request()
            .input("nombre", sql.VarChar, nombre)
            .query("SELECT codigo_proveedor FROM proveedor WHERE nombre = @nombre");
        
        if (proveedorResult.recordset.length > 0) {
            return proveedorResult.recordset[0].codigo_proveedor;
        }
        return null;
    }

    async createProvider(nombre, estado = true) {
        const pool = await getConnection();
        const nuevoProveedorResult = await pool
            .request()
            .input("nombre", sql.VarChar, nombre)
            .input("estado", sql.Bit, estado)
            .query(`
                INSERT INTO proveedor (nombre, estado)
                OUTPUT INSERTED.codigo_proveedor
                VALUES (@nombre, @estado)
            `);
        return nuevoProveedorResult.recordset[0].codigo_proveedor;
    }

    async getDefaultProvider() {
        const pool = await getConnection();
        const defaultProveedorResult = await pool
            .request()
            .query("SELECT TOP 1 codigo_proveedor FROM proveedor WHERE estado = 1");
            
        if (defaultProveedorResult.recordset.length > 0) {
            return defaultProveedorResult.recordset[0].codigo_proveedor;
        }
        return null;
    }

    async getBrandByName(nombre) {
        const pool = await getConnection();
        const marcaResult = await pool
            .request()
            .input("nombre", sql.VarChar, nombre)
            .query("SELECT codigo_marca FROM marca WHERE nombre = @nombre");
            
        if (marcaResult.recordset.length > 0) {
            return marcaResult.recordset[0].codigo_marca;
        }
        return null;
    }

    async createBrand(nombre, estado = true) {
        const pool = await getConnection();
        const nuevaMarcaResult = await pool
            .request()
            .input("nombre", sql.VarChar, nombre)
            .input("estado", sql.Bit, estado)
            .query(`
                INSERT INTO marca (nombre, estado)
                OUTPUT INSERTED.codigo_marca
                VALUES (@nombre, @estado)
            `);
        return nuevaMarcaResult.recordset[0].codigo_marca;
    }

    async getDefaultBrand() {
        const pool = await getConnection();
        const defaultMarcaResult = await pool.request().query("SELECT TOP 1 codigo_marca FROM marca WHERE estado = 1");
        
        if (defaultMarcaResult.recordset.length > 0) {
            return defaultMarcaResult.recordset[0].codigo_marca;
        }
        return null;
    }

    async checkProductExists(nombre, codigo_marca, talla, categoria, codigo_tienda) {
        const pool = await getConnection();
        const existe = await pool
            .request()
            .input("nombre", sql.VarChar, nombre)
            .input("codigo_marca", sql.Int, codigo_marca)
            .input("talla", sql.NVarChar, talla)
            .input("categoria", sql.VarChar, categoria)
            .input("codigo_tienda", sql.Int, codigo_tienda)
            .query(`
                SELECT codigo_producto FROM producto
                WHERE nombre = @nombre 
                  AND codigo_marca = @codigo_marca
                  AND talla = @talla
                  AND categoria = @categoria
                  AND codigo_tienda = @codigo_tienda
                  AND estado = 1
            `);
        return existe.recordset.length > 0;
    }

    async insertProduct(productData) {
        const pool = await getConnection();
        const productoResult = await pool
            .request()
            .input("nombre", sql.VarChar, productData.nombre)
            .input("descripcion", sql.Text, productData.descripcion || "")
            .input("precio_compra", sql.Decimal(10, 2), productData.precio_compra)
            .input("precio", sql.Decimal(10, 2), productData.precio)
            .input("stock", sql.Int, productData.stock)
            .input("estado", sql.Bit, productData.estado)
            .input("categoria", sql.VarChar, productData.categoria)
            .input("codigo_tienda", sql.Int, productData.codigo_tienda)
            .input("codigo_imagen", sql.Int, productData.codigo_imagen)
            .input("codigo_proveedor", sql.Int, productData.codigo_proveedor)
            .input("codigo_marca", sql.Int, productData.codigo_marca)
            .input("fecha_fabricacion", sql.Date, productData.fecha_fabricacion)
            .input("fecha_caducidad", sql.Date, productData.fecha_caducidad)
            .input("talla", sql.NVarChar, productData.talla)
            .input("material", sql.VarChar, productData.material)
            .input("color", sql.VarChar, productData.color)
            .input("tallas", sql.VarChar, productData.tallas)
            .input("composicion", sql.VarChar, productData.composicion)
            .input("tipo_ajuste", sql.VarChar, productData.tipo_ajuste)
            .input("tipo", sql.VarChar, productData.tipo)
            .input("textura", sql.VarChar, productData.textura)
            .input("acabado", sql.VarChar, productData.acabado)
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
            `);
        return productoResult.recordset[0].codigo_producto;
    }

    async updateProduct(id, productData) {
        const pool = await getConnection();
        
        let updateQuery = `
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
                acabado = @acabado`;

        if (productData.codigo_imagen) {
            updateQuery += `, codigo_imagen = @codigo_imagen`;
        }

        updateQuery += ` WHERE codigo_producto = @id`;

        const request = pool
            .request()
            .input("id", sql.Int, id)
            .input("nombre", sql.VarChar, productData.nombre)
            .input("descripcion", sql.Text, productData.descripcion || "")
            .input("precio_compra", sql.Decimal(10, 2), productData.precio_compra)
            .input("precio", sql.Decimal(10, 2), productData.precio)
            .input("stock", sql.Int, productData.stock)
            .input("categoria", sql.VarChar, productData.categoria)
            .input("codigo_tienda", sql.Int, productData.codigo_tienda)
            .input("talla", sql.NVarChar, productData.talla)
            .input("fecha_fabricacion", sql.Date, productData.fecha_fabricacion)
            .input("fecha_caducidad", sql.Date, productData.fecha_caducidad)
            .input("material", sql.VarChar, productData.material)
            .input("color", sql.VarChar, productData.color)
            .input("tallas", sql.VarChar, productData.tallas)
            .input("composicion", sql.VarChar, productData.composicion)
            .input("tipo_ajuste", sql.VarChar, productData.tipo_ajuste)
            .input("tipo", sql.VarChar, productData.tipo)
            .input("textura", sql.VarChar, productData.textura)
            .input("acabado", sql.VarChar, productData.acabado);

        if (productData.codigo_imagen) {
            request.input("codigo_imagen", sql.Int, productData.codigo_imagen);
        }

        await request.query(updateQuery);
    }

    async getProductById(id) {
        const pool = await getConnection();
        const result = await pool
            .request()
            .input("id", sql.Int, id)
            .query(`
                SELECT p.codigo_producto, p.nombre, p.descripcion, p.precio, p.precio_compra, p.stock, p.talla,
                       p.categoria,
                       pr.nombre AS proveedor,
                       m.nombre AS marca,
                       p.fecha_caducidad,
                       p.fecha_fabricacion,
                       ISNULL(i.ruta, '/placeholder.svg?height=50&width=50') AS imagen,
                       p.codigo_tienda,
                       p.material, p.color, p.tallas, p.composicion, p.tipo_ajuste, p.tipo, p.textura, p.acabado
                FROM producto p
                LEFT JOIN proveedor pr ON p.codigo_proveedor = pr.codigo_proveedor
                LEFT JOIN marca m ON p.codigo_marca = m.codigo_marca
                LEFT JOIN imagen i ON p.codigo_imagen = i.codigo_imagen
                WHERE p.codigo_producto = @id
            `);
        return result.recordset;
    }
}

export const productRepository = new ProductRepository();
