const express = require('express');
const router = express.Router();

const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');

const appController = require('../controller/app.controller');


router.post('/upload-csv',awaitHandlerFactory(appController.uploadCSV))
router.get('/get-policy-info', awaitHandlerFactory(appController.getPolicyInfo))
router.get('/aggregate-policy', awaitHandlerFactory(appController.aggregatePolicy))
router.post('/message', awaitHandlerFactory(appController.messageInDB))


module.exports = router;