// Funciones para mostrar el modal de solo vista de producto en carrito
function mostrarDetalleProductoSoloVista(producto) {
    console.log("Mostrando detalle producto:", producto)

    const modal = document.getElementById("detalle-producto-modal")
    modal.style.display = "flex"

    // Hacer el modal más ancho y mejorar la visualización de la imagen
    const modalContent = modal.firstElementChild
    modalContent.style.borderTop = "5px solid #f8a8b9"
    modalContent.style.maxWidth = "480px" // Más ancho
    modalContent.style.width = "95%"
    modalContent.style.minWidth = "340px"
    modalContent.style.boxSizing = "border-box"
    modalContent.style.padding = "36px 32px"
    modalContent.style.borderRadius = "20px"
    modalContent.style.background = "#fff"
    modalContent.style.boxShadow = "0 8px 32px rgba(0,0,0,0.18)"
    modalContent.style.position = "relative"
    modalContent.style.textAlign = "center"

    document.getElementById("detalle-producto-nombre").textContent = producto.nombre
    document.getElementById("detalle-producto-precio").textContent = `Precio: C$ ${producto.precio.toFixed(2)}`
    document.getElementById("detalle-producto-stock").textContent = `En Stock: ${producto.stock}`
    document.getElementById("detalle-producto-talla").textContent = `Talla: ${producto.talla || "-"}`

    // Descripción
    var descElem = document.getElementById("detalle-producto-descripcion")
    if (descElem) {
        descElem.textContent = producto.descripcion ? producto.descripcion : ""
        descElem.style.background = "#f7f3f8"
        descElem.style.padding = "14px 18px"
        descElem.style.borderRadius = "10px"
        descElem.style.margin = "18px 0 0 0"
        descElem.style.fontSize = "1.08rem"
        descElem.style.color = "#444"
        descElem.style.lineHeight = "1.5"
        descElem.style.boxShadow = "0 2px 8px rgba(209,123,152,0.07)"
        descElem.style.maxHeight = "90px"
        descElem.style.overflowY = "auto"
        descElem.style.textAlign = "left"
        descElem.style.fontFamily = "inherit"
        descElem.style.border = "1.5px solid #e0bfc7"
    }

    // Imagen mejorada - tamaño más pequeño y mejor visualización
    const imagenDiv = document.getElementById("detalle-producto-imagen")
    imagenDiv.innerHTML = ""
    imagenDiv.style.cssText = `
      width: 120px; 
      height: 120px; 
      background: #f8f9fa; 
      border-radius: 12px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      position: relative; 
      overflow: hidden; 
      margin: 0 auto 20px; 
      border: 2px solid #e9ecef;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `

    let imagenMostrar = null

    // 1. Usar imagen del producto si es válida
    if (
        producto.imagen &&
        typeof producto.imagen === "string" &&
        producto.imagen.trim() !== "" &&
        producto.imagen !== "/placeholder.svg?height=50&width=50" &&
        !producto.imagen.includes("placeholder")
    ) {
        imagenMostrar = producto.imagen
    }

    // 2. Buscar en tallas del producto
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
        const productoCache = window.productosCache.find(
            (p) => p.nombre === producto.nombre && (p.marca === producto.marca || !producto.marca),
        )

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
        if (!imagenMostrar.startsWith("http") && !imagenMostrar.startsWith("/")) {
            imagenMostrar = "/" + imagenMostrar
        }
        console.log("Imagen encontrada para detalle:", imagenMostrar)
    } else {
        console.log("No se encontró imagen válida para detalle:", producto.nombre)
    }

    // Crear y mostrar la imagen
    if (
        imagenMostrar &&
        imagenMostrar !== "/placeholder.svg?height=50&width=50" &&
        !imagenMostrar.includes("placeholder")
    ) {
        const img = document.createElement("img")
        img.src = imagenMostrar
        img.alt = producto.nombre
        img.loading = "lazy"
        img.style.cssText = `
        width: 100%; 
        height: 100%; 
        object-fit: cover; 
        position: absolute; 
        top: 0; 
        left: 0; 
        display: none;
        border-radius: 10px;
      `

        const placeholder = document.createElement("div")
        placeholder.style.cssText = `
        color: #6c757d; 
        font-size: 14px; 
        text-align: center; 
        padding: 10px; 
        z-index: 2; 
        position: relative; 
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      `
        placeholder.textContent = "Cargando..."

        img.onload = () => {
            placeholder.style.display = "none"
            img.style.display = "block"
            console.log("Imagen cargada correctamente:", imagenMostrar)
        }

        img.onerror = () => {
            placeholder.innerHTML = `
          <div style="text-align: center;">
            <div style="font-size: 24px; margin-bottom: 5px;">📷</div>
            <div style="font-size: 12px;">Sin imagen</div>
          </div>
        `
            img.style.display = "none"
            console.log("Error cargando imagen:", imagenMostrar)
        }

        imagenDiv.appendChild(img)
        imagenDiv.appendChild(placeholder)
    } else {
        const placeholder = document.createElement("div")
        placeholder.style.cssText = `
        color: #6c757d; 
        font-size: 14px; 
        text-align: center; 
        padding: 10px; 
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        flex-direction: column;
      `
        placeholder.innerHTML = `
        <div style="font-size: 24px; margin-bottom: 5px;">📷</div>
        <div style="font-size: 12px;">Sin imagen</div>
      `
        imagenDiv.appendChild(placeholder)
    }

    // Elimina controles de cantidad y botón agregar si existen
    const controles = modal.querySelectorAll(".solo-carrito-control")
    controles.forEach((ctrl) => ctrl.remove())

    // Controles de cantidad y eliminar
    // Buscar el índice del producto en el carrito
    let indexCarrito = -1
    if (window.carrito && Array.isArray(window.carrito)) {
        indexCarrito = window.carrito.findIndex(
            (p) =>
                p.nombre === producto.nombre && p.talla === producto.talla && p.codigo_producto === producto.codigo_producto,
        )
    }

    // Si el producto está en el carrito, mostrar controles
    if (indexCarrito !== -1) {
        // Crear contenedor de controles
        const controlesDiv = document.createElement("div")
        controlesDiv.className = "solo-carrito-control"
        controlesDiv.style = "display:flex; flex-direction:column; align-items:center; gap:10px; margin-top:18px;"

        // Input cantidad
        const labelCantidad = document.createElement("label")
        labelCantidad.textContent = "Cantidad:"
        labelCantidad.style = "font-weight:600; color:#d16a8a; margin-bottom:4px;"

        const inputCantidad = document.createElement("input")
        inputCantidad.type = "number"
        inputCantidad.min = 1
        inputCantidad.max = producto.stock
        inputCantidad.value = producto.cantidad
        inputCantidad.style =
            "width:70px; padding:6px; border-radius:8px; border:1.5px solid #e0bfc7; font-size:1.1rem; text-align:center;"

        inputCantidad.onchange = function () {
            const nuevaCantidad = Number.parseInt(this.value)
            if (isNaN(nuevaCantidad) || nuevaCantidad < 1) {
                this.value = producto.cantidad
                return
            }
            if (nuevaCantidad > producto.stock) {
                alert("No puedes seleccionar más de " + producto.stock + " unidades disponibles.")
                this.value = producto.cantidad
                return
            }
            window.carrito[indexCarrito].cantidad = nuevaCantidad
            producto.cantidad = nuevaCantidad

            // Actualizar input de cantidad en la fila del carrito
            const filaCarrito = document.querySelector(
                `#carrito-table tbody tr:nth-child(${indexCarrito + 1}) input[type='number']`,
            )
            if (filaCarrito) {
                filaCarrito.value = nuevaCantidad
            }

            if (typeof window.renderizarCarrito === "function") window.renderizarCarrito()
            if (typeof window.actualizarResumenPedido === "function") window.actualizarResumenPedido()
        }

        controlesDiv.appendChild(labelCantidad)
        controlesDiv.appendChild(inputCantidad)

        // Botón eliminar
        const btnEliminar = document.createElement("button")
        btnEliminar.textContent = "Eliminar del carrito"
        btnEliminar.style =
            "background:#f8a8b9; color:#fff; border:none; border-radius:8px; padding:8px 18px; font-size:1rem; font-weight:600; cursor:pointer; margin-top:8px;"
        btnEliminar.onclick = () => {
            window.carrito.splice(indexCarrito, 1)
            if (typeof window.renderizarCarrito === "function") window.renderizarCarrito()
            if (typeof window.actualizarResumenPedido === "function") window.actualizarResumenPedido()
            cerrarDetalleProducto()
        }

        controlesDiv.appendChild(btnEliminar)

        // Insertar controles antes del botón cerrar
        const btnCerrar = modalContent.querySelector('button[onclick="cerrarDetalleProducto()"]')
        if (btnCerrar) {
            modalContent.insertBefore(controlesDiv, btnCerrar)
        } else {
            modalContent.appendChild(controlesDiv)
        }
    }
}

function cerrarDetalleProducto() {
    document.getElementById("detalle-producto-modal").style.display = "none"
}

window.mostrarDetalleProductoSoloVista = mostrarDetalleProductoSoloVista
  