// ============================================
// TIENDA ONLINE - Versión mejorada
// ============================================

let productosOriginal = []
let productosFiltrados = []
let productoSeleccionadoIndex = -1

document.addEventListener("DOMContentLoaded", () => {
    cargarProductos()
    registrarListenersFiltros()
    registrarListenersCarrito()
})

/**
 * Cargar productos desde la API
 */
async function cargarProductos() {
    try {
        const res = await fetch("http://localhost:3000/api/products")
        if (!res.ok) throw new Error("Error al cargar productos")

        productosOriginal = await res.json()
        productosFiltrados = [...productosOriginal]

        window.productosCache = productosOriginal

        renderizarProductos()
        actualizarBadgeCarrito()
    } catch (error) {
        console.error("[TiendaOnline] Error cargando:", error)
        document.getElementById("sin-productos").style.display = "block"
    }
}

/**
 * Renderizar productos en el catálogo
 */
function renderizarProductos() {
    const cont = document.getElementById("catalogo")
    if (!cont) return

    cont.innerHTML = ""

    if (productosFiltrados.length === 0) {
        document.getElementById("sin-productos").style.display = "block"
        return
    }

    document.getElementById("sin-productos").style.display = "none"

    productosFiltrados.forEach((prod, index) => {
        const stock = prod.tallas?.[0]?.stock || 0
        const card = document.createElement("div")
        card.className = "producto-card"

        const img = document.createElement("div")
        img.className = "producto-img"
        const imgTag = document.createElement("img")
        imgTag.src = prod.imagen || "/generic-product-display.png"
        imgTag.alt = prod.nombre
        img.appendChild(imgTag)

        const info = document.createElement("div")
        info.className = "producto-info"
        info.innerHTML = `
      <div class="producto-nombre">${prod.nombre}</div>
      <div class="producto-precio">C$ ${Number.parseFloat(prod.precio).toFixed(2)}</div>
      <div class="producto-stock">${stock > 0 ? `Stock: ${stock}` : "Agotado"}</div>
      <button 
        class="producto-btn" 
        onclick="abrirModalSeleccionTalla(${index})" 
        ${stock === 0 ? "disabled" : ""}
        style="background: ${stock === 0 ? "#ddd" : "#f8a8b9"}; cursor: ${stock === 0 ? "not-allowed" : "pointer"};"
      >
        ${stock > 0 ? "Agregar al Carrito" : "Agotado"}
      </button>
    `

        card.appendChild(img)
        card.appendChild(info)
        cont.appendChild(card)
    })
}

/**
 * Aplicar filtros de búsqueda, categoría, precio
 */
function aplicarFiltros() {
    const cats = Array.from(document.querySelectorAll(".categoria-filter:checked")).map((e) => e.value)
    const priceMin = Number.parseFloat(document.getElementById("price-min").value)
    const priceMax = Number.parseFloat(document.getElementById("price-max").value)
    const stock = document.querySelector(".stock-filter:checked").value
    const search = document.getElementById("search-input").value.toLowerCase()

    document.getElementById("min-display").textContent = priceMin
    document.getElementById("max-display").textContent = priceMax

    productosFiltrados = productosOriginal.filter((p) => {
        const pStock = p.tallas?.[0]?.stock || 0
        const cumplePrice = p.precio >= priceMin && p.precio <= priceMax
        const cumpleCat = cats.length === 0 || cats.includes(p.categoria)
        const cumpleStock = stock === "all" || (stock === "available" && pStock > 0)
        const cumpleSearch = p.nombre.toLowerCase().includes(search) || p.descripcion?.toLowerCase().includes(search)

        return cumplePrice && cumpleCat && cumpleStock && cumpleSearch
    })

    // Aplicar ordenamiento
    const sortBy = document.getElementById("sort-by").value
    if (sortBy === "nombre") {
        productosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre))
    } else if (sortBy === "precio-asc") {
        productosFiltrados.sort((a, b) => a.precio - b.precio)
    } else if (sortBy === "precio-desc") {
        productosFiltrados.sort((a, b) => b.precio - a.precio)
    }

    renderizarProductos()
}

