const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

// Para grabar en bbdd de usuario cargamos info del esquema
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

// Para usar filesystem
const fs = require('fs');

// Para llegar a rutas desde el archivo necesitamos crear paths
const path = require('path');


// default options
app.use(fileUpload());

app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No files were uploaded.'
            }
        });
    }

    // Valida tipo
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidos son: ' + tiposValidos.join(', ')
            }
        });

    }


    // Si llega un archivo va a caer en req.files
    let archivo = req.files.archivo;

    // Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpg'];

    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son: ' + extensionesValidas.join(', ')
            }
        });
    }

    // Cambiar el nombre del archivo
    // hay que procurar que sea único
    // Y adicional adjuntarle algo para hacerle único y prevenir el caché del navegador (considera que el contenido es el mismo)
    let nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;

    // Movemos el fichero al directorio que deseemos subirlo
    archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // En este punto dabemos que la imagen existe en el filesystem
        // Imagen cargada
        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }


    });

});


function imagenUsuario(id, res, nombreArchivo) {

    // Primero comprobar que existe el usuario
    Usuario.findById(id, (err, usuarioDB) => {

        if (err) {

            // Eliminamos la imagen del filesystem para que no se acumulen
            borraArchivo(usuarioDB.img, 'usuarios');

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }


        // Comprobar y eliminar que existe el fichero en el filesystem
        borraArchivo(usuarioDB.img, 'usuarios');


        usuarioDB.img = nombreArchivo;


        usuarioDB.save((err, usuarioGuardado) => {

            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })

        });


    })
}

function imagenProducto(id, res, nombreArchivo) {

    // Primero comprobar que existe el producto
    Producto.findById(id, (err, productoDB) => {

        if (err) {

            // Eliminamos la imagen del filesystem para que no se acumulen
            borraArchivo(productoDB.img, 'productos');

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Producto no existe'
                }
            });
        }


        // Comprobar y eliminar que existe el fichero en el filesystem
        borraArchivo(productoDB.img, 'productos');


        productoDB.img = nombreArchivo;


        productoDB.save((err, productoGuardado) => {

            res.json({
                ok: true,
                usuario: productoGuardado,
                img: nombreArchivo
            })

        });


    })

}

function borraArchivo(nombreImagen, tipo) {
    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ nombreImagen }`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;