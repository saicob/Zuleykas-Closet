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
        ultimaActualizacion = ahora

        renderizarProductos(productos)
    } catch (err) {
        console.error("Error cargando productos:", err)
        alert("Ocurrió un error al cargar los productos. Por favor, inténtalo más tarde.")
    }
}

function renderizarProductos(productos, { local = null, query = "" } = {}) {
    const contenedor = document.querySelector(".catalogo-container")
    if (!contenedor) return

    // Asegurar centrado con flexbox
    contenedor.style.display = 'flex';
    contenedor.style.flexWrap = 'wrap';
    contenedor.style.justifyContent = 'center';
    contenedor.style.alignItems = 'flex-start';
    contenedor.style.gap = '32px 24px'; // Espaciado entre productos

    // Filtrar por local si corresponde
    let filtrados = productos
    if (local) {
        filtrados = filtrados.filter((prod) => prod.codigo_tienda == local)
    }
    // Filtrar por texto si corresponde
    if (query && query.length > 0) {
        filtrados = filtrados.filter((prod) => prod.nombre && prod.nombre.toLowerCase().includes(query.toLowerCase()))
    }

    // Solo limpiar si es necesario
    if (contenedor.children.length === 0 || contenedor.dataset.lastUpdate !== ultimaActualizacion.toString() || contenedor.dataset.lastLocal !== String(local) || contenedor.dataset.lastQuery !== query) {
        contenedor.innerHTML = ""
        contenedor.dataset.lastUpdate = ultimaActualizacion.toString()
        contenedor.dataset.lastLocal = String(local)
        contenedor.dataset.lastQuery = query

        filtrados.forEach((prod) => {
            if (!prod.nombre || !prod.precio || prod.stock === undefined) {
                console.error("Producto incompleto:", prod)
                return
            }

            const div = document.createElement("div")
            div.classList.add("producto")

            // Crear contenedor para imagen con placeholder estable
            const imgContainer = document.createElement("div")
            imgContainer.style.cssText =
                "width: 100%; height: 150px; background: #f5f5f5; border-radius: 8px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;"

            if (prod.imagen && prod.imagen !== "/placeholder.svg?height=50&width=50") {
                const img = document.createElement("img")
                img.src = prod.imagen
                img.alt = prod.nombre
                img.loading = "lazy"
                img.style.cssText = "width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0;"

                // Placeholder mientras carga
                const placeholder = document.createElement("div")
                placeholder.style.cssText = "color: #999; font-size: 12px; text-align: center; padding: 10px;"
                placeholder.textContent = "Cargando..."

                img.onload = () => {
                    placeholder.style.display = "none"
                    img.style.display = "block"
                }

                img.onerror = () => {
                    placeholder.textContent = "Sin imagen"
                    img.style.display = "none"
                }

                imgContainer.appendChild(img)
                imgContainer.appendChild(placeholder)
            } else {
                const placeholder = document.createElement("div")
                placeholder.style.cssText = "color: #999; font-size: 12px; text-align: center; padding: 10px;"
                placeholder.textContent = "Sin imagen"
                imgContainer.appendChild(placeholder)
            }

            const h3 = document.createElement("h3")
            h3.textContent = prod.nombre

            const pPrecio = document.createElement("p")
            pPrecio.textContent = `Precio: C$ ${Number.parseFloat(prod.precio).toFixed(2)}`

            const pStock = document.createElement("p")
            pStock.textContent = `En Stock: ${prod.stock}`

            // Mostrar talla si existe
            let pTalla = null
            if (prod.talla !== undefined && prod.talla !== null && prod.talla !== "") {
                pTalla = document.createElement("p")
                pTalla.textContent = `Talla: ${prod.talla}`
            }

            const btn = document.createElement("button")
            btn.textContent = "Ver producto"
            btn.onclick = () => {
                mostrarModalProducto(prod)
            }

            div.appendChild(imgContainer)
            div.appendChild(h3)
            div.appendChild(pPrecio)
            div.appendChild(pStock)
            if (pTalla) div.appendChild(pTalla)
            div.appendChild(btn)

            contenedor.appendChild(div)
        })
    }
}

