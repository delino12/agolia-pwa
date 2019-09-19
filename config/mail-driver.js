var sendgrid 	= require('@sendgrid/mail');
var nodemailer 	= require('nodemailer');
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

var node_transport = nodemailer.createTransport({
	host: "smtp.mailtrap.io",
	port: 2525,
	auth: {
		user: "d449edc4039e69",
		pass: "0bdd62f1cab268"
	}
});

var sendgrid_transport = (template) => {
    return new Promise((resolve, reject) => {
        sendgrid.send(template, (error, info) => {
            if (error) {
                // console.log(error);
                reject(error);
            }else if(info){
                // console.log(info);
                resolve(info);
            }
        });
    });
}

module.exports = {
	node_transport: node_transport,
	sendgrid_transport: sendgrid_transport
}