import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load the environment variables.
dotenv.config();

class DBClient {
  constructor() {
    // Collect the env variables or given defaults.
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '27017';
    this.database = process.env.DB_DATABASE || 'files_manager';

    // Build the MongoDB connection URI.
    const url = `mongodb://${host}:${port}`;
    this.client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    // Set database to null for now.
    this.db = null;

    // Connect to MongoDB.
    this.connect();
  }

  async connect() {
    try {
      // Connect to MongoDB client, then select the database.
      await this.client.connect();
      this.db = this.client.db(this.database);
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error.message);
    }
  }

  /**
   * Ascertains if MongoDB connection is successful/not.
   * @returns {boolean}
   */
  isAlive() {
    return !!this.db;
  }

  /**
   * Returns no. of docs in collection users.
   * @returns {Promise<number>}
   */
  async nbUsers() {
    try {
      return await this.db.collection('users').countDocuments();
    } catch (error) {
      console.error('Failed to count users:', error.message);
      return 0;
    }
  }

  /**
   * Returns no. of docs in collection files.
   * @returns {Promise<number>}
   */
  async nbFiles() {
    try {
      return await this.db.collection('files').countDocuments();
    } catch (error) {
      console.error('Failed to count files:', error.message);
      return 0;
    }
  }
}

// Create & export an instance of DBClient called dbClient.
const dbClient = new DBClient();
export default dbClient;
