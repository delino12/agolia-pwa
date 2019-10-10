// const endpoint = 'http://localhost:8181';
const endpoint = 'https://canary.timsmate.com';

// db version
const DB_VERSION = 1;

window.addEventListener('load', function(){
    if ('serviceWorker' in navigator) {
		// register the service worker
		navigator.serviceWorker.register('/service-worker.js', {scope: '/'}).then(function(sw) {
			console.log(sw);

			// check service worker controller
			if(!navigator.serviceWorker.controller) return;

			// on waiting state
			if(sw.waiting !== null){
				sw.waiting.postMessage({action: 'skipWaiting'});
			}

			// on installing state
			if(sw.installing !== null){
				sw.addEventListener('statechange', function(e){
					if(e.target.state == "installed"){
						notifyMe('success', 'Application update has been installed!');
					}
				});
			}

			// on updated found
			sw.addEventListener('updatefound', function (){
				notifyMeUpdate('success', 'You have new updates, click the app update button');
				console.log('Application found a new update on services worker');
			});
		});

		// listen for controller change
	    navigator.serviceWorker.addEventListener('controllerchange', function (){
	        console.log('New service worker is now activated');
	        window.location.reload();
	    });

	    // Are Notifications supported in the service worker?
    	if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
	        console.warn('Notifications aren\'t supported.');
	        return;
	    }

	    // Check the current Notification permission.
	    // If its denied, it's a permanent block until the
	    // user changes the permission
	    if (Notification.permission === 'denied') {
	        console.warn('The user has blocked notifications.');
	        return;
	    }

	    // Check if push messaging is supported
	    if (!('PushManager' in window)) {
	        console.warn('Push messaging isn\'t supported.');
	        return;
	    }

	    // We need the service worker registration to check for a subscription
	    navigator.serviceWorker.ready.then(function(event) {
	        console.log(event);
	    });
    } else {
        console.warn('Service workers aren\'t supported in this browser.');
    }
});

var deferredPrompt;
window.addEventListener('beforeinstallprompt', function(e){
  	// Prevent Chrome 67 and earlier from automatically showing the prompt
  	e.preventDefault();
  	// Stash the event so it can be triggered later.
	deferredPrompt = e;
});

// install application
function installApp() {
    // run app installation
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      	if (choiceResult.outcome === 'accepted') {
        	notifyMe("success", `Installation successful!`);
      	} else {
        	notifyMe("success", `You can always click install icon to install Sebastian`);
      	}
     	deferredPrompt = null;
    });
}

var user_id;
var token;
var current_date = new Date();

// check login state
function auth(username) {
    // body...
    var sessionDB = window.sessionStorage;
    for(var i =0; i < seessionDB.length; i++){
        let key     = sessionDB.key(i);
        let value   = sessionDB.getItem(key);
        if(username == value){
            return true;
        }else{
            return false;
        }
    }
}

// trigger login
function initLogin() {
    var username = $("#agent_login_id").val();
    var password = $("#agent_login_pass").val();

    // process login
    attempLogin(username, password).then(status => {
    	
    	if(status == true){
			window.location.reload();
    	}else{
    		// push notification
			notifyMe("danger", "Invalid Agent-ID/Passcode, check credentials and try again!");
    	}
    }).catch(err => {
    	// push notification
		notifyMe("danger", "Invalid Agent-ID/Passcode, check credentials and try again!");
    });

    // void form
    return false;
}

function previewCustomerName() {
	var customer_name = $("#customer_name").val();
	$("#preview-customer-name").html(`${customer_name}`);
}

/*
|-----------------------------------------
| AUTH SECTIONS
|-----------------------------------------
*/
function processUserLogin() {
	var email 		= $("#email").val();
	var password 	= $("#password").val();

	var query = {email, password};
	loginUser(query).then(val => {
		console.log(val);
		window.location.href = "/"
	}).catch(err => console.warn(err));

	// return void
	return false;
}

/*
|-----------------------------------------
| FORMAT VOLUME INPUT
|-----------------------------------------
*/
function formatVolume(element) {
	// body
    return element.value = numeral(element.value).format('0,0');
}

/*
|-----------------------------------------
| FORMAT VOLUME INPUT
|-----------------------------------------
*/
function formatRate(element) {
	// body
    return element.value = numeral(parseFloat(element.value)).format('0,0');
}

/*
|-----------------------------------------
| GET EQUIVALENT AND CONSIDERATION
|-----------------------------------------
*/
function calculateEquivalent() {
    var volume 	= $("#customer_volume").val();
    var rate 	= $("#customer_rate").val();
    var trade_type = $("#trade_type").val();

    // filter commas
    volume = volume.replace(/,/g, "");
    rate = rate.replace(/,/g, "");

    var consideration = (parseFloat(volume) * parseFloat(rate));

    if(trade_type == "1"){
    	$("#pay_customer_cash").val(numeral(consideration).format('0,0.00'));
    	$("#pay_customer_wire").val(0);
	    $("#receive_customer_cash").val(numeral(parseFloat(volume)).format('0,0.00'));
	    $("#receive_customer_wire").val(0);
    }else if(trade_type == "2"){
    	$("#pay_customer_cash").val(numeral(parseFloat(volume)).format('0,0.00'));
    	$("#pay_customer_wire").val(0);
	    $("#receive_customer_cash").val(numeral(consideration).format('0,0.00'));
	    $("#receive_customer_wire").val(0);
    }

    $("#exchange-preview").html(`
    	<label for="customer_consideration">Exchange Consideration</label>
    	<input type="text" id="customer_consideration" value="${numeral(consideration).format('0,0.00')}" class="form-control" readonly="" />
    `);
}

function togglePayWire(element) {
	var trade_type = $("#trade_type").val();
	var consideration;
	if(trade_type == "2"){
		consideration = $("#customer_volume").val();
	}else if(trade_type == "1"){
		consideration = $("#customer_consideration").val();
	}
	var pay_cash = $("#pay_customer_cash").val();
	var pay_wire = $("#pay_customer_wire").val();

	pay_cash = pay_cash.replace(/,/g, "");
    pay_wire = pay_wire.replace(/,/g, "");
    consideration = consideration.replace(/,/g, "");

    pay_cash = parseFloat(pay_cash);
    pay_wire = parseFloat(pay_wire);
    consideration = parseFloat(consideration);

	// var new_pay_cash = numeral(consideration).subtract(pay_wire);
	var new_pay_cash = (consideration) - (pay_wire);
    
    if(new_pay_cash > 0){
		$("#pay_customer_cash").val(numeral(new_pay_cash).format('0,0.00'));
    }else{
    	$("#pay_customer_wire").val(consideration);
    	$("#pay_customer_cash").val('0.00');
    }
}

function togglePayCash(element) {
	var trade_type = $("#trade_type").val();
	var consideration;
	if(trade_type == "2"){
		consideration = $("#customer_volume").val();
	}else if(trade_type == "1"){
		consideration = $("#customer_consideration").val();
	}

	var pay_cash = $("#pay_customer_cash").val();
	var pay_wire = $("#pay_customer_wire").val();

	pay_cash = pay_cash.replace(/,/g, "");
    pay_wire = pay_wire.replace(/,/g, "");
    consideration = consideration.replace(/,/g, "");

    pay_cash = parseFloat(pay_cash);
    pay_wire = parseFloat(pay_wire);
    consideration = parseFloat(consideration);

	// var new_pay_wire = numeral(consideration).subtract(pay_cash);
	var new_pay_wire = (consideration) - (pay_cash);
    
    if(new_pay_wire > 0){
		$("#pay_customer_wire").val(numeral(new_pay_wire).format('0,0.00'));
    }else{
    	$("#pay_customer_cash").val(consideration);
    	$("#pay_customer_wire").val('0.00');
    }
}

function toggleBdcReceiveWire(element) {
	var trade_type = $("#trade_type").val();
	var consideration;
	if(trade_type == "2"){
		consideration = $("#customer_consideration").val();
	}else if(trade_type == "1"){
		consideration = $("#customer_volume").val();
	}
	var receive_cash = $("#receive_customer_cash").val();
	var receive_wire = $("#receive_customer_wire").val();

	receive_cash = receive_cash.replace(/,/g, "");
    receive_wire = receive_wire.replace(/,/g, "");
    consideration = consideration.replace(/,/g, "");

    receive_cash = parseFloat(receive_cash);
    receive_wire = parseFloat(receive_wire);
    consideration = parseFloat(consideration);

	// var new_receive_cash = numeral(consideration).subtract(receive_wire);
	var new_receive_cash = (consideration) - (receive_wire);
    
    if(new_receive_cash > 0){
		$("#receive_customer_cash").val(numeral(new_receive_cash).format('0,0.00'));
    }else{
    	$("#receive_customer_wire").val(consideration);
    	$("#receive_customer_cash").val('0.00');
    }
}

