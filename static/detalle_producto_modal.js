// Funciones para mostrar el modal de solo vista de producto en carrito
function mostrarDetalleProductoSoloVista(producto) {
    document.getElementById('detalle-producto-modal').style.display = 'flex';
    document.getElementById('detalle-producto-modal').firstElementChild.style.borderTop = '5px solid #f8a8b9';
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
    // Imagen
    const imagenDiv = document.getElementById('detalle-producto-imagen');
    if (producto.imagen) {
        imagenDiv.innerHTML = `<img src="${producto.imagen}" alt="${producto.nombre}" style="max-width:100%; max-height:100%; border-radius:12px;">`;
    } else {
        imagenDiv.innerHTML = `<span style="color:#aaa;">Sin imagen</span>`;
    }
    // Elimina controles de cantidad y botón agregar si existen
    const modal = document.getElementById('detalle-producto-modal');
    const controles = modal.querySelectorAll('.solo-carrito-control');
    controles.forEach(ctrl => ctrl.remove());
}

function cerrarDetalleProducto() {
    document.getElementById('detalle-producto-modal').style.display = 'none';
}

window.mostrarDetalleProductoSoloVista = mostrarDetalleProductoSoloVista;
