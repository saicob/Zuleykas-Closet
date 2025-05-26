document.addEventListener('DOMContentLoaded', () => {
    const agregarProveedorSection = document.getElementById('Agregar-Proveedor');
    const overlay = document.getElementById('overlay');
    const agregarForm = document.getElementById('agregar-proveedor-form');
    const cancelarBtn = agregarProveedorSection ? agregarProveedorSection.querySelector('#Cancelar') : null;

    // Solo ejecuta si existe el formulario en la página actual
    if (!agregarProveedorSection || !agregarForm) return;

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
        const nombre = agregarForm.querySelector('[name="nombre"]').value.trim();
        const estado = agregarForm.querySelector('[name="estado"]').value.trim();

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
            // Si tienes una tabla de proveedores en esta página, recárgala aquí si es necesario
        } catch (err) {
            alert(`Hubo un error al agregar el proveedor: ${err.message}`);
        }
    });
});
