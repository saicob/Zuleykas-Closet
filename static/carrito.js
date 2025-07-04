// Arreglo global para almacenar los productos en el carrito
let carrito = []

// Debug: Función para inspeccionar productos
window.debugCarrito = () => {
    console.log("=== DEBUG CARRITO ===")
    console.log("Carrito actual:", carrito)
    console.log("Cache de productos:", window.productosCache)
    carrito.forEach((producto, index) => {
        console.log(`Producto ${index}:`, {
            nombre: producto.nombre,
            imagen: producto.imagen,
            tallas: producto.tallas,
        })
    })
}

// Debug: Verificar cuando se carga la página
document.addEventListener("DOMContentLoaded", () => {
    console.log("Carrito cargado. Cache disponible:", !!window.productosCache)
    setTimeout(() => {
        console.log("Cache después de 2 segundos:", !!window.productosCache)
    }, 2000)
})

// Función para mostrar detalles del producto (declarada antes de su uso)
function mostrarDetalleProductoSoloVista(producto) {
    console.log("Mostrando detalles del producto:", producto)
    // Implementación de la función aquí
}

// Agrega un producto al carrito (evita duplicados)
function agregarAlCarrito(producto) {
    console.log("Agregando producto al carrito:", producto)
    // Buscar por nombre + talla + código_producto
    const index = carrito.findIndex(
        (p) => p.nombre === producto.nombre && p.talla === producto.talla && p.codigo_producto === producto.codigo_producto,
    )

    // --- Imagen robusta: usar la misma lógica que funciona en el catálogo ---
    let imagenMostrar = null

    // 1. Si el producto ya tiene una imagen válida, usarla
    if (
        producto.imagen &&
        typeof producto.imagen === "string" &&
        producto.imagen.trim() !== "" &&
        producto.imagen !== "/placeholder.svg?height=50&width=50" &&
        !producto.imagen.includes("placeholder")
    ) {
        imagenMostrar = producto.imagen
    }

    // 2. Si no, buscar en las tallas del producto
    if (!imagenMostrar && producto.tallas && Array.isArray(producto.tallas)) {
        // Primero buscar la talla específica
        if (producto.talla) {
            const tallaEspecifica = producto.tallas.find((t) => t.talla === producto.talla)
            if (
                tallaEspecifica &&
                tallaEspecifica.imagen &&
                typeof tallaEspecifica.imagen === "string" &&
                tallaEspecifica.imagen.trim() !== "" &&
                tallaEspecifica.imagen !== "/placeholder.svg?height=50&width=50" &&
                !tallaEspecifica.imagen.includes("placeholder")
            ) {
                imagenMostrar = tallaEspecifica.imagen
            }
        }

        // Si no encontró imagen específica, buscar cualquier imagen válida
        if (!imagenMostrar) {
            for (const talla of producto.tallas) {
                if (
                    talla.imagen &&
                    typeof talla.imagen === "string" &&
                    talla.imagen.trim() !== "" &&
                    talla.imagen !== "/placeholder.svg?height=50&width=50" &&
                    !talla.imagen.includes("placeholder")
                ) {
                    imagenMostrar = talla.imagen
                    break
                }
            }
        }
    }

    // 3. Buscar en otras propiedades de imagen
    if (!imagenMostrar) {
        const propiedadesImagen = ["imagen_url", "url_imagen", "ruta_imagen"]
        for (const prop of propiedadesImagen) {
            if (
                producto[prop] &&
                typeof producto[prop] === "string" &&
                producto[prop].trim() !== "" &&
                producto[prop] !== "/placeholder.svg?height=50&width=50" &&
                !producto[prop].includes("placeholder")
            ) {
                imagenMostrar = producto[prop]
                break
            }
        }
    }

    // 4. Buscar en el cache global de productos si existe
    if (!imagenMostrar && window.productosCache && Array.isArray(window.productosCache)) {
        const productoCache = window.productosCache.find((p) => p.nombre === producto.nombre && p.marca === producto.marca)

        if (productoCache) {
            if (
                productoCache.imagen &&
                typeof productoCache.imagen === "string" &&
                productoCache.imagen.trim() !== "" &&
                productoCache.imagen !== "/placeholder.svg?height=50&width=50" &&
                !productoCache.imagen.includes("placeholder")
            ) {
                imagenMostrar = productoCache.imagen
            } else if (productoCache.tallas && Array.isArray(productoCache.tallas)) {
                for (const talla of productoCache.tallas) {
                    if (
                        talla.imagen &&
                        typeof talla.imagen === "string" &&
                        talla.imagen.trim() !== "" &&
                        talla.imagen !== "/placeholder.svg?height=50&width=50" &&
                        !talla.imagen.includes("placeholder")
                    ) {
                        imagenMostrar = talla.imagen
                        break
                    }
                }
            }
        }
    }

    // 5. Asegurar que la ruta sea correcta
    if (imagenMostrar) {
        // Si no empieza con http o /, agregar /
        if (!imagenMostrar.startsWith("http") && !imagenMostrar.startsWith("/")) {
            imagenMostrar = "/" + imagenMostrar
        }
        console.log("Imagen encontrada para carrito:", imagenMostrar)
    } else {
        console.log("No se encontró imagen válida para:", producto.nombre)
        imagenMostrar = "/placeholder.svg?height=50&width=50"
    }

    if (index !== -1) {
        if (carrito[index].cantidad < producto.stock) {
            carrito[index].cantidad += producto.cantidad || 1
        } else {
            alert("No puedes agregar más unidades de este producto. Stock insuficiente.")
        }
    } else {
        const cantidadInicial = Number.isInteger(producto.cantidad) && producto.cantidad > 0 ? producto.cantidad : 1
        // Crear objeto del carrito con imagen mejorada
        const productoCarrito = {
            ...producto,
            cantidad: cantidadInicial,
            imagen: imagenMostrar,
        }
        console.log("Producto agregado al carrito:", productoCarrito)
        carrito.push(productoCarrito)
    }
    renderizarCarrito()
}

