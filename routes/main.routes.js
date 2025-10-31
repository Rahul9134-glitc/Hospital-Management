// routes/mainRoutes.js (Create this file if it doesn't exist)

import express from 'express';
import { getDashboardData } from '../controllers/dashboard.controllers.js';
import { getLoginForm , postLogin , postLogout } from '../controllers/auth.controllers.js';

const router = express.Router();

router.get('/login', getLoginForm);
router.post('/login', postLogin);
router.post('/logout', postLogout);

router.get('/', getDashboardData);

export default router;