import mongoose from 'mongoose';

// Seleccionar la base de datos específica 'movietracker'
const db = mongoose.connection.useDb('movietracker');

const PlataformaUsuarioSchema = new mongoose.Schema({
    nom_usuario: { type: String, required: true },
    plataforma_id: { type: String, required: true }
});

export default db.model('PlataformaUsuario', PlataformaUsuarioSchema);