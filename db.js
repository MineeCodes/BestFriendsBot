const { MongoClient, ServerApiVersion } = require('mongodb');
const Logger = require('./logger.js');

class Database {
    constructor() {
        this.client = null;
        this.db = null;
    }

    async init(uri=String) {
        this.client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });
    }

    async connect(dbName=String) {
        if (!this.client) {
            Logger.warn("Connect to the cluster first!");
            return;
        }
        await this.client.connect();
        this.db = this.client.db(dbName);
        Logger.info("Connected to database: ", dbName);
        return this.db;
    }

    async test(db_name=String) {
        if (!this.client) {
            Logger.warn("Connect to the cluster first!");
            return;
        }
        try {
            await this.client.db(db_name).command({ ping: 1 });
            Logger.info("Pinged your deployment. You successfully connected to MongoDB!");
        } catch (e) {
            console.error(e);
        } finally {
            await this.client.close();
        }
    }

    async close() {
        if (this.client) {
            await this.client.close();
            this.client = null;
            this.db = null;
            Logger.info("Database connection closed");
        }
    }
}

module.exports = { Database };