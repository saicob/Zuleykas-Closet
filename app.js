const express = require('express');
const app = express();
const path = require('path');

// Configurar EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));

// Rutas
app.get('/', (req, res) => {
    res.render('index');
});

// ...otras rutas...

app.listen(3000, () => {
    console.log('Servidor iniciado en http://localhost:3000/VerProductos.html');
});



