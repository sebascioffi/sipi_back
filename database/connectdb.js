import dotenv from 'dotenv';
dotenv.config();  // Carga las variables de entorno del archivo .env

import mongoose from "mongoose";

try {
    await mongoose.connect(process.env.URI);
    console.log("Connect DB ok");
} catch (error) {
    console.log("Error de conexión a mongodb: " + error);
}
