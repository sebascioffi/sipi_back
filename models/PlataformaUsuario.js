import mongoose from 'mongoose';

const plataformaUsuarioSchema = new mongoose.Schema({
    nom_usuario: { type: String, required: true },
    plataforma_id: { type: String, required: true },
});

// Especificamos la colección como 'plataformausuarios'
const PlataformaUsuario = mongoose.model('PlataformaUsuario', plataformaUsuarioSchema, 'plataformausuarios');

export default PlataformaUsuario;
