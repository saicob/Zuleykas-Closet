document.addEventListener('DOMContentLoaded', () => {
    // Solo ejecuta si existe el botón mostrar-agregar-marca (evita conflicto con VerProductos.html)
    const mostrarAgregarMarcaBtn = document.getElementById('mostrar-agregar-marca');
    if (!mostrarAgregarMarcaBtn) return;

    const agregarMarcaSection = document.getElementById('Agregar-Marca');
    const overlay = document.getElementById('overlay');
    const agregarForm = document.getElementById('agregar-marca-form');
    const cancelarBtn = agregarMarcaSection ? agregarMarcaSection.querySelector('#Cancelar') : null;

    if (!agregarForm) {
        console.error('El formulario con id="agregar-marca-form" no se encontró en el DOM.');
        return;
    }

    console.log('Formulario "Agregar Marca" encontrado.');

    // Mostrar sección Agregar Marca
    mostrarAgregarMarcaBtn.addEventListener('click', () => {
        agregarMarcaSection.style.display = 'block';
        overlay.style.display = 'block';
    });

    // Cancelar Agregar
    if (cancelarBtn) {
        cancelarBtn.addEventListener('click', () => {
            agregarForm.reset(); // Limpiar el formulario
            agregarMarcaSection.style.display = 'none';
            overlay.style.display = 'none';
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

            if (!responseData.success) {
                throw new Error(responseData.message || 'Error al agregar la marca.');
            }

            alert('Marca agregada con éxito.');
            console.log('Marca agregada con éxito:', responseData);
            agregarForm.reset(); // Limpiar el formulario
            agregarMarcaSection.style.display = 'none';
            overlay.style.display = 'none';

            // Recargar la tabla de marcas si existe
            if (window.$ && $('#marcas-table').length) {
                $('#marcas-table').DataTable().ajax.reload(null, false);
            }
        } catch (err) {
            console.error('Error al agregar la marca:', err);
            alert(`Hubo un error al agregar la marca: ${err.message}`);
        }
    });
});
