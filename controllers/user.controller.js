import pool from '../db.js';
import bcrypt from 'bcrypt';

export const crearUsuario = async (req, res) => {
    try {
        const { nom_usuario, contraseña, preguntaSeg, respuestaSeg, plataformas_usuario } = req.body;

        // Verificar que todos los datos necesarios estén presentes
        if (!nom_usuario || !contraseña || !preguntaSeg || !respuestaSeg || !plataformas_usuario || !Array.isArray(plataformas_usuario)) {
            return res.status(400).json({ error: 'Faltan datos necesarios o formato incorrecto' });
        }

        // Hashear la contraseña antes de guardarla en la base de datos
        const saltRounds = 10; // El número de rondas de salt, entre más alto, más seguro, pero más lento
        const hashedPassword = await bcrypt.hash(contraseña, saltRounds);

        // Obtener una conexión de la pool
        const connection = await pool.promise().getConnection();
        await connection.beginTransaction();

        try {
            // Insertar el nuevo usuario en la tabla usuarios
            const insertUsuarioQuery = 'INSERT INTO usuarios (nom_usuario, contraseña, preguntaSeg, respuestaSeg) VALUES (?, ?, ?, ?)';
            const usuarioInsertResult = await connection.execute(insertUsuarioQuery, [nom_usuario, hashedPassword, preguntaSeg, respuestaSeg]);

            // Insertar las plataformas asociadas en usuario_plataformas
            const insertPlataformasQuery = 'INSERT INTO usuario_plataformas (nom_usuario, plataforma_id) VALUES (?, ?)';
            for (const plataforma_id of plataformas_usuario) {
                await connection.execute(insertPlataformasQuery, [nom_usuario, plataforma_id]);
            }

            // Confirmar la transacción si todo ha ido bien
            await connection.commit();
            connection.release();

            res.status(201).json({ message: 'Usuario creado exitosamente'});
        } catch (error) {
            // Revertir la transacción si ocurre algún error
            await connection.rollback();
            connection.release();

            console.error('Error creando usuario:', error);
            res.status(500).json({ error: 'Error creando usuario' });
        }
    } catch (error) {
        console.error('Error de base de datos:', error);
        res.status(500).json({ error: 'Error de base de datos' });
    }
};


