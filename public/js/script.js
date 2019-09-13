var user_id;
var token;

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
	$("#preview-customer-name").html(` - ${customer_name}`);
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

var uploadAvatar = (query) => {
	return new Promise((resolve, reject) => {
		fetch(`${config.endpoint}/media`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'user_id': user_id,
				'x-acces-token': token
			},
			body: JSON.stringify({media_path})
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

    // filter commas
    volume = volume.replace(/,/g, "");
    rate = rate.replace(/,/g, "");

    var consideration = (parseFloat(volume) * parseFloat(rate));
    $("#exchange-preview").html(`
    	<label for="customer_consideration">Exchange Consideration</label>
    	<input type="text" id="customer_consideration" value="${numeral(consideration).format('0,0.00')}" class="form-control" readonly="" />
    `);
    // $("#exchange-preview").addClass('form-control');
}

