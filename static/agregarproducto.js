$('#Agregar').on('click', async function(event) {
    event.preventDefault();
    const data = {
        nombre: $('#nombre').val(),
        descripcion: $('#descripcion').val(),
        precio: $('#precio-venta').val(),
        stock: $('#cantidad').val(),
        estado: true,
        fecha_caducidad: $('#fecha-caducidad').val()
    };

    try {
        const response = await fetch('/productos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Producto agregado exitosamente');
            location.reload();
        } else {
            alert('Error al agregar el producto');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
