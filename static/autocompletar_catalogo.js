//este trozo de codigo debe permitir el autocompletado al escribir en el input de productos

// Cache para autocompletado
let productosAutoComplete = null

const input = document.getElementById("productInput")
if (input) {
    // Cargar productos una sola vez para autocompletado
    async function cargarProductosAutoComplete() {
        if (productosAutoComplete) return productosAutoComplete

        try {
            const res = await fetch("http://localhost:3000/api/products")
            const productos = await res.json()
            productosAutoComplete = productos
            return productos
        } catch (err) {
            console.error("Error al cargar productos para autocompletado:", err)
            return []
        }
    }

    input.addEventListener("input", async (event) => {
        const query = event.target.value.trim().toLowerCase()
        const suggestionsContainer = document.getElementById("suggestions")

        if (!suggestionsContainer) {
            console.error("El contenedor de sugerencias no se encontró.")
            return
        }

        suggestionsContainer.innerHTML = ""

        // Filtrar productos del catálogo al escribir (solo los que comienzan con el texto)
        if (window.productosCache && window.renderizarProductos) {
            if (query.length === 0) {
                window.renderizarProductos(window.productosCache, true)
            } else {
                const filtrados = window.productosCache.filter((prod) =>
                    prod.nombre && prod.nombre.toLowerCase().startsWith(query)
                )
                window.renderizarProductos(filtrados, true)
            }
        }

        if (query.length > 0) {
            const productos = await cargarProductosAutoComplete()
            const filteredProducts = productos.filter((prod) =>
                prod.nombre && prod.nombre.toLowerCase().startsWith(query)
            )

            filteredProducts.slice(0, 10).forEach((prod) => {
                // Limitar a 10 resultados
                const div = document.createElement("div")
                div.classList.add("suggestion")
                div.textContent = prod.nombre
                div.dataset.id = prod.codigo_producto
                div.addEventListener("click", () => {
                    input.value = prod.nombre
                    suggestionsContainer.innerHTML = ""
                    // Al seleccionar una sugerencia, filtrar catálogo
                    if (window.productosCache && window.renderizarProductos) {
                        const filtrados = window.productosCache.filter((p) =>
                            p.nombre && p.nombre.toLowerCase().startsWith(prod.nombre.toLowerCase())
                        )
                        window.renderizarProductos(filtrados, true)
                    }
                })
                suggestionsContainer.appendChild(div)
            })
        } else {
            // Si el input está vacío, mostrar todo el catálogo
            if (window.productosCache && window.renderizarProductos) {
                window.renderizarProductos(window.productosCache, true)
            }
        }
    })
} else {
    console.error('El elemento con id="productInput" no se encontró en el DOM.')
}

// Actualizar subtotal al cambiar la cantidad
const cantidadInput = document.getElementById("cantidadl1")
if (cantidadInput) {
    cantidadInput.addEventListener("input", () => {
        const stock = Number.parseInt(document.getElementById("stockl1").value, 10)
        const precio = Number.parseFloat(document.getElementById("preciol1").value)
        const cantidad = Number.parseInt(document.getElementById("cantidadl1").value, 10)

        if (cantidad > stock) {
            alert("La cantidad no puede superar el stock disponible.")
            document.getElementById("cantidadl1").value = stock // Ajustar cantidad al stock máximo
        }
        if (cantidad < 0) {
            alert("La cantidad no puede ser negativa.")
            document.getElementById("cantidadl1").value = 0 // Ajustar cantidad a 0
        }
        const nuevaCantidad = Number.parseInt(document.getElementById("cantidadl1").value, 10)
        document.getElementById("subtotall1").value = (nuevaCantidad * precio).toFixed(2)
    })
} else {
    console.error('El elemento con id="cantidadl1" no se encontró en el DOM.')
}

// Cierra sugerencias al hacer clic fuera
document.addEventListener("click", (e) => {
    const suggestionsContainer = document.getElementById("suggestions")
    if (suggestionsContainer && !e.target.closest(".autocomplete-container")) {
        suggestionsContainer.innerHTML = ""
    }
})
