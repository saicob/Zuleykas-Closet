$(document).ready(function() {
    const actualizarProveedorSection = $('#Actualizar-Proveedor');
    const overlay = $('#overlay');

    // Manejar el envío del formulario de actualización
    $('#actualizar-proveedor-form').on('submit', async function(event) {
        event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

        const codigoProveedor = $(this).data('codigo_proveedor');
        const nombre = $('#actualizar-proveedor-form #nombre').val().trim();
        const estado = $('#actualizar-proveedor-form #estado').val().trim();

        if (!nombre || !estado) {
            alert('Por favor, complete todos los campos correctamente.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/proveedor/${codigoProveedor}`, {
                method: 'PUT',
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
                throw new Error(responseData.message || 'Error al actualizar el proveedor.');
            }

            alert('Proveedor actualizado con éxito.');
            $('#actualizar-proveedor-form')[0].reset(); // Limpiar el formulario
            actualizarProveedorSection.hide();
            overlay.hide();

            // Recargar la tabla de proveedores
            $('#proveedores-table').DataTable().ajax.reload();
        } catch (err) {
            console.error('Error al actualizar el proveedor:', err);
            alert(`Hubo un error al actualizar el proveedor: ${err.message}`);
        }
    });
});