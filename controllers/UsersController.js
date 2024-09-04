import crypto from 'crypto';
import dbClient from '../utils/db';

class users {
  static async postNew(request, response) {
    if (!request.body.hasOwnProperty('email')) {
      response.status(400).json({ error: 'Missing email' });
    }

    if (!request.body.hasOwnProperty('password')) {
      response.status(400).json({ error: 'Missing password' });
    }

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
      console.log(con);
      const { ops } = con;
      const id = ops[0]._id;

      if (id) {
        response.status(201).json({ id, email });
      }
    }
  }
}

export default users;
