import express from 'express';
import { pingResults } from './pingMonitor';

const app = express();
const PORT = process.env.PORT || 3000;

// Route for the root path
app.get('/', (req, res) => {
    res.send('Welcome to the Ping Monitor API. Use /api/ping-status to get the latest ping results.');
});

// Route to get ping status
app.get('/api/ping-status', (req, res) => {
    res.json(pingResults);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
    console.log('Received SIGINT. Shutting down...');
    process.exit(0);
});
