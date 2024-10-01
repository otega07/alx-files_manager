#!/usr/bin/node

import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import { redisClient } from '../utils/redis';
import dbClient from '../utils/db';

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [email, password] = Buffer.from(authHeader.split(' ')[1], 'base64')
      .toString('utf-8')
      .split(':');

    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const hashedPassword = sha1(password);
    const user = await dbClient.getUserByEmail(email, hashedPassword);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = uuidv4();

    const userId = parseInt(user._id.toString());
    if (isNaN(userId)) {
      return res.status(500).json({ error: 'Server error: Invalid user ID' });
    }

    try {
      console.log(`Storing token in Redis: auth_${token}, userId: ${userId}`);
      await redisClient.set(`auth_${token}`, userId, 'EX', 86400);
    } catch (error) {
      console.error('Error storing token in Redis:', error);
      return res.status(500).json({ error: 'Server error: Failed to store token in Redis' });
    }

    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await redisClient.del(`auth_${token}`);
    return res.status(204).send();
  }
}

module.exports = AuthController;
