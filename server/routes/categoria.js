const express = require('express');

const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const app = express();

const Categoria = require('../models/categoria');




// ===========================
// Mostar todas las categorías
// ===========================
app.get('/categoria', (req, res) => {

    // Paginación
    let desde = req.query.desde || 0;
    desde = Number(desde);

    limite = req.query.limite || 0;
    limite = Number(limite);

    Categoria.find({})
        .populate('usuario', 'nombre email')
        .sort('descripcion')
        //.skip(desde)
        //.limit(limite)
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            Categoria.countDocuments((err, conteo) => {
                res.json({
                    ok: true,
                    categorias,
                    cuantos: conteo
                });
            })
        });


});

// ===========================
// Mostar una categoría por ID
// ===========================
app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;


    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no es correcto'
                }
            });
        }
        // No ponemos status pq aquí es correcto
        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });

});


// ===========================
// Crear nueva categoría
// ===========================
app.post('/categoria', verificaToken, (req, res) => {

    // regresa la nueva categoría
    // req.usuario._id (persona que lo creó)
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        // No ponemos status pq aquí es correcto
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });


});


// =====================================
// Actualizar el nombre de una categoría
// =====================================
app.put('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    };

    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        // No ponemos status pq aquí es correcto
        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });

});


// ===========================
// Eliminar una categoría
// ===========================
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {

    // solo un administrador puede borrar categorías
    // Categoria.findByIdAndRemove
    let id = req.params.id;
    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaBorrada) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }

        // No ponemos status pq aquí es correcto
        res.json({
            ok: true,
            categoria: categoriaBorrada
        });
    });
});



module.exports = app;