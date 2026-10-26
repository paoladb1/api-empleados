
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Conexión a MongoDB Atlas
// Modelo para la colección "Empleados"
const empleadoSchema = new mongoose.Schema({
  clave: { type: Number, required: true, unique: true },
  nombre: { type: String, required: true },
  direccion: { type: String, required: true },
  fechadenacimiento: { type: Date, required: true },
  sexo: { type: mongoose.Schema.Types.Mixed, required: true },
  tipodesangre: { type: String, required: true }
});

const Empleado = mongoose.model(
  'Empleado',
  empleadoSchema,
  'Empleados'
);

// GET: Obtener todos los empleados
app.get('/api/empleados', async (req, res) => {
  try {
    const empleados = await Empleado.find();
    res.json(empleados);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// GET: Obtener empleado por clave
app.get('/api/empleados/:clave', async (req, res) => {
  try {
    const empleado = await Empleado.findOne({
      clave: Number(req.params.clave)
    });

    if (!empleado) {
      return res.status(404).json({
        mensaje: 'Empleado no encontrado'
      });
    }

    res.json(empleado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
});

// POST: Insertar empleado desde Postman
app.post('/api/empleados', async (req, res) => {
  try {
    const nuevoEmpleado = new Empleado(req.body);
    const guardado = await nuevoEmpleado.save();
    res.status(201).json(guardado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
});

// PUT: Actualizar empleado por clave
app.put('/api/empleados/:clave', async (req, res) => {
  try {
    const actualizado = await Empleado.findOneAndUpdate(
      { clave: Number(req.params.clave) },
      req.body,
      { new: true, runValidators: true }
    );

    if (!actualizado) {
      return res.status(404).json({
        mensaje: 'Empleado no encontrado'
      });
    }

    res.json(actualizado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
});

// DELETE: Eliminar empleado por clave
app.delete('/api/empleados/:clave', async (req, res) => {
  try {
    const eliminado = await Empleado.findOneAndDelete({
      clave: Number(req.params.clave)
    });

    if (!eliminado) {
      return res.status(404).json({
        mensaje: 'Empleado no encontrado'
      });
    }

    res.json({
      mensaje: 'Empleado eliminado correctamente',
      empleado: eliminado
    });
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
});

// Iniciar servidor después de conectar a Atlas
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Conectado exitosamente a MongoDB Atlas');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Error de conexión:', error.message);
    process.exit(1);
  });
