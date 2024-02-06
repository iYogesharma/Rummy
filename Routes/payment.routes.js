const express = require("express");

const PaymentController = require('../Controllers/payment.controller');

const {Auth} = require('../Middlewares/auth.middleware');

const router = express.Router();



router
    .get('/v1/balance', Auth, PaymentController.accountBalance)

    .get('/v1/withdraw', Auth, PaymentController.withdrawAmount)

    .get('/v1/deposit', Auth, PaymentController.generateDepositInvoice)

    .post('/v1/invoiceUpdates', Auth, PaymentController.invoiceUpdates)

    .post('/v1/withdrawInvoice', Auth, PaymentController.withdrawInvoice)

    .get('/lightning/deposit', Auth, PaymentController.depositRequest)

    .get('/lightning/withdraw', Auth, PaymentController.withdrawRequest)

    .post('/webhook/invoiceUpdates', PaymentController.webhookInvoiceUpdates);

  


module.exports = router;