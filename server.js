// Copyright Jordi Íñigo Griera, 2012
// LGPL

var http = require("http");
var url = require("url");

function route(handle, response, postData, request) {
	var pathname = url.parse(request.url, true).pathname;
	
	if (typeof handle[pathname] === 'function') {
		handle[pathname](response, postData, request);
	} else {
		handle[''](pathname, response);
	}
}

function start(port, handle) {
	function onRequest(request, response) {
		var postData = '';

		request.setEncoding('utf8');
	    request.addListener("data", function(postDataChunk) {
			postData += postDataChunk;
	    });

		request.addListener("end", function() {
			route(handle, response, postData, request);
		});
	}

	http.createServer(onRequest).listen(port);
	console.log("Server started.");
}

exports.start = start;
exports.route = route;