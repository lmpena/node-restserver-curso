// ==============================
// Puerto
// ==============================
process.env.PORT = process.env.PORT || 3000;

// ==============================
// Entorno
// ==============================
// Esta variable la crea Heroku, si no existe, estamos en desarrollo
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ==============================
// Base de datos
// ==============================
let urlDB;
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = 'mongodb+srv://user-cafe:cafe123456@cluster0.fndyx.mongodb.net/cafe';
}
// forzar la prueba en bbdd remota
//urlDB = 'mongodb+srv://user-cafe:cafe123456@cluster0.fndyx.mongodb.net/cafe';

process.env.URLDB = urlDB;