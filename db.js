const { MongoClient, ServerApiVersion } = require('mongodb');
const Logger = require('./logger.js');

let logger = new Logger("Database");

class Database {
    constructor(uri=String) {
        this.client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                deprecationErrors: true,
            }
        });
        this.db = null;
    }

    async connect(dbName=String) {
        if (!this.client) {
            logger.warn("Connect to the cluster first!");
            return;
        }
        await this.client.connect();
        this.db = this.client.db(dbName);
        logger.info("Connected to database: ", dbName);
        return this.db;
    }

    async test(db_name=String) {
        if (!this.client) {
            logger.warn("Connect to the cluster first!");
            return;
        }
        try {
            await this.client.db(db_name).command({ ping: 1 });
            logger.info("Pinged your deployment. You successfully connected to MongoDB!");
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
            logger.info("Database connection closed");
        }
    }

    async getCollection(collectionName=String) {
        if (!this.db) {
            logger.warn("Connect to the database first!");
            return null;
        }
        return this.db.collection(collectionName);
    }
}

module.exports = { Database };
