import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { authenticate } from '../middlewares/authenticate.js';

import {
  registerUserController,
  loginUserController,
  logoutUserController,
  refreshUserSessionController,
} from '../controllers/auth.js';

import { registerUserSchema, loginUserSchema } from '../validation/auth.js';

const router = Router();

// ---- Реєстрація ----
router.post(
  '/register',
  validateBody(registerUserSchema),
  ctrlWrapper(registerUserController),
);

// ---- Логін ----
router.post(
  '/login',
  validateBody(loginUserSchema),
  ctrlWrapper(loginUserController),
);

// ---- Логаут (доступ тільки авторизованим) ----
router.post('/logout', authenticate, ctrlWrapper(logoutUserController));

// ---- Оновлення сесії ----
router.post('/refresh', ctrlWrapper(refreshUserSessionController));

export default router;
