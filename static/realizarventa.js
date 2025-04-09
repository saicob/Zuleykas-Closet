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
