import mongoose from 'mongoose';

// Seleccionar la base de datos específica 'movietracker'
const db = mongoose.connection.useDb('movietracker');

const UsuarioSchema = new mongoose.Schema({
    nom_usuario: { type: String, required: true, unique: true },
    contraseña: { type: String, required: true },
    preguntaSeg: { type: String, required: true },
    respuestaSeg: { type: String, required: true },
    grupos: [
        {
            nombre_grupo: String,
            grupo_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Grupo' },
        },
    ],
});

// Crear el modelo en la base de datos 'movietracker'
export default db.model('Usuario', UsuarioSchema);
