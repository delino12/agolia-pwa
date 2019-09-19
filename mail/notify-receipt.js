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
						<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
						<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0-beta/js/bootstrap.min.js"></script>
						<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/bootswatch/3.3.7/cerulean/bootstrap.min.css">
						<link href='https://fonts.googleapis.com/css?family=Amiko' rel='stylesheet'>
						<style type="text/css">
							body {
							    font-family: 'Open Sans';font-size: 10px;
							}

							table, td, th {    
							    border: 0px solid #ddd;
							    text-align: left;
							}

							table {
							    border-collapse: collapse;
							    width: 50%;
							}

							th, td {
							    padding: 15px;
							}
						</style>
					</head>
					<body>
						<style type="text/css">
							body {
								font-family: 'Open Sans', sans-serif;
							}
						</style>
						<div style="padding: 0.5rem; margin-left: 10%; margin-right: 10%; margin-top: 2%;">
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