function toggleBdcReceiveCash(element) {
	var trade_type = $("#trade_type").val();
	var consideration;
	if(trade_type == "2"){
		consideration = $("#customer_consideration").val();
	}else if(trade_type == "1"){
		consideration = $("#customer_volume").val();
	}
	var receive_cash = $("#receive_customer_cash").val();
	var receive_wire = $("#receive_customer_wire").val();

	receive_cash = receive_cash.replace(/,/g, "");
    receive_wire = receive_wire.replace(/,/g, "");
    consideration = consideration.replace(/,/g, "");

    receive_cash = parseFloat(receive_cash);
    receive_wire = parseFloat(receive_wire);
    consideration = parseFloat(consideration);

	// var new_receive_cash = numeral(consideration).subtract(receive_cash);
	var new_receive_wire = (consideration) - (receive_cash);
    
    if(new_receive_wire > 0){
		$("#receive_customer_wire").val(numeral(new_receive_wire).format('0,0.00'));
    }else{
    	$("#receive_customer_cash").val(consideration);
    	$("#receive_customer_wire").val('0.00');
    }
}

function validatePhoneNumber(element) {
	if(element.value.length > 11){
		return element.value = element.value.slice(0, -1);
	}else{
		return element.value = element.value;
	}
}

function validateAccountNumber(element) {
	if(element.value.length > 10){
		return element.value = element.value.slice(0, -1);
	}else{
		return element.value = element.value;
	}
}

function getAvailableBanks() {
	fetch(`/banks.json`).then(r => {
		return r.json();
	}).then(results => {
		// console.log(results)
		// $("#pay_customer_bank_name").html("");
		$("#receive_bank_name").html("");
		$("#receive_bank_name").append(`
			<option value=""> -- select bank -- </option>
		`)
		$.each(results.data, function(index, bank) {
			$("#receive_bank_name").append(`
				<option value="${bank.code}">${bank.name}</option>
			`);
		});
	}).catch(err => {
		console.log(JSON.stringify(err));
	})
}

function notifyMe(status, message) {
	// body...
	// $("#notification-wrapper").show();
	// $("#notification-wrapper")
	$("#notification-wrapper").html(`
		<span class="text-${status}">${message}</span>
	`).show();

	setTimeout(function(e) {
		$("#notification-wrapper").fadeOut();
	}, 1000 * 5);
}

function notifyMeUpdate(status, message) {
	// body...
	$("#notification-wrapper").html(`
		<span class="text-${status}">${message}</span> 
		<a href="javascript:void(0);" onclick="resetWorker()" class="btn btn-default btn-xs small">Update now</a>
	`).show();
}

function resetWorker() {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      	for(let registration of registrations) {
          registration.unregister();
      	} 
      	window.location.reload();
    });
}

function setDefaultCurrency() {
	var currency = $("#customer_currency").val();
	var trade_type = $("#trade_type").val();
	if(currency == "2") {
		if(trade_type == "1"){
			$("#preview-pay-currency").html(`
				NGN
			`);
			$("#preview-receive-currency").html(`
				USD
			`);
		}else if(trade_type == "2"){
			$("#preview-pay-currency").html(`
				USD
			`);
			$("#preview-receive-currency").html(`
				NGN
			`);
		}
	}
	if(currency == "3"){
		if(trade_type == "1"){
			$("#preview-pay-currency").html(`
				NGN
			`);
			$("#preview-receive-currency").html(`
				GBP
			`);
		}else if(trade_type == "2"){
			$("#preview-pay-currency").html(`
				GBP
			`);
			$("#preview-receive-currency").html(`
				NGN
			`);
		}
	}
	if(currency == "4"){
		if(trade_type == "1"){
			$("#preview-pay-currency").html(`
				NGN
			`);
			$("#preview-receive-currency").html(`
				EUR
			`);
		}else if(trade_type == "2"){
			$("#preview-pay-currency").html(`
				EUR
			`);
			$("#preview-receive-currency").html(`
				NGN
			`);
		}
	}
}

var totalFileLimit = 3;
var totalFileCount = 0;
var files_box = [];
function addCustomerFileInput() {
	totalFileCount++;

	if(totalFileCount > totalFileLimit){
		notifyMe("info", `You have exceeded the file upload limit, You can only upload maximun of ${totalFileLimit} files.`);
		// return
		return false
	}else{
		$("#customer_files").append(`
			<input type="file" id="customer_email_${totalEmailFieldFileCount}" onchange="pushImageBinary(this)" class="form-control" />
		`);
	}
}

// capture image preview
function pushImageBinary(element){
	var file = element.files[0];
    // var file    = document.querySelector('input[name=file]').files[0];
    var reader  = new FileReader();

    reader.onloadend = async function (e) {
       // console.log(reader.result);
       files_box.push({
       	document_file: reader.result
       });
       // $("#document_file").val(reader.result);
    }

    if (file) {
       //reads the data as a URL
       reader.readAsDataURL(file);
    } 
}

var totalEmailFieldLimit = 3;
var totalEmailFieldFileCount = 0;
var email_fields_box = [];
function addMoreEmailField() {
	if(totalEmailFieldFileCount > totalEmailFieldLimit){
		notifyMe("info", `You have exceeded the email add-on limit, You can only add maximun of ${totalEmailFieldLimit} emails.`);
		// return
		return false
	}else{
		totalEmailFieldFileCount++;
		$("#email-addon").append(`
			<div id="email_wrapper_${totalEmailFieldFileCount}">
				<br />
				<a href="javascript:void(0);" onclick="removeEmail(${totalEmailFieldFileCount})" class="float-right">
					<i class="material-icons">clear</i>
				</a>
				<input type="email" class="form-control input-classic" id="email_${totalEmailFieldFileCount}" placeholder="someone@domain.com" onblur="pushExtraEmail(this)" required="">
			</div>
		`);

	}
}

function removeEmail(total_email) {
	totalEmailFieldFileCount = (totalEmailFieldFileCount - 1);
	$(`#email_wrapper_${total_email}`).remove();
	
	console.log(totalEmailFieldFileCount);
}

// push to bank binary
function pushExtraEmail(element) {
	var email = element.value;
	email_fields_box.push({
		email: email
	});
}

var totalBankFieldLimit = 3;
var totalBankFieldFileCount = 0;
var bank_fields_box = [];
function addMoreBankField() {
	if(totalBankFieldFileCount > totalBankFieldLimit){
		notifyMe("info", `You have exceeded the banks add-on limit, You can only add maximun of ${totalBankFieldLimit} bank fields.`);
		// return
		return false
	}else{
		var pay_customer_wire = parseFloat($("#pay_customer_wire").val());
		if(pay_customer_wire < 1){
			notifyMe("danger", `Enter wire amount for customer before adding bank information!`);
			// return
			return false
		}else{
			$("#banks-addon").append(`
				<div class="row" id="banks_addon_${totalBankFieldFileCount}">
					<div class="col-sm-4" style="width: 50%;">
		                <div class="form-group">
		                    <label for="pay_customer_bank_name_${totalBankFieldFileCount}"> Bank Name
				                <a href="javascript:void(0);" onclick="removeCustomerBank(${totalBankFieldFileCount})" class="float-right">
									<i class="material-icons">clear</i>
								</a>
							</label>
		                    <select class="form-control" id="pay_customer_bank_name_${totalBankFieldFileCount}" required>
		                        <option value="">Select Bank</option>
		                    </select>
		                </div>
		            </div>
		            <div class="col-sm-4" style="width: 50%;">
		                <div class="form-group">
		                    <label for="customer_bank_nuban_${totalBankFieldFileCount}">Account Number</label>
		                    <input type="number" onkeyup="validateAccountNumber(this)" class="form-control input-classic" placeholder="Eg, 002123330" step="any" min="0" id="customer_bank_nuban_${totalBankFieldFileCount}" required>
		                </div>
		            </div>
		            <div class="col-sm-4" style="width: 50%;">
		                <div class="form-group">
		                    <label for="amount_${totalBankFieldFileCount}">Amount</label>
		                    <input type="text" pattern="[0-9.,]+" value="0.00" onkeyup="formatVolume(this)" class="form-control input-classic" placeholder="0.00" id="amount_${totalBankFieldFileCount}" required>
		                </div>
		            </div>
	            </div>
			`);
			preloadBankCodes(totalBankFieldFileCount, 1); // 1 means customer banks
			totalBankFieldFileCount++;
		}
	}
}

function removeCustomerBank(addon_bank_id) {
	// body...
	totalBankFieldFileCount = (totalBankFieldFileCount - 1);
	$(`#banks_addon_${addon_bank_id}`).remove();
}

