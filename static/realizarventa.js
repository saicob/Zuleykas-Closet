document.addEventListener('DOMContentLoaded', () => {
    cargarEmpleados();
    cargarProductos();
});

async function cargarEmpleados() {
    const response = await fetch('http://localhost:3000/api/empleado');
    const empleados = await response.json();

    const select = document.getElementById('empleadol1');
    empleados.forEach(e => {
        const option = document.createElement('option');
        option.value = e.codigo_empleado;
        option.textContent = `${e.nombre} ${e.apellido}`;
        select.appendChild(option);
    });
}

async function cargarProductos() {
    const response = await fetch('http://localhost:3000/api/productos');
    const productos = await response.json();

    const select = document.getElementById('productosl1');
    productos.forEach(p => {
        const option = document.createElement('option');
        option.value = p.codigo_producto;
        option.textContent = p.nombre;
        option.dataset.precio = p.precio;
        option.dataset.stock = p.stock;
        select.appendChild(option);
    });

    // Cargar datos cuando se selecciona un producto
    select.addEventListener('change', e => {
        const selected = e.target.selectedOptions[0];
        document.getElementById('stockl1').value = selected.dataset.stock || 0;
        document.getElementById('preciol1').value = selected.dataset.precio || 0;
        document.getElementById('cantidadl1').value = 1;
        document.getElementById('subtotall1').value = selected.dataset.precio || 0;
    });
}

const tablaTemporal = document.getElementById('tablaTemporal').querySelector('tbody');
const agregarBtn = document.getElementById('agregar');
const pagarBtn = document.getElementById('pagar');
const clienteInput = document.getElementById('clientel1');

let productosAgregados = [];

// Prevenir el comportamiento por defecto del formulario
document.getElementById('ventaForm').addEventListener('submit', e => {
    e.preventDefault();
});

agregarBtn.addEventListener('click', () => {
    const producto = document.getElementById('productInput').value;
    const cantidad = parseInt(document.getElementById('cantidadl1').value, 10);
    const precio = parseFloat(document.getElementById('preciol1').value);
    const subtotal = parseFloat(document.getElementById('subtotall1').value);

    if (!producto || cantidad <= 0 || isNaN(precio)) {
        alert('Por favor, complete todos los campos correctamente.');
        return;
    }

    // Agregar producto a la tabla temporal
    productosAgregados.push({ producto, cantidad, precio, subtotal });
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${producto}</td>
        <td>${cantidad}</td>
        <td>${precio.toFixed(2)}</td>
        <td>${subtotal.toFixed(2)}</td>
    `;
    tablaTemporal.appendChild(row);

    // Vaciar campos excepto cliente
    document.getElementById('productInput').value = '';
    document.getElementById('cantidadl1').value = 0;
    document.getElementById('preciol1').value = 0;
    document.getElementById('subtotall1').value = 0;
    document.getElementById('stockl1').value = 0;
});

pagarBtn.addEventListener('click', async () => {
    if (productosAgregados.length === 0) {
        alert('No hay productos en la tabla temporal.');
        return;
    }

    const cliente = clienteInput.value.trim() || 'Cliente Anónimo'; // Permitir cliente vacío

    try {
        // Enviar datos al servidor para procesar el pago
        const response = await fetch('/api/realizarventa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cliente, productos: productosAgregados }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error del servidor: ${errorText}`);
        }

        const responseData = await response.json();

        if (!responseData.success) {
            throw new Error(responseData.message || 'Error al procesar la venta.');
        }

        alert('Venta realizada con éxito.');
        productosAgregados = [];
        tablaTemporal.innerHTML = ''; // Vaciar tabla temporal
        clienteInput.value = ''; // Vaciar campo de cliente
    } catch (err) {
        console.error('Error al realizar la venta:', err);
        alert(`Hubo un error al realizar la venta: ${err.message}`);
    }
});
