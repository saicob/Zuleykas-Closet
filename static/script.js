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

// ===== Socket.IO client (auto-load + notifications) =====
(function initSocketNotifications() {
    // Cargar script cliente de socket.io dinámicamente si no existe
    function loadSocketClient(cb) {
        if (window.io) return cb()
        const s = document.createElement('script')
        s.src = '/socket.io/socket.io.js'
        s.onload = cb
        s.onerror = () => console.warn('No se pudo cargar /socket.io/socket.io.js')
        document.head.appendChild(s)
    }

    loadSocketClient(() => {
        try {
            if (!window.io) return
            const socket = io()
            socket.on('connect', () => {
                console.log('Socket conectado:', socket.id)
            })

            // Manejar notificaciones entrantes
            socket.on('notification', (payload) => {
                try {
                    // Intentar usar showToast si existe (templates lo definen), si no, crear mínimo
                    if (typeof window.showToast === 'function') {
                        window.showToast(payload.message || 'Notificación', payload.type === 'venta' ? 'success' : 'success', 6000)
                    } else {
                        // Crear contenedor si no existe
                        let container = document.getElementById('toast-container')
                        if (!container) {
                            container = document.createElement('div')
                            container.id = 'toast-container'
                            container.style.cssText = 'position: fixed; top: 30px; right: 30px; z-index:2000;'
                            document.body.appendChild(container)
                        }
                        const toast = document.createElement('div')
                        toast.style.cssText = 'min-width:220px; max-width:350px; background:#4BB543; color:white; padding:14px 24px; border-radius:8px; margin-bottom:12px; box-shadow:0 2px 8px rgba(0,0,0,0.15); font-size:16px; font-family:inherit; opacity:0.97;'
                        toast.textContent = payload.message || JSON.stringify(payload)
                        container.appendChild(toast)
                        setTimeout(() => {
                            toast.style.opacity = '0'
                            setTimeout(() => toast.remove(), 400)
                        }, 5000)
                    }
                } catch (err) {
                    console.error('Error al mostrar notificación entrante:', err)
                }
            })
        } catch (err) {
            console.warn('No se pudo inicializar socket notifications:', err)
        }
    })
})()
