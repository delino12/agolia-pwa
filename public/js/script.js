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

function navigateTo(args) {
	// body...
	switch(args) {
		case 'profile':
			// code block
			$("#timeline-contents").hide();
			$("#message-contents").hide();
			$("#profile-contents").show();
			$("#settings-contents").hide();
			$("#followers-contents").hide();
			$("#comments-contents").hide();
			$("#favorite-contents").hide();
			break;
		case 'home':
			// code block
			$("#timeline-contents").show();
			$("#message-contents").hide();
			$("#profile-contents").hide();
			$("#settings-contents").hide();
			$("#followers-contents").hide();
			$("#favorite-contents").hide();
			$("#comments-contents").hide();
			break;
		case 'followers':
			// code block
			$("#timeline-contents").hide();
			$("#message-contents").hide();
			$("#profile-contents").hide();
			$("#settings-contents").hide();
			$("#followers-contents").show();
			$("#favorite-contents").hide();
			$("#comments-contents").hide();
			break;
		case 'message':
			// code block
			$("#timeline-contents").hide();
			$("#message-contents").show();
			$("#profile-contents").hide();
			$("#settings-contents").hide();
			$("#followers-contents").hide();
			$("#favorite-contents").hide();
			$("#comments-contents").hide();
			break;
		case 'comments':
			// code block
			$("#timeline-contents").hide();
			$("#message-contents").hide();
			$("#profile-contents").hide();
			$("#settings-contents").hide();
			$("#followers-contents").hide();
			$("#favorite-contents").hide();
			$("#comments-contents").show();
			break;
		case 'favorite':
			// code block
			$("#timeline-contents").hide();
			$("#message-contents").hide();
			$("#profile-contents").hide();
			$("#settings-contents").hide();
			$("#followers-contents").hide();
			$("#favorite-contents").hide();
			$("#comments-contents").show();
			break;
		case 'media':
			// code block
			openMediaGallery();
			break;

		default:
			// code block
	}
}

function navigateToAuth(args) {
	// body...
	switch(args) {
		case 'login':
			// code block
			$("#login-contents").show();
			$("#register-contents").hide();
			$("#reset-contents").hide();
			break;
		case 'register':
			// code block
			$("#login-contents").hide();
			$("#register-contents").show();
			$("#reset-contents").hide();
			break;
		case 'reset':
			// code block
			$("#login-contents").hide();
			$("#register-contents").hide();
			$("#reset-contents").show();
			break;
		default:
			// code block
	}
}

function openMediaGallery() {
	// media gallery
	$("#open-media").trigger('click');
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
| API SECTIONS
|-----------------------------------------
*/
var registerUser = (query) => {
	return new Promise((resolve, reject) => {
		fetch(`${config.endpoint}/user`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(query)
		}).then(r => r.json()).then(results => {
			console.log(results)
			resolve(results);
		}).catch(err => {
			console.log(err)
			reject(JSON.stringify(err));
		})
	});
}

var loginUser = (query) => {
	return new Promise((resolve, reject) => {
		fetch(`${config.endpoint}/auth`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(query)
		}).then(r => r.json()).then(results => {
			resolve(results);
		}).catch(err => {
			console.log(err)
			reject(JSON.stringify(err));
		})
	});
}

var userProfile = (query) => {
	// console.log('hello');
	return new Promise((resolve, reject) => {
		fetch(`${config.endpoint}/user/${LocalStorage.getItem('user_id')}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'user_id': user_id,
				'x-acces-token': token
			}
		}).then(r => {
			return r.json();
		}).then(results => {
			resolve(results);
		}).catch(err => {
			reject(JSON.stringify(err));
		})
	});
}

var userUpdateProfile = (query) => {
	return new Promise((resolve, reject) => {
		fetch(`${config.endpoint}/user/${LocalStorage.getItem('user_id')}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'user_id': user_id,
				'x-acces-token': token
			},
			body: JSON.stringify(query)
		}).then(r => {
			return r.json();
		}).then(results => {
			resolve(results);
		}).catch(err => {
			reject(JSON.stringify(err));
		})
	});
}

/*
|-----------------------------------------
| FORMAT VOLUME INPUT
|-----------------------------------------
*/
function formatVolume(element) {
    return element.value = numeral(element.value).format('0,0');
}