// Elimina un producto del carrito por índice
function eliminarDelCarrito(index) {
    carrito.splice(index, 1)
    renderizarCarrito()
}

// Cambia la cantidad de un producto (aumenta o disminuye)
function cambiarCantidad(index, delta) {
    const nuevoValor = carrito[index].cantidad + delta
    const stock = carrito[index].stock

    if (delta > 0 && nuevoValor > stock) {
        alert(`No puedes agregar más de ${stock} unidades disponibles.`)
        return
    }
    if (nuevoValor <= 0) {
        carrito.splice(index, 1)
    } else {
        carrito[index].cantidad = nuevoValor
    }
    renderizarCarrito()
}

// Muestra el contenido del carrito en la tabla HTML
function renderizarCarrito() {
    const tbody = document.querySelector("#carrito-table tbody")
    if (!tbody) {
        console.error("No se encontró el tbody del carrito")
        return
    }

    tbody.innerHTML = ""
    let total = 0

    carrito.forEach((producto, index) => {
        const subtotal = producto.precio * producto.cantidad
        total += subtotal

        const tr = document.createElement("tr")
        tr.innerHTML = `
           <td style="cursor:pointer;color:#d16a8a;font-weight:bold;" title="Ver detalles">${producto.nombre} <span style='font-size:12px;color:#888;'>[${producto.talla}]</span></td>
           <td>$${producto.precio.toFixed(2)}</td>
           <td style="text-align: center;">
               <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
                   <button onclick="cambiarCantidad(${index}, 1)">➕</button>
                   <input 
                       type="number" 
                       value="${producto.cantidad}" 
                       min="1"
                       onchange="actualizarCantidad(${index}, this.value)"
                   />
                   <button onclick="cambiarCantidad(${index}, -1)">➖</button>
               </div>
           </td>
           <td>$${subtotal.toFixed(2)}</td>
           <td><button onclick="eliminarDelCarrito(${index})">🗑️</button></td>
       `
        // Mostrar detalles al hacer clic en el nombre
        tr.querySelector("td").onclick = () => window.mostrarDetalleProductoSoloVista(producto)
        tbody.appendChild(tr)
    })

    const totalElement = document.querySelector("#carrito-total")
    if (totalElement) {
        totalElement.textContent = `Total: $${total.toFixed(2)}`
    }

    // Actualizar visualmente el input de cantidad si el carrito está visible
    carrito.forEach((producto, index) => {
        const input = document.querySelector(`#carrito-table tbody tr:nth-child(${index + 1}) input[type='number']`)
        if (input && input.value != producto.cantidad) {
            input.value = producto.cantidad
        }
    })
}

