// Barra lateral izquierda, Configuración de Dropdowns

document.addEventListener("DOMContentLoaded", () => {
    // Remove dropdown hover logic as CSS handles it

    // Ocultar y mostrar Agregar Proveedor Local 1
    const proveedorLocal1 = document.getElementById('proveedor_local1');
    if (proveedorLocal1) {
        proveedorLocal1.addEventListener('change', function() {
            const nuevoProveedor = document.getElementById('nuevo-proveedor_local1');
            if (this.value === 'nuevo') {
                nuevoProveedor.style.display = 'block';
            } else {
                nuevoProveedor.style.display = 'none';
            }
        });
    }

    // Ocultar y mostrar Agregar Marca Local 1
    const marcaLocal1 = document.getElementById('marca_local1');
    if (marcaLocal1) {
        marcaLocal1.addEventListener('change', function() {
            const nuevaMarca = document.getElementById('nueva-marca_local1');
            if (this.value === 'nueva') {
                nuevaMarca.style.display = 'block';
            } else {
                nuevaMarca.style.display = 'none';
            }
        });
    }

    // Ocultar y mostrar Agregar Proveedor Local 2
    const proveedorLocal2 = document.getElementById('proveedor_local2');
    if (proveedorLocal2) {
        proveedorLocal2.addEventListener('change', function() {
            const nuevoProveedor = document.getElementById('nuevo-proveedor_local2');
            if (this.value === 'nuevo') {
                nuevoProveedor.style.display = 'block';
            } else {
                nuevoProveedor.style.display = 'none';
            }
        });
    }

    // Ocultar y mostrar Agregar Marca Local 2
    const marcaLocal2 = document.getElementById('marca_local2');
    if (marcaLocal2) {
        marcaLocal2.addEventListener('change', function() {
            const nuevaMarca = document.getElementById('nueva-marca_local2');
            if (this.value === 'nueva') {
                nuevaMarca.style.display = 'block';
            } else {
                nuevaMarca.style.display = 'none';
            }
        });
    }

    // Toggle between sections when a table row is clicked
    const tableBody = document.getElementById('productos-table');
    const verProductosSection = document.getElementById('Ver_Productos');
    const actualizarProductoSection = document.getElementById('Actualizar_Producto');
    const actualizarButton = document.getElementById('actualizar-button');

    tableBody.addEventListener('click', (event) => {
        const row = event.target.closest('tr');
        if (row) {
            verProductosSection.style.display = 'none';
            actualizarProductoSection.style.display = 'block';
        }
    });

    // Refresh the page when the actualizar button is clicked
    if (actualizarButton) {
        actualizarButton.addEventListener('click', () => {
            location.reload();
        });
    }

    // Initially show the Ver_Productos section and hide Actualizar_Producto
    verProductosSection.style.display = 'block';
    actualizarProductoSection.style.display = 'none';

    // Show "Agregar Producto" section when "Registrar prenda" button is clicked
    const registrarPrendaButton = document.getElementById("registrar-prenda-button");
    const agregarProductoSection = document.getElementById("Agregar-Producto");
    const overlay = document.getElementById("overlay");

    if (registrarPrendaButton && agregarProductoSection) {
        registrarPrendaButton.addEventListener("click", () => {
            agregarProductoSection.style.display = "block";
            overlay.style.display = "block"; // Show overlay
        });
    }

    // Hide "Agregar Producto" section when "Cancelar" button is clicked
    const cancelarButton = agregarProductoSection.querySelector("#Cancelar");
    if (cancelarButton) {
        cancelarButton.addEventListener("click", (event) => {
            event.preventDefault();
            agregarProductoSection.style.display = "none";
            overlay.style.display = "none"; // Hide overlay
        });
    }
});

// Ocultar y mostrar Agregar Proveedor
document.getElementById('proveedor').addEventListener('change', function() {
    const nuevoProveedor = document.getElementById('nuevo-proveedor');
    if (this.value === 'nuevo') {
        nuevoProveedor.style.display = 'block';
    } else {
        nuevoProveedor.style.display = 'none';
    }
});

// Ocultar y mostrar Agregar Marca
document.getElementById('marca').addEventListener('change', function() {
    const nuevaMarca = document.getElementById('nueva-marca');
    if (this.value === 'nueva') {
        nuevaMarca.style.display = 'block';
    } else {
        nuevaMarca.style.display = 'none';
    }
});
