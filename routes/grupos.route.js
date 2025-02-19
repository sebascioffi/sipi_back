import { Router } from "express";
import { crearGrupo, obtenerGruposUsuario, obtenerUsuariosGrupo, unirseAGrupo } from "../controllers/grupos.controller.js";

const router = Router()

router.post("/:nom_usuario/:nombre_grupo", crearGrupo)
router.get("/:nom_usuario", obtenerGruposUsuario)
router.get("/usuario/:nombre_grupo", obtenerUsuariosGrupo)
router.post("/unirse/:nom_usuario/:nombre_grupo", unirseAGrupo)

export default router