// Modal flotante para ver producto y agregar al carrito
function mostrarModalProducto(prod) {
    document.getElementById('modal-producto')?.remove();
    const modal = document.createElement('div');
    modal.id = 'modal-producto';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.45); z-index: 9999;
        display: flex; align-items: center; justify-content: center; animation: modalFadeIn 0.25s;`
    ;
    const card = document.createElement('div');
    card.style.cssText = `background: #fff; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.18); padding: 36px 32px; min-width: 340px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative; text-align: center;`;
    // Imagen
    if (!prod.imagen || prod.imagen === '/placeholder.svg?height=50&width=50') {
        const noImg = document.createElement('div');
        noImg.textContent = 'Sin imagen';
        noImg.style.cssText = 'width: 260px; height: 200px; display: flex; align-items: center; justify-content: center; color: #999; background: #f5f5f5; border-radius: 12px; margin: 0 auto 18px; font-size: 20px; font-weight: 500;';
        card.appendChild(noImg);
    } else {
        const img = document.createElement('img');
        img.src = prod.imagen;
        img.alt = prod.nombre;
        img.style.cssText = 'width: 260px; height: 200px; object-fit: cover; border-radius: 12px; background: #f5f5f5; display: block; margin: 0 auto 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.07)';
        card.appendChild(img);
    }
    // Nombre
    const h3 = document.createElement('h3');
    h3.textContent = prod.nombre;
    h3.style.cssText = 'font-size: 2rem; font-family: "Montserrat", Arial, sans-serif; font-weight: 700; margin-bottom: 12px; color: #222; letter-spacing: 0.5px;';
    card.appendChild(h3);
    // Descripción (como párrafo, no una sola línea)
    if (prod.descripcion) {
        const desc = document.createElement('p');
        desc.textContent = prod.descripcion;
        desc.style.cssText = 'font-size: 1.08rem; color: #333; margin-bottom: 18px; max-width: 100%; white-space: normal; overflow-wrap: break-word; text-align: center;';
        card.appendChild(desc);
    }
    // Precio y stock
    const pPrecio = document.createElement('p');
    pPrecio.textContent = `Precio: C$ ${Number.parseFloat(prod.precio).toFixed(2)}`;
    pPrecio.style.cssText = 'font-size: 1.15rem; color: #d16a8a; font-weight: 600; margin-bottom: 2px;';
    card.appendChild(pPrecio);
    const pStock = document.createElement('p');
    pStock.textContent = `En Stock: ${prod.stock}`;
    pStock.style.cssText = 'font-size: 1.05rem; color: #666; margin-bottom: 2px;';
    card.appendChild(pStock);
    // Talla
    if (prod.talla !== undefined && prod.talla !== null && prod.talla !== "") {
        const pTalla = document.createElement("p");
        pTalla.textContent = `Talla: ${prod.talla}`;
        pTalla.style.cssText = 'font-size: 1.05rem; color: #666; margin-bottom: 2px;';
        card.appendChild(pTalla);
    }
    // Input cantidad
    const cantidadGroup = document.createElement('div');
    cantidadGroup.style.cssText = 'display: flex; align-items: center; justify-content: center; gap: 12px; margin: 22px 0 10px 0;';
    const labelCantidad = document.createElement('label');
    labelCantidad.textContent = 'Cantidad:';
    labelCantidad.htmlFor = 'cantidad-modal';
    labelCantidad.style.cssText = 'font-size: 1.1rem; font-weight: 500;';
    const inputCantidad = document.createElement('input');
    inputCantidad.type = 'number';
    inputCantidad.min = 1;
    inputCantidad.max = prod.stock;
    inputCantidad.value = 1;
    inputCantidad.id = 'cantidad-modal';
    inputCantidad.style.cssText = 'width: 70px; padding: 6px; border-radius: 8px; border: 1.5px solid #e0bfc7; font-size: 1.1rem; text-align: center;';
    cantidadGroup.appendChild(labelCantidad);
    cantidadGroup.appendChild(inputCantidad);
    card.appendChild(cantidadGroup);
    // Botones
    const btns = document.createElement('div');
    btns.style.cssText = 'display: flex; justify-content: center; gap: 22px; margin-top: 18px;';
    const btnCancelar = document.createElement('button');
    btnCancelar.textContent = 'Cancelar';
    btnCancelar.style.cssText = 'background: #f5f5f5; color: #444; border: none; border-radius: 10px; padding: 10px 28px; font-size: 1.08rem; font-weight: 500; cursor: pointer; transition: background 0.18s;';
    btnCancelar.onmouseenter = () => btnCancelar.style.background = '#e0e0e0';
    btnCancelar.onmouseleave = () => btnCancelar.style.background = '#f5f5f5';
    btnCancelar.onclick = () => modal.remove();
    const btnAgregar = document.createElement('button');
    btnAgregar.textContent = 'Agregar al carrito';
    btnAgregar.style.cssText = 'background: #f8a8b9; color: #fff; border: none; border-radius: 10px; padding: 10px 28px; font-size: 1.08rem; font-weight: 600; cursor: pointer; box-shadow: 0 2px 8px rgba(248,168,185,0.08); transition: background 0.18s;';
    btnAgregar.onmouseenter = () => btnAgregar.style.background = '#e07a9b';
    btnAgregar.onmouseleave = () => btnAgregar.style.background = '#f8a8b9';
    btnAgregar.onclick = () => {
        if (window.agregarAlCarrito) {
            window.agregarAlCarrito({
                nombre: prod.nombre,
                precio: Number.parseFloat(prod.precio),
                stock: Number.parseInt(prod.stock),
                cantidad: Number.parseInt(inputCantidad.value)
            });
        }
        modal.remove();
        mostrarToast('¡Producto agregado al carrito!');
    };
    btns.appendChild(btnCancelar);
    btns.appendChild(btnAgregar);
    card.appendChild(btns);
    modal.appendChild(card);
    document.body.appendChild(modal);
    // Animación CSS
    if (!document.getElementById('modal-producto-style')) {
        const style = document.createElement('style');
        style.id = 'modal-producto-style';
        style.textContent = `@keyframes modalFadeIn { from { opacity: 0; transform: scale(0.97);} to { opacity: 1; transform: scale(1);} }`;
        document.head.appendChild(style);
    }
}