var totalReceiveBankFieldLimit = 3;
var totalReceiveBankFieldFileCount = 0;
var bank_fields_box = [];
function addBDCMoreBankField() {
	if(totalReceiveBankFieldFileCount > totalReceiveBankFieldLimit){
		notifyMe("info", `You have exceeded the banks add-on limit, You can only add maximun of ${totalReceiveBankFieldLimit} bank fields.`);
		// return
		return false
	}else{
		var receive_customer_wire = parseFloat($("#receive_customer_wire").val());
		console.log(receive_customer_wire)
		if(receive_customer_wire < 1 || isNaN(receive_customer_wire)){
			notifyMe("danger", `Enter wire amount before adding bdc bank information!`);
			// return
			return false
		}else{
			$("#receive-banks-addon").append(`
				<div class="row" id="bdc_banks_addon_${totalReceiveBankFieldFileCount}">
					<div class="col-sm-4" style="width: 50%;">
		                <div class="form-group">
		                    <label for="receive_bank_name_${totalReceiveBankFieldFileCount}">Bank Name
		                    	<a href="javascript:void(0);" onclick="removeBDCBank(${totalReceiveBankFieldFileCount})" class="float-right">
									<i class="material-icons">clear</i>
								</a>
		                    </label>
		                    <select class="form-control" id="receive_bank_name_${totalReceiveBankFieldFileCount}" required>
		                        <option value="">Select Bank</option>
		                    </select>
		                </div>
		            </div>
		            <div class="col-sm-4" style="width: 50%;">
		                <div class="form-group">
		                    <label for="receive_bank_nuban_${totalReceiveBankFieldFileCount}">Account Number</label>
		                    <input type="number" class="form-control input-classic" onkeyup="validateAccountNumber(this)" placeholder="Eg, 002123330" step="any" min="0" id="receive_bank_nuban_${totalReceiveBankFieldFileCount}" required>
		                </div>
		            </div>
		            <div class="col-sm-4" style="width: 50%;">
		                <div class="form-group">
		                    <label for="receive_amount_${totalReceiveBankFieldFileCount}">Amount</label>
		                    <input type="text" pattern="[0-9.,]+" value="0.00" onkeyup="formatVolume(this)" class="form-control input-classic" placeholder="0.00" id="receive_amount_${totalReceiveBankFieldFileCount}" required>
		                </div>
		            </div>
	            </div>
			`);
			preloadBankCodes(totalReceiveBankFieldFileCount, 2); // 2 means bdc banks
			totalReceiveBankFieldFileCount++;
		}
	}
}

function removeBDCBank(addon_bank_id) {
	// body...
	totalReceiveBankFieldFileCount = (totalReceiveBankFieldFileCount - 1);
	$(`#bdc_banks_addon_${addon_bank_id}`).remove();
}

function preloadBankCodes(sn, type) {
	fetch(`/banks.json`).then(r => {
		return r.json();
	}).then(results => {

		if(type == 1){
			// console.log(results)
			$(`#pay_customer_bank_name_${sn}`).html("");
			$(`#pay_customer_bank_name_${sn}`).append(`
				<option value=""> -- select bank -- </option>
			`)
			$.each(results.data, function(index, bank) {
				$(`#pay_customer_bank_name_${sn}`).append(`
					<option value="${bank.code}">${bank.name}</option>
				`);
			});
		}else if(type == 2){
			// console.log(results)
			$(`#receive_bank_name_${sn}`).html("");
			$(`#receive_bank_name_${sn}`).append(`
				<option value=""> -- select bank -- </option>
			`)
			$.each(results.data, function(index, bank) {
				$(`#receive_bank_name_${sn}`).append(`
					<option value="${bank.code}">${bank.name}</option>
				`);
			});
		}
	}).catch(err => {
		console.log(JSON.stringify(err));
	})
}

function sourceOfFunds() {
	fetch(`/source-of-funds.json`).then(r => r.json()).then(results => {
		console.log(results)
		$("#source_of_funds").html("");
		$("#source_of_funds").append(`
			<option value=""> -- select -- </option>
		`);
		$.each(results.data, function(index, val) {
			$("#source_of_funds").append(`
				<option value="${val.id}"> ${val.name} </option>
			`);
		});
	}).catch(err => {
		console.log(err);
	})
}

function saveToQueue() {
	var consideration       = $("#customer_consideration").val();
	var name 				= $("#customer_name").val();
	var email 				= $("#customer_email").val();
	var phone 				= $("#customer_phone").val();
	var currency 			= $("#customer_currency").val();
	var volume 				= $("#customer_volume").val();
	var rate 				= $("#customer_rate").val();
	var pay_cash 			= $("#pay_customer_cash").val();
	var pay_wire 			= $("#pay_customer_wire").val();
	var pay_bank_name 		= $("#pay_customer_bank_name").val();
	var pay_bank_nuban 		= $("#customer_bank_nuban").val();
	var receive_cash 		= $("#receive_customer_cash").val();
	var receive_wire 		= $("#receive_customer_wire").val();
	var receive_bank_name 	= $("#receive_bank_name").val();
	var receive_bank_nuban 	= $("#receive_bank_nuban").val();
	var trade_type          = $("#trade_type").val();
	var created_at          = current_date;
	var updated_at          = current_date;
	var updated_by          = $("#agent_id").val();
	var created_by          = $("#agent_id").val();
	var comment  			= $("#agent_comment").val();
	var documents       	= files_box;
	var email_addons        = email_fields_box;
	var transport_charges   = $("#transport_charges").val();
	var source_of_funds     = $("#source_of_funds").val();

	var bank_addons = [];
	for(var i = 0; i < totalBankFieldFileCount; i++){
		bank_addons.push({
			bank_name: $(`#pay_customer_bank_name_${i}`).val(),
			bank_no: $(`#customer_bank_nuban_${i}`).val(),
			amount: $(`#amount_${i}`).val()
		})
	}

	var bdc_bank_addons = [];
	for(var i = 0; i < totalReceiveBankFieldFileCount; i++){
		bdc_bank_addons.push({
			bank_name: $(`#receive_bank_name_${i}`).val(),
			bank_no: $(`#customer_bank_nuban_${i}`).val(),
			amount: $(`#receive_amount_${i}`).val()
		})
	}

	// trim numeric value
	consideration = consideration.replace(/,/g, "");
    volume 		= volume.replace(/,/g, "");
    rate 		= rate.replace(/,/g, "");
    pay_cash 	= pay_cash.replace(/,/g, "");
    pay_wire 	= pay_wire.replace(/,/g, "");
    receive_wire = receive_wire.replace(/,/g, "");
    receive_cash = receive_cash.replace(/,/g, "");

    if(trade_type == "1"){
    	if((parseFloat(pay_cash) + parseFloat(pay_wire)) !== parseFloat(consideration)){
			notifyMe("warning", "Check customer cash and wire field must equal consideration!");
			// return 
			return false;
		}

		if((parseFloat(receive_cash) + parseFloat(receive_wire)) !== parseFloat(volume)){
			notifyMe("warning", " Check BDC cash and wire field must equal volume!");
			// return 
			return false;
		}
    }else if(trade_type == "2"){
    	if((parseFloat(pay_cash) + parseFloat(pay_wire)) !== parseFloat(volume)){
    		console.log(parseFloat(pay_cash) + parseFloat(pay_wire))
    		console.log(parseFloat(volume))
			notifyMe("warning", "Check BDC pay cash and wire field must equal volume!");
			// return 
			return false;
		}

		if((parseFloat(receive_cash) + parseFloat(receive_wire)) !== parseFloat(consideration)){
			console.log(parseFloat(receive_cash) + parseFloat(receive_wire))
    		console.log(parseFloat(consideration))
			notifyMe("warning", " Check customer receive cash and wire field must equal consideration!");
			// return 
			return false;
		}
    }

	var query = {name, email, phone, currency, volume, rate, pay_cash, pay_wire, pay_bank_name, pay_bank_nuban, receive_cash, receive_wire, receive_bank_name, receive_bank_nuban, consideration, trade_type, created_at, updated_at, created_by, updated_by, documents, email_addons, transport_charges, bank_addons, bdc_bank_addons, comment, source_of_funds}
	// console.log(query);

	// save to offline db
	saveToTransaction(query);

	setTimeout(function(){
		window.location.reload();
	}, 1500)

	// return 
	return false;
}

sourceOfFunds();
getAvailableBanks();
setDefaultCurrency();
getAllTransactions(0, 10);
getCompletedTransactions(0, 10);

/*
|-----------------------------------------
| DATABASE SECTION
|-----------------------------------------
*/
if (!window.indexedDB) {
    // console.log("Your browser doesn't support a stable version of IndexedDB");
    notifyMe("warning", "Your browser doesn't support a stable version of IndexedDB");
}

