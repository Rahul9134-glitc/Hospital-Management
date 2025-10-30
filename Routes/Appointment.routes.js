import express from "express";

const router = express.Router();

import {
  getAllAppointments,
  renderNewAppointmentForm,
  createAppointment,
  getAppointment,
  updateAppointmentStatus,
} from "../Controllers/appointment.controllers.js";

router.get("/new", renderNewAppointmentForm);
router.post("/", createAppointment);
router.get("/", getAllAppointments);
router.get('/:id', getAppointment);
router.put('/:id', updateAppointmentStatus);

export default router;