// Toast notification
function mostrarToast(mensaje) {
    let toast = document.getElementById('toast-notif');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notif';
        toast.style.cssText = 'position:fixed;bottom:32px;left:50%;transform:translateX(-50%);background:#f8a8b9;color:#fff;padding:16px 32px;border-radius:12px;font-size:1.1rem;box-shadow:0 2px 12px rgba(0,0,0,0.10);z-index:10000;opacity:0;pointer-events:none;transition:opacity 0.3s;';
        document.body.appendChild(toast);
    }
    toast.textContent = mensaje;
    toast.style.opacity = '1';
    setTimeout(() => {
        toast.style.opacity = '0';
    }, 1800);
}

// Función para obtener el valor actual de los filtros y renderizar
function actualizarCatalogoFiltrado() {
    const local = document.getElementById("local")?.value || null
    const query = document.getElementById("productInput")?.value || ""
    if (productosCache) {
        renderizarProductos(productosCache, { local, query })
    }
}

// Cargar solo una vez al inicio
window.addEventListener("DOMContentLoaded", () => {
    cargarCatalogo().then(() => {
        actualizarCatalogoFiltrado()
    })
    document.getElementById("local")?.addEventListener("change", actualizarCatalogoFiltrado)
    document.getElementById("productInput")?.addEventListener("input", actualizarCatalogoFiltrado)
})

// Función para refrescar manualmente si es necesario
window.refrescarCatalogo = () => {
    productosCache = null
    cargarCatalogo()
}