/**
 * Registrar listeners para filtros
 */
function registrarListenersFiltros() {
    document.querySelectorAll(".categoria-filter, .stock-filter").forEach((el) => {
        el.addEventListener("change", aplicarFiltros)
    })

    document.getElementById("price-min").addEventListener("input", aplicarFiltros)
    document.getElementById("price-max").addEventListener("input", aplicarFiltros)
    document.getElementById("search-input").addEventListener("input", aplicarFiltros)
    document.getElementById("sort-by").addEventListener("change", aplicarFiltros)
}

/**
 * Limpiar todos los filtros
 */
window.limpiarFiltros = () => {
    document.querySelectorAll(".categoria-filter").forEach((e) => {
        e.checked = false
    })
    document.querySelector('.stock-filter[value="all"]').checked = true
    document.getElementById("price-min").value = "0"
    document.getElementById("price-max").value = "5000"
    document.getElementById("search-input").value = ""
    document.getElementById("sort-by").value = "nombre"
    aplicarFiltros()
}

/**
 * Abrir modal para seleccionar talla
 */
window.abrirModalSeleccionTalla = (productoIndex) => {
    const producto = productosOriginal[productoIndex]

    if (!producto || !producto.tallas || producto.tallas.length === 0) {
        alert("Error: Producto sin tallas disponibles")
        return
    }

    productoSeleccionadoIndex = productoIndex

    let htmlTallas = `
    <div style="margin: 20px 0;">
      <p style="font-weight: 600; margin-bottom: 12px; color: #d16a8a;">Selecciona una talla:</p>
  `

    producto.tallas.forEach((talla, index) => {
        const disponible = talla.stock > 0
        const labelTalla = talla.talla && talla.talla !== "N/A" ? talla.talla : "Talla única"
        htmlTallas += `
      <button 
        class="talla-btn" 
        onclick="agregarAlCarritoConTalla(${productoIndex}, ${index})"
        style="
          width: 100%;
          padding: 12px;
          margin: 8px 0;
          border: 2px solid ${disponible ? "#f8a8b9" : "#ccc"};
          background: ${disponible ? "#fff" : "#f5f5f5"};
          border-radius: 8px;
          cursor: ${disponible ? "pointer" : "not-allowed"};
          font-weight: 600;
          color: ${disponible ? "#d16a8a" : "#999"};
          transition: all 0.2s;
        "
        ${!disponible ? "disabled" : ""}
        onmouseover="if(!this.disabled) this.style.background='#f8a8b9'; this.style.color='white';"
        onmouseout="if(!this.disabled) this.style.background='#fff'; this.style.color='#d16a8a';"
      >
        ${labelTalla} ${disponible ? `(${talla.stock} disp.)` : "(Agotada)"}
      </button>
    `
    })

    htmlTallas += "</div>"
    document.getElementById("talla-content").innerHTML = htmlTallas
    document.getElementById("modal-talla").classList.add("active")
}

/**
 * Registrar listeners del carrito
 */
function registrarListenersCarrito() {
    // Si existe botón header para abrir carrito, delegar al toggle global
    const cartBtn = document.getElementById("open-cart")
    if (cartBtn) {
        cartBtn.addEventListener("click", () => {
            // abrir/cerrar panel lateral que provee carrito.js
            if (typeof toggleCarrito === "function") {
                toggleCarrito()
            } else {
                // fallback: abrir modal legacy si existe
                const modal = document.getElementById("modal-checkout")
                if (modal) modal.classList.add("active")
            }
            // Asegurar que la tabla del carrito global se renderice
            if (typeof window.renderizarCarrito === "function") window.renderizarCarrito()
        })
    }

    // Suscribirse a cambios del carrito global para actualizar badge
    if (window.carritoManager && typeof window.carritoManager.escuchar === "function") {
        window.carritoManager.escuchar(() => {
            actualizarBadgeCarrito()
            // Forzar render del panel global si está presente
            if (typeof window.renderizarCarrito === "function") window.renderizarCarrito()
        })
    }
}

/**
 * Agregar producto al carrito con talla seleccionada
 */
