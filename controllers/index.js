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

module.exports = {
	index: index,
	buy: buy,
	sell: sell,
	transaction: transaction,
	completed: completed,
	settings: settings
}