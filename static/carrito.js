// Arreglo global para almacenar los productos en el carrito
let carrito = []

// Agrega un producto al carrito (evita duplicados)
function agregarAlCarrito(producto) {
    console.log("Agregando producto al carrito:", producto)

    if (!producto.nombre || typeof producto.nombre !== "string") {
        console.error("El producto no tiene un nombre válido:", producto)
        alert("Error: El producto no tiene un nombre válido.")
        return
    }

    if (isNaN(producto.precio) || producto.precio <= 0) {
        console.error("El producto tiene un precio inválido:", producto)
        alert("Error: El producto tiene un precio inválido.")
        return
    }

    if (isNaN(producto.stock) || producto.stock < 0) {
        console.error("El producto tiene un stock inválido:", producto)
        alert("Error: El producto tiene un stock inválido.")
        return
    }

    // Buscar por nombre + talla + código_producto
    const index = carrito.findIndex((p) => p.nombre === producto.nombre && p.talla === producto.talla && p.codigo_producto === producto.codigo_producto)
    if (index !== -1) {
        if (carrito[index].cantidad < producto.stock) {
            carrito[index].cantidad += producto.cantidad || 1
        } else {
            alert("No puedes agregar más unidades de este producto. Stock insuficiente.")
        }
    } else {
        const cantidadInicial = Number.isInteger(producto.cantidad) && producto.cantidad > 0 ? producto.cantidad : 1
        carrito.push({ ...producto, cantidad: cantidadInicial })
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
        tr.querySelector('td').onclick = () => mostrarDetalleProductoCarrito(producto)
        tbody.appendChild(tr)
    })

    const totalElement = document.querySelector("#carrito-total")
    if (totalElement) {
        totalElement.textContent = `Total: $${total.toFixed(2)}`
    }
}

// Mostrar detalles del producto del carrito en un modal reutilizando mostrarModalProducto si existe
function mostrarDetalleProductoCarrito(producto) {
    if (typeof window.mostrarModalProducto === 'function') {
        // Buscar el producto original en productosCache para mostrar todos los detalles
        if (window.productosCache && Array.isArray(window.productosCache)) {
            // Buscar el grupo por nombre, marca y categoría
            const grupo = window.productosCache.find(p => p.nombre === producto.nombre && p.marca === producto.marca && p.categoria === producto.categoria);
            if (grupo) {
                // Buscar la talla específica
                let tallaObj = null;
                if (producto.talla && grupo.tallas && Array.isArray(grupo.tallas)) {
                    tallaObj = grupo.tallas.find(t => t.talla === producto.talla);
                }
                // Construir objeto para el modal
                const prodModal = {
                    ...grupo,
                    talla: producto.talla,
                    stock: tallaObj ? tallaObj.stock : producto.stock,
                    imagen: (tallaObj && tallaObj.imagen) ? tallaObj.imagen : (grupo.imagen || producto.imagen),
                    tallas: grupo.tallas
                };
                window.mostrarModalProducto(prodModal);
                return;
            }
        }
        // Si no se encuentra, mostrar solo los datos del carrito
        window.mostrarModalProducto(producto);
    } else {
        alert('Detalles: ' + JSON.stringify(producto, null, 2))
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

// Envía los datos del carrito al backend (crear compra)
async function finalizarCompra() {
    console.log("=== INICIANDO FINALIZAR COMPRA ===")
    console.log("Carrito actual:", carrito)

    if (carrito.length === 0) {
        alert("El carrito está vacío.")
        return
    }

    // Validar los datos del carrito antes de enviarlos
    for (const producto of carrito) {
        if (!producto.nombre || typeof producto.nombre !== "string") {
            console.error("Producto con nombre inválido:", producto)
            alert("Error: Uno o más productos tienen un nombre inválido.")
            return
        }

        if (isNaN(producto.precio) || producto.precio <= 0) {
            console.error("Producto con precio inválido:", producto)
            alert("Error: Uno o más productos tienen un precio inválido.")
            return
        }

        if (!Number.isInteger(producto.cantidad) || producto.cantidad <= 0) {
            console.error("Producto con cantidad inválida:", producto)
            alert("Error: Uno o más productos tienen una cantidad inválida.")
            return
        }
    }

    const datos = {
        productos: carrito.map((p) => ({
            nombre: p.nombre,
            cantidad: p.cantidad,
            subtotal: Number.parseFloat((p.precio * p.cantidad).toFixed(2)),
        })),
    }

    console.log("Datos a enviar:", JSON.stringify(datos, null, 2))

    try {
        console.log("Enviando petición a /api/ventas...")

        const response = await fetch("/api/ventas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(datos),
        })

        console.log("Respuesta recibida:", response.status, response.statusText)

        if (!response.ok) {
            const errorText = await response.text()
            console.error("Error del servidor:", errorText)
            throw new Error(`Error del servidor (${response.status}): ${errorText}`)
        }

        const result = await response.json()
        console.log("Resultado:", result)

        if (result.success) {
            alert("¡Venta realizada con éxito! Factura ID: " + result.facturaId)
            carrito = []
            renderizarCarrito()

            // Cerrar el panel del carrito
            const panel = document.getElementById("carrito-panel")
            if (panel) {
                panel.style.right = "-500px"
            }
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
