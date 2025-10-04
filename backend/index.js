//Hola Vscode
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Importa la función de conexión, que ahora maneja la carga de modelos de forma segura
import { connectToDatabase } from './src/database/database.js'; 

// Rutas
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import productRoutes from './src/routes/product.routes.js';
import salesRoutes from './src/routes/sales.routes.js';
import closureRoutes from './src/routes/closure.routes.js';

// Swagger
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Configuración Swagger
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'PORTAL DE DOCUMENTACIÓN',
            version: '1.0.0',
            description: 'Documentación de la API de la ferretería',
        },
        components: {
            securitySchemes: {
                bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
            }
        }
    },
    apis: ['./src/routes/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/closure', closureRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: 'API de la ferretería funcionando.' });
});

// Función de arranque asíncrona
async function startServer() {
    // 1. Conectar a la base de datos (esto inyecta y sincroniza los modelos)
    await connectToDatabase();

    // 2. Iniciar el servidor Express
    app.listen(PORT, () => {
        console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
        console.log(` Documentación en http://localhost:${PORT}/api-docs`);
    });
}

startServer();