const express = require('express');
const app = express();


// Importaciín de rutas
app.use(require('./usuario'));
app.use(require('./login'));
app.use(require('./categoria'));
app.use(require('./producto.js'));

module.exports = app;