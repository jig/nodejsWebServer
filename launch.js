// Copyright Jordi Íñigo Griera, 2012
// LGPL

var args = require('commander');
var fs = require('fs');
var server = require("./server");

args
	.version('0.0.1')
	.option('-p, --port [number]', 'client port', 80)
	.parse(process.argv);

// client pages, styles and scripts
var extensions = {
	"html" 	: "text/html; charset=UTF-8", 
	"htm" 	: "text/html; charset=UTF-8", 
	"css" 	: "text/css",
	"json" 	: "application/json; charset=UTF-8",
	"js" 	: "application/javascript; charset=UTF-8",
	"ico" 	: "image/x-icon",
	"text"	: "text/plain"
}

var handle = {};

handle["/"] = function (response) {
  console.log('...');
  response.writeHead(200, {"Content-Type": extensions.json });
  response.write( 
	JSON.stringify({
		"varA": "valueA",
		"varB": "valueB"		
	})
  );
  response.end();
}

server.start(args.port, handle);
