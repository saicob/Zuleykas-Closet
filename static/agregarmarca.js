document.addEventListener('DOMContentLoaded', () => {
    const agregarForm = document.getElementById('agregar-marca-form');

    if (!agregarForm) {
        console.error('El formulario con id="agregar-marca-form" no se encontró en el DOM.');
        return;
    }

    console.log('Formulario "Agregar Marca" encontrado.');

    const agregarButton = document.querySelector('#Agregar-Marca #Agregar');
    if (agregarButton) {
        agregarButton.addEventListener('click', () => {
            console.log('Botón "Agregar" para marca presionado.');
        });
    }

    agregarForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevenir el comportamiento por defecto del formulario
        console.log('Formulario "Agregar Marca" enviado.');

        // Obtener los valores de los campos del formulario
        const nombre = document.getElementById('nombre').value.trim();
        const estado = document.getElementById('estado').value.trim();

        // Validar los campos
        if (!nombre || !estado) {
            alert('Por favor, complete todos los campos correctamente.');
            console.error('Validación fallida: Campos incompletos.');
            return;
        }

        try {
            console.log('Enviando datos al backend:', { nombre, estado });
            const response = await fetch('http://localhost:3000/api/marcas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre,
                    estado: estado === 'Activo' ? 1 : 0 // Convertir estado a formato booleano
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error del servidor: ${errorText}`);
            }

            const responseData = await response.json();

            if (!responseData.codigo_marca) {
                throw new Error(responseData.message || 'Error al agregar la marca.');
            }

            alert('Marca agregada con éxito.');
            console.log('Marca agregada con éxito:', responseData);
            agregarForm.reset(); // Limpiar el formulario
            document.getElementById('Agregar-Marca').style.display = 'none'; // Ocultar el modal
            document.getElementById('overlay').style.display = 'none'; // Ocultar el overlay

            // Recargar la tabla de marcas
            $('#marcas-table').DataTable().ajax.reload();
        } catch (err) {
            console.error('Error al agregar la marca:', err);
            alert(`Hubo un error al agregar la marca: ${err.message}`);
        }
    });
});
