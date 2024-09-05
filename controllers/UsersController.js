import crypto from 'crypto';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { response } from 'express';

class users {
  static async postNew(request, response) {
    if (!('email' in request.body)) {
      response.status(400).json({ error: 'Missing email' });
    } else if (!('password' in request.body)) {
      response.status(400).json({ error: 'Missing password' });
    } else {
      const { email, password } = request.body;
      const user = await dbClient.db.collection('users').findOne({ email })
        .catch((err) => console.log(err));

      if (user) {
        response.status('400').json({ error: 'Already exist' });
      } else {
        const hash = crypto.createHash('sha1');
        hash.update(password);
        const pwdResult = hash.digest('hex');

        const con = await dbClient.db.collection('users').insertOne({ email, password: pwdResult });
        const { ops } = con;
        const id = ops[0]._id;

        if (id) {
          response.status(201).json({ id, email });
        }
      }
    }
  }

  static async signOut(request, response) {
    const XToken = request.headers['x-token'];
    if (XToken === null) {
      response.status(401).json({'error': 'Unathorized'});
      return;
    }
    const key = 'auth_' + XToken;
    const id = redisClient.get(key);
    if (!id) {
      response.status(401).json({'error': 'Unathorized'});
    } else {
      const user = dbClient.db.collection('users').findOne({'id': id});
      if (user) {
        await redisClient.del(key);
        response.status(204);
      } else {
        response.status(401).json({'error': 'Unathorized'});
      }
    }
  }

  static async retrieveUser(request, response) {
    const XToken = request.headers['x-token'];
    if (XToken === null) {
      response.status(401).json({'error': 'Unathorized'});
      return;
    }
    const key = 'auth_' + XToken;
    const id = redisClient.get(key);
    if (!id) {
      response.status(401).json({'error': 'Unathorized'});
    } else {
      const user = await dbClient.db.collection('users').findOne({'_id': id});
      console.log(user)
      if (user) {
        response.status(200).json({id: id, email: user.email});
      } else {
        response.status(401).json({'error': 'Unathorized'});
      }
    }
  }
}

export default users;
