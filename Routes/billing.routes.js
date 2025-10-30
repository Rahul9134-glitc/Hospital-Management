import epxress from "express";
const router = epxress.Router();

import {
  getAllInvoices,
  renderNewInvoiceForm,
  createInvoice,
  getInvoice,
  updateInvoiceStatus,
  mockPaymentUpdate,
  generatePdfInvoice
} from "../Controllers/biling.controllers.js";


router.get('/new', renderNewInvoiceForm);
router.post('/', createInvoice);
router.get('/', getAllInvoices);
router.post('/mockPay', mockPaymentUpdate);

router.route('/:id')
    .get(getInvoice) 
    .put(updateInvoiceStatus);

router.get('/:id/pdf', generatePdfInvoice);
export default router;
