// Arreglo global para almacenar los productos en el carrito
let carrito = [];

// Agrega un producto al carrito (evita duplicados)
function agregarAlCarrito(producto) {
    const index = carrito.findIndex(p => p.nombre === producto.nombre);
    if (index !== -1) {
        if (carrito[index].cantidad < producto.stock) {
            carrito[index].cantidad += 1;
        } else {
            alert("No puedes agregar más unidades de este producto. Stock insuficiente.");
        }
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }
    renderizarCarrito();
}

// Elimina un producto del carrito por índice
function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    renderizarCarrito();
}

// Cambia la cantidad de un producto (aumenta o disminuye)
function cambiarCantidad(index, delta) {
    carrito[index].cantidad += delta;
    if (carrito[index].cantidad <= 0) {
        carrito.splice(index, 1);
    }
    renderizarCarrito();
}

// Muestra el contenido del carrito en la tabla HTML
function renderizarCarrito() {
    const tbody = $('#carrito-table tbody');
    tbody.empty();
    let total = 0;

    carrito.forEach((producto, index) => {
        const subtotal = producto.precio * producto.cantidad;
        total += subtotal;

        tbody.append(`
            <tr>
                <td>${producto.nombre}</td>
                <td>$${producto.precio.toFixed(2)}</td>
                <td>
                    <button onclick="cambiarCantidad(${index}, -1)">➖</button>
                    <input 
                        type="number" 
                        value="${producto.cantidad}" 
                        min="1"
                        style="width: 50px; text-align: center;"
                        onchange="actualizarCantidad(${index}, this.value)"
                    />
                    <button onclick="cambiarCantidad(${index}, 1)">➕</button>
                </td>
                <td>$${subtotal.toFixed(2)}</td>
                <td><button onclick="eliminarDelCarrito(${index})">🗑️</button></td>
            </tr>
        `);
    });

    $('#carrito-total').text(`Total: $${total.toFixed(2)}`);
}

function actualizarCantidad(index, nuevaCantidad) {
    const cantidad = parseInt(nuevaCantidad);
    const stock = carrito[index].stock;

    if (isNaN(cantidad) || cantidad <= 0) {
        alert("La cantidad debe ser mayor a cero.");
        renderizarCarrito(); // Revertir visualmente el valor
        return;
    }

    if (cantidad > stock) {
        alert(`No puedes seleccionar más de ${stock} unidades disponibles.`);
        renderizarCarrito(); // Revertir visualmente el valor
        return;
    }

    carrito[index].cantidad = cantidad;
    renderizarCarrito();
}

// Envía los datos del carrito al backend (crear compra)
function finalizarCompra() {
    if (carrito.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    const datos = {
        productos: carrito.map(p => ({
            nombre: p.nombre,
            cantidad: p.cantidad,
            precio_unitario: p.precio
        })),
        fecha: new Date().toISOString()
    };

    $.ajax({
        url: 'http://localhost:3000/api/compras',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(datos),
        success: function () {
            alert('Compra realizada con éxito');
            carrito = [];
            renderizarCarrito();
            $('#carrito-container').hide();
        },
        error: function () {
            alert('Error al registrar la compra');
        }
    });
}

// Alternar visibilidad del panel del carrito (desplazable)
function toggleCarrito() {
    const panel = document.getElementById('carrito-panel');
    if (panel.style.right === '0px') {
        panel.style.right = '-400px';
    } else {
        panel.style.right = '0px';
    }
}

// Asigna el evento al botón del carrito
document.addEventListener('DOMContentLoaded', () => {
    const botonCarrito = document.getElementById('ver-carrito');
    if (botonCarrito) {
        botonCarrito.addEventListener('click', toggleCarrito);
    }
});

