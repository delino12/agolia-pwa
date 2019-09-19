var mail = require('../mail/notify-receipt');

var index = (req, res) => {
	res.render('index')
}

var buy = (req, res) => {
	res.render('buy')
}

var sell = (req, res) => {
	res.render('sell')
}

var transaction = (req, res) => {
	res.render('transaction')
}

var completed = (req, res) => {
	res.render('completed')
}

var settings = (req, res) => {
	res.render('settings')
}

var receipt = async (req, res) => {
	var recipient 	= 'ekpoto.liberty@gmail.com';
	var template 	= req.body.data;

	// console.log(req.body)
	await mail.send2(template, recipient).then(val => {
		res.status(200).json({status: "success", message: "Mail sent!", data: val});
	}).catch(err => {
		res.status(500).json({status: "error", message: "Mail not sent!", data: err});
	})
}

module.exports = {
	index: index,
	buy: buy,
	sell: sell,
	transaction: transaction,
	completed: completed,
	settings: settings,
	receipt: receipt
}