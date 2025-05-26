function setupProveedorAutocomplete(inputId, suggestionsId) {
    const input = document.getElementById(inputId);
    const suggestionsContainer = document.getElementById(suggestionsId);
    let proveedoresCache = [];

    if (!input || !suggestionsContainer) return;

    function renderSuggestions(query = '') {
        suggestionsContainer.innerHTML = '';
        const filtered = proveedoresCache.filter(p =>
            p.nombre.toLowerCase().includes(query)
        );
        filtered.forEach(p => {
            const div = document.createElement('div');
            div.classList.add('suggestion');
            div.textContent = p.nombre;
            div.addEventListener('click', () => {
                input.value = p.nombre;
                suggestionsContainer.innerHTML = '';
            });
            suggestionsContainer.appendChild(div);
        });
    }

    function fetchAndShowSuggestions(query = '') {
        if (proveedoresCache.length > 0) {
            renderSuggestions(query);
        } else {
            fetch('http://localhost:3000/api/proveedor')
                .then(res => res.json())
                .then(proveedores => {
                    proveedoresCache = proveedores;
                    renderSuggestions(query);
                })
                .catch(() => {});
        }
    }

    input.addEventListener('input', function() {
        const query = input.value.trim().toLowerCase();
        fetchAndShowSuggestions(query);
    });

    input.addEventListener('focus', function() {
        fetchAndShowSuggestions('');
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest(`#${suggestionsId}`) && e.target !== input) {
            suggestionsContainer.innerHTML = '';
        }
    });
}

setupProveedorAutocomplete('proveedor-input', 'proveedor-suggestions');
setupProveedorAutocomplete('proveedor-input-agregar', 'proveedor-suggestions-agregar');
