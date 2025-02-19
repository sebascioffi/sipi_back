import mongoose from 'mongoose';

// Seleccionar la base de datos específica 'movietracker'
const db = mongoose.connection.useDb('movietracker');

const GrupoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        unique: true,
    },
});

// Crear el modelo en la base de datos 'movietracker'
export default db.model('Grupo', GrupoSchema);
