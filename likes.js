var myProductName = "nodeLikes", myVersion = "0.4.3";   

const mysql = require ("mysql");
const utils = require ("daveutils");
const fs = require ("fs");
const request = require ("request");
const davetwitter = require ("davetwitter");
const dateFormat = require ("dateformat");
const s3 = require ("daves3"); 

var config = {
	fnameStats: "data/stats.json",
	};
const fnameConfig = "config.json";

var stats = {
	productName: myProductName,
	version: myVersion,
	ctStartups: 0,
	whenLastStartup: new Date (0),
	ctHits: 0,
	ctHitsToday: 0,
	ctHitsThisRun: 0,
	whenLastHit: new Date (0),
	ctLikes: 0, whenLastLike: new Date (0),
	ctUnlikes: 0, whenLastUnlike: new Date (0)
	};
var flStatsChanged = false;

var theSqlConnectionPool = undefined; 
var flOneConsoleMsgInLastMinute = false;

function statsChanged () {
	flStatsChanged = true;
	}

function runSqltext (s, callback) {
	theSqlConnectionPool.getConnection (function (err, connection) {
		if (err) {
			console.log ("runSqltext: s == " + s);
			console.log ("runSqltext: err.code == " + err.code + ", err.message == " + err.message);
			if (callback !== undefined) {
				callback (err);
				}
			}
		else {
			connection.query (s, function (err, result) {
				connection.release ();
				if (err) {
					console.log ("runSqltext: err.code == " + err.code + ", err.message == " + err.message);
					}
				if (callback !== undefined) {
					callback (err, result);
					}
				});
			}
		});
	}
function formatDateTime (when) {
	if (when === undefined) {
		when = new Date ();
		}
	return (dateFormat (new Date (when), "yyyy-mm-dd HH:MM:ss"));
	}
function encode (s) {
	return (mysql.escape (s));
	}
function encodeValues (values) {
	var part1 = "", part2 = "";
	for (var x in values) { //generate something like this: (feedurl, title, htmlurl, description, whenupdated)
		if (part1.length > 0) {
			part1 += ", ";
			}
		part1 += x;
		}
	for (var x in values) { //and this: ('http://scripting.com/rss.xml', Scripting News', 'http://scripting.com/', 'Even worse etc', '2018-02-04 12:04:08')
		if (part2.length > 0) {
			part2 += ", ";
			}
		part2 += encode (values [x]);
		}
	return ("(" + part1 + ") values (" + part2 + ");");
	}

function findLike (username, url, callback) {
	var sqltext = "select * from likes where username = " + encode (username) + " and url = " + encode (url) + ";";
	runSqltext (sqltext, function (err, result) {
		if (!err) {
			console.log ("findLike: result == " + utils.jsonStringify (result));
			}
		if (callback !== undefined) {
			callback (err, result);
			}
		});
	}
function like (username, url, callback) {
	var values = {
		username: username,
		url: url,
		whencreated: formatDateTime (new Date ())
		};
	var sqltext = "replace into likes " + encodeValues (values);
	runSqltext (sqltext, callback);
	stats.ctLikes++;
	stats.whenLastLike = new Date ();
	statsChanged ();
	}
function unlike (username, url, callback) {
	var sqltext = "delete from likes where username = " + encode (username) + " and url = " + encode (url) + ";";
	runSqltext (sqltext, callback);
	stats.ctUnlikes++;
	stats.whenLastUnlike = new Date ();
	statsChanged ();
	}
function getLikes (url, callback) {
	var sqltext = "select username from likes where url = " + encode (url) + " order by whencreated desc;";
	runSqltext (sqltext, function (err, result) {
		if (!err) {
			}
		if (callback !== undefined) {
			var theList = new Array ();
			for (var i = 0; i < result.length; i++) {
				theList.push (result [i].username);
				}
			callback (err, theList);
			}
		});
	}
function toggleLike (username, url, callback) {
	var flLiked = false;
	getLikes (url, function (err, theArray) {
		theArray.forEach (function (name) {
			if (name == username) {
				flLiked = true;
				}
			});
		var jstruct = {
			what: (flLiked) ? "unlike" : "like",
			screenname: username,
			url: url,
			likes: theArray
			};
		if (flLiked) { //not liked
			unlike (username, url, function (err, result) {
				var likeList = new Array ();
				jstruct.likes.forEach (function (name) {
					if (name != username) { //copy every name but the user's
						likeList.push (name);
						}
					});
				jstruct.likes = likeList;
				callback (err, jstruct);
				});
			}
		else {
			like (username, url, function (err, result) {
				jstruct.likes.unshift (username); //insert at beginning of array
				callback (err, jstruct);
				});
			}
		});
	}

