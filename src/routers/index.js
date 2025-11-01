import { Router } from 'express';
import contactsRouter from './contacts.js';
import authRouter from './auth.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'contacts-api',
    uptime: Math.round(process.uptime()),
  });
});

router.use('/contacts', contactsRouter);
router.use('/auth', authRouter);

export default router;
