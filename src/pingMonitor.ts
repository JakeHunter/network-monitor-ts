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

const pingResults: { ip: string; status: string; timestamp: string }[] = [];

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
        const status = res.alive ? 'alive' : 'dead';
        const timestamp = new Date().toISOString();

        logger.info(`Ping ${ip}: ${status}`);

        pingResults.push({ ip, status, timestamp });

        if (pingResults.length > 100) pingResults.shift();

        if (!res.alive && retries < maxRetries) {
            logger.info(`Retrying (${retries + 1}/${maxRetries})...`);
            await pingDevice(ip, retries + 1);
        }
    } catch (error) {
        logger.error(`Failed to ping ${ip}:`, error);
    }
};

setInterval(() => pingDevice(targetIp), pingInterval);

process.on('SIGINT', () => {
    logger.info('Received SIGINT. Shutting down...');
    process.exit(0);
});

export { pingResults };
