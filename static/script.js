// Barra lateral izquierda, Configuración de Dropdowns

document.addEventListener("DOMContentLoaded", () => {
    const dropdowns = document.querySelectorAll(".dropdown");

    // Manejo de hover: abrir al pasar el mouse
    dropdowns.forEach(dropdown => {
        const menuItem = dropdown.querySelector(".menu-item");

        dropdown.addEventListener("mouseenter", () => {
            dropdown.classList.add("active");
        });

        dropdown.addEventListener("mouseleave", () => {
            if (!dropdown.classList.contains("clicked")) {
                dropdown.classList.remove("active");
            }
        });

        //  Clic para mantener activo el dropdown
        menuItem.addEventListener("click", (e) => {
            e.stopPropagation(); // Evita que el clic se propague al body
            dropdowns.forEach(d => {
                if (d !== dropdown) {
                    d.classList.remove("active", "clicked");
                }
            });

            dropdown.classList.toggle("clicked");
            dropdown.classList.toggle("active");
        });
    });

    // Clic fuera del menú para cerrar el dropdown activo
    document.addEventListener("click", () => {
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove("active", "clicked");
        });
    });

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