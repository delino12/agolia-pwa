var nodemailer = require("nodemailer");
var transport = nodemailer.createTransport({
	host: "smtp.mailtrap.io",
	port: 2525,
	auth: {
		user: "d449edc4039e69",
		pass: "0bdd62f1cab268"
	}
});

exports.send = function(template, recipient){
	return new Promise((resolve, reject) => {
		// send mail with defined transport object
	    transport.sendMail({
	        from: '"SEBASITAN BDC" <no-reply@sebastianbdc.com>', // sender address
	        to: `${recipient}`, // list of receivers
	        subject: 'SebastianFX Receipt ✔', // Subject line
	        html: `
		        <html>
					<head>
						<title>Mail</title>
						<link href="https://fonts.googleapis.com/css?family=Open+Sans&display=swap" rel="stylesheet">
					</head>
					<body>
						<style type="text/css">
							body {
								font-family: 'Open Sans', sans-serif;
							}
						</style>
						<div style="padding: 1rem; margin-left: 20%; margin-right: 20%; margin-top: 2%;">
		        			${template}
		        		</div>
		        	</body>
		        </html>
	        `
	    }, function(error, success) {
	    	if(success) {
	    		resolve(success)
	    	}else if(error) {
	    		reject(error)
	    	}
	    })
	});
}