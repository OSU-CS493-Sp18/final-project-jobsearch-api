const router = module.exports = require('express').Router();

router.use('/users', require('./users').router);

router.use('/positions', require('./positions').router);
router.use('/companies', require('./companies').router);
router.use('/fields', require('./fields').router);
