function setupMarcaAutocomplete(inputId, suggestionsId) {
    const input = document.getElementById(inputId);
    const suggestionsContainer = document.getElementById(suggestionsId);
    let marcasCache = [];

    if (!input || !suggestionsContainer) return;

    function renderSuggestions(query = '') {
        suggestionsContainer.innerHTML = '';
        const filtered = marcasCache.filter(m =>
            m.nombre.toLowerCase().includes(query)
        );
        filtered.forEach(m => {
            const div = document.createElement('div');
            div.classList.add('suggestion');
            div.textContent = m.nombre;
            div.addEventListener('click', () => {
                input.value = m.nombre;
                suggestionsContainer.innerHTML = '';
            });
            suggestionsContainer.appendChild(div);
        });
    }

    function fetchAndShowSuggestions(query = '') {
        if (marcasCache.length > 0) {
            renderSuggestions(query);
        } else {
            fetch('http://localhost:3000/api/marcas')
                .then(res => res.json())
                .then(marcas => {
                    marcasCache = marcas;
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

setupMarcaAutocomplete('marca-input', 'marca-suggestions');
setupMarcaAutocomplete('marca-input-agregar', 'marca-suggestions-agregar');
