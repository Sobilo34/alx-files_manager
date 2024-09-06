import { ObjectId } from 'mongodb';
import { v4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(request, response) {
    const { authorization } = request.headers;

    const encondedAuth = authorization.split(' ')[1];
    const emailPwd = Buffer.from(encondedAuth, 'base64').toString('utf-8');
    const [email, password] = emailPwd.split(':');

    const user = await dbClient.db.collection('users').findOne({ email });

    if (!user && !password) {
      response.status(401).json({ error: 'Unauthorized' });
    } else {
      const randomStr = v4();
      const key = `auth_${randomStr}`;

      const id = user._id;
      redisClient.set(key, id.toString(), 24 * 60 * 60);
      response.status(200).json({ token: randomStr });
    }
  }

  static async getDisconnect(request, response) {
    const XToken = request.headers['x-token'];
    if (XToken === null) {
      response.status(401).json({ error: 'Unathorized' });
      return;
    }
    const key = `auth_${XToken}`;
    const id = redisClient.get(key);
    if (!id) {
      response.status(401).json({ error: 'Unathorized' });
    } else {
      const user = dbClient.db.collection('users').findOne({ _id: ObjectId(id) });
      if (user) {
        await redisClient.del(key);
        response.status(204);
      } else {
        response.status(401).json({ error: 'Unathorized' });
      }
    }
  }
}

export default AuthController;