window.agregarAlCarritoConTalla = (productoIndex, tallaIndex) => {
    try {
        const producto = productosOriginal[productoIndex]
        const talla = producto.tallas[tallaIndex]

        if (!talla || talla.stock === 0) {
            throw new Error("Talla no disponible")
        }

        const productoCarrito = {
            nombre: producto.nombre,
            precio: Number.parseFloat(producto.precio),
            talla: talla.talla || "N/A",
            codigo_producto: talla.codigo_producto || producto.codigo_producto,
            stock: talla.stock,
            cantidad: 1,
            imagen: talla.imagen || producto.imagen,
            marca: producto.marca || "Sin marca",
            descripcion: producto.descripcion,
            categoria: producto.categoria,
        }

        // Usar carrito global
        if (!window.carritoManager || typeof window.carritoManager.agregar !== "function") {
            throw new Error("Carrito global no disponible")
        }

        window.carritoManager.agregar(productoCarrito)

        // Forzar render del carrito global (asegura que tabla lateral se actualice inmediatamente)
        if (typeof window.renderizarCarrito === "function") window.renderizarCarrito()

        // Actualizar badge header
        actualizarBadgeCarrito()

        // Cerrar modal de talla y mostrar feedback
        document.getElementById("modal-talla").classList.remove("active")
        mostrarToast("✓ Producto agregado al carrito")
    } catch (error) {
        console.error("[TiendaOnline] Error agregando producto:", error)
        alert("Error: " + error.message)
    }
}

/**
 * Mostrar notificación toast
 */
function mostrarToast(mensaje) {
    const existing = document.getElementById("toast")
    if (existing) existing.remove()

    const toast = document.createElement("div")
    toast.id = "toast"
    toast.textContent = mensaje
    toast.style.cssText = `
    position: fixed; bottom: 20px; right: 20px; 
    background: #d16a8a; color: white; padding: 12px 20px;
    border-radius: 6px; z-index: 10000; font-weight: 600;
  `
    document.body.appendChild(toast)

    setTimeout(() => toast.remove(), 3000)
}

/**
 * Actualizar badge del carrito
 */
function actualizarBadgeCarrito() {
    const total = window.carritoManager.obtenerCantidad()
    const badge = document.getElementById("cart-count")
    if (badge) {
        badge.textContent = total
    }
}

/**
 * Actualizar tabla del carrito en el modal
 */
function actualizarTablaCarrito() {
    const tbody = document.getElementById("carrito-items")
    if (!tbody) return

    tbody.innerHTML = ""
    const carrito = window.carritoManager.obtener()

    if (carrito.length === 0) {
        tbody.innerHTML = "<tr><td colspan='3' style='text-align: center; padding: 20px;'>Carrito vacío</td></tr>"
        document.getElementById("carrito-total").textContent = "C$ 0.00"
        return
    }

    let total = 0
    carrito.forEach((p, idx) => {
        const subtotal = p.precio * p.cantidad
        total += subtotal

        const tr = document.createElement("tr")
        tr.innerHTML = `
      <td style="padding: 8px 0;">${p.nombre} ${p.talla ? `[${p.talla}]` : ""}</td>
      <td style="text-align: center; padding: 8px 0;">
        <button onclick="window.cambiarCantidadCarrito(${idx}, -1)" style="width: 20px; height: 20px; cursor: pointer; border: 1px solid #f8a8b9; background: white; border-radius: 3px; color: #d16a8a; font-weight: bold;">−</button>
        <span style="margin: 0 6px;">${p.cantidad}</span>
        <button onclick="window.cambiarCantidadCarrito(${idx}, 1)" style="width: 20px; height: 20px; cursor: pointer; border: 1px solid #f8a8b9; background: white; border-radius: 3px; color: #d16a8a; font-weight: bold;">+</button>
      </td>
      <td style="text-align: right; padding: 8px 0; font-weight: 600; color: #d16a8a;">C$ ${subtotal.toFixed(2)}</td>
    `
        tbody.appendChild(tr)
    })

    document.getElementById("carrito-total").textContent = `C$ ${total.toFixed(2)}`
}

