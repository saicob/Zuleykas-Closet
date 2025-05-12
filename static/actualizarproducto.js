$('#Actualizar').on('click', async function(event) {
    event.preventDefault();
    const data = {
        nombre: $('#nombre').val(),
        proveedor: $('#proveedor').val(),
        precio_compra: $('#precio-compra').val(),
        precio_venta: $('#precio-venta').val(),
        cantidad: $('#cantidad').val(),
        descripcion: $('#descripcion').val()
    };

    try {
        const response = await fetch(`/productos/${data.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Producto actualizado exitosamente');
            location.reload();
        } else {
            alert('Error al actualizar el producto');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

$('#productos-table tbody').on('click', 'tr', async function() {
    const table = $('#productos-table').DataTable();
    const data = table.row(this).data();

    if (data) {
        try {
            const response = await fetch(`/productos/${data.nombre}`);
            if (response.ok) {
                const product = await response.json();

                // Populate the form with the product data
                $('#nombre').val(product.nombre);
                $('#proveedor').val(product.proveedor || ''); // Assuming 'proveedor' exists in the data
                $('#precio-compra').val(product.precio_compra || ''); // Assuming 'precio_compra' exists in the data
                $('#precio-venta').val(product.precio || '');
                $('#cantidad').val(product.stock || '');
                $('#descripcion').val(product.descripcion || '');

                // Show the update form
                $('#Actualizar-Producto').css('display', 'block');
                $('#overlay').css('display', 'block');
            } else {
                alert('Error al obtener los detalles del producto');
            }
        } catch (error) {
            console.error('Error al obtener los detalles del producto:', error);
        }
    }
});
