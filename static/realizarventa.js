document.addEventListener('DOMContentLoaded', () => {
    const finalizarCompraBtn = document.getElementById('finalizar-compra');

    if (!finalizarCompraBtn) {
        console.error('El botón con id="finalizar-compra" no se encontró en el DOM.');
        return;
    }

    finalizarCompraBtn.addEventListener('click', async () => {
        console.log('Botón "Finalizar Compra" clickeado.');

        if (carrito.length === 0) {
            alert('El carrito está vacío.');
            return;
        }

        // Verificar que todos los productos tengan un nombre válido
        for (const producto of carrito) {
            if (!producto.nombre) {
                console.error('Producto con nombre inválido:', producto);
                alert('Error: Uno o más productos no tienen un nombre válido.');
                return;
            }
        }

        const total = carrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0); // Calcular el total
        const fecha = new Date().toISOString();

        try {
            // Enviar datos al servidor para procesar la compra
            const response = await fetch('http://localhost:3000/api/realizarventa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productos: carrito.map(p => ({
                        nombre: p.nombre, // Asegúrate de que este campo esté correctamente definido
                        cantidad: p.cantidad,
                        subtotal: p.precio * p.cantidad
                    })),
                    total,
                    fecha
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error del servidor: ${errorText}`);
            }

            const responseData = await response.json();

            if (!responseData.success) {
                throw new Error(responseData.message || 'Error al procesar la compra.');
            }

            alert('Compra realizada con éxito.');
            carrito = [];
            renderizarCarrito(); // Vaciar el carrito visualmente
            location.reload(); // Recargar la página
        } catch (err) {
            console.error('Error al realizar la compra:', err);
            alert(`Hubo un error al realizar la compra: ${err.message}`);
        }
    });
});