// open database 
function openDatabase() {
	// return db instances
	const DB_NAME 	= 'sebastianfx_db';
	const database 	= indexedDB.open(DB_NAME, 1);

	// on error catch errors 
	database.onerror = (event) => {
		console.log('error opening web database');
		console.log(event.target.result);
	};

	// check db version
	database.onupgradeneeded = function(event) {
	  	// Save the IDBDatabase interface
		var upgradeDB = event.target.result;

		switch(database.result.version){
			case 1:
				// Create an objectStore for this database
				upgradeDB.createObjectStore("transactions", {
					keyPath: "id",
					autoIncrement : true
			  	});

				// Create cloud users
				upgradeDB.createObjectStore("transactions_media", {
					keyPath: "id",
					autoIncrement : true
				});
			case 2:
				// Create an objectStore for this database
				upgradeDB.createObjectStore("users", {
					keyPath: "id",
					autoIncrement : true
			  	});
			default:
				console.log("no database object created!");
		}
	};

	// return db instance
	return database;
}

// count total local users data
function countLocalUserData() {
	// init database
	const db = openDatabase();
	return new Promise((resolve, reject) => {
		// on success fetch data
		db.onsuccess = function(event) {
			// Do something with request.result!
			var query = event.target.result;
		  	var users = query.transaction("users").objectStore("users").count();

		  	users.onsuccess = function(event){
		  		// show total
		  		// console.log(event);
		  		resolve(event.target.result)
		  	}

		  	users.onerror = function(event){
		  		reject(event.target.result);
		  	}
		}
	})
}

// count total local transactions from cloud data
function countLocalTransactionsFromLiveData() {
	// init database
	const db = openDatabase();
	return new Promise((resolve, reject) => {
		// on success fetch data
		db.onsuccess = function(event) {
			// Do something with request.result!
			var query = event.target.result;
		  	var transactions_media = query.transaction("transactions_media").objectStore("transactions_media").count();

		  	transactions_media.onsuccess = function(event){
		  		// show total
		  		// console.log(event);
		  		resolve(event.target.result)
		  	}

		  	transactions_media.onerror = function(event){
		  		reject(event.target.result);
		  	}
		}
	})
}

// fetch users from cloud
fetchUsersFromCloud();

// fetch transactions from cloud
fetchTransactionsFromCloud();

// fetch users from cloud
async function fetchUsersFromCloud() {
	// body...
	var total_user = await resolveTotalServerUsers().then(total => total);
	var total_offline_user = await countLocalUserData().then(total => total);
	if(total_user > total_offline_user){
		var users = await resolveAllServerUsers().then(users => users);
		// console.log(users);
		users.forEach(function(user) {
			saveToUsers(user);
		})
	}
}

// fetch transactions from cloud
async function fetchTransactionsFromCloud() {
	// body...
	var total_transactions = await resolveTotalTransactions().then(total => total);
	var total_offline_transactions = await countLocalTransactionsFromLiveData().then(total => total);

	if(total_transactions > total_offline_transactions){
		var transactions = await resolveAllAgentTransaction().then(transactions => transactions);
		// console.log(users);
		transactions.forEach(function(transact) {
			saveCloudToLocalTransaction(transact);
		})
	}
}

// resolve total users
function resolveTotalServerUsers() {
	return new Promise((resolve, reject) => {
		fetch(`${endpoint}/api/count/agents`).then(r => {
			return r.json();
		}).then(results => {
			console.log(results)
			resolve(results)
		}).catch(err => {
			console.log(err)
			reject(err)
		})
	})
}

// resolve all users
function resolveAllServerUsers() {
	return new Promise((resolve, reject) => {
		fetch(`${endpoint}/api/all/agents`).then(r => {
			return r.json();
		}).then(results => {
			console.log(results)
			resolve(results)
		}).catch(err => {
			console.log(err)
			reject(err)
		})
	})
}

// resolve total transactions
function resolveTotalTransactions() {
	return new Promise((resolve, reject) => {
		fetch(`${endpoint}/api/count/transaction?agent_code=${sessionStorage.username}`).then(r => {
			return r.json();
		}).then(results => {
			console.log(results)
			resolve(results)
		}).catch(err => {
			console.log(err)
			reject(err)
		})
	})
}

// resolve all transactions from cloud
function resolveAllAgentTransaction() {
	return new Promise((resolve, reject) => {
		fetch(`${endpoint}/api/all/transaction?agent_code=${sessionStorage.username}`).then(r => {
			return r.json();
		}).then(results => {
			console.log(results)
			resolve(results)
		}).catch(err => {
			console.log(err)
			reject(err)
		})
	})
}

// save to transactions
function saveCloudToLocalTransaction(payload) {
	// body...
	const db = openDatabase();

	// on success add user
	db.onsuccess = (event) => {
		const query = event.target.result;
		const transactions_media = query.transaction("transactions_media", "readwrite").objectStore("transactions_media");
		transactions_media.add(payload);

		// return 
		return true;
	}
}

// save to users
function saveToUsers(payload) {
	// body
	const db = openDatabase();

	// on success add user
	db.onsuccess = (event) => {
		const query = event.target.result;
		const users = query.transaction("users", "readwrite").objectStore("users");
		users.add(payload);

		// return 
		return true;
	}
}

// login agent
function attempLogin(username, passcode) {
	const db = openDatabase();
	return new Promise((resolve, reject) => {
		// on success add user
		db.onsuccess = (event) => {
			const query = event.target.result;
			const users = query.transaction("users", "readwrite").objectStore("users").getAll();

			users.onsuccess = function(event){
				var all_users = event.target.result;
				console.log(all_users);
		    	let isMatch = false;
		    	for(var i =0; i < all_users.length; i++) {
			        if(username == all_users[i].agent_code && passcode == all_users[i].agent_pass){
			            sessionStorage.setItem("username", username);
			            isMatch = true;
			        }
			    } 

			    if(isMatch == true){
			    	resolve(true);
			    }else{
			    	resolve(false)
			    }
			}
		}
	})
}

// login agent
function getUserByAgentCode(username) {
	const db = openDatabase();
	return new Promise((resolve, reject) => {
		// on success add user
		db.onsuccess = (event) => {
			const query = event.target.result;
			const users = query.transaction("users", "readwrite").objectStore("users").getAll();
		
			users.onsuccess = function(event){
				var all_users = event.target.result;	
		    	for(var i =0; i < all_users.length; i++) {
			        if(username == all_users[i].agent_code){
			            resolve(all_users[i].name);
			        }
			    }
			}

			users.onerror = function(event){
				reject('Error retrieving data by agent code');
			}
		}
	})
}

// save transaction
function saveToTransaction(payload) {
	// body
	const db = openDatabase();

	// on success add user
	db.onsuccess = (event) => {
		const query = event.target.result;
		const transactions = query.transaction("transactions", "readwrite").objectStore("transactions");
		transactions.add(payload);

		notifyMe("success", "Transaction saved!");
		$("#transaction-form")[0].reset();

		// return 
		return true;
	}
}

// count total data
function countData() {
	// init database
	const db = openDatabase();
	// on success fetch data
	db.onsuccess = function(event) {
		// Do something with request.result!
		var query = event.target.result;
	  	var transactions = query.transaction("transactions").objectStore("transactions").count();

	  	transactions.onsuccess = function(event){
	  		// show total
	  		totalUsers = event.target.result;
	  		$(".total-transactions").html('Total: ' + event.target.result);
	  	}
	}
}

// count total completed data
function countCompletedData() {
	// init database
	const db = openDatabase();
	// on success fetch data
	db.onsuccess = function(event) {
		// Do something with request.result!
		var query = event.target.result;
	  	var transactions = query.transaction("transactions_media").objectStore("transactions_media").count();

	  	transactions.onsuccess = function(event){
	  		// show total
	  		totalUsers = event.target.result;
	  		$(".total-completed").html('Total: ' + event.target.result);
	  	}
	}
}

