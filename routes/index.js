var express     = require("express");
var controller 	= require("../controllers/index");
var router 		= express.Router();

// Routes related to event
router.get('/', controller.index);
router.get('/buy', controller.buy);
router.get('/sell', controller.sell);
router.get('/transaction', controller.transaction);
router.get('/completed', controller.completed);
router.post('/receipt',	controller.receipt);

module.exports = router;