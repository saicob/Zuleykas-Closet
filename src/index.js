import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import { initNotificationService } from './services/notificationService.js';

const PORT = process.env.PORT || 3000;

// Crear servidor HTTP y socket.io usando el app completo
const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: {
        origin: '*',
    }
});

// Inicializar servicio de notificaciones con la instancia de io
initNotificationService(io);

io.on('connection', (socket) => {
    console.log('Cliente socket conectado:', socket.id);
    socket.on('disconnect', () => {
        console.log('Cliente socket desconectado:', socket.id);
    });
});

// Inicializar servicios y levantar servidor
(async () => {
    try {
        server.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Error inicializando servicios:', err);
        process.exit(1);
    }
})();