// get all transactions 
function getAllTransactions(start = 0, total = 10) {
	// count users 
	countData();

	// init database
	const db = openDatabase();

	// on success fetch data
	db.onsuccess = function(event) {

		// Do something with request.result!
		var query = event.target.result;
	  	var transactions = query.transaction("transactions", "readonly").objectStore("transactions").openCursor();
	  	var transactions_box = [];

	  	console.log('start='+start+' total='+total);
		var hasSkipped = false;

	  	// wait for users to arrive
	  	transactions.onsuccess = (event) => {
	  		var cursor = event.target.result;
	  		
	  		// check if data set has next
	  		if(!hasSkipped && start > 0) {
				hasSkipped = true;
				cursor.advance(start);
				return;
			}

			if(cursor){
				// push new scanned data
				transactions_box.push(cursor.value);
				if(transactions_box.length < total) {
					// keep pushing
					cursor.continue();
				}
				// console.log('start reading dataset is ready');
				var sn = 0;
				$("#load-all-transactions").html("");
				$.each(transactions_box, function(index, val) {
				    sn++;
				    if(val.currency == "2"){
				    	val.currency = "USD";
				    }else if(val.currency == "4"){
				    	val.currency = "EUR";
				    }else if(val.currency == "3"){
				    	val.currency = "GBP";
				    }

				    // shade
				    let shade;
				    if(val.trade_type == "1"){
				    	shade = `class="text-success"`;
				    }else if(val.trade_type == "2"){
				    	shade = `class="text-danger"`;
				    }

				    if(val.created_by == sessionStorage.username){
				    	// console.log(val);
					    $("#load-all-transactions").append(`
					        <tr ${shade}>
					            <td>
					            	<a href="javascript:void(0);" ${shade} onclick="viewTransaction(${val.id})">
					                    ${val.name}
					                </a> 
					            </td>
					            <td>${numeral(val.consideration).format('0,0.00')} <br /> (${numeral(val.volume).format('0,0.00')} * ${numeral(val.rate).format('0,0.00')})</td>
					            <td>${val.currency}</td>
					            <td>
					            	<a href="javascript:void(0);" ${shade} onclick="previewReceipt(${val.id})">
					                    <i class="material-icons py-1">print</i></a>
					                </a> 
					                <a href="javascript:void(0);" ${shade} onclick="syncTransaction(${val.id})" id="sync-icon-${val.id}">
					                	<i class="material-icons py-1">cloud_upload</i>
					                </a>
					                <a href="javascript:void(0);" ${shade} onclick="deleteTransaction(${val.id})">
					                <i class="material-icons py-1">restore_from_trash</i></a>
					            </td>
					        </tr>
					    `);
				    }
				});
				
			}else{
				// console log value
				console.log('No result set found!');
			}
	  	}
	};
}

// get all transactions 
function getCompletedTransactions(start = 0, total = 10) {
	// count transactions 
	countCompletedData()

	// init database
	const db = openDatabase();

	// on success fetch data
	db.onsuccess = function(event) {

		// Do something with request.result!
		var query = event.target.result;
	  	var transactions_media = query.transaction("transactions_media", "readonly").objectStore("transactions_media").openCursor();
	  	var transactions_box = [];

	  	console.log('start='+start+' total='+total);
		var hasSkipped = false;

	  	// wait for users to arrive
	  	transactions_media.onsuccess = (event) => {
	  		var cursor = event.target.result;
	  		
	  		// check if data set has next
	  		if(!hasSkipped && start > 0) {
				hasSkipped = true;
				cursor.advance(start);
				return;
			}

			if(cursor){
				// push new scanned data
				transactions_box.push(cursor.value);
				if(transactions_box.length < total) {
					// keep pushing
					cursor.continue();
				}
				// console.log('start reading dataset is ready');
				var sn = 0;
				$("#load-all-transactions-media").html("");
				$.each(transactions_box, function(index, val) {
				    sn++;
				    if(val.currency == "2"){
				    	val.currency = "USD";
				    }else if(val.currency == "4"){
				    	val.currency = "EUR";
				    }else if(val.currency == "3"){
				    	val.currency = "GBP";
				    }

				    // shade
				    let shade;
				    if(val.trade_type == "1"){
				    	shade = `class="text-success"`;
				    }else if(val.trade_type == "2"){
				    	shade = `class="text-danger"`;
				    }

				    if(val.created_by == sessionStorage.username){
				    	// console.log(val);
					    $("#load-all-transactions-media").append(`
					        <tr ${shade}>
					            <td>
					            	<a href="javascript:void(0);" ${shade} onclick="viewCompletedTransaction(${val.id})">
					                    ${val.customer}
					                </a> 
					            </td>
					            <td>${numeral(val.consideration).format('0,0.00')} <br /> (${numeral(val.volume).format('0,0.00')} * ${numeral(val.rate).format('0,0.00')})</td>
					            <td>${val.currency}</td>
					            <td>
					            	<a href="javascript:void(0);" ${shade} onclick="previewCompletedReceipt(${val.id})">
					                    <i class="material-icons py-1">print</i></a>
					                </a> 
					            </td>
					        </tr>
					    `);
				    }
				});
			}else{
				// console log value
				console.log('No result set found!');
			}
	  	}
	};
}

// get transaction by id
function getOneTransaction(trans_id) {
	const db = openDatabase();

	return new Promise((resolve, reject) => {
		db.onsuccess = (event) => {
			// Do something with request.result!
			var query = event.target.result;
		  	var transaction = query.transaction("transactions").objectStore("transactions").get(trans_id);

		  	// on success
		  	transaction.onsuccess = (event) => {
		  		resolve(event.target.result);
		  	}

		  	// on error
		  	transaction.onerror = (event) => {
		  		reject(event.target.result)
		  	}
		}
	})
}

// get transaction by id
function getOneCompletedTransaction(trans_id) {
	const db = openDatabase();

	return new Promise((resolve, reject) => {
		db.onsuccess = (event) => {
			// Do something with request.result!
			var query = event.target.result;
		  	var transactions_media = query.transaction("transactions_media").objectStore("transactions_media").get(trans_id);

		  	// on success
		  	transactions_media.onsuccess = (event) => {
		  		resolve(event.target.result);
		  	}

		  	// on error
		  	transactions_media.onerror = (event) => {
		  		reject(event.target.result)
		  	}
		}
	})
}

// view transaction
function viewTransaction(trans_id) {
	getOneTransaction(trans_id).then(async transaction => {
		if(transaction.currency == "2"){
			transaction.currency = "USD - Dollar";
		}else if(transaction.currency == "4"){
			transaction.currency = "EUR - Euro";
		}else if(transaction.currency == "3"){
			transaction.currency = "GBP - Pounds";
		}

		var pay_currency;
		var receive_currency;

		if(transaction.trade_type == "1"){
			pay_currency = "NGN - Naira";
			receive_currency = transaction.currency;
			$("#transaction-title").html(`
				<span class="text-success">Transaction Details - BUY</span>
			`);
		}

		if(transaction.trade_type == "2"){
			pay_currency = transaction.currency;
			receive_currency = "NGN - Naira";
			$("#transaction-title").html(`
				<span class="text-danger">Transaction Details - SELL</span>
			`);
		}

		if(transaction.pay_bank_name){
			transaction.pay_bank_name = await getBankByCode(transaction.pay_bank_name).then(bank_name => bank_name)
		}

		if(transaction.receive_bank_name){
			transaction.receive_bank_name = await getBankByCode(transaction.receive_bank_name).then(bank_name => bank_name)
		}

		transaction.source_of_funds = await getSourceOfFunds(transaction.source_of_funds).then(funds_source => funds_source)

		transaction.volume 		 = numeral(transaction.volume).format('0,0.00');
		transaction.rate 		 = numeral(transaction.rate).format('0,0.00');
		transaction.pay_cash	 = numeral(transaction.pay_cash).format('0,0.00');
		transaction.pay_wire 	 = numeral(transaction.pay_wire).format('0,0.00');
		transaction.receive_cash = numeral(transaction.receive_cash).format('0,0.00');
		transaction.receive_wire = numeral(transaction.receive_wire).format('0,0.00');
		transaction.consideration = numeral(transaction.consideration).format('0,0.00');
		
		$("#show-transaction-data").html(`
			<table class="table">
				<tr>
					<td><b>Customer</b></td>
					<td>${transaction.name}</td>
				</tr>
				<tr>
					<td><b>Email</b></td>
					<td>${transaction.email}</td>
				</tr>
				<tr>
					<td><b>Phone</b></td>
					<td>${transaction.phone}</td>
				</tr>
				<tr>
					<td><b>Source of Funds</b></td>
					<td>${transaction.source_of_funds}</td>
				</tr>
				<tr>
					<td><b>Currency</b></td>
					<td>${transaction.currency}</td>
				</tr>
				<tr>
					<td><b>Volume</b></td>
					<td>${transaction.volume}</td>
				</tr>
				<tr>
					<td><b>Rate</b></td>
					<td>${transaction.rate}</td>
				</tr>
				<tr>
					<td><b>Consideration</b></td>
					<td>${transaction.consideration}</td>
				</tr>
				<tr>
					<td><b>Date</b></td>
					<td>${transaction.created_at}</td>
				</tr>
				<tr>
					<td><br /><br /></td>
					<td>------------</td>
				</tr>
				<tr>
					<td><b>Pay</b></td>
					<td>${pay_currency}</td>
				</tr>
				<tr>
					<td><b>Cash</b></td>
					<td>${transaction.pay_cash}</td>
				</tr>
				<tr>
					<td><b>Wire</b></td>
					<td>${transaction.pay_wire}</td>
				</tr>
				<tr>
					<td><b>Banks</b></td>
					<td><div id="customer_banks"></div></td>
				</tr>
				<tr>
					<td><br /><br /></td>
					<td>------------</td>
				</tr>
				<tr>
					<td><b>Receive</b></td>
					<td>${receive_currency}</td>
				</tr>
				<tr>
					<td><b>Cash</b></td>
					<td>${transaction.receive_cash}</td>
				</tr>
				<tr>
					<td><b>Wire</b></td>
					<td>${transaction.receive_wire}</td>
				</tr>
			</table>
		`);

		$.each(transaction.bank_addons, async function(index, val) {
			val.bank_name = await getBankByCode(val.bank_name).then(bank => bank);
			// console.log(val);
			$("#customer_banks").append(`
				<div>
					${val.bank_name} <br />
					${val.bank_no} <br /><br />
					<b>Amount:</b> ${numeral(val.amount).format('0,0.00')}
				</div>
				<hr />
			`);
		});
		$("#show-preview-transaction").modal();	
	})
}

