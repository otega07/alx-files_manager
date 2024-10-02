#!/usr/bin/env node

const { MongoClient, ObjectId } = require('mongodb');
const envLoader = require('./env_loader');

/**
 * Represents a MongoDB client.
 */
class DBClient {
  /**
   * Creates a new DBClient instance.
   */
  constructor() {
    envLoader();
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '27017';
    this.databaseName = process.env.DB_DATABASE || 'files_manager';

    const dbURL = `mongodb://${host}:${port}`;
    this.client = new MongoClient(dbURL, { useNewUrlParser: true, useUnifiedTopology: true });
    this.db = null;
  }

  /**
   * Initiates connection to the MongoDB server and selects the database.
   * Handles connection errors by logging them.
   */
  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db(this.databaseName);
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error.message);
    }
  }

  /**
   * Checks if this client's connection to the MongoDB server is active.
   * @returns {boolean}
   */
  isAlive() {
    return this.client && this.client.isConnected();
  }

  /**
   * Retrieves the number of users in the database.
   * @returns {Promise<number>}
   */
  async nbUsers() {
    try {
      const collection = this.db.collection('users');
      return await collection.countDocuments();
    } catch (error) {
      console.error('Error retrieving users count:', error.message);
      return 0;
    }
  }

  /**
   * Retrieves the number of files in the database.
   * @returns {Promise<number>}
   */
  async nbFiles() {
    try {
      const collection = this.db.collection('files');
      return await collection.countDocuments();
    } catch (error) {
      console.error('Error retrieving files count:', error.message);
      return 0;
    }
  }

  /**
   * Finds a user by email and password.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object|null>}
   */
  async getUserByEmail(email, password) {
    try {
      return await this.db.collection('users').findOne({ email, password });
    } catch (error) {
      console.error('Error retrieving user by email:', error.message);
      return null;
    }
  }

  /**
   * Finds a user by ID.
   * @param {string} userId
   * @returns {Promise<object|null>}
   */
  async getUserById(userId) {
    try {
      return await this.db.collection('users').findOne({ _id: new ObjectId(userId) });
    } catch (error) {
      console.error('Error retrieving user by ID:', error.message);
      return null;
    }
  }

  /**
   * Retrieves a reference to the `users` collection.
   * @returns {Promise<Collection>}
   */
  async usersCollection() {
    return this.db.collection('users');
  }

  /**
   * Retrieves a reference to the `files` collection.
   * @returns {Promise<Collection>}
   */
  async filesCollection() {
    return this.db.collection('files');
  }
}

// Create and connect a new DBClient instance.
const dbClient = new DBClient();
dbClient.connect();

module.exports = dbClient;
