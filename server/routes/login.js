const express = require('express');

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');


const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);


const Usuario = require('../models/usuario');


const app = express();


app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {

            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o contraseña incorrectos'
                }
            });

        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (contraseña) incorrectos'
                }
            });

        }

        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });
    });



});

// Configuraciones de Google
async function verify(token) {

    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();



    console.log(payload.name);
    console.log(payload.email);
    console.log(payload.picture);


    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}



app.post('/google', async(req, res) => {

    let token = req.body.idtoken;

    let googleUser = await verify(token)
        .catch((e) => {
            return res.status(403).json({
                ok: false,
                err: e
            });
        });


    // Validar el usuario
    // ------------------
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        // Si se prodice error en el acceso a bbdd
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Si el usuario existe
        if (usuarioDB) {
            // Comprobar si se ha autentificado vía google

            // Si Se ha autenticado por vía normal (no-google)
            if (usuario.db.google === false) {

                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe usuar su autentificación normal'
                    }
                });

            } else { // Se ha autenticado por google

                // Renovamos el token
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                // retormamos usuario y token
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });

            }

        } else { // Si el usuario no existe

            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

            });
        }

    });

});

module.exports = app;