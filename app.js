"use strict";

var Pushalot = require('pushalot-node');
var account = [];
var pushalotToken;
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

function createInsightlog() {
	Homey.manager('insights').createLog( 'pushalot_sendNotifications', {
    label: {
        en: 'Send Notifications'
    },
    type: 'number',
    units: {
        en: 'notifications'
    },
    decimals: 0
});
}

Homey.manager('flow').on('action.pushalotSend', function( callback, args ){
		if( typeof pushalotToken == 'undefined' || pushalotToken == '') return callback( new Error("Pushalot token not configured under settings!") );
		var pMessage = args.message;
		if( typeof pMessage == 'undefined' || pMessage == '' || pMessage == null) return callback( new Error("Message cannot be blank!") );
		var pMessage_type = args.message_type;
		pushalotSend ( pushalotToken, pMessage, pMessage_type);
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
		case 'Belangrijk':
			Type = {IsImportant: true};
			break;
		case 'Stil':
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
		//Add send notification to Insights
		Homey.manager('insights').createEntry( 'pushalot_sendNotifications', 1, new Date(), function(err, success){
        if( err ) return Homey.error(err);
    });
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
		// Create insight log
		createInsightlog();

		Homey.manager('settings').on( 'set', function(settingname){

			if(settingname == 'pushalotaccount') {
			Homey.log('Pushalot - Account has been changed/updated...');
			buildPushalotArray();
		}
		});

	}
}