// view transaction
function viewCompletedTransaction(trans_id) {
	getOneCompletedTransaction(trans_id).then(async transaction => {
		if(transaction.currency == "2"){
			transaction.currency = "USD - Dollar";
		}else if(transaction.currency == "4"){
			transaction.currency = "EUR - Euro";
		}else if(transaction.currency == "3"){
			transaction.currency = "GBP - Pounds";
		}

		var pay_currency;
		var receive_currency;

		if(transaction.trade_type == "1"){
			pay_currency = "NGN - Naira";
			receive_currency = transaction.currency;
			$("#transaction-title").html(`
				<span class="text-success">Transaction Details - BUY</span>
			`);
		}

		if(transaction.trade_type == "2"){
			pay_currency = transaction.currency;
			receive_currency = "NGN - Naira";
			$("#transaction-title").html(`
				<span class="text-danger">Transaction Details - SELL</span>
			`);
		}

		if(transaction.pay_bank_name){
			transaction.pay_bank_name = await getBankByCode(transaction.pay_bank_name).then(bank_name => bank_name)
		}

		if(transaction.receive_bank_name){
			transaction.receive_bank_name = await getBankByCode(transaction.receive_bank_name).then(bank_name => bank_name)
		}

		transaction.volume 		 = numeral(transaction.volume).format('0,0.00');
		transaction.rate 		 = numeral(transaction.rate).format('0,0.00');
		transaction.pay_cash	 = numeral(transaction.pay_cash).format('0,0.00');
		transaction.pay_wire 	 = numeral(transaction.pay_wire).format('0,0.00');
		transaction.receive_cash = numeral(transaction.receive_cash).format('0,0.00');
		transaction.receive_wire = numeral(transaction.receive_wire).format('0,0.00');
		transaction.consideration = numeral(transaction.consideration).format('0,0.00');
		
		$("#show-transaction-data").html(`
			<table class="table">
				<tr>
					<td><b>Customer</b></td>
					<td>${transaction.customer}</td>
				</tr>
				<tr>
					<td><b>Email</b></td>
					<td>${transaction.email}</td>
				</tr>
				<tr>
					<td><b>Phone</b></td>
					<td>${transaction.phone}</td>
				</tr>
				<tr>
					<td><b>Currency</b></td>
					<td>${transaction.currency}</td>
				</tr>
				<tr>
					<td><b>Volume</b></td>
					<td>${transaction.volume}</td>
				</tr>
				<tr>
					<td><b>Rate</b></td>
					<td>${transaction.rate}</td>
				</tr>
				<tr>
					<td><b>Consideration</b></td>
					<td>${transaction.consideration}</td>
				</tr>
				<tr>
					<td><b>Date</b></td>
					<td>${transaction.created_at}</td>
				</tr>
				<tr>
					<td><br /><br /></td>
					<td>------------</td>
				</tr>
				<tr>
					<td><b>Pay</b></td>
					<td>${pay_currency}</td>
				</tr>
				<tr>
					<td><b>Cash</b></td>
					<td>${transaction.pay_cash}</td>
				</tr>
				<tr>
					<td><b>Wire</b></td>
					<td>${transaction.pay_wire}</td>
				</tr>
				<tr>
					<td><b>Banks</b></td>
					<td><div id="customer_banks"></div></td>
				</tr>
				<tr>
					<td><br /><br /></td>
					<td>------------</td>
				</tr>
				<tr>
					<td><b>Receive</b></td>
					<td>${receive_currency}</td>
				</tr>
				<tr>
					<td><b>Cash</b></td>
					<td>${transaction.receive_cash}</td>
				</tr>
				<tr>
					<td><b>Wire</b></td>
					<td>${transaction.receive_wire}</td>
				</tr>
			</table>
		`);

		$.each(transaction.bank_addons, async function(index, val) {
			val.bank_name = await getBankByCode(val.bank_name).then(bank => bank);
			// console.log(val);
			$("#customer_banks").append(`
				<div>
					${val.bank_name} <br />
					${val.bank_no} <br /><br />
					<b>Amount:</b> ${numeral(val.amount).format('0,0.00')}
				</div>
				<hr />
			`);
		});
		$("#show-preview-transaction").modal();	
	})
}

// sync records
function syncTransaction(trans_id) {
	$(`#sync-icon-${trans_id}`).html(`
		<span class="small">uploading...</span>
	`);

	getOneTransaction(trans_id).then(transaction => {
		// console.log(transaction);
		$.ajax({
  			url: `${endpoint}/api/save/transaction`,
  			type: 'POST',
  			dataType: 'json',
  			data: transaction,
  			success: function(data){
  				console.log(data);
  				if(data.status == 'success'){
  					notifyMe("success", data.message);
					$(`#sync-icon-${trans_id}`).html(`
						<i class="material-icons">cloud_done</i>
					`);

					// lose cargo
					// deleteTransaction(trans_id);
  				}else{
  					notifyMe("danger", data.message);
					$(`#sync-icon-${trans_id}`).html(`
						<i class="material-icons">cloud_upload</i>
					`);	
  				}
  			}
  		}).done(function() {
  			console.log("done");
  		}).fail(function(err) {
  			console.log(err);
  			notifyMe("danger", "Error synching to cloud service!");
			$(`#sync-icon-${trans_id}`).html(`
				<i class="material-icons">cloud_upload</i>
			`);
  		});
	});
}

// delete transaction
function deleteTransaction(trans_id) {
	// delete 
	const db = openDatabase();

	// wait for transactions to arrive
  	db.onsuccess = (event) => {
  		// body...
		var query = event.target.result;
	  	var transactions = query.transaction("transactions", "readwrite").objectStore("transactions");

	  	// destroy id
  		transactions.delete(trans_id);
  	}

  	// fetch new updates
	getAllTransactions(0, 10);
}

