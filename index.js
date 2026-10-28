
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

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

// CONSULTAR TODOS LOS EMPLEADOS
app.get('/api/empleados', async (req, res) => {
  try {
    const empleados = await Empleado.find();
    res.json(empleados);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// CONSULTAR EMPLEADO POR CLAVE
app.get('/api/empleados/:clave', async (req, res) => {
  try {
    const clave = Number(req.params.clave);

    if (!Number.isInteger(clave) || clave < 1) {
      return res.status(400).json({
        mensaje: 'La clave debe ser un entero positivo'
      });
    }

    const empleado = await Empleado.findOne({ clave });

    if (!empleado) {
      return res.status(404).json({
        mensaje: 'Empleado no encontrado'
      });
    }

    res.json(empleado);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// REGISTRAR EMPLEADO
app.post('/api/empleados', async (req, res) => {
  try {
    const clave = req.body.clave;

    if (!Number.isInteger(clave) || clave < 1) {
      return res.status(400).json({
        mensaje: 'La clave debe ser un número entero positivo'
      });
    }

    const nuevoEmpleado = new Empleado(req.body);
    const guardado = await nuevoEmpleado.save();

    res.status(201).json(guardado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
});

// ACTUALIZAR EMPLEADO POR CLAVE
app.put('/api/empleados/:clave', async (req, res) => {
  try {
    const clave = Number(req.params.clave);

    if (!Number.isInteger(clave) || clave < 1) {
      return res.status(400).json({
        mensaje: 'La clave debe ser un entero positivo'
      });
    }

    const datos = { ...req.body };
    delete datos._id;
    delete datos.__v;
    delete datos.clave;

    const actualizado = await Empleado.findOneAndUpdate(
      { clave },
      { $set: datos },
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

// ELIMINAR EMPLEADO POR CLAVE
app.delete('/api/empleados/:clave', async (req, res) => {
  try {
    const clave = Number(req.params.clave);

    if (!Number.isInteger(clave) || clave < 1) {
      return res.status(400).json({
        mensaje: 'La clave debe ser un entero positivo'
      });
    }

    const eliminado = await Empleado.findOneAndDelete({ clave });

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
    res.status(500).json({ mensaje: error.message });
  }
});

// CONEXIÓN A MONGODB ATLAS
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
