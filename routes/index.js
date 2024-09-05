import express, { Router } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import Auth from '../controllers/AuthController';

const router = Router();

router.use(express.json());
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', UsersController.postNew);
router.get('/connect', Auth.getConnect);
router.get('/disconnect', UsersController.signOut);
router.get('/users/me', UsersController.retrieveUser);

export default router;
