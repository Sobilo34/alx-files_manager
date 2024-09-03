import express from 'express';
import router from './routes/index';

const app = express();
const PORT = 5000;

app.use('/', router);

app.listen(PORT, () => {
  console.log(`Server running at http://127.0.0.1:${PORT}/`);
});

export default app;
