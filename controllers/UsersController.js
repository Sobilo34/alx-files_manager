import dbClient from "../utils/db";

class users {
	static async postNew(request, response) {
		console.log(request.body);
		if (!request.body.hasOwnProperty('email')) { response.status('400').json({error: 'Missing email'}) }
		if (!request.body.hasOwnProperty('password')) { response.status('400').json({error: 'Missing password'}) }

		const { email } = request.body;
		const tp = await dbClient.db.collection('users').findOne({'email': email})
			.catch ((err) => console.log('--------------------------------------------------\n', err) );

		if (tp) {
			response.status('400').json({ error: 'Already exist' });
		}
	}
}

export default users;
