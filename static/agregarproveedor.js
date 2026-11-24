document.addEventListener('DOMContentLoaded', () => {
    // Solo ejecuta si existe el botón mostrar-agregar-proveedor (evita conflicto con VerProductos.html)
    const mostrarAgregarProveedorBtn = document.getElementById('mostrar-agregar-proveedor');
    if (!mostrarAgregarProveedorBtn) return;

    const agregarProveedorSection = document.getElementById('Agregar-Proveedor');
    const overlay = document.getElementById('overlay');
    const agregarForm = document.getElementById('agregar-proveedor-form');
    const cancelarBtn = agregarProveedorSection ? agregarProveedorSection.querySelector('#Cancelar') : null;

    // Mostrar sección Agregar Proveedor
    mostrarAgregarProveedorBtn.addEventListener('click', () => {
        agregarProveedorSection.style.display = 'block';
        overlay.style.display = 'block';
    });

    // Cancelar Agregar
    if (cancelarBtn) {
        cancelarBtn.addEventListener('click', () => {
            agregarForm.reset();
            agregarProveedorSection.style.display = 'none';
            overlay.style.display = 'none';
        });
    }

    agregarForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const nombre = document.getElementById('nombre').value.trim();
        const estado = document.getElementById('estado').value.trim();

        if (!nombre || !estado) {
            alert('Por favor, complete todos los campos correctamente.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/proveedor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre,
                    estado: estado === 'Activo' ? 1 : 0
                }),
            });

            const responseData = await response.json();
            if (!response.ok || !responseData.success) {
                throw new Error(responseData.message || 'Error al agregar el proveedor.');
            }

            alert('Proveedor agregado con éxito.');
            agregarForm.reset();
            agregarProveedorSection.style.display = 'none';
            overlay.style.display = 'none';

            if (window.$ && $('#proveedores-table').length) {
                $('#proveedores-table').DataTable().ajax.reload(null, false);
            }
        } catch (err) {
            alert(`Hubo un error al agregar el proveedor: ${err.message}`);
        }
    });
});
