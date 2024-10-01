#!/usr/bin/node

import { redisClient } from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  // for GET /status
  static async getStatus(req, res) {
    const redisAlive = redisClient.isAlive();
    const dbAlive = dbClient.isAlive();

    res.status(200).json({ redis: redisAlive, db: dbAlive });
  }

  // for GET /stats
  static async getStats(req, res) {
    const usersCount = await dbClient.nbUsers();
    const filesCount = await dbClient.nbFiles();

    res.status(200).json({ users: usersCount, files: filesCount });
  }
}

module.exports = AppController;
