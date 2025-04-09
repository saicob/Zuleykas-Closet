//este trozo de codigo debe permitir el autocompletado al escribir en el input de productos

const input = document.getElementById('productInput');
const suggestionsContainer = document.getElementById('suggestions');

input.addEventListener('input', async () => {
    const query = input.value.trim();

    if (query.length === 0) {
        suggestionsContainer.innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`/api/productos?search=${encodeURIComponent(query)}`);
        const productos = await response.json();

        suggestionsContainer.innerHTML = '';

        productos.forEach(prod => {
            const div = document.createElement('div');
            div.classList.add('suggestion');
            div.textContent = prod.nombre;
            div.dataset.id = prod.codigo_producto; // Si necesitas guardar el ID
            div.addEventListener('click', () => {
                input.value = prod.nombre;
                suggestionsContainer.innerHTML = '';
                // Aquí podrías hacer algo con el prod.id si es necesario
            });
            suggestionsContainer.appendChild(div);
        });
    } catch (err) {
        console.error('Error al buscar productos:', err);
    }
});

// Cierra sugerencias al hacer clic fuera
document.addEventListener('click', e => {
    if (!e.target.closest('.autocomplete-container')) {
        suggestionsContainer.innerHTML = '';
    }
});
