const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());


app.get('/usuario', (req, res) => res.json('get usuario'));
//app.post('/usuario', (req, res) => res.json('post usuario'));
//app.put('/usuario', (req, res) => res.json('put usuario'));
app.delete('/usuario', (req, res) => res.json('delete usuario'));


app.put('/usuario/:ident', (req, res) => {
    let id = req.params.ident;
    res.json({
        id
    })
});

app.post('/usuario', (req, res) => {
    let body = req.body;

    if (body.nombre === undefined) {

        res.status(400).json({
            ok: false,
            mensaje: 'Elnombre es obligatorio'
        });

    } else {
        res.json({
            body
        });
    }
});

app.listen(3000, () => {
    console.log('Escuchando puerto: ', 3000);
})