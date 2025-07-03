// Funciones para mostrar el modal de solo vista de producto en carrito
function mostrarDetalleProductoSoloVista(producto) {
    const modal = document.getElementById('detalle-producto-modal');
    modal.style.display = 'flex';
    // Hacer el modal más ancho y mejorar la visualización de la imagen
    const modalContent = modal.firstElementChild;
    modalContent.style.borderTop = '5px solid #f8a8b9';
    modalContent.style.maxWidth = '480px'; // Más ancho
    modalContent.style.width = '95%';
    modalContent.style.minWidth = '340px';
    modalContent.style.boxSizing = 'border-box';
    modalContent.style.padding = '36px 32px';
    modalContent.style.borderRadius = '20px';
    modalContent.style.background = '#fff';
    modalContent.style.boxShadow = '0 8px 32px rgba(0,0,0,0.18)';
    modalContent.style.position = 'relative';
    modalContent.style.textAlign = 'center';

    document.getElementById('detalle-producto-nombre').textContent = producto.nombre;
    document.getElementById('detalle-producto-precio').textContent = `Precio: C$ ${producto.precio.toFixed(2)}`;
    document.getElementById('detalle-producto-stock').textContent = `En Stock: ${producto.stock}`;
    document.getElementById('detalle-producto-talla').textContent = `Talla: ${producto.talla || '-'}`;
    // Descripción
    var descElem = document.getElementById('detalle-producto-descripcion');
    if (descElem) {
        descElem.textContent = producto.descripcion ? producto.descripcion : '';
        descElem.style.background = '#f7f3f8';
        descElem.style.padding = '14px 18px';
        descElem.style.borderRadius = '10px';
        descElem.style.margin = '18px 0 0 0';
        descElem.style.fontSize = '1.08rem';
        descElem.style.color = '#444';
        descElem.style.lineHeight = '1.5';
        descElem.style.boxShadow = '0 2px 8px rgba(209,123,152,0.07)';
        descElem.style.maxHeight = '90px';
        descElem.style.overflowY = 'auto';
        descElem.style.textAlign = 'left';
        descElem.style.fontFamily = 'inherit';
        descElem.style.border = '1.5px solid #e0bfc7';
    }
    // Imagen (lógica igual que en catálogo, con referencia de estilo y carga)
    const imagenDiv = document.getElementById('detalle-producto-imagen');
    imagenDiv.innerHTML = '';
    imagenDiv.style.cssText = 'width: 100%; height: 150px; background: #f5f5f5; border-radius: 8px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; margin: 0 auto 18px;';
    let imagenMostrar = null;
    // Prioridad igual que en catálogo.js
    if (producto.talla && producto.tallas && Array.isArray(producto.tallas)) {
        const tallaObj = producto.tallas.find(t => t.talla === producto.talla);
        if (tallaObj && tallaObj.imagen && typeof tallaObj.imagen === 'string' && tallaObj.imagen.trim() !== '' && tallaObj.imagen !== '/placeholder.svg?height=50&width=50') {
            imagenMostrar = tallaObj.imagen;
        }
    }
    // Si no se encontró imagen por talla, buscar en las demás propiedades
    if (!imagenMostrar && producto.tallas && Array.isArray(producto.tallas) && producto.tallas.length > 0) {
        // Buscar la primera imagen válida en las tallas
        for (const t of producto.tallas) {
            if (t.imagen && typeof t.imagen === 'string' && t.imagen.trim() !== '' && t.imagen !== '/placeholder.svg?height=50&width=50') {
                imagenMostrar = t.imagen;
                break;
            }
        }
    }
    if (!imagenMostrar && producto.imagen && typeof producto.imagen === 'string' && producto.imagen.trim() !== '' && producto.imagen !== '/placeholder.svg?height=50&width=50') imagenMostrar = producto.imagen;
    if (!imagenMostrar && producto.imagen_url && typeof producto.imagen_url === 'string' && producto.imagen_url.trim() !== '' && producto.imagen_url !== '/placeholder.svg?height=50&width=50') imagenMostrar = producto.imagen_url;
    if (!imagenMostrar && producto.url_imagen && typeof producto.url_imagen === 'string' && producto.url_imagen.trim() !== '' && producto.url_imagen !== '/placeholder.svg?height=50&width=50') imagenMostrar = producto.url_imagen;
    if (!imagenMostrar && producto.imagenes && Array.isArray(producto.imagenes) && producto.imagenes.length > 0) {
        for (const img of producto.imagenes) {
            if (typeof img === 'string' && img.trim() !== '' && img !== '/placeholder.svg?height=50&width=50') {
                imagenMostrar = img;
                break;
            }
        }
    }
    if (imagenMostrar) {
        const img = document.createElement('img');
        img.src = imagenMostrar;
        img.alt = producto.nombre;
        img.loading = 'lazy';
        img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; display: none;';
        const placeholder = document.createElement('div');
        placeholder.style.cssText = 'color: #999; font-size: 12px; text-align: center; padding: 10px; z-index:2; position:relative; width:100%;';
        placeholder.textContent = 'Cargando...';
        img.onload = () => { placeholder.style.display = 'none'; img.style.display = 'block'; };
        img.onerror = () => { placeholder.textContent = 'Sin imagen'; img.style.display = 'none'; };
        imagenDiv.appendChild(img);
        imagenDiv.appendChild(placeholder);
    } else {
        const placeholder = document.createElement('div');
        placeholder.style.cssText = 'color: #999; font-size: 12px; text-align: center; padding: 10px; width:100%;';
        placeholder.textContent = 'Sin imagen';
        imagenDiv.appendChild(placeholder);
    }
    // Elimina controles de cantidad y botón agregar si existen
    const controles = modal.querySelectorAll('.solo-carrito-control');
    controles.forEach(ctrl => ctrl.remove());
    // Controles de cantidad y eliminar
    // Buscar el índice del producto en el carrito
    let indexCarrito = -1;
    if (window.carrito && Array.isArray(window.carrito)) {
        indexCarrito = window.carrito.findIndex(p => p.nombre === producto.nombre && p.talla === producto.talla && p.codigo_producto === producto.codigo_producto);
    }
    // Si el producto está en el carrito, mostrar controles
    if (indexCarrito !== -1) {
        // Crear contenedor de controles
        let controlesDiv = document.createElement('div');
        controlesDiv.className = 'solo-carrito-control';
        controlesDiv.style = 'display:flex; flex-direction:column; align-items:center; gap:10px; margin-top:18px;';
        // Input cantidad
        let labelCantidad = document.createElement('label');
        labelCantidad.textContent = 'Cantidad:';
        labelCantidad.style = 'font-weight:600; color:#d16a8a; margin-bottom:4px;';
        let inputCantidad = document.createElement('input');
        inputCantidad.type = 'number';
        inputCantidad.min = 1;
        inputCantidad.max = producto.stock;
        inputCantidad.value = producto.cantidad;
        inputCantidad.style = 'width:70px; padding:6px; border-radius:8px; border:1.5px solid #e0bfc7; font-size:1.1rem; text-align:center;';
        inputCantidad.onchange = function() {
            let nuevaCantidad = parseInt(this.value);
            if (isNaN(nuevaCantidad) || nuevaCantidad < 1) {
                this.value = producto.cantidad;
                return;
            }
            if (nuevaCantidad > producto.stock) {
                alert('No puedes seleccionar más de ' + producto.stock + ' unidades disponibles.');
                this.value = producto.cantidad;
                return;
            }
            window.carrito[indexCarrito].cantidad = nuevaCantidad;
            producto.cantidad = nuevaCantidad;
            // Actualizar input de cantidad en la fila del carrito
            const filaCarrito = document.querySelector(`#carrito-table tbody tr:nth-child(${indexCarrito + 1}) input[type='number']`);
            if (filaCarrito) {
                filaCarrito.value = nuevaCantidad;
            }
            if (typeof window.renderizarCarrito === 'function') window.renderizarCarrito();
            if (typeof window.actualizarResumenPedido === 'function') window.actualizarResumenPedido();
        };
        controlesDiv.appendChild(labelCantidad);
        controlesDiv.appendChild(inputCantidad);
        // Botón eliminar
        let btnEliminar = document.createElement('button');
        btnEliminar.textContent = 'Eliminar del carrito';
        btnEliminar.style = 'background:#f8a8b9; color:#fff; border:none; border-radius:8px; padding:8px 18px; font-size:1rem; font-weight:600; cursor:pointer; margin-top:8px;';
        btnEliminar.onclick = function() {
            window.carrito.splice(indexCarrito, 1);
            if (typeof window.renderizarCarrito === 'function') window.renderizarCarrito();
            if (typeof window.actualizarResumenPedido === 'function') window.actualizarResumenPedido();
            cerrarDetalleProducto();
        };
        controlesDiv.appendChild(btnEliminar);
        // Insertar controles antes del botón cerrar
        let btnCerrar = modalContent.querySelector('button[onclick="cerrarDetalleProducto()"]');
        if (btnCerrar) {
            modalContent.insertBefore(controlesDiv, btnCerrar);
        } else {
            modalContent.appendChild(controlesDiv);
        }
    }
}

function cerrarDetalleProducto() {
    document.getElementById('detalle-producto-modal').style.display = 'none';
}

window.mostrarDetalleProductoSoloVista = mostrarDetalleProductoSoloVista;