function handleHttpRequest (theRequest) {
	var params = theRequest.params;
	var token = (params.oauth_token !== undefined) ? params.oauth_token : undefined;
	var secret = (params.oauth_token_secret !== undefined) ? params.oauth_token_secret : undefined;
	
	flOneConsoleMsgInLastMinute = true;
	
	stats.ctHits++;
	stats.ctHitsToday++;
	stats.ctHitsThisRun++;
	stats.whenLastHit = new Date ();
	
	function returnPlainText (s) {
		theRequest.httpReturn (200, "text/plain", s.toString ());
		}
	function returnData (jstruct) {
		if (jstruct === undefined) {
			jstruct = {};
			}
		theRequest.httpReturn (200, "application/json", utils.jsonStringify (jstruct));
		}
	function returnXml (xmltext) {
		theRequest.httpReturn (200, "text/xml", xmltext);
		}
	function returnNotFound () {
		theRequest.httpReturn (404, "text/plain", "Not found.");
		}
	function returnError (jstruct) {
		console.log ("returnError: jstruct == " + utils.jsonStringify (jstruct));
		theRequest.httpReturn (500, "application/json", utils.jsonStringify (jstruct));
		}
	function httpReturn (err, jstruct) {
		if (err) {
			returnError (err);
			}
		else {
			returnData (jstruct);
			}
		}
	function callWithScreenname (callback) {
		davetwitter.getScreenName (token, secret, function (screenname) {
			if (screenname === undefined) {
				returnError ({message: "Can't do the thing you want because the accessToken is not valid."});    
				}
			else {
				callback (screenname);
				}
			});
		}
	
	switch (theRequest.lowerpath) {
		case "/now": 
			returnPlainText (new Date ());
			return (true); 
		case "/stats":
			returnData (stats);
			return (true); 
		case "/toggle":
			callWithScreenname (function (screenname) {
				toggleLike (screenname, params.url, httpReturn);
				});
			return (true); 
		case "/likes":
			getLikes (params.url, httpReturn);
			return (true); 
		}
	return (false); //we didn't handle it
	}
function readConfig (callback) {
	utils.sureFilePath (fnameConfig, function () {
		fs.readFile (fnameConfig, function (err, data) {
			if (!err) {
				try {
					var jstruct = JSON.parse (data.toString ());
					for (var x in jstruct) {
						config [x] = jstruct [x];
						}
					}
				catch (err) {
					console.log ("readConfig: err == " + err.message);
					}
				}
			if (callback !== undefined) {
				callback ();
				}
			});
		});
	}
function readStats (callback) {
	utils.sureFilePath (config.fnameStats, function () {
		fs.readFile (config.fnameStats, function (err, data) {
			if (!err) {
				try {
					var jstruct = JSON.parse (data.toString ());
					for (var x in jstruct) {
						stats [x] = jstruct [x];
						}
					}
				catch (err) {
					}
				}
			if (callback !== undefined) {
				callback ();
				}
			});
		});
	}
function writeStats (callback) {
	utils.sureFilePath (config.fnameStats, function () {
		fs.writeFile (config.fnameStats, utils.jsonStringify (stats), function (err) {
			if (callback !== undefined) {
				callback ();
				}
			});
		});
	}
function everyMinute () {
	var now = new Date (), timestring = now.toLocaleTimeString ();
	if (flOneConsoleMsgInLastMinute) {
		console.log ("");
		flOneConsoleMsgInLastMinute = false;
		}
	console.log (myProductName + " v" + myVersion + ": " + timestring + ".\n");
	readConfig ();
	if (!utils.sameDay (stats.whenLastDayRollover, now)) { //date rollover
		stats.whenLastDayRollover = now;
		stats.ctHitsToday = 0;
		statsChanged ();
		}
	}
function everySecond () {
	if (flStatsChanged) {
		flStatsChanged = false;
		writeStats ();
		}
	}

console.log ("\n" + myProductName + " v" + myVersion + "\n");
readConfig (function () {
	console.log ("config == " + utils.jsonStringify (config));
	readStats (function () {
		stats.productName = myProductName;
		stats.version = myVersion;
		stats.whenLastStartup = new Date ();
		stats.ctStartups++;
		stats.ctHitsThisRun = 0;
		statsChanged ();
		theSqlConnectionPool = mysql.createPool (config.database);
		config.twitter.httpRequestCallback = handleHttpRequest;
		config.twitter.flPostEnabled = true; //3/1/18 by DW
		davetwitter.start (config.twitter, function () {
			});
		setInterval (everySecond, 1000); 
		utils.runEveryMinute (everyMinute);
		});
	});
