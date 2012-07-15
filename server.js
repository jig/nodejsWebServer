// Copyright Jordi Íñigo Griera, 2012
// LGPL

var http = require("http");
var url = require("url");

function route(handle, pathname, response, postData) {
  console.log("About to route a request for " + pathname);
  if (typeof handle[pathname] === 'function') {
	handle[pathname](response, postData);
  } else {
	handle[null](pathname, response, postData);
  }
}

function start(port, handle) {
	function onRequest(request, response) {
		var postData = '';
		var pathname = url.parse(request.url).pathname;
		console.log("\nRequest: " + pathname);

		request.setEncoding('utf8');
	    request.addListener("data", function(postDataChunk) {
			postData += postDataChunk;
			console.log("Received POST data chunk '"+
			postDataChunk + "'.");
	    });

		request.addListener("end", function() {
			// enruta al handler apropiat
			route(handle, pathname, response, postData);
		});
	}

  http.createServer(onRequest).listen(port);
  console.log("Server has started at port " + port);
}

exports.start = start;
exports.route = route;