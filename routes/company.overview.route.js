const express = require('express');
const { getOverview, updateOverview } = require('../controller/company.overview.controller');

const router = express.Router();

router.get('/', getOverview); // Get company overview
router.put('/', updateOverview); // Update company overview

module.exports = router;
