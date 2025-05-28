// Cache para evitar recargas innecesarias
let productosCache = null
let ultimaActualizacion = 0
const CACHE_DURATION = 30000 // 30 segundos

async function cargarCatalogo() {
    try {
        // Verificar si tenemos datos en caché y son recientes
        const ahora = Date.now()
        if (productosCache && ahora - ultimaActualizacion < CACHE_DURATION) {
            renderizarProductos(productosCache)
            return
        }

        const res = await fetch("http://localhost:3000/api/products")

        if (!res.ok) {
            throw new Error(`Error al cargar productos: ${res.statusText}`)
        }

        const productos = await res.json()

        if (!Array.isArray(productos)) {
            throw new Error("La respuesta no es un arreglo de productos")
        }

        // Actualizar caché
        productosCache = productos
        window.productosCache = productosCache // <-- Actualiza la referencia global
        ultimaActualizacion = ahora

        renderizarProductos(productos)
    } catch (err) {
        console.error("Error cargando productos:", err)
        alert("Ocurrió un error al cargar los productos. Por favor, inténtalo más tarde.")
    }
}

function getLocalSeleccionado() {
    const select = document.getElementById("local")
    return select ? select.value : null
}

function filtrarPorLocal(productos, localSeleccionado) {
    // Solo filtra si los productos tienen el campo codigo_tienda
    if (
        productos.length > 0 &&
        Object.prototype.hasOwnProperty.call(productos[0], "codigo_tienda") &&
        localSeleccionado
    ) {
        return productos.filter(prod =>
            String(prod.codigo_tienda) === String(localSeleccionado)
        )
    }
    // Si no hay campo codigo_tienda, retorna todos los productos
    return productos
}

function renderizarProductos(productos, forzar = false) {
    const contenedor = document.querySelector(".catalogo-container")
    if (!contenedor) return

    // Filtrar SIEMPRE por tienda seleccionada antes de cualquier otro filtro
    let productosFiltrados = productos
    const localSeleccionado = getLocalSeleccionado()
    productosFiltrados = filtrarPorLocal(productos, localSeleccionado)

    // Limpiar siempre si forzar es true, si no, solo si es necesario
    if (forzar || contenedor.children.length === 0 || contenedor.dataset.lastUpdate !== ultimaActualizacion.toString()) {
        contenedor.innerHTML = ""
        if (!forzar) {
            contenedor.dataset.lastUpdate = ultimaActualizacion.toString()
        } else {
            contenedor.dataset.lastUpdate = "filtro"
        }

        productosFiltrados.forEach((prod) => {
            if (!prod.nombre || !prod.precio || prod.stock === undefined) {
                console.error("Producto incompleto:", prod)
                return
            }

            const div = document.createElement("div")
            div.classList.add("producto")

            // Crear imagen con manejo de errores mejorado
            const img = document.createElement("img")
            img.src = prod.imagen || "/placeholder.svg?height=200&width=200"
            img.alt = prod.nombre
            img.loading = "lazy" // Carga perezosa
            img.style.cssText = "width: 100%; height: 150px; object-fit: cover; border-radius: 8px;"

            // Manejar errores de imagen sin parpadeo
            img.onerror = function () {
                if (this.src !== "/placeholder.svg?height=200&width=200") {
                    this.src = "/placeholder.svg?height=200&width=200"
                }
            }

            const h3 = document.createElement("h3")
            h3.textContent = prod.nombre

            const pPrecio = document.createElement("p")
            pPrecio.textContent = `Precio: C$ ${Number.parseFloat(prod.precio).toFixed(2)}`

            const pStock = document.createElement("p")
            pStock.textContent = `En Stock: ${prod.stock}`

            const btn = document.createElement("button")
            btn.textContent = "Agregar al carrito"
            btn.onclick = () => {
                if (window.agregarAlCarrito) {
                    window.agregarAlCarrito({
                        nombre: prod.nombre,
                        precio: Number.parseFloat(prod.precio),
                        stock: Number.parseInt(prod.stock),
                    })
                }
            }

            div.appendChild(img)
            div.appendChild(h3)
            div.appendChild(pPrecio)
            div.appendChild(pStock)
            div.appendChild(btn)

            contenedor.appendChild(div)
        })
    }
}

// Exponer para uso externo (autocompletar_catalogo.js)
window.productosCache = productosCache
window.renderizarProductos = renderizarProductos

// Cargar solo una vez al inicio
window.addEventListener("DOMContentLoaded", () => {
    cargarCatalogo()
    // Escuchar cambios en el select de tienda/local
    const selectLocal = document.getElementById("local")
    if (selectLocal) {
        selectLocal.addEventListener("change", () => {
            // Al cambiar la tienda, renderiza el catálogo filtrado
            if (window.productosCache && window.renderizarProductos) {
                window.renderizarProductos(window.productosCache, true)
            }
        })
    }
})

// Función para refrescar manualmente si es necesario
window.refrescarCatalogo = () => {
    productosCache = null
    cargarCatalogo()
}
