import { Router } from "express";
import { agregarFavorita, agregarPendiente, crearUsuario, eliminarFavorita, eliminarPendiente, iniciarSesion, obtenerFavoritas, obtenerPendientes, obtenerUltimaFavorita, plataformasUsuario } from "../controllers/user.controller.js";

const router = Router()

router.post("/", crearUsuario)
router.post("/login", iniciarSesion)
router.get("/plataformas/:nom_usuario", plataformasUsuario) //Obtener las plataformas preferidas del usuario.
router.post("/favorita", agregarFavorita) //Agregar favorita
router.post("/pendiente", agregarPendiente) //Agregar pendiente
router.get("/favoritas/:nom_usuario", obtenerFavoritas) //Obtener favoritas del usuario
router.get("/pendientes/:nom_usuario", obtenerPendientes) //Obtener pendientes del usuario
router.get("/ultimaFavorita/:nom_usuario", obtenerUltimaFavorita) //Obtener película favorita agregada más recientemente del usuario

router.delete("/favorita/:nom_usuario/:pelicula_id", eliminarFavorita) //Eliminar película favorita
router.delete("/pendiente/:nom_usuario/:pelicula_id", eliminarPendiente) //Eliminar película favorita

export default router

