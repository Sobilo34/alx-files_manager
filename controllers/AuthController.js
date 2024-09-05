import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { v4 } from 'uuid';

class Auth {
  static async getConnect(request, response) {
    const { authorization } = request.headers;

    const encondedAuth = authorization.split(' ')[1]
    const emailPwd = Buffer.from(encondedAuth, 'base64').toString('utf-8');
    const [email, password] = emailPwd.split(':')
    
    const user = await dbClient.db.collection('users').findOne({ 'email': email });

    if (!user) {
      response.status(401).json({ error: 'Unauthorized'});
    } else {
      const randomStr = v4();
      const key = 'auth_' + randomStr;

      const id = user._id;
      redisClient.set(key, id.toString(), 24000 * 60 * 60);
      response.status(200).json({ token: randomStr });
    }
  }
}

export default Auth;
