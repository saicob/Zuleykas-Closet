$(document).ready(function() {
    // --- Quitar imagen en formulario de actualizar producto ---
    const previewActualizar = $('#preview-actualizar');
    const inputActualizar = $('#imagen-actualizar');
    const removeBtnActualizar = $('#remove-image-actualizar');
    const dropAreaActualizar = $('#drop-area-actualizar');

    // Mostrar preview al seleccionar imagen
    inputActualizar.on('change', function(e) {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewActualizar.attr('src', e.target.result).show();
                removeBtnActualizar.show();
            }
            reader.readAsDataURL(this.files[0]);
        }
    });

    // Quitar imagen al hacer click en la X
    removeBtnActualizar.on('click', function() {
        previewActualizar.hide().attr('src', '/placeholder.svg');
        inputActualizar.val('');
        removeBtnActualizar.hide();
        // Mostrar el texto de subir imagen
        dropAreaActualizar.find('span').show();
    });

    // Al hacer click en el área, abrir el input de archivo
    dropAreaActualizar.on('click', function(e) {
        // Solo abrir si no se hizo click en la X
        if (!$(e.target).is(removeBtnActualizar)) {
            inputActualizar.trigger('click');
        }
    });

    // Ocultar texto de subir imagen cuando hay preview
    inputActualizar.on('change', function() {
        if (this.files && this.files[0]) {
            dropAreaActualizar.find('span').hide();
        }
    });
});

$('#Actualizar').on('click', async function(event) {
    event.preventDefault();
    const data = {
        nombre: $('#nombre').val(),
        proveedor: $('#proveedor').val(),
        precio_compra: $('#precio-compra').val(),
        precio_venta: $('#precio-venta').val(),
        cantidad: $('#cantidad').val(),
        descripcion: $('#descripcion').val(),
        codigo_tienda: $('#local').val() // Nuevo: Local
    };

    try {
        const response = await fetch(`/products/${data.id}`, {
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
            const response = await fetch(`/products/${data.nombre}`);
            if (response.ok) {
                const product = await response.json();

                // Populate the form with the product data
                $('#nombre').val(product.nombre);
                $('#proveedor').val(product.proveedor || ''); // Assuming 'proveedor' exists in the data
                $('#precio-compra').val(product.precio_compra || ''); // Assuming 'precio_compra' exists in the data
                $('#precio-venta').val(product.precio || '');
                $('#cantidad').val(product.stock || '');
                $('#descripcion').val(product.descripcion || '');
                $('#local').val(product.codigo_tienda || '1'); // <-- Set Local

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