// Mostrar detalles del producto del carrito en un modal reutilizando mostrarModalProducto si existe
function mostrarDetalleProductoCarrito(producto) {
    if (typeof window.mostrarModalProducto === "function") {
        // Buscar el producto original en productosCache para mostrar todos los detalles
        if (window.productosCache && Array.isArray(window.productosCache)) {
            // Buscar el grupo por nombre, marca y categoría
            const grupo = window.productosCache.find(
                (p) => p.nombre === producto.nombre && p.marca === producto.marca && p.categoria === producto.categoria,
            )
            if (grupo) {
                // Buscar la talla específica
                let tallaObj = null
                if (producto.talla && grupo.tallas && Array.isArray(grupo.tallas)) {
                    tallaObj = grupo.tallas.find((t) => t.talla === producto.talla)
                }
                // Construir objeto para el modal
                const prodModal = {
                    ...grupo,
                    talla: producto.talla,
                    stock: tallaObj ? tallaObj.stock : producto.stock,
                    imagen: tallaObj && tallaObj.imagen ? tallaObj.imagen : grupo.imagen || producto.imagen,
                    tallas: grupo.tallas,
                }
                window.mostrarModalProducto(prodModal)
                return
            }
        }
        // Si no se encuentra, mostrar solo los datos del carrito
        window.mostrarModalProducto(producto)
    } else {
        alert("Detalles: " + JSON.stringify(producto, null, 2))
    }
}

function actualizarCantidad(index, nuevaCantidad) {
    const cantidad = Number.parseInt(nuevaCantidad, 10)
    if (isNaN(cantidad)) {
        alert("La cantidad ingresada no es un número válido.")
        renderizarCarrito()
        return
    }

    const stock = carrito[index].stock

    if (isNaN(cantidad) || cantidad <= 0) {
        alert("La cantidad debe ser mayor a cero.")
        renderizarCarrito()
        return
    }

    if (cantidad > stock) {
        alert(`No puedes seleccionar más de ${stock} unidades disponibles.`)
        renderizarCarrito()
        return
    }

    carrito[index].cantidad = cantidad
    renderizarCarrito()
}

// Mostrar resumen de pedido en lugar de finalizar directamente
async function finalizarCompra() {
    console.log("=== ABRIENDO RESUMEN DE PEDIDO ===")

    if (carrito.length === 0) {
        alert("El carrito está vacío.")
        return
    }

    // Cerrar el panel del carrito
    const panel = document.getElementById("carrito-panel")
    if (panel) {
        panel.style.right = "-500px"
    }

    // Mostrar el modal de resumen de pedido
    mostrarResumenPedido()
}

// Nueva función para mostrar el resumen de pedido
function mostrarResumenPedido() {
    // Crear el modal si no existe
    let modal = document.getElementById("resumen-pedido-modal")
    if (!modal) {
        modal = crearModalResumenPedido()
        document.body.appendChild(modal)
    }

    // Actualizar el contenido del resumen
    actualizarResumenPedido()

    // Mostrar el modal
    modal.style.display = "flex"
}