/*
|-----------------------------------------
| FORMAT VOLUME INPUT
|-----------------------------------------
*/
function formatRate(element) {
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

function togglePayWire() {
	// var customer_consideration = $("#customer_consideration").val();
	// var pay_cash = $("#pay_customer_cash").val();
	// var pay_wire = $("#pay_customer_wire").val();

	// pay_cash = pay_cash.replace(/,/g, "");
 //    pay_wire = pay_wire.replace(/,/g, "");

 //    if(parseFloat(pay_cash) < 0){
 //    	$("#pay_customer_wire").val(numeral(customer_consideration).format('0,0.00'));
 //    	$("#pay_customer_cash").val(numeral(0).format('0,0.00'));
 //    	return false;
 //    }else{
 //    	var new_pay_cash = (parseFloat(pay_cash) - parseFloat(pay_wire));
	// 	var pay_cash = $("#pay_customer_cash").val(numeral(new_pay_cash).format('0,0.00'));
 //    }
}

function togglePayCash() {
	// var pay_wire = $("#pay_customer_wire").val();

}

function toggleBalanceReceive() {
	// toggle balancing
}

function validatePhoneNumber(element) {
	if(element.value.length > 11){
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
		$("#pay_customer_bank_name").html("");
		$("#receive_bank_name").html("");
		$("#pay_customer_bank_name").append(`
			<option value=""> -- select bank -- </option>
		`)
		$("#receive_bank_name").append(`
			<option value=""> -- select bank -- </option>
		`)
		$.each(results.data, function(index, bank) {
			 /* iterate through array or object */
			$("#pay_customer_bank_name").append(`
				<option value="${bank.code}">${bank.name}</option>
			`)

			$("#receive_bank_name").append(`
				<option value="${bank.code}">${bank.name}</option>
			`);
		});
	}).catch(err => {
		console.log(JSON.stringify(err));
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
	var updated_by          = "SB-A21884";
	var created_by          = "SB-A21884";
	var document_file       = $("#document_file").val();

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

	var query = {name, email, phone, currency, volume, rate, pay_cash, pay_wire, pay_bank_name, pay_bank_nuban, receive_cash, receive_wire, receive_bank_name, receive_bank_nuban, consideration, trade_type, created_at, updated_at, created_by, updated_by, document_file}
	// console.log(query);

	// save to offline db
	saveToTransaction(query);

	// return 
	return false;
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

var totalFileLimit = 1;
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
			<input type="file" name="media_file" onchange="pushImageBinary()" class="form-control" />
		`);
	}
}

// capture image preview
function pushImageBinary(){
    var file    = document.querySelector('input[type=file]').files[0];
    var reader  = new FileReader();

    reader.onloadend = async function (e) {
       // console.log(reader.result);
       $("#document_file").val(reader.result);
    }

    if (file) {
       //reads the data as a URL
       reader.readAsDataURL(file);
    } 
}

// get banks
getAvailableBanks();
setDefaultCurrency();
getAllTransactions(0, 10);

/*
|-----------------------------------------
| GET AND OPEN DATABASE
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
			default:
				console.log("no database object created!");
		}
	};

	// return db instance
	return database;
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


		transaction.volume 		 = numeral(transaction.volume).format('0,0.00');
		transaction.rate 		 = numeral(transaction.rate).format('0,0.00');
		transaction.pay_cash	 = numeral(transaction.pay_cash).format('0,0.00');
		transaction.pay_wire 	 = numeral(transaction.pay_wire).format('0,0.00');
		transaction.receive_cash = numeral(transaction.receive_cash).format('0,0.00');
		transaction.receive_wire = numeral(transaction.receive_wire).format('0,0.00');
		transaction.consideration = numeral(transaction.consideration).format('0,0.00');
		
		console.log(transaction);
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
			</table>

			<br /><br />
			<table class="table">
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
					<td><b>Bank Name</b></td>
					<td>${transaction.pay_bank_name}</td>
				</tr>
				<tr>
					<td><b>Account NUBAN</b></td>
					<td>${transaction.pay_bank_nuban}</td>
				</tr>
			</table>

			<br /><br />
			<table class="table">
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
				<tr>
					<td><b>Bank Name</b></td>
					<td>${transaction.receive_bank_name}</td>
				</tr>
				<tr>
					<td><b>Account NUBAN</b></td>
					<td>${transaction.receive_bank_nuban}</td>
				</tr>
			</table>
			<button class="btn btn-flat float-right">
				<i class="material-icons">edit</i> <span class="print-title">Edit</span>
			</button>
		`);
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
  			url: 'https://canary.timsmate.com/api/save/transaction',
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

		if(transaction.trade_type == "1"){
			pay_currency = "NGN - Naira";
			receive_currency = transaction.currency;
			$("#receipt-title").html(`
				<span class="text-success">Receipt</span>
			`);
			transaction.trade_type = "Sold";
		}

		if(transaction.trade_type == "2"){
			pay_currency = transaction.currency;
			receive_currency = "NGN - Naira";
			$("#receipt-title").html(`
				<span class="text-danger">Receipt</span>
			`);
			transaction.trade_type = "Purchased";
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
		
		console.log(transaction);
		$("#show-preview-data").html(`
			<div class="text-center">
				<img src="/img/android-icon-48x48.png" style="border-radius: 0.5rem;"> <span class="text-primary">SEBASTIAN BDC</span>
			</div>
			<table class="table">
				<tr>
					<td>Customer</td>
					<td>${transaction.name}</td>
				</tr>
				<tr>
					<td>Transaction</td>
					<td>${transaction.trade_type}</td>
				</tr>
				<tr>
					<td>Currency</td>
					<td>${transaction.currency}</td>
				</tr>
				<tr>
					<td>Consideration</td>
					<td>${transaction.consideration}</td>
				</tr>
				<tr>
					<td>Agent ID</td>
					<td>${transaction.updated_by}</td>
				</tr>
				<tr>
					<td>Naration</td>
					<td>${transaction.name} ${transaction.trade_type} ${transaction.volume} ${transaction.currency} </td>
				</tr>
				<tr>
					<td>Date</td>
					<td>${transaction.created_at}</td>
				</tr>
			</table>

			<br /><br />
				<table class="table">
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
						<td><b>Bank Name</b></td>
						<td>${transaction.pay_bank_name}</td>
					</tr>
					<tr>
						<td><b>Account NUBAN</b></td>
						<td>${transaction.pay_bank_nuban}</td>
					</tr>
				</table>

				<br /><br />
				<table class="table">
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
					<tr>
						<td><b>Bank Name</b></td>
						<td>${transaction.receive_bank_name}</td>
					</tr>
					<tr>
						<td><b>Account NUBAN</b></td>
						<td>${transaction.receive_bank_nuban}</td>
					</tr>
				</table>

			<button class="btn btn-flat float-right" onclick="printReceipt()" id="print-deal-slip">
				<i class="material-icons">print</i> <span class="print-title">Receipt</span>
			</button>
		`);
		$("#show-preview-modal").modal();
	})
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

function printReceipt() {
	$("#print-deal-slip").hide();
	$("#printable-area").printMe({
		"path": ["css/bootstrap.css"],
		"title": "SB-BDC Receipt" 
	});
}
