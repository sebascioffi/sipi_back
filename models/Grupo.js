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

export default db.model('Grupo', GrupoSchema);
