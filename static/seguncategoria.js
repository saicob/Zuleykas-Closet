document.addEventListener('DOMContentLoaded', () => {
    const categoriaSelect = document.getElementById('categoria');
    const tallaInput = document.getElementById('talla');
    const fechaFabricacionInput = document.getElementById('fecha-fabricacion');
    const fechaCaducidadInput = document.getElementById('fecha-caducidad');

    function actualizarCamposPorCategoria() {
        const categoria = categoriaSelect.value;

        if (categoria === 'Ropa' || categoria === 'Lencería') {
            // Habilitar talla, deshabilitar fechas
            tallaInput.disabled = false;
            tallaInput.parentElement.style.opacity = '';
            fechaFabricacionInput.disabled = true;
            fechaFabricacionInput.value = '';
            fechaFabricacionInput.parentElement.style.opacity = '0.5';
            fechaCaducidadInput.disabled = true;
            fechaCaducidadInput.value = '';
            fechaCaducidadInput.parentElement.style.opacity = '0.5';
        } else if (categoria === 'Cosmetico') {
            // Habilitar fechas, deshabilitar talla
            tallaInput.disabled = true;
            tallaInput.value = '';
            tallaInput.parentElement.style.opacity = '0.5';
            fechaFabricacionInput.disabled = false;
            fechaFabricacionInput.parentElement.style.opacity = '';
            fechaCaducidadInput.disabled = false;
            fechaCaducidadInput.parentElement.style.opacity = '';
        } else if (categoria === 'Accesorios') {
            // Deshabilitar todo
            tallaInput.disabled = true;
            tallaInput.value = '';
            tallaInput.parentElement.style.opacity = '0.5';
            fechaFabricacionInput.disabled = true;
            fechaFabricacionInput.value = '';
            fechaFabricacionInput.parentElement.style.opacity = '0.5';
            fechaCaducidadInput.disabled = true;
            fechaCaducidadInput.value = '';
            fechaCaducidadInput.parentElement.style.opacity = '0.5';
        } else {
            // Por defecto, habilitar todo
            tallaInput.disabled = false;
            tallaInput.parentElement.style.opacity = '';
            fechaFabricacionInput.disabled = false;
            fechaFabricacionInput.parentElement.style.opacity = '';
            fechaCaducidadInput.disabled = false;
            fechaCaducidadInput.parentElement.style.opacity = '';
        }
    }

    if (categoriaSelect && tallaInput && fechaFabricacionInput && fechaCaducidadInput) {
        categoriaSelect.addEventListener('change', actualizarCamposPorCategoria);
        // Inicializar al cargar
        actualizarCamposPorCategoria();
    }
});
