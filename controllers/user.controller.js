import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Usuario from '../models/Usuario.js';
import PlataformaUsuario from '../models/PlataformaUsuario.js';

export const crearUsuario = async (req, res) => {
  const session = await mongoose.startSession(); // Iniciar sesión para transacción
  session.startTransaction();

  try {
    const { nom_usuario, contraseña, preguntaSeg, respuestaSeg, plataformas_usuario } = req.body;

    // Verificar que todos los datos necesarios estén presentes
    if (!nom_usuario || !contraseña || !preguntaSeg || !respuestaSeg || !plataformas_usuario || !Array.isArray(plataformas_usuario)) {
      return res.status(400).json({ error: 'Faltan datos necesarios o formato incorrecto' });
    }

    // Hashear la contraseña antes de guardarla en la base de datos
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(contraseña, saltRounds);

    // Crear el usuario en la colección "usuarios"
    const nuevoUsuario = new Usuario({
      nom_usuario,
      contraseña: hashedPassword,
      preguntaSeg,
      respuestaSeg,
    });

    await nuevoUsuario.save({ session }); // Guardar con la sesión activa

    // Guardar las plataformas asociadas
    const plataformas = plataformas_usuario.map(plataforma_id => ({
      nom_usuario,
      plataforma_id
    }));

    await PlataformaUsuario.insertMany(plataformas, { session });

    // Confirmar la transacción
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: 'Usuario creado exitosamente' });
  } catch (error) {
    await session.abortTransaction(); // Revertir la transacción en caso de error
    session.endSession();

    console.error('Error creando usuario:', error);
    res.status(500).json({ error: 'Error creando usuario' });
  }
};

