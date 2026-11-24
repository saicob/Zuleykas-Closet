document.addEventListener('DOMContentLoaded', () => {
    const agregarMarcaSection = document.getElementById('Agregar-Marca');
    const overlay = document.getElementById('overlay');
    const agregarForm = document.getElementById('agregar-marca-form');
    const cancelarBtn = agregarMarcaSection ? agregarMarcaSection.querySelector('#Cancelar') : null;

    // Solo ejecuta si existe el formulario en la página actual
    if (!agregarMarcaSection || !agregarForm) return;

    // Cancelar Agregar
    if (cancelarBtn) {
        cancelarBtn.addEventListener('click', () => {
            agregarForm.reset();
            agregarMarcaSection.style.display = 'none';
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
            const response = await fetch('http://localhost:3000/api/marcas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre,
                    estado: estado === 'Activo' ? 1 : 0
                }),
            });

            const responseData = await response.json();
            if (!response.ok || !responseData.success) {
                throw new Error(responseData.message || 'Error al agregar la marca.');
            }

            alert('Marca agregada con éxito.');
            agregarForm.reset();
            agregarMarcaSection.style.display = 'none';
            overlay.style.display = 'none';
            // Si tienes una tabla de marcas en esta página, recárgala aquí si es necesario
        } catch (err) {
            alert(`Hubo un error al agregar la marca: ${err.message}`);
        }
    });
});
