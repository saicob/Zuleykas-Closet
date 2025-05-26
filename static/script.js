document.addEventListener('DOMContentLoaded', function () {
    const dropdowns = document.querySelectorAll('.menu .dropdown');

    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        const content = dropdown.querySelector('.dropdown-content');
        dropdown._keepOpen = false;

        // Mostrar al hacer hover (ya lo hace el CSS, pero dejamos la lógica por si acaso)
        dropdown.addEventListener('mouseenter', () => {
            if (!dropdown._keepOpen) {
                content.classList.add('show');
            }
        });

        dropdown.addEventListener('mouseleave', () => {
            if (!dropdown._keepOpen) {
                content.classList.remove('show');
            }
        });

        // Toggle al hacer clic en el enlace principal
        link.addEventListener('click', function (e) {
            if (link.getAttribute('href') === '#') {
                e.preventDefault();

                if (dropdown._keepOpen) {
                    // Ya estaba abierto por clic → cerrar
                    dropdown._keepOpen = false;
                    content.classList.remove('show');
                } else {
                    // Cierra otros dropdowns fijados
                    dropdowns.forEach(d => {
                        if (d !== dropdown) {
                            d._keepOpen = false;
                            const otherContent = d.querySelector('.dropdown-content');
                            if (otherContent) otherContent.classList.remove('show');
                        }
                    });

                    // Abrir este dropdown
                    dropdown._keepOpen = true;
                    content.classList.add('show');
                }
            }
        });
    });

    // Cierra los dropdowns si se hace clic fuera del menú
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.menu')) {
            dropdowns.forEach(dropdown => {
                dropdown._keepOpen = false;
                const content = dropdown.querySelector('.dropdown-content');
                if (content) content.classList.remove('show');
            });
        }
    });
});
