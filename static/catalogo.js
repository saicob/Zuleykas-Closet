async function cargarCatalogo() {
    try {
        const res = await fetch('http://localhost:3000/api/productos');
        const productos = await res.json();

        const contenedor = document.querySelector('.catalogo-container');

        productos.forEach(prod => {
            const div = document.createElement('div');
            div.classList.add('producto');
            div.innerHTML = `
                <img src="${prod.imagen_url}" alt="${prod.nombre}">
                <h3>${prod.nombre}</h3>
                <p>Precio: C$ ${prod.precio}</p>
                <p>En Stock: ${prod.stock}</p>
            `;
        
            // Crear y agregar botón con evento
            const btn = document.createElement('button');
            btn.textContent = 'Agregar al carrito';
            btn.onclick = () => {
                if (!prod.nombre) {
                    console.error('El producto no tiene un nombre válido:', prod);
                    alert('Error: El producto no tiene un nombre válido.');
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
    }
}

window.addEventListener('DOMContentLoaded', cargarCatalogo);
