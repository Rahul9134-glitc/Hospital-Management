import express from "express";
const router = express.Router();

import { getAllPatients , renderNewPatientForm , createPatient , getPatient , deletePatient , renderEditPatientForm , updatePatient} from "../Controllers/patient.controllers.js";

router.get("/new" , renderNewPatientForm);
router.post("/" , createPatient);
router.get("/",getAllPatients);
router.get('/:id', getPatient);
router.delete("/:id" , deletePatient);
router.get('/:id/edit', renderEditPatientForm);
router.put("/:id" , updatePatient)

export default router;

