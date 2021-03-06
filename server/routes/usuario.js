const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');

const Usuario = require('../models/usuario');
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const app = express();

//app.get('/usuario', (req, res) => res.json('get usuario'));
//app.post('/usuario', (req, res) => res.json('post usuario'));
//app.put('/usuario', (req, res) => res.json('put usuario'));
//app.delete('/usuario', (req, res) => res.json('delete usuario'));

app.get('/usuario', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    limite = req.query.limite || 0;
    limite = Number(limite);

    // filtros
    let estadoActivo = { estado: true };
    let estadoInActivo = { estado: false };

    //Usuario.find({}, 'nombre email role estado google img')
    Usuario.find(estadoActivo, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            //Usuario.count({}, (err, conteo) => {
            Usuario.count(estadoActivo, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                });
            })
        });


});


app.put('/usuario/:ident', [verificaToken, verificaAdmin_Role], function(req, res) {
    let id = req.params.ident;

    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // No ponemos status pq aquí es correcto
        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });

});

app.post('/usuario', [verificaToken, verificaAdmin_Role], function(req, res) {
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // No ponemos status pq aquí es correcto
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

});

app.delete('/usuario/:ident', [verificaToken, verificaAdmin_Role], function(req, res) {
    let id = req.params.ident;
    let cambiaEstado = {
        estado: false
    }

    // Borrado físico
    //Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    // Borrado lógico
    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (usuarioBorrado === null) {
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });

    });

});

module.exports = app;