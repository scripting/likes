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
		var thisUrl = "http://scripting.com/code/nodelikes/client/" + "#" + thisColor;
		$(this).attr ("urlForLike", thisUrl);
		$(this).css ("color", thisColor);
		});
	var options = {
		urlLikesServer: "http://likes.scripting.com/"
		};
	myNodeLikesApp = new nodeLikesApp (options, function () {
		hitCounter (); 
		initGoogleAnalytics (); 
		self.setInterval (everySecond, 1000); 
		});
	}
