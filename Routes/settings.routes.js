import express from "express";
const router = express.Router()

import { getSettings , updateSettings } from "../controllers/settings.controllers.js";
import { isAuth , isAdmin } from "../middleware/isAuth.js";



router.get('/', isAuth, isAdmin, getSettings);

router.post('/', isAuth, isAdmin, updateSettings);

export default router;