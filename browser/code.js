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

function toggleTwitterConnect () {
	twToggleConnectCommand (function (prompt, callback) {
		confirmDialog (prompt, function () {
			callback ();
			});
		});
	}
function everyMinute () {
	var now = new Date ();
	console.log ("\neveryMinute: " + now.toLocaleTimeString () + ", v" + appConsts.version);
	if (flHotlistPage) {
		if (ctHotlistUpdateChecks++ < maxHotlistUpdateChecks) { //5/15/18 by DW
			viewHotlistWithCheckboxes (); //update if change
			}
		}
	}
function oldstartup () {
	
	function finishStartup () {
		var feedurlParam = getURLParameter ("feedurl");
		var usernameParam = getURLParameter ("username");
		var testingParam = getURLParameter ("testing");
		
		if (testingParam != "null") {
			console.log ("testing");
			viewHotlistWithCheckboxes ();
			}
		else {
			if (feedurlParam != "null") {
				viewFeedPage (decodeURIComponent (feedurlParam));
				}
			else {
				if (usernameParam != "null") {
					viewUserPage (decodeURIComponent (usernameParam));
					}
				else {
					viewHotlistWithCheckboxes ();
					}
				}
			}
		
		
		self.setInterval (everySecond, 1000); 
		runAtTopOfMinute (function () {
			self.setInterval (everyMinute, 60000); 
			everyMinute ();
			});
		hitCounter (); 
		initGoogleAnalytics (); 
		}
	
	console.log ("startup");
	
	if (appConsts.urlTwitterServer == "[%urlTwitterServer%]") { //4/5/18 by DW
		appConsts.urlTwitterServer = "http://feedbase.io/";
		console.log ("startup: appConsts.urlTwitterServer == " + appConsts.urlTwitterServer);
		}
	
	$("div[rel=tooltip]").tooltip ({
		live: true
		});
	initMenus ();
	menubarDropzoneSetup ();
	
	twStorageData.urlTwitterServer = appConsts.urlTwitterServer;
	
	if (localStorage.twSYO2Conversion === undefined) { //force user to login again if they haven't used SYO2
		localStorage.removeItem ("twOauthToken");
		localStorage.twSYO2Conversion = true; //now it's defined
		}
	
	twGetOauthParams ();
	if (twIsTwitterConnected ()) {
		getPrefs (function () {
			appPrefs.ctStartups++;
			appPrefs.whenLastStartup = new Date ();
			console.log ("startup: appPrefs == " + jsonStringify (appPrefs));
			prefsChanged ();
			finishStartup ();
			});
		}
	else {
		finishStartup ();
		}
	}

function serverCall (verb, params, callback, server, method, data) {
	const timeoutInMilliseconds = 30000;
	if (method === undefined) {
		method = "GET";
		}
	if (params === undefined) {
		params = new Object ();
		}
	if (params.accessToken === undefined) { //10/29/18 by DW
		params.accessToken = appPrefs.accessToken;
		}
	if (server === undefined) { //9/25/18 by DW
		server = appConsts.urlTwitterServer;
		}
	var apiUrl = server + verb;
	var paramString = buildParamList (params);
	if (paramString.length > 0) {
		apiUrl += "?" + paramString;
		}
	var ajaxResult = $.ajax ({ 
		url: apiUrl,
		type: method,
		data: data,
		dataType: "text", 
		headers: undefined,
		timeout: timeoutInMilliseconds 
		}) 
	.success (function (data, status) { 
		callback (undefined, data);
		}) 
	.error (function (status) { 
		console.log ("serverCall: url == " + apiUrl + ", error == " + jsonStringify (status));
		callback ({message: "Error reading the file."});
		});
	}
function likeClick (idLikes) {
	if (twIsTwitterConnected ()) {
		var params = {
			oauth_token: localStorage.twOauthToken,
			oauth_token_secret: localStorage.twOauthTokenSecret,
			url: window.location.href
			};
		console.log ("likeClick:");
		$("#" + idLikes).blur ();
		serverCall ("toggle", params, function (err, jsontext) {
			if (err) {
				console.log ("likeClick: err == " + jsonStringify (err));
				}
			else {
				var jstruct = JSON.parse (jsontext);
				console.log ("likeClick: jstruct == " + jsonStringify (jstruct));
				viewLikes ("idLikes", jstruct.likes);
				}
			});
		}
	else {
		confirmDialog ("Sign on to Twitter to enable Like/Unlike?", function () {
			twConnectToTwitter ();
			});
		}
	}
function getLikes (callback) {
	var params = {
		url: window.location.href
		};
	serverCall ("likes", params, function (err, jsontext) {
		if (err) {
			console.log ("getLikes: err == " + jsonStringify (err));
			callback (err);
			}
		else {
			var jstruct = JSON.parse (jsontext);
			console.log ("getLikes: jstruct == " + jsonStringify (jstruct));
			callback (undefined, jstruct);
			}
		});
	}
function viewLikes (idLikes, likes) { 
	var likesObject = $("#" + idLikes);
	var ct = 0, likenames = "", thumbDirection = "up", myScreenname = twGetScreenName (), flThumbOpen = true;
	if (likes !== undefined) {
		likes.forEach (function (name) {
			ct++;
			likenames += name + ", ";
			if (name == myScreenname) {
				thumbDirection = "down";
				flThumbOpen = false;
				}
			});
		}
	
	var openOrNot = (flThumbOpen) ? "-o" : "";
	var theThumb = "<span class=\"spThumb\"><i class=\"fa fa-thumbs" + openOrNot + "-up\"></i></span>&nbsp;";
	
	var ctLikes = ct + " like";
	if (ct != 1) {
		ctLikes += "s";
		}
	if (ct > 0) {
		likenames = stringMid (likenames, 1, likenames.length - 2); //pop off comma and blank at end
		ctLikes = "<span rel=\"tooltip\" title=\"" + likenames + "\">" + ctLikes + "</span>";
		}
	var htmltext = "<span class=\"spLikes\"><a onclick=\"likeClick ('" + idLikes + "')\">" + theThumb + "</a>" + ctLikes + "</span>";
	likesObject.html (htmltext);
	$("[rel=\"tooltip\"]").tooltip ();
	}
function startLikes () {
	getLikes (function (err, likes) {
		if (err) {
			console.log ("startLikes: " + err.message);
			}
		else {
			viewLikes ("idLikes", likes);
			}
		});
	}
function everySecond () {
	var now = clockNow ();
	twUpdateTwitterMenuItem ("idConnectButton");
	
	$("#idTwitterUsername").html (localStorage.twScreenName); 
	
	twUpdateTwitterUsername ("idTwitterUsername");
	
	
	}
function startup () {
	console.log ("startup");
	twStorageData.urlTwitterServer = appConsts.urlTwitterServer;
	twGetOauthParams ();
	self.setInterval (everySecond, 1000); 
	startLikes ();
	hitCounter (); 
	initGoogleAnalytics (); 
	}