/**
 * Cambiar cantidad de producto en el carrito
 */
window.cambiarCantidadCarrito = (idx, cambio) => {
    try {
        const carrito = window.carritoManager.obtener()
        const nuevaCantidad = carrito[idx].cantidad + cambio

        if (nuevaCantidad <= 0) {
            window.carritoManager.eliminar(idx)
        } else {
            window.carritoManager.cambiarCantidad(idx, nuevaCantidad)
        }

        actualizarTablaCarrito()
    } catch (error) {
        alert("Error: " + error.message)
    }
}

/**
 * Procesar compra
 */
window.procesarCompra = async (e) => {
    e.preventDefault()

    const validaciones = {
        nombre: {
            valor: document.getElementById("nombre").value.trim(),
            regex: /^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]{3,}$/,
            msg: "Nombre: mínimo 3 caracteres",
        },
        email: {
            valor: document.getElementById("email").value.trim(),
            regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            msg: "Email inválido",
        },
        telefono: {
            valor: document.getElementById("telefono").value.trim(),
            regex: /^\d{4}-\d{4}$/,
            msg: "Teléfono: formato 8xxx-xxxx",
        },
        direccion: {
            valor: document.getElementById("direccion").value.trim(),
            regex: /^.{5,}$/,
            msg: "Dirección: mínimo 5 caracteres",
        },
        ciudad: {
            valor: document.getElementById("ciudad").value.trim(),
            regex: /^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]{2,}$/,
            msg: "Ciudad inválida",
        },
    }

    let esValido = true
    for (const [campo, config] of Object.entries(validaciones)) {
        const errorElem = document.getElementById(`error-${campo}`)
        if (!config.regex.test(config.valor)) {
            if (errorElem) {
                errorElem.textContent = config.msg
            }
            document.getElementById(campo)?.classList.add("is-invalid")
            esValido = false
        } else {
            if (errorElem) {
                errorElem.textContent = ""
            }
            document.getElementById(campo)?.classList.remove("is-invalid")
        }
    }

    const carrito = window.carritoManager.obtener()
    if (!esValido || carrito.length === 0) {
        alert("Por favor completa todos los campos y tienes productos en el carrito")
        return
    }

    try {
        const datosCompra = {
            nombre: validaciones.nombre.valor,
            email: validaciones.email.valor,
            telefono: validaciones.telefono.valor,
            direccion: validaciones.direccion.valor,
            ciudad: validaciones.ciudad.valor,
            codigo_postal: document.getElementById("codigo-postal").value.trim(),
            productos: carrito.map((p) => ({
                nombre: p.nombre,
                cantidad: p.cantidad,
                subtotal: p.precio * p.cantidad,
            })),
        }

        const res = await fetch("http://localhost:3000/api/ventas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosCompra),
        })

        const result = await res.json()
        if (result.success) {
            mostrarToast("✓ Compra realizada exitosamente")
            window.carritoManager.vaciar()
            actualizarTablaCarrito()
            actualizarBadgeCarrito()
            document.getElementById("checkout-form").reset()
            document.getElementById("modal-checkout").classList.remove("active")
        } else {
            alert("Error: " + result.message)
        }
    } catch (error) {
        console.error("[TiendaOnline] Error procesando compra:", error)
        alert("Error al procesar la compra")
    }
}

/* NUEVO: abrir formulario de compra (abre modal-compra que acabamos de insertar en el HTML) */
window.abrirFormularioCompra = () => {
    try {
        const carrito = window.carritoManager && window.carritoManager.obtener ? window.carritoManager.obtener() : []
        if (!carrito || carrito.length === 0) {
            alert("El carrito está vacío. Agrega productos antes de continuar.")
            return
        }
        // Abrir modal de datos (usar clase active para mostrar)
        const modal = document.getElementById("modal-compra")
        if (modal) {
            modal.classList.add("active")
            // asegurarse que se muestre (compatibilidad con estilos inline)
            modal.style.display = "flex"
        }
    } catch (err) {
        console.error("[TiendaOnline] abrirFormularioCompra error:", err)
        alert("No se pudo abrir el formulario de compra.")
    }
}
