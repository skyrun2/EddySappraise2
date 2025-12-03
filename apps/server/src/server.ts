import app from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';

const startServer = async (): Promise<void> => {
    try {
        // Connect to database
        await connectDatabase();

        // Start server
        const server = app.listen(env.PORT, () => {
            console.log(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
            console.log(`📍 API available at http://localhost:${env.PORT}/api`);
        });

        // Graceful shutdown
        const gracefulShutdown = async (signal: string): Promise<void> => {
            console.log(`\n${signal} received. Shutting down gracefully...`);
            server.close(async () => {
                await disconnectDatabase();
                console.log('Server closed');
                process.exit(0);
            });
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
