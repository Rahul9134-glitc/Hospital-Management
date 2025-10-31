import express from "express";
import { getServices , createService , updateService , getEditService , deleteService } from "../controllers/service.controllers.js";
import { isAdmin , isAuth } from "../middleware/isAuth.js";

const router = express.Router();

router.use(isAuth, isAdmin);

router.get('/',isAuth , getServices);

router.post('/',isAuth , createService);

router.get('/edit/:id',isAuth , getEditService);

router.post('/edit',isAuth , updateService);

router.post("/:id/delete" ,deleteService );

export default router;