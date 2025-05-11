document.addEventListener('DOMContentLoaded', () => {
    const agregarProveedorSection = document.getElementById('Agregar-Proveedor');
    const overlay = document.getElementById('overlay');

    // Mostrar sección Agregar Proveedor
    document.getElementById('mostrar-agregar-proveedor').addEventListener('click', () => {
        agregarProveedorSection.style.display = 'block';
        overlay.style.display = 'block';
    });

    // Cancelar Agregar
    document.getElementById('Agregar-Proveedor').querySelector('#Cancelar').addEventListener('click', () => {
        document.getElementById('agregar-proveedor-form').reset(); // Limpiar el formulario
        agregarProveedorSection.style.display = 'none';
        overlay.style.display = 'none';
    });

    // Manejar el envío del formulario
    document.getElementById('agregar-proveedor-form').addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

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
                    estado: estado === 'Activo' ? 1 : 0 // Convertir estado a booleano
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error del servidor: ${errorText}`);
            }

            const responseData = await response.json();

            if (!responseData.success) {
                throw new Error(responseData.message || 'Error al agregar el proveedor.');
            }

            alert('Proveedor agregado con éxito.');
            document.getElementById('agregar-proveedor-form').reset(); // Limpiar el formulario
            agregarProveedorSection.style.display = 'none';
            overlay.style.display = 'none';

            // Recargar la tabla de proveedores
            $('#proveedores-table').DataTable().ajax.reload();
        } catch (err) {
            console.error('Error al agregar el proveedor:', err);
            alert(`Hubo un error al agregar el proveedor: ${err.message}`);
        }
    });
});
