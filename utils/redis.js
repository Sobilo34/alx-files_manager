import { createClient } from "redis";
import { promisify } from 'util';

class RedisClient {
    constructor() {
        this.client = createClient();
        this.client.on('error', (err) => {
            console.log('Redis Client Error:', err);
        });
        this.client.connect(); // Establish the connection
        this.getAsync = promisify(this.client.get).bind(this.client);
        this.setAsync = promisify(this.client.set).bind(this.client);
        this.delAsync = promisify(this.client.del).bind(this.client);
    }

    isAlive() {
        return this.client.isOpen;
    }

    async get(key) {
        try {
            const value = await this.getAsync(key);
            return value;
        } catch (err) {
            // console.error('Error retrieving the Redis value:', err);
            return null;
        }
    }

    async set(key, value, duration) {
        try {
            await this.client.set(key, value, 'EX', duration); // Set with expiration
        } catch (err) {
            console.error('Error setting value in Redis:', err);
        }
    }

    async del(key) {
        try {
            await this.delAsync(key);
        } catch (err) {
            console.error('Error deleting value from Redis:', err);
        }
    }
}

const redisClient = new RedisClient();
export default redisClient;
