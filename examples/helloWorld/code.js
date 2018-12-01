var appConsts = {
	domain: "littleoutliner.com",
	version: "0.4.0"
	};
function everyMinute () {
	var now = new Date ();
	console.log ("\neveryMinute: " + now.toLocaleTimeString () + ", v" + appConsts.version);
	}
function everySecond () {
	}
function startup () {
	console.log ("startup");
	$(".likeable").each (function () {
		$(this).attr ("urlForLike", window.location.href);
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
