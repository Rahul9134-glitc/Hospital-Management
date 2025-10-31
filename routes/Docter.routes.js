import epxress from "express";

const router = epxress.Router();

import {
  renderEditDoctorForm,
  renderNewDoctorForm,
  getAllDoctors,
  getDoctor,
  updateDoctor,
  deleteDoctor,
  createDoctor
} from "../controllers/docter.controllers.js";

router.route('/')
    .get(getAllDoctors)
    .post(createDoctor);

router.get('/new', renderNewDoctorForm);

router.route('/:id')
    .get(getDoctor)     
    .put(updateDoctor)      
    .delete(deleteDoctor);

router.get('/:id/edit', renderEditDoctorForm);


export default router;