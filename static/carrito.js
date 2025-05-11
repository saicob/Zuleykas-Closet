// Arreglo global para almacenar los productos en el carrito
let carrito = [];

// Agrega un producto al carrito (evita duplicados)
function agregarAlCarrito(producto) {
    if (!producto.nombre || typeof producto.nombre !== 'string') {
        console.error('El producto no tiene un nombre válido:', producto);
        alert('Error: El producto no tiene un nombre válido.');
        return;
    }

    if (isNaN(producto.precio) || producto.precio <= 0) {
        console.error('El producto tiene un precio inválido:', producto);
        alert('Error: El producto tiene un precio inválido.');
        return;
    }

    if (isNaN(producto.stock) || producto.stock < 0) {
        console.error('El producto tiene un stock inválido:', producto);
        alert('Error: El producto tiene un stock inválido.');
        return;
    }

    const index = carrito.findIndex(p => p.nombre === producto.nombre);
    if (index !== -1) {
        if (carrito[index].cantidad < producto.stock) {
            carrito[index].cantidad += 1;
        } else {
            alert("No puedes agregar más unidades de este producto. Stock insuficiente.");
        }
    } else {
        const cantidadInicial = Number.isInteger(producto.cantidad) && producto.cantidad > 0 ? producto.cantidad : 1;
        carrito.push({ ...producto, cantidad: cantidadInicial });

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
            </tr>
        `);
    });

    $('#carrito-total').text(`Total: $${total.toFixed(2)}`);
}

function actualizarCantidad(index, nuevaCantidad) {
    
    const cantidad = parseInt(nuevaCantidad, 10);
    if (isNaN(cantidad)) {
        alert("La cantidad ingresada no es un número válido.");
        renderizarCarrito();
        return;
    }



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
async function finalizarCompra() {

    console.log("Carrito que se enviará:", JSON.stringify(carrito, null, 2));

    if (carrito.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    // Validar los datos del carrito antes de enviarlos
    for (const producto of carrito) {
        if (!producto.nombre || typeof producto.nombre !== 'string') {
            console.error('Producto con nombre inválido:', producto);
            alert('Error: Uno o más productos tienen un nombre inválido.');
            return;
        }

        if (isNaN(producto.precio) || producto.precio <= 0) {
            console.error('Producto con precio inválido:', producto);
            alert('Error: Uno o más productos tienen un precio inválido.');
            return;
        }

        if (!Number.isInteger(producto.cantidad) || producto.cantidad <= 0) {
            console.error('Producto con cantidad inválida (tipo o valor):', producto);
            alert('Error: Uno o más productos tienen una cantidad inválida.');
            return;
        }   

        
    }

    const datos = {
        productos: carrito.map(p => ({
            nombre: p.nombre,
            cantidad: p.cantidad,
            subtotal: parseFloat((p.precio * p.cantidad).toFixed(2)) // Asegúrate de que sea un número válido
        }))
    };

    try {
        const response = await fetch('http://localhost:3000/api/ventas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datos),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error del servidor: ${errorText}`);
        }

        const result = await response.json();

        if (result.success) {
            alert('Venta realizada con éxito. Factura ID: ' + result.facturaId);
            carrito = [];
            renderizarCarrito();
        } else {
            alert('Error al registrar la venta: ' + result.message);
        }
    } catch (error) {
        console.error('Error al realizar la venta:', error);
        alert('Ocurrió un error al registrar la venta.');
    }
}

// Alternar visibilidad del panel del carrito (desplazable)
function toggleCarrito() {
    const panel = document.getElementById('carrito-panel');
    if (panel.style.right === '0px') {
        panel.style.right = '-500px'; // Ensure it slides out completely
    } else {
        panel.style.right = '0px'; // Slide in
    }
}

// Asigna el evento al botón del carrito
document.addEventListener('DOMContentLoaded', () => {
    const botonCarrito = document.getElementById('ver-carrito');
    if (botonCarrito) {
        botonCarrito.addEventListener('click', toggleCarrito);
    }
});