// Crear la estructura HTML del modal de resumen
function crearModalResumenPedido() {
    const modal = document.createElement("div")
    modal.id = "resumen-pedido-modal"
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; 
        background: rgba(0,0,0,0.5); z-index: 3000; display: none;
        align-items: center; justify-content: center; padding: 20px;
    `

    modal.innerHTML = `
        <div id="resumen-pedido-content" style="
            background: #fff; border-radius: 20px; width: 100%; max-width: 1200px; 
            max-height: 90vh; overflow-y: auto; position: relative;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        ">
            <!-- Header con pasos -->
            <div style="
                background: #f8f9fa; padding: 20px 40px; border-radius: 20px 20px 0 0;
                border-bottom: 1px solid #e9ecef; text-align: center;
            ">
              
                <h1 style="
                    font-family: 'Great Vibes', cursive; font-size: 36px; 
                    color: #dd9cba; margin: 0;
                ">Zuleyka's Closet</h1>
            </div>

            <!-- Contenido principal -->
            <div style="display: grid; grid-template-columns: 1fr 400px; gap: 40px; padding: 40px;">
                
                <!-- Lado izquierdo: Lista de productos -->
                <div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 30px;">
                        <h2 style="font-size: 32px; font-weight: bold; margin: 0;">CARRITO</h2>
                        <span id="carrito-count" style="
                            background: #dd9cba; color: white; border-radius: 50%;
                            width: 40px; height: 40px; display: flex; align-items: center;
                            justify-content: center; font-weight: bold; font-size: 18px;
                        ">0</span>
                    </div>
                    
                    <div id="productos-resumen-lista">
                        <!-- Aquí se llenarán los productos -->
                    </div>
                    
                    <div style="
                        border-top: 2px solid #e9ecef; padding-top: 20px; margin-top: 30px;
                        display: flex; justify-content: space-between; align-items: center;
                    ">
                        <span style="font-size: 20px; font-weight: bold;">Subtotal:</span>
                        <span id="subtotal-carrito" style="font-size: 20px; font-weight: bold;">$0.00</span>
                    </div>
                    
                  
                </div>

                <!-- Lado derecho: Resumen del pedido -->
                <div style="
                    background: #f8f9fa; border-radius: 15px; padding: 30px;
                    border: 1px solid #e9ecef; height: fit-content;
                ">
                    <h3 style="font-size: 24px; font-weight: bold; margin: 0 0 30px 0;">
                        Resumen del Pedido
                    </h3>
                    
                    <div style="margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Subtotal</span>
                            <span id="resumen-subtotal">$0.00</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Descuento</span>
                            <span id="resumen-descuento">$0.00</span>
                        </div>
                        <div style="
                            display: flex; justify-content: space-between; font-weight: bold;
                            font-size: 18px; border-top: 1px solid #dee2e6; padding-top: 10px;
                        ">
                            <span>Total</span>
                            <span id="resumen-total">$0.00</span>
                        </div>
                    </div>
                    
                    
                    
                    <!-- Opción de delivery -->
                    <div style="margin-bottom: 25px;">
                        <label style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                            <input type="checkbox" id="delivery-option" onchange="toggleDelivery(this.checked)">
                            <span style="font-weight: 600;">Delivery</span>
                        </label>
                        
                        <div id="delivery-fields" style="display: none;">
                            <input type="text" id="delivery-direccion" placeholder="123 Calle Falsa" style="
                                width: 100%; padding: 12px; border: 1px solid #dee2e6; border-radius: 8px;
                                margin-bottom: 10px; font-size: 16px;
                            ">
                            <input type="text" id="delivery-cliente" placeholder="Nombre del cliente" style="
                                width: 100%; padding: 12px; border: 1px solid #dee2e6; border-radius: 8px;
                                margin-bottom: 10px; font-size: 16px;
                            ">
                            <input type="number" id="delivery-costo" placeholder="Costo de delivery" step="0.01" style="
                                width: 100%; padding: 12px; border: 1px solid #dee2e6; border-radius: 8px;
                                margin-bottom: 10px; font-size: 16px;
                            " onchange="actualizarTotalConDelivery()">
                        </div>
                    </div>
                    
                    <button onclick="procesarPedidoFinal()" style="
                        background: #dd9cba; color: white; border: none; border-radius: 25px;
                        padding: 15px 0; width: 100%; font-size: 18px; font-weight: bold; 
                        cursor: pointer; transition: background 0.3s;
                    " onmouseover="this.style.background='#c47ba7'" 
                       onmouseout="this.style.background='#dd9cba'">
                        Finalizar Compra
                    </button>
                </div>
            </div>
            
            <!-- Botón cerrar -->
            <button onclick="cerrarResumenPedido()" style="
                position: absolute; top: 20px; right: 20px; background: none; border: none;
                font-size: 24px; cursor: pointer; color: #6c757d; width: 40px; height: 40px;
                border-radius: 50%; display: flex; align-items: center; justify-content: center;
            " onmouseover="this.style.background='#f8f9fa'" 
               onmouseout="this.style.background='none'">
                ✕
            </button>
        </div>
    `

    return modal
}

// Variables globales para el resumen
let descuentoGlobal = 0
let costoDelivery = 0
let descuentosIndividuales = {}

// Actualizar el contenido del resumen de pedido
function actualizarResumenPedido() {
    const listaProductos = document.getElementById("productos-resumen-lista")
    const carritoCount = document.getElementById("carrito-count")

    if (!listaProductos || !carritoCount) return

    // Actualizar contador
    carritoCount.textContent = carrito.length

    // Limpiar lista
    listaProductos.innerHTML = ""

    // Agregar cada producto
    carrito.forEach((producto, index) => {
        const productoDiv = document.createElement("div")
        productoDiv.style.cssText = `
        display: grid; grid-template-columns: 80px 1fr auto auto;
        gap: 15px; align-items: center; padding: 20px 0;
        border-bottom: 1px solid #e9ecef;
    `

        const descuentoIndividual = descuentosIndividuales[index] || 0
        const precioConDescuento = producto.precio * (1 - descuentoIndividual / 100)

        // Lógica mejorada para obtener imagen
        let imagenFinal = producto.imagen

        // Verificar si la imagen actual es válida
        if (
            !imagenFinal ||
            imagenFinal === "/placeholder.svg?height=50&width=50" ||
            imagenFinal.includes("placeholder") ||
            imagenFinal.trim() === ""
        ) {
            // Buscar imagen en tallas si existe
            if (producto.tallas && Array.isArray(producto.tallas)) {
                for (const talla of producto.tallas) {
                    if (
                        talla.imagen &&
                        typeof talla.imagen === "string" &&
                        talla.imagen.trim() !== "" &&
                        !talla.imagen.includes("placeholder") &&
                        talla.imagen !== "/placeholder.svg?height=50&width=50"
                    ) {
                        imagenFinal = talla.imagen
                        break
                    }
                }
            }

            // Buscar en cache global
            if (
                (!imagenFinal || imagenFinal.includes("placeholder")) &&
                window.productosCache &&
                Array.isArray(window.productosCache)
            ) {
                const productoCache = window.productosCache.find((p) => p.nombre === producto.nombre)

                if (productoCache && productoCache.imagen && !productoCache.imagen.includes("placeholder")) {
                    imagenFinal = productoCache.imagen
                } else if (productoCache && productoCache.tallas) {
                    for (const talla of productoCache.tallas) {
                        if (talla.imagen && !talla.imagen.includes("placeholder")) {
                            imagenFinal = talla.imagen
                            break
                        }
                    }
                }
            }
        }

        // Asegurar ruta correcta
        if (imagenFinal && !imagenFinal.startsWith("http") && !imagenFinal.startsWith("/")) {
            imagenFinal = "/" + imagenFinal
        }

        console.log("Imagen final para resumen:", imagenFinal, "Producto:", producto.nombre)

        productoDiv.innerHTML = `
        <div style="
            width: 80px; height: 80px; background: #f8f9fa; border-radius: 8px;
            display: flex; align-items: center; justify-content: center; overflow: hidden;
        ">
            ${imagenFinal &&
                imagenFinal !== "/placeholder.svg?height=50&width=50" &&
                !imagenFinal.includes("placeholder")
                ? `<img src="${imagenFinal}" alt="${producto.nombre}" 
                       style="width: 100%; height: 100%; object-fit: cover;" 
                       onerror="console.log('Error cargando imagen:', this.src); this.style.display='none'; this.nextElementSibling.style.display='flex';">
                   <div style="color: #6c757d; font-size: 12px; display: none; align-items: center; justify-content: center; width: 100%; height: 100%;">Sin imagen</div>`
                : '<span style="color: #6c757d; font-size: 12px;">Sin imagen</span>'
            }
        </div>
        
        <div>
            <div style="font-weight: 600; font-size: 18px; margin-bottom: 5px;">
                ${producto.nombre}
            </div>
            <div style="color: #6c757d;">
                In stock: ${producto.stock}
            </div>
            ${producto.talla ? `<div style="color: #6c757d; font-size: 14px;">Talla: ${producto.talla}</div>` : ""}
            <div style="margin-top: 8px;">
                <input type="number" value="${descuentoIndividual}" min="0" max="100" 
                       placeholder="% desc." onchange="aplicarDescuentoIndividual(${index}, this.value)"
                       style="width: 80px; padding: 4px 8px; border: 1px solid #dee2e6; border-radius: 4px; font-size: 14px;">
                <span style="font-size: 12px; color: #6c757d; margin-left: 5px;">% descuento</span>
            </div>
            ${descuentoIndividual > 0
                ? `<div style="font-size: 14px; color: #28a745; margin-top: 4px;">
                    Precio original: $${producto.precio.toFixed(2)} → $${precioConDescuento.toFixed(2)}
                   </div>`
                : ""
            }
        </div>
        
        <div style="display: flex; align-items: center; gap: 10px;">
            <button onclick="cambiarCantidadResumen(${index}, -1)" style="
                background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 50%;
                width: 35px; height: 35px; display: flex; align-items: center; justify-content: center;
                cursor: pointer; font-size: 18px; color: #6c757d;
            ">−</button>
            
            <span style="
                min-width: 40px; text-align: center; font-weight: 600; font-size: 18px;
            ">${producto.cantidad}</span>
            
            <button onclick="cambiarCantidadResumen(${index}, 1)" style="
                background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 50%;
                width: 35px; height: 35px; display: flex; align-items: center; justify-content: center;
                cursor: pointer; font-size: 18px; color: #6c757d;
            ">+</button>
        </div>
        
        <button onclick="eliminarProductoResumen(${index})" style="
            background: none; border: none; cursor: pointer; font-size: 20px;
            color: #dc3545; padding: 5px;
        ">🗑️</button>
    `

        listaProductos.appendChild(productoDiv)
    })

    // Actualizar totales
    actualizarTotalesResumen()
}

// Cambiar cantidad en el resumen
function cambiarCantidadResumen(index, delta) {
    if (carrito[index]) {
        const nuevoValor = carrito[index].cantidad + delta
        const stock = carrito[index].stock

        if (delta > 0 && nuevoValor > stock) {
            alert(`No puedes agregar más de ${stock} unidades disponibles.`)
            return
        }

        if (nuevoValor <= 0) {
            eliminarProductoResumen(index)
        } else {
            carrito[index].cantidad = nuevoValor
            actualizarResumenPedido()
        }
    }
}

// Eliminar producto del resumen
function eliminarProductoResumen(index) {
    carrito.splice(index, 1)
    // Reajustar índices de descuentos individuales
    const nuevosDescuentos = {}
    Object.keys(descuentosIndividuales).forEach((key) => {
        const keyNum = Number.parseInt(key)
        if (keyNum < index) {
            nuevosDescuentos[keyNum] = descuentosIndividuales[keyNum]
        } else if (keyNum > index) {
            nuevosDescuentos[keyNum - 1] = descuentosIndividuales[keyNum]
        }
    })
    descuentosIndividuales = nuevosDescuentos

    if (carrito.length === 0) {
        cerrarResumenPedido()
    } else {
        actualizarResumenPedido()
    }
}

// Aplicar descuento individual a un producto
function aplicarDescuentoIndividual(index, porcentaje) {
    const descuento = Math.max(0, Math.min(100, Number.parseFloat(porcentaje) || 0))
    descuentosIndividuales[index] = descuento
    actualizarTotalesResumen()
}

// Aplicar descuento global
function aplicarDescuentoGlobal(porcentaje, aplicar) {
    descuentoGlobal = aplicar ? porcentaje : 0
    actualizarTotalesResumen()
}

// Toggle delivery
function toggleDelivery(mostrar) {
    const deliveryFields = document.getElementById("delivery-fields")
    if (deliveryFields) {
        deliveryFields.style.display = mostrar ? "block" : "none"
        if (!mostrar) {
            costoDelivery = 0
            actualizarTotalesResumen()
        }
    }
}

// Actualizar total con delivery
function actualizarTotalConDelivery() {
    const costoInput = document.getElementById("delivery-costo")
    costoDelivery = Number.parseFloat(costoInput.value) || 0
    actualizarTotalesResumen()
}

// Actualizar todos los totales del resumen
function actualizarTotalesResumen() {
    let subtotal = 0
    let totalDescuentos = 0

    carrito.forEach((producto, index) => {
        const descuentoIndividual = descuentosIndividuales[index] || 0
        const precioConDescuentoIndividual = producto.precio * (1 - descuentoIndividual / 100)
        const subtotalProducto = precioConDescuentoIndividual * producto.cantidad

        subtotal += subtotalProducto
        totalDescuentos += producto.precio * producto.cantidad - subtotalProducto
    })

    // Aplicar descuento global sobre el subtotal ya con descuentos individuales
    const descuentoGlobalMonto = subtotal * (descuentoGlobal / 100)
    totalDescuentos += descuentoGlobalMonto

    const total = subtotal - descuentoGlobalMonto + costoDelivery

    // Actualizar elementos del DOM
    const elementos = {
        "subtotal-carrito": `$${(subtotal + descuentoGlobalMonto).toFixed(2)}`,
        "resumen-subtotal": `$${(subtotal + descuentoGlobalMonto).toFixed(2)}`,
        "resumen-descuento": `$${totalDescuentos.toFixed(2)}`,
        "resumen-total": `$${total.toFixed(2)}`,
    }

    Object.entries(elementos).forEach(([id, valor]) => {
        const elemento = document.getElementById(id)
        if (elemento) elemento.textContent = valor
    })
}

// Cerrar resumen de pedido
function cerrarResumenPedido() {
    const modal = document.getElementById("resumen-pedido-modal")
    if (modal) {
        modal.style.display = "none"
    }
}

// Procesar pedido final
async function procesarPedidoFinal() {
    console.log("=== PROCESANDO PEDIDO FINAL ===")

    if (carrito.length === 0) {
        alert("El carrito está vacío.")
        return
    }

    // Validar datos de delivery si está seleccionado
    const deliveryOption = document.getElementById("delivery-option")
    let datosDelivery = null

    if (deliveryOption && deliveryOption.checked) {
        const direccion = document.getElementById("delivery-direccion").value.trim()
        const cliente = document.getElementById("delivery-cliente").value.trim()
        const costo = Number.parseFloat(document.getElementById("delivery-costo").value) || 0

        if (!direccion || !cliente) {
            alert("Por favor, complete la dirección y nombre del cliente para el delivery.")
            return
        }

        datosDelivery = { direccion, cliente, costo }
    }

    // Preparar datos de productos con descuentos aplicados
    const productosConDescuentos = carrito.map((producto, index) => {
        const descuentoIndividual = descuentosIndividuales[index] || 0
        const precioConDescuento = producto.precio * (1 - descuentoIndividual / 100)
        const precioFinalConDescuentoGlobal = precioConDescuento * (1 - descuentoGlobal / 100)

        return {
            nombre: producto.nombre,
            cantidad: producto.cantidad,
            subtotal: Number.parseFloat((precioFinalConDescuentoGlobal * producto.cantidad).toFixed(2)),
            precio_original: producto.precio,
            descuento_individual: descuentoIndividual,
            descuento_global: descuentoGlobal,
        }
    })

    const datos = {
        productos: productosConDescuentos,
        delivery: datosDelivery,
        descuento_global: descuentoGlobal,
        costo_delivery: costoDelivery,
    }

    console.log("Datos a enviar:", JSON.stringify(datos, null, 2))

    try {
        const response = await fetch("/api/ventas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(datos),
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Error del servidor (${response.status}): ${errorText}`)
        }

        const result = await response.json()

        if (result.success) {
            alert("¡Venta realizada con éxito! Factura ID: " + result.facturaId)

            // Limpiar carrito y cerrar modal
            carrito = []
            descuentosIndividuales = {}
            descuentoGlobal = 0
            costoDelivery = 0
            cerrarResumenPedido()
            renderizarCarrito()
        } else {
            alert("Error al registrar la venta: " + result.message)
        }
    } catch (error) {
        console.error("Error completo:", error)
        alert("Ocurrió un error al registrar la venta: " + error.message)
    }
}