export const iniciarSesion = async (req, res) => {
  const { nom_usuario, contraseña } = req.body;

  if (!nom_usuario || !contraseña) {
    return res.status(400).json({ error: 'Faltan nombre de usuario o contraseña en el cuerpo de la solicitud' });
  }

  try {
    // Buscar el usuario en la base de datos por su nombre
    const usuario = await Usuario.findOne({ nom_usuario });

    if (!usuario) {
      return res.status(401).json({ error: 'Nombre de usuario o contraseña incorrectos' });
    }

    // Comparar la contraseña ingresada con el hash almacenado
    const isMatch = await bcrypt.compare(contraseña, usuario.contraseña);

    if (isMatch) {
      // Contraseña correcta
      res.status(200).json({ message: 'Inicio de sesión exitoso' });
    } else {
      // Contraseña incorrecta
      res.status(401).json({ error: 'Nombre de usuario o contraseña incorrectos' });
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

export const plataformasUsuario = async (req, res) => {
  const { nom_usuario } = req.params;

  if (!nom_usuario) {
    return res.status(400).json({ error: "El nombre de usuario es requerido" });
  }

  try {
    // Buscar todas las entradas que coincidan con el usuario en la colección 'plataformausuarios'
    const plataformas = await PlataformaUsuario.find({ nom_usuario }).select("plataforma_id");

    // Si no se encontraron plataformas, devolvemos un error 404
    if (!plataformas || plataformas.length === 0) {
      return res.status(404).json({ message: "No se encontraron plataformas para este usuario" });
    }

    // Extraer solo los valores de 'plataforma_id' y devolverlos
    const plataformaIds = plataformas.map((item) => item.plataforma_id);

    // Devolver la respuesta con los ids de las plataformas
    res.status(200).json({ plataformas: plataformaIds });
  } catch (error) {
    console.error("Error obteniendo plataformas del usuario:", error);
    res.status(500).json({ error: "Error al obtener las plataformas del usuario" });
  }
};

export const agregarFavorita = async (req, res) => {
  const { nom_usuario, pelicula_id } = req.body;

  if (!nom_usuario || !pelicula_id) {
    return res.status(400).json({ error: 'El nombre de usuario y el ID de la película son requeridos' });
  }

  try {
    // Buscar al usuario en la base de datos
    const usuario = await Usuario.findOne({ nom_usuario });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar si la película ya está en la lista de favoritas
    if (usuario.favoritas.includes(pelicula_id)) {
      return res.status(400).json({ error: 'La película ya está en la lista de favoritas' });
    }

    // Agregar la película a la lista de favoritas
    usuario.favoritas.push(pelicula_id);
    await usuario.save();

    res.status(201).json({ message: 'Película favorita agregada exitosamente' });
  } catch (error) {
    console.error('Error agregando película favorita:', error);
    res.status(500).json({ error: 'Error al agregar la película favorita' });
  }
};

export const agregarPendiente = async (req, res) => {
  const { nom_usuario, pelicula_id } = req.body;

  if (!nom_usuario || !pelicula_id) {
    return res.status(400).json({ error: 'El nombre de usuario y el ID de la película son requeridos' });
  }

  try {
    // Buscar al usuario en la base de datos
    const usuario = await Usuario.findOne({ nom_usuario });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar si la película ya está en la lista de pendientes
    if (usuario.pendientes.includes(pelicula_id)) {
      return res.status(400).json({ error: 'La película ya está en la lista de pendientes' });
    }

    // Agregar la película a la lista de pendientes
    usuario.pendientes.push(pelicula_id);
    await usuario.save();

    res.status(201).json({ message: 'Película pendiente agregada exitosamente' });
  } catch (error) {
    console.error('Error agregando película pendiente:', error);
    res.status(500).json({ error: 'Error al agregar la película pendiente' });
  }
};

export const obtenerFavoritas = async (req, res) => {
  const { nom_usuario } = req.params;

  // Validar que el nom_usuario esté presente
  if (!nom_usuario) {
    return res.status(400).json({ error: 'El nombre de usuario es requerido' });
  }

  try {
    // Buscar al usuario en la base de datos
    const usuario = await Usuario.findOne({ nom_usuario });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Obtener las películas favoritas del usuario
    const peliculasFavoritas = usuario.favoritas;

    // Si no se encuentran películas favoritas, devolver un mensaje adecuado
    if (peliculasFavoritas.length === 0) {
      return res.status(404).json({ message: 'No se encontraron películas favoritas para este usuario' });
    }

    // Enviar la lista de IDs de películas favoritas como respuesta JSON
    res.status(200).json({ favoritas: peliculasFavoritas });
  } catch (error) {
    console.error('Error obteniendo películas favoritas:', error);
    res.status(500).json({ error: 'Error al obtener las películas favoritas' });
  }
};

export const obtenerPendientes = async (req, res) => {
  const { nom_usuario } = req.params;

  // Validar que el nom_usuario esté presente
  if (!nom_usuario) {
    return res.status(400).json({ error: 'El nombre de usuario es requerido' });
  }

  try {
    // Buscar al usuario en la base de datos
    const usuario = await Usuario.findOne({ nom_usuario });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Obtener las películas pendientes del usuario
    const peliculasPendientes = usuario.pendientes;

    // Si no se encuentran películas pendientes, devolver un mensaje adecuado
    if (peliculasPendientes.length === 0) {
      return res.status(404).json({ message: 'No se encontraron películas pendientes para este usuario' });
    }

    // Enviar la lista de IDs de películas pendientes como respuesta JSON
    res.status(200).json({ pendientes: peliculasPendientes });
  } catch (error) {
    console.error('Error obteniendo películas pendientes:', error);
    res.status(500).json({ error: 'Error al obtener las películas pendientes' });
  }
};

export const obtenerUltimaFavorita = async (req, res) => {
  const { nom_usuario } = req.params;

  try {
    // Buscar al usuario en la base de datos
    const usuario = await Usuario.findOne({ nom_usuario });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Obtener la última película favorita (última en el array)
    const ultimaFavorita = usuario.favoritas[usuario.favoritas.length - 1];

    if (!ultimaFavorita) {
      return res.status(404).json({ message: 'No se encontraron películas favoritas para este usuario.' });
    }

    // Enviar la última película favorita como respuesta
    res.json({ ultimaFavorita });
  } catch (error) {
    console.error('Error obteniendo la última película favorita:', error);
    res.status(500).json({ message: 'Error obteniendo la última película favorita.' });
  }
};

export const eliminarFavorita = async (req, res) => {
  const { pelicula_id } = req.params;

  try {
    // Buscar al usuario en la base de datos
    const usuario = await Usuario.findOne({ 'favoritas': pelicula_id });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado o la película no está en las favoritas' });
    }

    // Eliminar la película de las favoritas
    const index = usuario.favoritas.indexOf(pelicula_id);
    if (index === -1) {
      return res.status(404).json({ message: 'Película no encontrada en las favoritas' });
    }

    // Eliminar la película del array
    usuario.favoritas.splice(index, 1);

    // Guardar los cambios en la base de datos
    await usuario.save();

    res.status(200).json({ message: 'Película eliminada exitosamente de las favoritas' });
  } catch (error) {
    console.error('Error eliminando la película favorita:', error);
    res.status(500).json({ message: 'Error eliminando la película favorita' });
  }
};

export const eliminarPendiente = async (req, res) => {
  const { pelicula_id } = req.params;

  try {
    // Buscar al usuario que tiene la película pendiente
    const usuario = await Usuario.findOne({ 'pendientes': pelicula_id });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado o la película no está en los pendientes' });
    }

    // Eliminar la película de los pendientes
    const index = usuario.pendientes.indexOf(pelicula_id);
    if (index === -1) {
      return res.status(404).json({ message: 'Película no encontrada en los pendientes' });
    }

    // Eliminar la película del array de pendientes
    usuario.pendientes.splice(index, 1);

    // Guardar los cambios en la base de datos
    await usuario.save();

    res.status(200).json({ message: 'Película eliminada exitosamente de los pendientes' });
  } catch (error) {
    console.error('Error eliminando la película pendiente:', error);
    res.status(500).json({ message: 'Error eliminando la película pendiente' });
  }
};