$('#Agregar').on('click', async function(event) {
    event.preventDefault();
    const data = {
        nombre: $('#nombre').val(),
        descripcion: $('#descripcion').val(),
        precio_compra: $('#precio-compra').val(),
        precio_venta: $('#precio-venta').val(),
        cantidad: $('#cantidad').val(),
        categoria: $('#categoria').val(),
        local: $('#local').val(),
        proveedor: $('#proveedor-input-agregar').val(),
        marca: $('#marca-input-agregar').val(),
        fecha_fabricacion: $('#fecha-fabricacion').val(),
        fecha_caducidad: $('#fecha-caducidad').val(),
        talla: $('#talla').val()
    };

    try {
        const response = await fetch('http://localhost:3000/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Producto agregado exitosamente');
            location.reload();
        } else {
            const error = await response.json();
            alert('Error al agregar el producto: ' + (error.error || ''));
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
