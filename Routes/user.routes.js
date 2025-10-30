import express from "express"
const router = express.Router();
import { isAdmin } from "../Middleware/isAuth.js";

import { getAllUsers , getNewUserForm , deleteUser , createUser } from "../Controllers/user.controllers.js";

router.use(isAdmin);
router.get('/', getAllUsers);
router.get('/new', getNewUserForm);
router.post('/', createUser);
router.delete('/:id', deleteUser);

export default router;