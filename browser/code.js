var appConsts = {
	productname: "nodeLikes", 
	productnameForDisplay: "nodeLikes",
	description: "An experiment in liking stuff.",
	urlTwitterServer: "http://likes.scripting.com/",
	domain: "scripting.com", 
	version: "0.4.0"
	};
var appPrefs = {
	ctStartups: 0,
	whenFirstStartup: new Date (),
	maxCharsDescription: 140,
	opmlUrl: undefined,
	lastFeedSubscribedTo: "",
	flConfirmUploads: true,
	urlReaderApp: "http://xmlviewer.scripting.com/?url="
	};

const urlLikeServer = "http://likes.scripting.com/";
var ctLikesInPage = 0; //11/10/18 by DW
var flWasConnected = undefined;
var myNodeLikesApp;

function toggleTwitterConnect () {
	twToggleConnectCommand (function (prompt, callback) {
		confirmDialog (prompt, function () {
			callback ();
			});
		});
	}
function updateConnectButton () {
	var flConnected = twIsTwitterConnected ();
	if (flConnected !== flWasConnected) {
		twUpdateTwitterMenuItem ("idConnectButton");
		flWasConnected = flConnected;
		$("#idConnectButton").css ("display", "inline");
		}
	}

function everySecond () {
	updateConnectButton ();
	}
function startup () {
	console.log ("startup");
	
	$(".likeable").each (function () {
		var thisColor = $(this).attr ("color");
		var thisUrl = window.location.href + "#" + thisColor;
		$(this).attr ("urlForLike", thisUrl);
		$(this).css ("color", thisColor);
		});
	
	var options = {
		urlTwitterServer: "http://likes.scripting.com/"
		};
	myNodeLikesApp = new nodeLikesApp (options, function () {
		hitCounter (); 
		initGoogleAnalytics (); 
		self.setInterval (everySecond, 1000); 
		});
	}
