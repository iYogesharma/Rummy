const express = require("express");

const PaymentController = require('../Controllers/payment.controller');

const {Auth} = require('../Middlewares/auth.middleware');

const router = express.Router();



router
    .get('/v1/balance', Auth, PaymentController.accountBalance)

    .get('/v1/withdraw', Auth, PaymentController.withdrawAmmount)

    .get('/v1/deposite', Auth, PaymentController.depositeAmount)

    .get('/lightning/deposite', Auth, PaymentController.depositeRequest)

    .get('/lightning/withdraw', Auth, PaymentController.withdrawRequest)


module.exports = router;