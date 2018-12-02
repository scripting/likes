var myNodeLikesApp;

function startup () {
	console.log ("startup");
	
	var options = {
		flPrepend: false,
		addTheWordLikes: false
		};
	
	myNodeLikesApp = new nodeLikesApp (options, function () {
		console.log ("startup: all the likes have been set up.");
		});
	}
