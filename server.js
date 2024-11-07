const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const app = express();
const PORT = 3000;

app.use(express.json()); // Necesario para manejar JSON
app.use(express.static('public')); // Servir archivos estáticos

// Ruta para la página principal
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Ruta para obtener todos los patitos
app.get('/patitos', (req, res) => {
    db.query('SELECT * FROM patitos WHERE borrado = false', (err, results) => {
        if (err) {
            return res.status(500).send('Error al obtener los patitos');
        }
        res.json(results);
    });
});

// Ruta para agregar un patito
app.post('/patitos', (req, res) => {
    const { color, tamano, cantidad } = req.body;

    db.query('SELECT * FROM patitos WHERE color = ? AND tamano = ?', [color, tamano], (err, results) => {
        if (err) {
            return res.status(500).send('Error al verificar patito existente');
        }

        if (results.length > 0) {
            // Si ya existe un patito, actualizar la cantidad
            const patitoExistente = results[0];
            const nuevaCantidad = patitoExistente.cantidad + parseInt(cantidad);

            db.query('UPDATE patitos SET cantidad = ? WHERE id = ?', [nuevaCantidad, patitoExistente.id], (err) => {
                if (err) {
                    return res.status(500).send('Error al actualizar patito existente');
                }
                res.status(200).send('Patito actualizado');
            });
        } else {
            // Si no existe, insertar un nuevo patito
            db.query('INSERT INTO patitos (color, tamano, cantidad) VALUES (?, ?, ?)', [color, tamano, cantidad], (err) => {
                if (err) {
                    return res.status(500).send('Error al agregar el patito');
                }
                res.status(201).send('Patito agregado');
            });
        }
    });
});

// Ruta para obtener un patito por ID
app.get('/patitos/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM patitos WHERE id = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).send('Error al obtener el patito');
        }
        if (results.length === 0) {
            return res.status(404).send('Patito no encontrado');
        }
        res.json(results[0]);
    });
});

// Ruta para actualizar un patito
app.put('/patitos/:id', (req, res) => {
    const { id } = req.params;
    const { cantidad } = req.body; // Solo se recibe la cantidad

    // Verificar si existe un patito con el mismo precio, color y tamaño
    db.query('SELECT * FROM patitos WHERE id = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).send('Error al verificar patito existente');
        }

        if (results.length > 0) {
            const patitoExistente = results[0];
            const nuevaCantidad = patitoExistente.cantidad + parseInt(cantidad); // Sumar cantidades

            db.query('UPDATE patitos SET cantidad = ? WHERE id = ?', [nuevaCantidad, patitoExistente.id], (err) => {
                if (err) {
                    return res.status(500).send('Error al actualizar el patito');
                }
                res.status(200).send('Patito actualizado');
            });
        } else {
            return res.status(404).send('Patito no encontrado');
        }
    });
});

// Ruta para obtener todos los patitos
app.get('/patitos', (req, res) => {
    db.query('SELECT * FROM patitos WHERE borrado = false', (err, results) => {
        if (err) {
            return res.status(500).send('Error al obtener los patitos');
        }
        res.json(results);
    });
});

// Ruta para eliminar un patito (borrado lógico)
app.delete('/patitos/:id', async (req, res) => {
    const { id } = req.params;
    await Patito.update({ borrado: true }, { where: { id } });
    res.sendStatus(204);
});


// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
