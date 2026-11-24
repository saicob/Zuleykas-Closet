import { productRepository } from "../repositories/product.repository.js";
import { strategyRegistry } from "../models/product.strategies.js";

export class ProductService {
    constructor(repository, registry) {
        this.repository = repository;
        this.registry = registry;
    }

    async getProducts() {
        return await this.repository.getAllProducts();
    }

    async getProductByName(nombre) {
        const products = await this.repository.getProductByName(nombre);
        return products.length > 0 ? products[0] : null;
    }

    async getProductsJSON() {
        const records = await this.repository.getActiveProductsGrouped();
        
        const productosMap = {};
        for (const prod of records) {
            const key = [
                prod.nombre,
                prod.marca_nombre,
                prod.categoria,
                prod.codigo_tienda,
                prod.imagen_url,
                prod.precio,
            ].join("|");

            if (!productosMap[key]) {
                productosMap[key] = {
                    codigo_producto: prod.codigo_producto,
                    nombre: prod.nombre,
                    descripcion: prod.descripcion,
                    precio_compra: prod.precio_compra,
                    precio: prod.precio,
                    categoria: prod.categoria,
                    proveedor: prod.proveedor,
                    marca: prod.marca_nombre,
                    imagen: prod.imagen_url,
                    codigo_tienda: prod.codigo_tienda,
                    fecha_fabricacion: prod.fecha_fabricacion,
                    fecha_caducidad: prod.fecha_caducidad,
                    tallas: [],
                };
            }

            productosMap[key].tallas.push({
                talla: prod.talla || "",
                stock: prod.stock,
                codigo_producto: prod.codigo_producto,
                precio: prod.precio,
                precio_compra: prod.precio_compra,
                fecha_fabricacion: prod.fecha_fabricacion,
                fecha_caducidad: prod.fecha_caducidad,
                imagen: prod.imagen_url,
            });
        }

        return Object.values(productosMap);
    }

    _calculatePrice(precio_compra) {
        const pc = Number.parseFloat(precio_compra);
        if (isNaN(pc)) return 0;
        return Number((pc * 1.5 * 1.15).toFixed(2));
    }

    async _getOrCreateProvider(proveedorIdOrName) {
        if (proveedorIdOrName && proveedorIdOrName.trim()) {
            const name = proveedorIdOrName.trim();
            let code = await this.repository.getProviderByName(name);
            if (!code) {
                code = await this.repository.createProvider(name, true);
            }
            return code;
        } else {
            const defaultProv = await this.repository.getDefaultProvider();
            if (!defaultProv) {
                throw new Error("No hay proveedores disponibles. Por favor, agregue un proveedor primero.");
            }
            return defaultProv;
        }
    }

    async _getOrCreateBrand(marcaIdOrName) {
        if (marcaIdOrName && marcaIdOrName.trim()) {
            const name = marcaIdOrName.trim();
            let code = await this.repository.getBrandByName(name);
            if (!code) {
                code = await this.repository.createBrand(name, true);
            }
            return code;
        } else {
            const defaultMarca = await this.repository.getDefaultBrand();
            if (!defaultMarca) {
                throw new Error("No hay marcas disponibles. Por favor, agregue una marca primero.");
            }
            return defaultMarca;
        }
    }

    async createProduct(data, file) {
        if (!data.nombre || (data.precio_compra === undefined || data.precio_compra === null || data.precio_compra === '') || !data.cantidad || !data.categoria) {
            throw new Error("Validation: Los campos nombre, precio de compra, stock y categoría son obligatorios");
        }

        const strategy = this.registry.getStrategy(data.categoria);
        const specificFields = strategy.extractFields(data);
        const tallasArray = strategy.getTallasArray(data);

        let codigo_imagen = null;
        if (file) {
            codigo_imagen = await this.repository.insertImage(`/imagenes/${file.filename}`);
        }

        const codigo_proveedor = await this._getOrCreateProvider(data.proveedor);
        const codigo_marca = await this._getOrCreateBrand(data.marca);
        const precio = this._calculatePrice(data.precio_compra);

        const codigos_productos = [];
        
        const baseProduct = {
            nombre: data.nombre.trim(),
            descripcion: data.descripcion || "",
            precio_compra: Number.parseFloat(data.precio_compra) || 0,
            precio: precio,
            stock: Number.parseInt(data.cantidad),
            estado: true,
            categoria: data.categoria,
            codigo_tienda: Number.parseInt(data.local) || 1,
            codigo_imagen: codigo_imagen,
            codigo_proveedor: codigo_proveedor,
            codigo_marca: codigo_marca,
            ...specificFields
        };

        if (tallasArray.length > 0) {
            for (const talla of tallasArray) {
                const existe = await this.repository.checkProductExists(
                    baseProduct.nombre,
                    baseProduct.codigo_marca,
                    talla,
                    baseProduct.categoria,
                    baseProduct.codigo_tienda
                );

                if (!existe) {
                    const insertData = { ...baseProduct, talla };
                    const id = await this.repository.insertProduct(insertData);
                    codigos_productos.push(id);
                }
            }
        } else {
            const talla = data.talla || null;
            const existe = await this.repository.checkProductExists(
                baseProduct.nombre,
                baseProduct.codigo_marca,
                talla,
                baseProduct.categoria,
                baseProduct.codigo_tienda
            );

            if (!existe) {
                const insertData = { ...baseProduct, talla };
                const id = await this.repository.insertProduct(insertData);
                codigos_productos.push(id);
            }
        }

        return codigos_productos;
    }

    async updateProduct(id, data, file) {
        const strategy = this.registry.getStrategy(data.categoria);
        const specificFields = strategy.extractFields(data);
        const precio = this._calculatePrice(data.precio_compra);

        let codigo_imagen = null;
        if (file) {
            codigo_imagen = await this.repository.insertImage(`/imagenes/${file.filename}`);
        }

        const productData = {
            nombre: data.nombre,
            descripcion: data.descripcion,
            precio_compra: Number.parseFloat(data.precio_compra) || 0,
            precio: precio,
            stock: Number.parseInt(data.cantidad),
            categoria: data.categoria,
            codigo_tienda: Number.parseInt(data.local) || 1,
            talla: data.talla || null,
            codigo_imagen: codigo_imagen,
            ...specificFields
        };

        await this.repository.updateProduct(id, productData);
    }

    async getProductById(id) {
        const records = await this.repository.getProductById(id);
        return records.length > 0 ? records[0] : null;
    }
}

// Instance for default use throughout app
export const productService = new ProductService(productRepository, strategyRegistry);
