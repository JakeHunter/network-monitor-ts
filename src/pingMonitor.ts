import ping from 'ping';
import dotenv from 'dotenv';
import winston from 'winston';

dotenv.config();

const targetIp = process.env.MONITOR_IP;
const pingInterval = parseInt(process.env.PING_INTERVAL || '5000');
const maxRetries = parseInt(process.env.MAX_RETRIES || '3');

if (!targetIp) {
    console.error('No IP address provided in the .env file.');
    process.exit(1);
}

// Configure winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'monitor.log' }),
    ],
});

const pingDevice = async (ip: string, retries: number = 0): Promise<void> => {
    try {
        const res = await ping.promise.probe(ip);
        if (res.alive) {
            logger.info(`Ping ${ip}: alive`);
        } else {
            logger.warn(`Ping ${ip}: dead`);
            if (retries < maxRetries) {
                logger.info(`Retrying (${retries + 1}/${maxRetries})...`);
                await pingDevice(ip, retries + 1);
            }
        }
    } catch (error) {
        logger.error(`Failed to ping ${ip}:`, error);
    }
};

const intervalId = setInterval(() => pingDevice(targetIp), pingInterval);

// Graceful shutdown on SIGINT (Ctrl+C)
process.on('SIGINT', () => {
    logger.info('Received SIGINT. Shutting down...');
    clearInterval(intervalId);
    process.exit(0);
});
