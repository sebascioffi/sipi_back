import mongoose from 'mongoose';

// Seleccionar la base de datos específica 'movietracker'
const db = mongoose.connection.useDb('movietracker');

const PlataformausuarioSchema = new mongoose.Schema({
    nom_usuario: { type: String, required: true },
    plataforma_id: { type: String, required: true },
});

// Crear el modelo en la base de datos 'movietracker'
export default db.model('Plataformausuario', PlataformausuarioSchema);
