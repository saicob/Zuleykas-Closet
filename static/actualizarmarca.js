$(document).ready(function() {
    const actualizarMarcaSection = $('#Actualizar-Marca');
    const overlay = $('#overlay');

    // Manejar el envío del formulario de actualización
    $('#actualizar-marca-form').on('submit', async function(event) {
        event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

        const codigoMarca = $(this).data('codigo_marca');
        const nombre = $('#actualizar-marca-form #nombre').val().trim();
        const estado = $('#actualizar-marca-form #estado').val().trim();

        if (!nombre || !estado) {
            alert('Por favor, complete todos los campos correctamente.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/marcas/${codigoMarca}`, {
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
                throw new Error(responseData.message || 'Error al actualizar la marca.');
            }

            alert('Marca actualizada con éxito.');
            $('#actualizar-marca-form')[0].reset(); // Limpiar el formulario
            actualizarMarcaSection.hide();
            overlay.hide();

            // Recargar la tabla de marcas
            $('#marcas-table').DataTable().ajax.reload(null, false); // Mantener la página actual
        } catch (err) {
            console.error('Error al actualizar la marca:', err);
            alert(`Hubo un error al actualizar la marca: ${err.message}`);
        }
    });
});
