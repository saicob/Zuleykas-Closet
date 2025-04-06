const proveedorSelect = document.getElementById('proveedor_local1');
const marcaSelect = document.getElementById('marca_local1');

// Función para llenar un select
const llenarSelect = async (url, selectElement, textKey, valueKey) => {
    try {
        const res = await fetch(url);
        const data = await res.json();

        selectElement.innerHTML = '<option value="">-- Seleccione --</option>';
        data.forEach(item => {
            const option = document.createElement('option');
            option.textContent = item[textKey];
            option.value = item[valueKey];
            selectElement.appendChild(option);
        });
    } catch (err) {
        console.error('Error llenando el select desde', url, err);
    }
};

// Llenar los select al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    llenarSelect('/proveedor', proveedorSelect, 'nombre', 'id'); // asegúrate de que 'id' sea la key correcta
    llenarSelect('/marcas', marcaSelect, 'nombre', 'id'); // lo mismo aquí
});
