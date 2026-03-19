import { productService } from "../services/product.service.js"

export const getProducts = async (req, res) => {
    try {
        const result = await productService.getProducts()
        console.log(result)
        res.send("Obteniendo productos")
    } catch (error) {
        console.error("Error al obtener productos:", error)
        res.status(500).json({ error: "Error del servidor" })
    }
}

export const getProductByName = async (req, res) => {
    try {
        const { nombre } = req.params
        const product = await productService.getProductByName(nombre)

        if (product) {
            res.json(product)
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
        const productos = await productService.getProductsJSON()
        res.json(productos)
    } catch (error) {
        console.error("Error al obtener los productos:", error.message, error.stack)
        res.status(500).json({ error: "Error al obtener los productos: " + error.message })
    }
}

export const createProduct = async (req, res) => {
    try {
        const codigos_productos = await productService.createProduct(req.body, req.file)

        res.status(201).json({
            message: "Producto(s) agregado(s) exitosamente",
            codigos_productos,
            imagen_subida: !!req.file,
        })
    } catch (error) {
        console.error("Error al agregar producto:", error)
        const status = error.message.includes("Validation") ? 400 : 500
        res.status(status).json({
            error: error.message.replace("Validation: ", ""),
        })
    }
}

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params
        await productService.updateProduct(id, req.body, req.file)

        res.status(200).json({
            message: "Producto actualizado exitosamente",
            imagen_actualizada: !!req.file,
        })
    } catch (error) {
        console.error("Error al actualizar producto:", error)
        res.status(500).json({ error: "Error del servidor: " + error.message })
    }
}

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params
        const product = await productService.getProductById(id)
        
        if (product) {
            res.json(product)
        } else {
            res.status(404).json({ error: "Producto no encontrado" })
        }
    } catch (error) {
        console.error("Error al obtener el producto por ID:", error)
        res.status(500).json({ error: "Error del servidor" })
    }
}
