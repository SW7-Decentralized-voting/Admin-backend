import { createClient } from 'redis';

const redisClient = createClient({
    url: 'redis://localhost:6379' // Adjust the URL if your Redis server is hosted elsewhere
});

redisClient.on('error', (err) => {
    console.error('Redis client error:', err);
});

export default redisClient;