// view transaction
function previewReceipt(trans_id, trans_type) {
	getOneTransaction(trans_id).then(async transaction => {
		if(transaction.currency == "2"){
			transaction.currency = "USD - Dollar";
		}else if(transaction.currency == "4"){
			transaction.currency = "EUR - Euro";
		}else if(transaction.currency == "3"){
			transaction.currency = "GBP - Pounds";
		}

		var pay_currency;
		var receive_currency;
		var pay_title;
		var receive_title;
		var consid_currency_lite = "NGN";

		var naration;

		if(transaction.trade_type == "1"){
			pay_currency = "NGN - Naira";
			receive_currency = transaction.currency;
			$("#receipt-title").html(`
				<span class="text-success">Receipt</span>
			`);
			transaction.trade_type = "Sold";
			pay_title = "Receive";
			receive_title = "Pay";
		}

		if(transaction.trade_type == "2"){
			pay_currency = transaction.currency;
			receive_currency = "NGN - Naira";
			$("#receipt-title").html(`
				<span class="text-danger">Receipt</span>
			`);
			transaction.trade_type = "Purchased";
			pay_title = "Pay";
			receive_title = "Receive";
		}

		if(transaction.pay_bank_name){
			transaction.pay_bank_name = await getBankByCode(transaction.pay_bank_name).then(bank_name => bank_name)
		}

		if(transaction.receive_bank_name){
			transaction.receive_bank_name = await getBankByCode(transaction.receive_bank_name).then(bank_name => bank_name)
		}

		transaction.updated_by = await getUserByAgentCode(transaction.updated_by).then(agent => agent);

		transaction.volume 		 = numeral(transaction.volume).format('0,0.00');
		transaction.rate 		 = numeral(transaction.rate).format('0,0.00');
		transaction.pay_cash	 = numeral(transaction.pay_cash).format('0,0.00');
		transaction.pay_wire 	 = numeral(transaction.pay_wire).format('0,0.00');
		transaction.receive_cash = numeral(transaction.receive_cash).format('0,0.00');
		transaction.receive_wire = numeral(transaction.receive_wire).format('0,0.00');
		transaction.consideration = numeral(transaction.consideration).format('0,0.00');

		if(transaction.trade_type == "Sold"){
			naration = `
				<tr>
					<td><br /><br /></td>
					<td>------------</td>
				</tr>
				<tr>
					<td><b>${pay_title}</b></td>
					<td>${pay_currency}</td>
				</tr>
				<tr>
					<td><b>Cash</b></td>
					<td>${transaction.pay_cash}</td>
				</tr>
				<tr>
					<td><b>Wire</b></td>
					<td>${transaction.pay_wire}</td>
				</tr>
				<tr>
					<td><br /><br /></td>
					<td>------------</td>
				</tr>
				<tr>
					<td><b>${receive_title}</b></td>
					<td>${receive_currency}</td>
				</tr>
				<tr>
					<td><b>Cash</b></td>
					<td>${transaction.receive_cash}</td>
				</tr>
				<tr>
					<td><b>Wire</b></td>
					<td>${transaction.receive_wire}</td>
				</tr>
			`
		}else if(transaction.trade_type == "Purchased"){
			naration = `
				<tr>
					<td><br /><br /></td>
					<td>------------</td>
				</tr>
				<tr>
					<td><b>${receive_title}</b></td>
					<td>${pay_currency}</td>
				</tr>
				<tr>
					<td><b>Cash</b></td>
					<td>${transaction.pay_cash}</td>
				</tr>
				<tr>
					<td><b>Wire</b></td>
					<td>${transaction.pay_wire}</td>
				</tr>
				<tr>
					<td><br /><br /></td>
					<td>------------</td>
				</tr>
				<tr>
					<td><b>${pay_title}</b></td>
					<td>${receive_currency}</td>
				</tr>
				<tr>
					<td><b>Cash</b></td>
					<td>${transaction.receive_cash}</td>
				</tr>
				<tr>
					<td><b>Wire</b></td>
					<td>${transaction.receive_wire}</td>
				</tr>
			`
		}
		

		$("#show-preview-data").html(`
			<div class="text-center">
				<img src="/img/android-icon-48x48.png" style="border-radius: 0.5rem;"> <span class="text-primary">SEBASTIAN BDC</span>
			</div>
			<table class="table">
				<tr>
					<td><b>Customer</b></td>
					<td>${transaction.name}</td>
				</tr>
				<tr>
					<td><b>Transaction</b></td>
					<td>${transaction.trade_type} ${transaction.volume} ${transaction.currency} @ ${transaction.rate} </td>
				</tr>
				<tr>
					<td><b>Consideration</b></td>
					<td>${consid_currency_lite} ${transaction.consideration}</td>
				</tr>
				<tr>
					<td><b>Agent ID</b></td>
					<td>${transaction.updated_by}</td>
				</tr>
				
				${naration}
				
				<tr>
					<td><b>Banks</b></td>
					<td><div id="prev_customer_banks"></div></td>
				</tr>

				<tr>
					<td><br /><br /></td>
					<td>------------</td>
				</tr>
				<tr>
					<td><b>Date</b></td>
					<td>${transaction.created_at}</td>
				</tr>
			</table>

			<button class="btn btn-flat" onclick="PrintElem(${trans_id})" id="print-deal-slip">
				<i class="material-icons">print</i> <span class="print-title">Print</span>
			</button>
			<button class="btn btn-flat float-right" onclick="emailReceipt(${trans_id})" id="email-deal-slip">
				<i class="material-icons">email</i> <span class="print-title">Email Receipt</span>
			</button>
		`);

		$.each(transaction.bank_addons, async function(index, val) {
			val.bank_name = await getBankByCode(val.bank_name).then(bank => bank);
			// console.log(val);
			$("#prev_customer_banks").append(`
				<div>
					${val.bank_name} <br />
					${val.bank_no} <br /><br />
					<b>Amount:</b> ${numeral(val.amount).format('0,0.00')}
				</div>
				<hr />
			`);
		});

		$("#show-preview-modal").modal();
	})
}

// view transaction
function previewCompletedReceipt(trans_id, trans_type) {
	getOneCompletedTransaction(trans_id).then(async transaction => {
		if(transaction.currency == "2"){
			transaction.currency = "USD - Dollar";
		}else if(transaction.currency == "4"){
			transaction.currency = "EUR - Euro";
		}else if(transaction.currency == "3"){
			transaction.currency = "GBP - Pounds";
		}

		var pay_currency;
		var receive_currency;
		var pay_title;
		var receive_title;
		var consid_currency_lite = "NGN";

		var naration;

		if(transaction.trade_type == "1"){
			pay_currency = "NGN - Naira";
			receive_currency = transaction.currency;
			$("#receipt-title").html(`
				<span class="text-success">Receipt</span>
			`);
			transaction.trade_type = "Sold";
			pay_title = "Receive";
			receive_title = "Pay";
		}

		if(transaction.trade_type == "2"){
			pay_currency = transaction.currency;
			receive_currency = "NGN - Naira";
			$("#receipt-title").html(`
				<span class="text-danger">Receipt</span>
			`);
			transaction.trade_type = "Purchased";
			pay_title = "Pay";
			receive_title = "Receive";
		}

		if(transaction.pay_bank_name){
			transaction.pay_bank_name = await getBankByCode(transaction.pay_bank_name).then(bank_name => bank_name)
		}

		if(transaction.receive_bank_name){
			transaction.receive_bank_name = await getBankByCode(transaction.receive_bank_name).then(bank_name => bank_name)
		}

		transaction.volume 		 = numeral(transaction.volume).format('0,0.00');
		transaction.rate 		 = numeral(transaction.rate).format('0,0.00');
		transaction.pay_cash	 = numeral(transaction.pay_cash).format('0,0.00');
		transaction.pay_wire 	 = numeral(transaction.pay_wire).format('0,0.00');
		transaction.receive_cash = numeral(transaction.receive_cash).format('0,0.00');
		transaction.receive_wire = numeral(transaction.receive_wire).format('0,0.00');
		transaction.consideration = numeral(transaction.consideration).format('0,0.00');

		if(transaction.trade_type == "Sold"){
			naration = `
				<tr>
					<td><br /><br /></td>
					<td>------------</td>
				</tr>
				<tr>
					<td><b>${pay_title}</b></td>
					<td>${pay_currency}</td>
				</tr>
				<tr>
					<td><b>Cash</b></td>
					<td>${transaction.pay_cash}</td>
				</tr>
				<tr>
					<td><b>Wire</b></td>
					<td>${transaction.pay_wire}</td>
				</tr>
				<tr>
					<td><br /><br /></td>
					<td>------------</td>
				</tr>
				<tr>
					<td><b>${receive_title}</b></td>
					<td>${receive_currency}</td>
				</tr>
				<tr>
					<td><b>Cash</b></td>
					<td>${transaction.receive_cash}</td>
				</tr>
				<tr>
					<td><b>Wire</b></td>
					<td>${transaction.receive_wire}</td>
				</tr>
			`
		}else if(transaction.trade_type == "Purchased"){
			naration = `
				<tr>
					<td><br /><br /></td>
					<td>------------</td>
				</tr>
				<tr>
					<td><b>${receive_title}</b></td>
					<td>${pay_currency}</td>
				</tr>
				<tr>
					<td><b>Cash</b></td>
					<td>${transaction.pay_cash}</td>
				</tr>
				<tr>
					<td><b>Wire</b></td>
					<td>${transaction.pay_wire}</td>
				</tr>
				<tr>
					<td><br /><br /></td>
					<td>------------</td>
				</tr>
				<tr>
					<td><b>${pay_title}</b></td>
					<td>${receive_currency}</td>
				</tr>
				<tr>
					<td><b>Cash</b></td>
					<td>${transaction.receive_cash}</td>
				</tr>
				<tr>
					<td><b>Wire</b></td>
					<td>${transaction.receive_wire}</td>
				</tr>
			`
		}
		

		$("#show-preview-data").html(`
			<div class="text-center">
				<img src="/img/android-icon-48x48.png" style="border-radius: 0.5rem;"> <span class="text-primary">SEBASTIAN BDC</span>
			</div>
			<table class="table">
				<tr>
					<td><b>Customer</b></td>
					<td>${transaction.customer}</td>
				</tr>
				<tr>
					<td><b>Transaction</b></td>
					<td>${transaction.trade_type} ${transaction.volume} ${transaction.currency} @ ${transaction.rate} </td>
				</tr>
				<tr>
					<td><b>Consideration</b></td>
					<td>${consid_currency_lite} ${transaction.consideration}</td>
				</tr>
				<tr>
					<td><b>Agent ID</b></td>
					<td>${transaction.updated_by}</td>
				</tr>
				
				${naration}
				
				<tr>
					<td><b>Banks</b></td>
					<td><div id="prev_customer_banks"></div></td>
				</tr>

				<tr>
					<td><br /><br /></td>
					<td>------------</td>
				</tr>
				<tr>
					<td><b>Date</b></td>
					<td>${transaction.created_at}</td>
				</tr>
			</table>

			<button class="btn btn-flat" onclick="PrintElem(${trans_id})" id="print-deal-slip">
				<i class="material-icons">print</i> <span class="print-title">Print</span>
			</button>
			<button class="btn btn-flat float-right" onclick="emailReceipt(${trans_id})" id="email-deal-slip">
				<i class="material-icons">email</i> <span class="print-title">Email Receipt</span>
			</button>
		`);

		$.each(transaction.bank_addons, async function(index, val) {
			val.bank_name = await getBankByCode(val.bank_name).then(bank => bank);
			// console.log(val);
			$("#prev_customer_banks").append(`
				<div>
					${val.bank_name} <br />
					${val.bank_no} <br /><br />
					<b>Amount:</b> ${numeral(val.amount).format('0,0.00')}
				</div>
				<hr />
			`);
		});

		$("#show-preview-modal").modal();
	}).catch(err => console.log(err))
}

