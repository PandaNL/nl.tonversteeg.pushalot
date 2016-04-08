"use strict";

var Pushalot = require('pushalot-node');
var account = [];
var pushalotToken = null;
var ledringPreference = false;

// Get accounts from homey settings page.
function buildPushalotArray() {
	account = null;
	account = Homey.manager('settings').get('pushalotaccount');

	if (account != null) {
		pushalotToken = account['token'];
		ledringPreference = account['ledring'];
	} else {
	Homey.log("Pushalot - No account configured yet");
	}
}

Homey.manager('flow').on('action.pushalotSend', function( callback, args ){
		var tempToken = pushalotToken;
		var pMessage = args.message;
		var pMessage_type = args.message_type;
		pushalotSend ( tempToken, pMessage, pMessage_type);
    callback( null, true ); // we've fired successfully
});


// Send notification with parameters
function pushalotSend ( pToken , pMessage, pMessage_type) {
	var Type = null;
	switch (pMessage_type) {
		case 'Important':
			Type = {IsImportant: true};
			break;
		case 'Silent':
			Type = {IsSilent: true};
			break;
	}
	if (pToken != ""){
		var client = new Pushalot(pToken)

		client.push(pMessage, "Homey", Type)
	.on('success', function ( code , res ) {
	  //
		if (ledringPreference == true){
			LedAnimate("green", 3000);
		}
	})
	.on('error', function (code , res ) {
	  //
		if (ledringPreference == true){
			LedAnimate("red", 3000);
		}
	})
	}
}


function LedAnimate(colorInput, duration) {
Homey.manager('ledring').animate(
    // animation name (choose from loading, pulse, progress, solid)
    'pulse',

    // optional animation-specific options
    {

	   color: colorInput,
        rpm: 300 // change rotations per minute
    },

    // priority
    'INFORMATIVE',

    // duration
    duration,

    // callback
    function( err, success ) {
        if( err ) return Homey.error(err);

    }
);
}

var self = module.exports = {
	init: function () {

		// Start building Pushalot accounts array
		buildPushalotArray();

		Homey.manager('settings').on( 'set', function(settingname){

			if(settingname == 'pushalotaccount') {
			Homey.log('Pushalot - Account has been changed/updated...');
			buildPushalotArray();
		}
		});

	}
}
