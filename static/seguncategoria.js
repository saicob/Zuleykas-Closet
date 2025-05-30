document.addEventListener('DOMContentLoaded', () => {
    // Para formulario de agregar producto
    const categoriaSelect = document.getElementById('categoria');
    const tallaInput = document.getElementById('talla');
    const fechaFabricacionInput = document.getElementById('fecha-fabricacion');
    const fechaCaducidadInput = document.getElementById('fecha-caducidad');

    // Para formulario de actualizar producto
    const categoriaActualizar = document.getElementById('categoria-actualizar');
    const tallaActualizar = document.getElementById('talla-actualizar');
    const fechaFabricacionActualizar = document.getElementById('fecha-fabricacion-actualizar');
    const fechaCaducidadActualizar = document.getElementById('fecha-caducidad-actualizar');

    function actualizarCamposPorCategoria(select, talla, fechaFab, fechaCad) {
        const categoria = select.value;
        if (categoria === 'Ropa' || categoria === 'Lencería') {
            talla.disabled = false;
            talla.parentElement.style.opacity = '';
            fechaFab.disabled = true;
            fechaFab.parentElement.style.opacity = '0.5';
            fechaCad.disabled = true;
            fechaCad.parentElement.style.opacity = '0.5';
        } else if (categoria === 'Cosmetico') {
            talla.disabled = true;
            talla.parentElement.style.opacity = '0.5';
            fechaFab.disabled = false;
            fechaFab.parentElement.style.opacity = '';
            fechaCad.disabled = false;
            fechaCad.parentElement.style.opacity = '';
        } else {
            talla.disabled = true;
            talla.parentElement.style.opacity = '0.5';
            fechaFab.disabled = true;
            fechaFab.parentElement.style.opacity = '0.5';
            fechaCad.disabled = true;
            fechaCad.parentElement.style.opacity = '0.5';
        }
    }

    if (categoriaSelect && tallaInput && fechaFabricacionInput && fechaCaducidadInput) {
        categoriaSelect.addEventListener('change', function() {
            actualizarCamposPorCategoria(categoriaSelect, tallaInput, fechaFabricacionInput, fechaCaducidadInput);
        });
        actualizarCamposPorCategoria(categoriaSelect, tallaInput, fechaFabricacionInput, fechaCaducidadInput);
    }
    if (categoriaActualizar && tallaActualizar && fechaFabricacionActualizar && fechaCaducidadActualizar) {
        categoriaActualizar.addEventListener('change', function() {
            actualizarCamposPorCategoria(categoriaActualizar, tallaActualizar, fechaFabricacionActualizar, fechaCaducidadActualizar);
        });
        actualizarCamposPorCategoria(categoriaActualizar, tallaActualizar, fechaFabricacionActualizar, fechaCaducidadActualizar);
    }
});
