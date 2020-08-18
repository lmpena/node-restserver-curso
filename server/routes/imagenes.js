const express = require('express');

const fs = require('fs');
const path = require('path');

const { verificaTokenImg } = require('../middlewares/autenticacion');

const app = express();

app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {

    let tipo = req.params.tipo;
    let img = req.params.img;

    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ img }`);

    // Si existe el path y la imagen la devolvemos
    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        let noImagepath = path.resolve(__dirname, '../assets/no-image.jpg');
        // Si no encontramos una imagen o archivo cargamos uno estático por defecto
        // Esta función lee el ContenType y devuelve el tipo que corresponda
        res.sendFile(noImagepath);
    }



});

module.exports = app;