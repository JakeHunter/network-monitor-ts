import net from 'net';
import dotenv from 'dotenv';

dotenv.config();
const targetIp = process.env.MONITOR_IP;


if (!targetIp) {
    console.error('No IP address provided in the .env file.');
    process.exit(1);
}

const scanPort = (ip: string, port: number): Promise<boolean> => {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(1000);

        socket.on('connect', () => {
            socket.destroy();
            resolve(true);
        }).on('timeout', () => {
            socket.destroy();
            resolve(false);
        }).on('error', () => {
            resolve(false);
        }).connect(port, ip);
    });
};

const scanPorts = async (ip: string, ports: number[]): Promise<void> => {
    for (const port of ports) {
        const isOpen = await scanPort(ip, port);
        console.log(`Port ${port} on ${ip} is ${isOpen ? 'open' : 'closed'}`);
    }
};

scanPorts(targetIp, [22, 80, 443]);