function emailReceipt(trans_id) {
	// console.log(transaction);
	$("#print-deal-slip").html('Sending...');
	getOneTransaction(trans_id).then(async transaction => {
		if(transaction.currency == "2"){
			transaction.currency = "USD - Dollar";
		}else if(transaction.currency == "4"){
			transaction.currency = "EUR - Euro";
		}else if(transaction.currency == "3"){
			transaction.currency = "GBP - Pounds";
		}

		var pay_currency;
		var receive_currency;
		var pay_title;
		var receive_title;
		var consid_currency_lite = "NGN";

		var naration;

		if(transaction.trade_type == "1"){
			pay_currency = "NGN - Naira";
			receive_currency = transaction.currency;
			$("#receipt-title").html(`
				<span class="text-success">Receipt</span>
			`);
			transaction.trade_type = "Sold";
			pay_title = "Receive";
			receive_title = "Pay";
		}

		if(transaction.trade_type == "2"){
			pay_currency = transaction.currency;
			receive_currency = "NGN - Naira";
			$("#receipt-title").html(`
				<span class="text-danger">Receipt</span>
			`);
			transaction.trade_type = "Purchased";
			pay_title = "Pay";
			receive_title = "Receive";
		}

		if(transaction.pay_bank_name){
			transaction.pay_bank_name = await getBankByCode(transaction.pay_bank_name).then(bank_name => bank_name)
		}

		if(transaction.receive_bank_name){
			transaction.receive_bank_name = await getBankByCode(transaction.receive_bank_name).then(bank_name => bank_name)
		}

		transaction.volume 		 = numeral(transaction.volume).format('0,0.00');
		transaction.rate 		 = numeral(transaction.rate).format('0,0.00');
		transaction.pay_cash	 = numeral(transaction.pay_cash).format('0,0.00');
		transaction.pay_wire 	 = numeral(transaction.pay_wire).format('0,0.00');
		transaction.receive_cash = numeral(transaction.receive_cash).format('0,0.00');
		transaction.receive_wire = numeral(transaction.receive_wire).format('0,0.00');
		transaction.consideration = numeral(transaction.consideration).format('0,0.00');

		if(transaction.trade_type == "Sold"){
			naration = `
				<tr>
					<td><br /><br /></td>
					<td>------------</td>
				</tr>
				<tr>
					<td><b>${pay_title}</b></td>
					<td>${pay_currency}</td>
				</tr>
				<tr>
					<td><b>Cash</b></td>
					<td>${transaction.pay_cash}</td>
				</tr>
				<tr>
					<td><b>Wire</b></td>
					<td>${transaction.pay_wire}</td>
				</tr>
				<tr>
					<td><br /><br /></td>
					<td>------------</td>
				</tr>
				<tr>
					<td><b>${receive_title}</b></td>
					<td>${receive_currency}</td>
				</tr>
				<tr>
					<td><b>Cash</b></td>
					<td>${transaction.receive_cash}</td>
				</tr>
				<tr>
					<td><b>Wire</b></td>
					<td>${transaction.receive_wire}</td>
				</tr>
			`
		}else if(transaction.trade_type == "Purchased"){
			naration = `
				<tr>
					<td><br /><br /></td>
					<td>------------</td>
				</tr>
				<tr>
					<td><b>${receive_title}</b></td>
					<td>${pay_currency}</td>
				</tr>
				<tr>
					<td><b>Cash</b></td>
					<td>${transaction.pay_cash}</td>
				</tr>
				<tr>
					<td><b>Wire</b></td>
					<td>${transaction.pay_wire}</td>
				</tr>
				<tr>
					<td><br /><br /></td>
					<td>------------</td>
				</tr>
				<tr>
					<td><b>${pay_title}</b></td>
					<td>${receive_currency}</td>
				</tr>
				<tr>
					<td><b>Cash</b></td>
					<td>${transaction.receive_cash}</td>
				</tr>
				<tr>
					<td><b>Wire</b></td>
					<td>${transaction.receive_wire}</td>
				</tr>
			`
		}
		
		var data = `
			<div class="text-center">
				<center>
					<img src="https://sebastianfx.herokuapp.com/img/android-icon-48x48.png" style="border-radius: 0.5rem;"> 
					<h3 class="text-primary">SEBASTIAN BDC FX Receipt</h3>
				</center>
			</div>
			<table class="table">
				<tr>
					<td><b>Customer</b></td>
					<td>${transaction.name}</td>
				</tr>
				<tr>
					<td><b>Transaction</b></td>
					<td>${transaction.trade_type} ${transaction.volume} ${transaction.currency} @ ${transaction.rate} </td>
				</tr>
				<tr>
					<td><b>Consideration</b></td>
					<td>${consid_currency_lite} ${transaction.consideration}</td>
				</tr>
				<tr>
					<td><b>Agent ID</b></td>
					<td>${transaction.updated_by}</td>
				</tr>
				
				${naration}

				<tr>
					<td><br /><br /></td>
					<td>------------</td>
				</tr>
				<tr>
					<td><b>Date</b></td>
					<td>${transaction.created_at}</td>
				</tr>
			</table>
		`;

		$("#show-preview-modal").modal();

		var to = transaction.email;
		var cc = transaction.email_addons;
		var query = {data, to, cc}

		fetch(`/receipt`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(query)
		}).then(r => {
			return r.json();
		}).then(results => {
			console.log(results)
			if(results.status == "success"){
				$("#print-deal-slip").html('Receipt sent!');
			}
		}).catch(err => {
			$("#print-deal-slip").html('Email Receipt');
			console.log(err);
		})
	})
}

function PrintElem(){
	$("#print-deal-slip").hide();
	$("#email-deal-slip").hide();

	html2canvas(document.querySelector("#printable-area")).then(canvas => {
	    document.body.appendChild(canvas)
	});

	$("#printable-area").printMe({
		"path": ["css/bootstrap.css"],
		"title": "Receipt" 
	});
    return true;
}

// get bank name
function getBankByCode(bank_code) {
	return new Promise((resolve, reject) => {
		fetch(`/banks.json`).then(r => {
			return r.json();
		}).then(results => {
			// console.log(results)
			$.each(results.data, function(index, bank) {
				/* iterate through array or object */
				if(bank_code == bank.code){
					resolve(bank.name)
				}
			});
		}).catch(err => {
			reject(err)
		})
	});
}

// resolve source of funds
function getSourceOfFunds(fund_source_id) {
	return new Promise((resolve, reject) => {
		fetch(`/source-of-funds.json`).then(r => {
			return r.json();
		}).then(results => {
			// console.log(results)
			$.each(results.data, function(index, source) {
				/* iterate through array or object */
				if(fund_source_id == source.id){
					resolve(source.name)
				}
			});
		}).catch(err => {
			reject(err)
		})
	});
}

// resolve source of funds
function resolveSourceOfFunds() {
	// body...
	return new Promise((resolve, reject) => {
		fetch(`/source-of-funds`).then(r => {
			return r.json();
		}).then(results => {
			console.log(results)
			resolve(results)
		}).catch(err => {
			console.log(err);
			reject(err);
		})
	});
}

function getAgentInformation() {
	
}

function printReceipt() {
	$("#print-deal-slip").hide();
	$("#printable-area").printMe({
		"path": ["css/bootstrap.css"],
		"title": "SB-BDC Receipt" 
	});
}
