//este trozo de codigo debe permitir el autocompletado al escribir en el input de productos

const input = document.getElementById('productInput');
const suggestionsContainer = document.getElementById('suggestions');

input.addEventListener('input', async () => {
    const query = input.value.trim().toLowerCase();

    if (query.length === 0) {
        suggestionsContainer.innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`/api/productos`);
        const productos = await response.json();

        const filteredProducts = productos.filter(prod =>
            prod.nombre.toLowerCase().startsWith(query) // Filtrar por inicio de caracteres
        );

        suggestionsContainer.innerHTML = '';

        filteredProducts.forEach(prod => {
            const div = document.createElement('div');
            div.classList.add('suggestion');
            div.textContent = prod.nombre;
            div.dataset.id = prod.codigo_producto;
            div.addEventListener('click', () => {
                input.value = prod.nombre;
                suggestionsContainer.innerHTML = '';
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