export const iniciarSesion = async (req, res) => {
    const { nom_usuario, contraseña } = req.body;

    if (!nom_usuario || !contraseña) {
        return res.status(400).json({ error: 'Faltan nombre de usuario o contraseña en el cuerpo de la solicitud' });
    }

    try {
        const connection = await pool.promise().getConnection();
        
        // Consulta para obtener el hash de la contraseña del usuario
        const query = 'SELECT contraseña FROM usuarios WHERE nom_usuario = ?';
        const [rows] = await connection.execute(query, [nom_usuario]);

        connection.release(); // Liberar la conexión de la pool

        if (rows.length === 1) {
          const hashedPassword = rows[0].contraseña;

          // Comparar la contraseña ingresada con el hash almacenado
          const isMatch = await bcrypt.compare(contraseña, hashedPassword);

          if (isMatch) {
              // Contraseña correcta
              res.status(200).json({ message: 'Inicio de sesión exitoso' });
          } else {
              // Contraseña incorrecta
              res.status(401).json({ error: 'Nombre de usuario o contraseña incorrectos' });
          }
      } else {
          // Usuario no encontrado
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
      return res.status(400).json({ error: 'El nombre de usuario es requerido' });
    }
  
    try {
      const connection = await pool.promise().getConnection();
  
      const query = 'SELECT plataforma_id FROM usuario_plataformas WHERE nom_usuario = ?';
      const [rows] = await connection.execute(query, [nom_usuario]);
  
      connection.release();
  
      if (rows.length === 0) {
        return res.status(404).json({ message: 'No se encontraron plataformas para este usuario' });
      }
  
      const plataformaIds = rows.map(row => row.plataforma_id);
      res.status(200).json({ plataformas: plataformaIds });
    } catch (error) {
      console.error('Error obteniendo plataformas del usuario:', error);
      res.status(500).json({ error: 'Error al obtener las plataformas del usuario' });
    }
  };

  export const agregarFavorita = async (req, res) => {
    const { nom_usuario, pelicula_id } = req.body;
  
    // Validar que los campos necesarios estén presentes
    if (!nom_usuario || !pelicula_id) {
      return res.status(400).json({ error: 'El nombre de usuario y el ID de la película son requeridos' });
    }
  
    try {
      // Obtener una conexión de la pool
      const connection = await pool.promise().getConnection();
  
      // Consulta para insertar la película favorita
      const query = 'INSERT INTO usuario_favoritas (nom_usuario, pelicula_id) VALUES (?, ?)';
      await connection.execute(query, [nom_usuario, pelicula_id]);
  
      // Liberar la conexión
      connection.release();
  
      // Enviar una respuesta exitosa
      res.status(201).json({ message: 'Película favorita agregada exitosamente' });
    } catch (error) {
      console.error('Error agregando película favorita:', error);
      res.status(500).json({ error: 'Error al agregar la película favorita' });
    }
  };

  export const agregarPendiente = async (req, res) => {
    const { nom_usuario, pelicula_id } = req.body;
  
    // Validar que los campos necesarios estén presentes
    if (!nom_usuario || !pelicula_id) {
      return res.status(400).json({ error: 'El nombre de usuario y el ID de la película son requeridos' });
    }
  
    try {
      // Obtener una conexión de la pool
      const connection = await pool.promise().getConnection();
  
      // Consulta para insertar la película favorita
      const query = 'INSERT INTO usuario_pendientes (nom_usuario, pelicula_id) VALUES (?, ?)';
      await connection.execute(query, [nom_usuario, pelicula_id]);
  
      // Liberar la conexión
      connection.release();
  
      // Enviar una respuesta exitosa
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
      // Obtener una conexión de la pool
      const connection = await pool.promise().getConnection();
  
      // Consulta para obtener los IDs de las películas favoritas
      const query = 'SELECT pelicula_id FROM usuario_favoritas WHERE nom_usuario = ?';
      const [rows] = await connection.execute(query, [nom_usuario]);
  
      // Liberar la conexión
      connection.release();
  
      // Si no se encuentran películas favoritas, devolver un mensaje adecuado
      if (rows.length === 0) {
        return res.status(404).json({ message: 'No se encontraron películas favoritas para este usuario' });
      }
  
      // Extraer los IDs de las películas favoritas
      const peliculaIds = rows.map(row => row.pelicula_id);
  
      // Enviar la lista de IDs de películas favoritas como respuesta JSON
      res.status(200).json({ favoritas: peliculaIds });
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
      // Obtener una conexión de la pool
      const connection = await pool.promise().getConnection();
  
      // Consulta para obtener los IDs de las películas favoritas
      const query = 'SELECT pelicula_id FROM usuario_pendientes WHERE nom_usuario = ?';
      const [rows] = await connection.execute(query, [nom_usuario]);
  
      // Liberar la conexión
      connection.release();
  
      // Si no se encuentran películas favoritas, devolver un mensaje adecuado
      if (rows.length === 0) {
        return res.status(404).json({ message: 'No se encontraron películas pendientes para este usuario' });
      }
  
      // Extraer los IDs de las películas favoritas
      const peliculaIds = rows.map(row => row.pelicula_id);
  
      // Enviar la lista de IDs de películas favoritas como respuesta JSON
      res.status(200).json({ pendientes: peliculaIds });
    } catch (error) {
      console.error('Error obteniendo películas pendientes:', error);
      res.status(500).json({ error: 'Error al obtener las películas pendientes' });
    }
  };

  export const obtenerUltimaFavorita = async (req, res) => {
    const { nom_usuario } = req.params;

    try {
      const connection = await pool.promise().getConnection();

        
      const query = 'SELECT pelicula_id FROM usuario_favoritas WHERE nom_usuario = ? ORDER BY id DESC LIMIT 1'
      const [rows] = await connection.execute(query, [nom_usuario]);

      connection.release();

        if (rows.length === 0) {
            res.status(404).json({ message: 'No se encontraron películas favoritas para este usuario.' });
        } else {
            res.json({ ultimaFavorita: rows[0].pelicula_id });
        }
    } catch (error) {
        console.error('Error obteniendo la última película favorita:', error);
        res.status(500).json({ message: 'Error obteniendo la última película favorita.' });
    }
};

export const eliminarFavorita = async (req, res) => {
  const { pelicula_id } = req.params;

  try {
    const connection = await pool.promise().getConnection();
    
    const query = 'DELETE FROM usuario_favoritas WHERE pelicula_id = ?';
    const [result] = await connection.execute(query, [pelicula_id]);

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Película no encontrada' });
    }

    res.status(200).json({ message: 'Película eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando la película favorita:', error);
    res.status(500).json({ message: 'Error eliminando la película favorita' });
  }
};

export const eliminarPendiente = async (req, res) => {
  const { pelicula_id } = req.params;

  try {
    const connection = await pool.promise().getConnection();
    
    const query = 'DELETE FROM usuario_pendientes WHERE pelicula_id = ?';
    const [result] = await connection.execute(query, [pelicula_id]);

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Película no encontrada' });
    }

    res.status(200).json({ message: 'Película eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando la película pendiente:', error);
    res.status(500).json({ message: 'Error eliminando la película pendiente' });
  }
};