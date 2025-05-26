async function cargarCatalogo() {
    try {
        const res = await fetch('http://localhost:3000/api/productos');
        
        // Verifica si la respuesta es exitosa
        if (!res.ok) {
            throw new Error(`Error al cargar productos: ${res.statusText}`);
        }

        const productos = await res.json();

        // Verifica que los productos tienen la estructura esperada
        if (!Array.isArray(productos)) {
            throw new Error('La respuesta no es un arreglo de productos');
        }

        const contenedor = document.querySelector('.catalogo-container');
        contenedor.innerHTML = ''; // Limpiar el contenedor antes de agregar nuevos productos

        productos.forEach(prod => {
            // Validar que el producto tenga los datos necesarios
            if (!prod.nombre || !prod.precio || !prod.stock ) {
                console.error('Producto incompleto:', prod);
                return; // Saltar este producto si falta algún campo importante
            }

            // Crear contenedor para el producto
            const div = document.createElement('div');
            div.classList.add('producto');
            div.innerHTML = `
                <img src="${prod.imagen_url}" alt="${prod.nombre}">
                <h3>${prod.nombre}</h3>
                <p>Precio: C$ ${prod.precio}</p>
                <p>En Stock: ${prod.stock}</p>
            `;
        
            // Crear y agregar el botón para agregar al carrito
            const btn = document.createElement('button');
            btn.textContent = 'Agregar al carrito';
            btn.onclick = () => {
                if (!prod.nombre || !prod.precio || !prod.stock) {
                    alert('Error: Producto con datos incompletos.');
                    return;
                }

                agregarAlCarrito({
                    nombre: prod.nombre,
                    precio: prod.precio,
                    stock: prod.stock
                });
            };
            div.appendChild(btn);
        
            contenedor.appendChild(div);
        });
        
    } catch (err) {
        console.error('Error cargando productos:', err);
        alert('Ocurrió un error al cargar los productos. Por favor, inténtalo más tarde.');
    }
}

// No hay referencias a Local1, solo lógica de catálogo

window.addEventListener('DOMContentLoaded', cargarCatalogo);
