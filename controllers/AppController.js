#!/usr/bin/node

import { redisClient } from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  // for GET /status
  static async getStatus(req, res) {
    try {
      const redisAlive = redisClient.isAlive();
      const dbAlive = dbClient.isAlive();

      res.status(200).json({ redis: redisAlive, db: dbAlive });
    } catch (error) {
      console.error(error);
    }
  }

  // for GET /stats
  static async getStats(req, res) {
    try {
      const usersCount = await dbClient.nbUsers();
      const filesCount = await dbClient.nbFiles();

      res.status(200).json({ users: usersCount, files: filesCount });
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = AppController;
