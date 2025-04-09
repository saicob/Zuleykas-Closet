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

                // Autorrellenar campos al seleccionar un producto
                document.getElementById('stockl1').value = prod.stock;
                document.getElementById('preciol1').value = prod.precio;
                document.getElementById('cantidadl1').value = 0; // Reiniciar cantidad
                document.getElementById('subtotall1').value = 0; // Reiniciar subtotal
            });
            suggestionsContainer.appendChild(div);
        });
    } catch (err) {
        console.error('Error al buscar productos:', err);
    }
});

// Actualizar subtotal al cambiar la cantidad
document.getElementById('cantidadl1').addEventListener('input', () => {
    const stock = parseInt(document.getElementById('stockl1').value, 10);
    const precio = parseFloat(document.getElementById('preciol1').value);
    const cantidad = parseInt(document.getElementById('cantidadl1').value, 10);

    if (cantidad > stock) {
        alert('La cantidad no puede superar el stock disponible.');
        document.getElementById('cantidadl1').value = stock; // Ajustar cantidad al stock máximo
    }
    if(cantidad < 0){
        alert('La cantidad no puede ser negativa.');
        document.getElementById('cantidadl1').value = 0; // Ajustar cantidad a 0
    }
    const nuevaCantidad = parseInt(document.getElementById('cantidadl1').value, 10);
    document.getElementById('subtotall1').value = (nuevaCantidad * precio).toFixed(2);
});

// Cierra sugerencias al hacer clic fuera
document.addEventListener('click', e => {
    if (!e.target.closest('.autocomplete-container')) {
        suggestionsContainer.innerHTML = '';
    }
});
