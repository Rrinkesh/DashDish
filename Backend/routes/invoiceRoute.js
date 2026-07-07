const express = require('express');
const { generateInvoice, getInvoice, downloadInvoicePdf } = require('../controllers/invoiceController');
const { authmiddleware } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const invoiceRouter = express.Router();

invoiceRouter.post('/generate', authmiddleware, authorizeRoles('OWNER', 'MANAGER'), generateInvoice);
invoiceRouter.get('/:id', authmiddleware, getInvoice);
invoiceRouter.get('/:id/pdf', authmiddleware, downloadInvoicePdf);

module.exports = invoiceRouter;
