import { ObjectId } from 'mongodb';
import fs from 'fs';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class files {
  static async postUpload(request, response) {
    const XToken = request.headers['x-token'];
    if (XToken === null) {
      response.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const key = `auth_${XToken}`;
    const id = await redisClient.get(key);
    if (!id) {
      response.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await dbClient.db.collection('users').findOne({ _id: new ObjectId(id) });
    if (!user) {
      response.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const data = request.body;
    console.log(data)
    if (!data?.name) {
      response.status(400).json({ error: 'Missing name'});
    } else if (!data?.type) {
      response.status(400).json({ error: 'Missing type'});
    } else if (!data?.data && data?.type !== 'folder') {
      response.status(400).json({ error: 'Missing data'});
    } else {
      if (data?.parentId) {
        const parentFolder = await dbClient.db.collection('files').findOne({ parentId: data.parentId });
        if (parentFolder) {
          if (parentFolder.type !== 'folder') {
          response.status(400).json({ error: 'Parent is not a folder'})
          }
        } else {
          response.status(400).json({ error: 'Parent not found'})
          parentFolder.userId = user._id;
        }
      }
      if (data.type === 'folder') {
        const con = await dbClient.db.collection('files').insertOne(data);
        response.status(201).json(con);
      } else {
        let path = null;
        if (!process.env.FOLDER_PATH) {
          path = '/tmp/file-manager';
        }
        console.log("path is: ", path);
        fs.mkdir(path, {
          recursive: true,
        }, async () => {
          fs.writeFile(`${path}/${data.name}`, data.data, (err) => {
            if (err) {
              console.log(err);
            }
          });
          const con = await dbClient.db.collection('files').insertOne(data);
          response.status(201).json({ data });
        });
      }
    }


  }
}

export default files;
