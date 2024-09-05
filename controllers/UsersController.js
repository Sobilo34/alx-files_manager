import crypto from 'crypto';
import dbClient from '../utils/db';

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
}

export default users;
