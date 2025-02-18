import Usuario from '../models/Usuario.js';

export const crearGrupo = async (req, res) => {
    const { nom_usuario, nombre_grupo } = req.body;

    try {
        // Verificar si ya existe un grupo con el mismo nombre
        const grupoExistente = await Grupo.findOne({ nombre: nombre_grupo });

        if (grupoExistente) {
            return res.status(400).json({ message: 'El nombre del grupo ya existe' });
        }

        // Crear el nuevo grupo en la colección 'grupos'
        const nuevoGrupo = new Grupo({ nombre: nombre_grupo });
        await nuevoGrupo.save();

        // Buscar al usuario por nombre
        const usuario = await Usuario.findOne({ nombre_usuario: nom_usuario });
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Insertar el grupo en el array de grupos del usuario
        usuario.grupos.push({ nombre_grupo, grupo_id: nuevoGrupo._id });
        await usuario.save();

        return res.status(201).json({ message: 'Grupo creado con éxito' });
    } catch (error) {
        console.error('Error al crear el grupo:', error);
        return res.status(500).json({ message: 'Hubo un problema al crear el grupo' });
    }
};

export const unirseAGrupo = async (req, res) => {
    const { nom_usuario, nombre_grupo } = req.params;

    try {
        // Verificar si existe el grupo con el nombre_grupo dado
        const grupo = await Grupo.findOne({ nombre: nombre_grupo });

        if (!grupo) {
            return res.status(404).json({ message: 'Grupo no existe' });
        }

        // Verificar si el usuario ya está en el grupo
        const usuario = await Usuario.findOne({ nombre_usuario: nom_usuario });

        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar si el usuario ya está en el grupo
        const usuarioEnGrupo = usuario.grupos.find(grupo => grupo.nombre_grupo === nombre_grupo);

        if (usuarioEnGrupo) {
            return res.status(400).json({ message: 'Ya te encuentras en el grupo' });
        }

        // Si no está en el grupo, agregarlo a usuario.grupos
        usuario.grupos.push({ nombre_grupo, grupo_id: grupo._id });
        await usuario.save();

        return res.status(200).json({ message: 'Te has unido al grupo exitosamente' });
    } catch (error) {
        console.error('Error al unirse al grupo:', error);
        return res.status(500).json({ message: 'Hubo un problema al unirse al grupo' });
    }
};

export const obtenerGruposUsuario = async (req, res) => {
    const { nom_usuario } = req.params;

    try {
        // Obtener el usuario por su nombre de usuario
        const usuario = await Usuario.findOne({ nombre_usuario: nom_usuario }).populate('grupos.grupo_id', 'nombre');

        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Extraer los nombres de grupo de los resultados
        const grupos = usuario.grupos.map(grupo => grupo.nombre_grupo);

        return res.status(200).json({ grupos });
    } catch (error) {
        console.error('Error al obtener los grupos del usuario:', error);
        return res.status(500).json({ message: 'Hubo un problema al obtener los grupos del usuario' });
    }
};

export const obtenerUsuariosGrupo = async (req, res) => {
    const { nombre_grupo } = req.params;

    try {
        // Consultar el grupo por nombre
        const grupo = await Grupo.findOne({ nombre: nombre_grupo });

        if (!grupo) {
            return res.status(404).json({ message: 'Grupo no encontrado' });
        }

        // Obtener todos los usuarios que pertenecen a este grupo
        const usuarios = await Usuario.find({ 'grupos.nombre_grupo': nombre_grupo }).select('nombre_usuario');

        // Extraer los nombres de usuario de los resultados
        const nombresUsuarios = usuarios.map(usuario => usuario.nombre_usuario);

        return res.status(200).json({ usuarios: nombresUsuarios });
    } catch (error) {
        console.error('Error al obtener los usuarios del grupo:', error);
        return res.status(500).json({ message: 'Hubo un problema al obtener los usuarios del grupo' });
    }
};