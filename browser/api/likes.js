function nodeLikesApp (options, callback) {
	var ctLikesInPage = 0;
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
			server = twStorageData.urlTwitterServer;
			}
		var apiUrl = server + verb;
		var paramString = buildParamList (params);
		if (paramString.length > 0) {
			apiUrl += "?" + paramString;
			}
		console.log ("serverCall: verb == " + verb + ", apiUrl == " + apiUrl);
		
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
	function likeClick (likesObject, urlForLike) {
		if (twIsTwitterConnected ()) {
			var params = {
				oauth_token: localStorage.twOauthToken,
				oauth_token_secret: localStorage.twOauthTokenSecret,
				url: urlForLike
				};
			likesObject.blur ();
			serverCall ("toggle", params, function (err, jsontext) {
				if (err) {
					console.log ("likeClick: err.message == " + err.message);
					}
				else {
					var jstruct = JSON.parse (jsontext);
					console.log ("likeClick: jstruct == " + jsonStringify (jstruct));
					viewLikes (likesObject, urlForLike, jstruct.likes);
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
	function getMyLikes (callback) {
		if (twIsTwitterConnected ()) {
			var params = {
				oauth_token: localStorage.twOauthToken,
				oauth_token_secret: localStorage.twOauthTokenSecret
				};
			serverCall ("mylikes", params, function (err, jsontext) {
				if (err) {
					console.log ("getMyLikes: err == " + jsonStringify (err));
					callback (err);
					}
				else {
					var jstruct = JSON.parse (jsontext);
					callback (undefined, jstruct);
					}
				});
			}
		else {
			callback (undefined, new Array ());
			}
		}
	function getTopLikes (callback) { //11/24/18 by DW
		if (twIsTwitterConnected ()) {
			serverCall ("toplikes", undefined, function (err, jsontext) {
				if (err) {
					console.log ("getTopLikes: err == " + jsonStringify (err));
					callback (err);
					}
				else {
					var jstruct = JSON.parse (jsontext);
					console.log ("getTopLikes: jstruct == " + jsonStringify (jstruct));
					callback (undefined, jstruct);
					}
				});
			}
		else {
			callback (undefined, new Array ());
			}
		}
	function viewLikes (likesObject, myUrl, likes) { 
		function getThumbIcon (thumbDirection, flopen) {
			var open = "";
			if (flopen) {
				open = "o-";
				}
			return ("<span class=\"spThumb\"><i class=\"fa fa-thumbs-" + open + thumbDirection + "\"></i></span>&nbsp;");
			}
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
		likesObject.html ($("<span class=\"spLikes\">" + theThumb + ctLikes + "</span>"));
		$("[rel=\"tooltip\"]").tooltip ();
		}
	function startLikes () {
		$(".likeable").each (function () {
			var thisUrl = $(this).attr ("urlForLike");
			var id = "idLike" + ctLikesInPage++;
			$(this).prepend ("<div class=\"divLikeContainer\" id=\"" + id + "\"></div>");
			getLikes (thisUrl, function (err, likes) {
				var likesObject = $("#" + id);
				console.log ("startLikes: id == " + id + ", thisUrl == " + thisUrl + ", likes == " + JSON.stringify (likes));
				viewLikes (likesObject, thisUrl, likes);
				likesObject.click (function (event) {
					console.log ("click");
					likeClick (likesObject, thisUrl);
					});
				});
			});
		}
	if (options === undefined) {
		options = {
			};
		}
	twStorageData.urlTwitterServer = (options.urlLikesServer) ? options.urlLikesServer : "http://likes.scripting.com/";
	twGetOauthParams (); //part of the oAuth dance
	this.getMyLikes = getMyLikes;
	this.getTopLikes = getTopLikes;
	startLikes ();
	if (callback !== undefined) {
		callback ();
		}
	}
