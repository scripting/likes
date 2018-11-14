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

function serverCall (verb, params, callback, server, method, data) {
	const timeoutInMilliseconds = 30000;
	if (method === undefined) {
		method = "GET";
		}
	if (params === undefined) {
		params = new Object ();
		}
	if (params.accessToken === undefined) { //10/29/18 by DW
		if (localStorage.twOauthToken !== undefined) {
			params.accessToken = localStorage.twOauthToken;
			}
		}
	if (server === undefined) { //9/25/18 by DW
		server = urlLikeServer;
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
function likeClick (idLikes, urlForLike) {
	twStorageData.urlTwitterServer = urlLikeServer;
	if (twIsTwitterConnected ()) {
		var params = {
			oauth_token: localStorage.twOauthToken,
			oauth_token_secret: localStorage.twOauthTokenSecret,
			url: urlForLike
			};
		$("#" + idLikes).blur ();
		serverCall ("toggle", params, function (err, jsontext) {
			if (err) {
				console.log ("likeClick: err.message == " + err.message);
				}
			else {
				var jstruct = JSON.parse (jsontext);
				console.log ("likeClick: jstruct == " + jsonStringify (jstruct));
				viewLikes (idLikes, urlForLike, jstruct.likes);
				}
			});
		}
	else {
		confirmDialog ("Sign on to Twitter to enable Like/Unlike?", function () {
			twConnectToTwitter ();
			});
		}
	}
function getLikes (url, callback) {
	var params = {
		url: url
		};
	serverCall ("likes", params, function (err, jsontext) {
		if (err) {
			console.log ("getLikes: err == " + jsonStringify (err));
			callback (err);
			}
		else {
			var jstruct = JSON.parse (jsontext);
			callback (undefined, jstruct);
			}
		});
	}
function viewLikes (idLikes, myUrl, likes) { 
	function getThumbIcon (thumbDirection, flopen) {
		var open = "";
		if (flopen) {
			open = "o-";
			}
		return ("<span class=\"spThumb\"><i class=\"fa fa-thumbs-" + open + thumbDirection + "\"></i></span>&nbsp;");
		}
	var likesObject = $("#" + idLikes);
	var ct = 0, likenames = "", thumbDirection = "up", flOpenThumb = true, myScreenname = twGetScreenName ();
	if (likes !== undefined) {
		likes.forEach (function (name) {
			ct++;
			likenames += name + ", ";
			if (name == myScreenname) {
				thumbDirection = "down";
				flOpenThumb = false;
				}
			});
		}
	var theThumb = getThumbIcon ("up", flOpenThumb);
	var ctLikes = ct + " like";
	if (ct != 1) {
		ctLikes += "s";
		}
	if (ct > 0) {
		likenames = stringMid (likenames, 1, likenames.length - 2); //pop off comma and blank at end
		ctLikes = "<span rel=\"tooltip\" title=\"" + likenames + "\">" + ctLikes + "</span>";
		}
	var htmltext = "<span class=\"spLikes\"><a onclick=\"likeClick ('" + idLikes + "', '" + myUrl + "')\">" + theThumb + "</a>" + ctLikes + "</span>";
	likesObject.html (htmltext);
	$("[rel=\"tooltip\"]").tooltip ();
	}

function everySecond () {
	updateConnectButton ();
	}
function startLikes () {
	var url = window.location.href;
	if (endsWith (url, "#")) {
		url = stringMid (url, 1, url.length - 1);
		}
	$(".likeable").each (function () {
		var thisColor = $(this).attr ("color");
		var thisUrl = url + "#" + thisColor;
		var id = "idLike" + ctLikesInPage++;
		$(this).prepend ("<div class=\"divLikeContainer\" id=\"" + id + "\"></div>");
		$(this).css ("color", thisColor);
		getLikes (thisUrl, function (err, likes) {
			console.log ("startLikes: id == " + id + ", thisColor == " + thisColor + ", likes == " + JSON.stringify (likes));
			viewLikes (id, thisUrl, likes);
			});
		});
	}
function startup () {
	console.log ("startup");
	twStorageData.urlTwitterServer = appConsts.urlTwitterServer;
	twGetOauthParams ();
	startLikes ();
	hitCounter (); 
	initGoogleAnalytics (); 
	self.setInterval (everySecond, 1000); 
	}
