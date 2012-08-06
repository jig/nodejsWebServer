// Copyright Jordi Íñigo Griera, 2012
// LGPL

var http = require("http");
var url = require("url");

function route(handle, urlElements, response, postData) {
	if (typeof handle[urlElements.pathname] === 'function') {
		handle[urlElements.pathname](response, postData, urlElements);
	} else {
		handle[''](urlElements.pathname, response, postData, urlElements);
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
			route(handle, url.parse(request.url, true), response, postData);
		});
	}

	http.createServer(onRequest).listen(port);
	console.log("Server started.");
}

exports.start = start;
exports.route = route;