// Alternar visibilidad del panel del carrito (desplazable)
function toggleCarrito() {
    const panel = document.getElementById("carrito-panel")
    if (!panel) {
        console.error("No se encontró el panel del carrito")
        return
    }

    if (panel.style.right === "0px") {
        panel.style.right = "-500px"
    } else {
        panel.style.right = "0px"
    }
}

// Asigna el evento al botón del carrito
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM cargado, configurando carrito...")

    const botonCarrito = document.getElementById("ver-carrito")
    if (botonCarrito) {
        botonCarrito.addEventListener("click", toggleCarrito)
        console.log("Botón carrito configurado")
    } else {
        console.error("No se encontró el botón del carrito")
    }

    // Configurar botón finalizar compra
    const botonFinalizar = document.getElementById("finalizar-compra")
    if (botonFinalizar) {
        botonFinalizar.addEventListener("click", finalizarCompra)
        console.log("Botón finalizar compra configurado")
    } else {
        console.error("No se encontró el botón finalizar compra")
    }
})

window.agregarAlCarrito = agregarAlCarrito
window.mostrarDetalleProductoCarrito = mostrarDetalleProductoCarrito

// Asegura que la función esté disponible globalmente
window.mostrarDetalleProductoSoloVista = mostrarDetalleProductoSoloVista

// Hacer las funciones disponibles globalmente
window.cambiarCantidadResumen = cambiarCantidadResumen
window.eliminarProductoResumen = eliminarProductoResumen
window.aplicarDescuentoIndividual = aplicarDescuentoIndividual
window.aplicarDescuentoGlobal = aplicarDescuentoGlobal
window.toggleDelivery = toggleDelivery
window.actualizarTotalConDelivery = actualizarTotalConDelivery
window.cerrarResumenPedido = cerrarResumenPedido
window.procesarPedidoFinal = procesarPedidoFinal
window.renderizarCarrito = renderizarCarrito
window.debugCarrito = window.debugCarrito
