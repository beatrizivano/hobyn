import { express } from 'express';
import { authController } from './auth.controller';

const router = express.Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);

export default router;

