// Copyright Jordi Íñigo Griera, 2012
// LGPL

var args = require('commander');
var fs = require('fs');
var server = require("./server");

args
	.version('0.0.1')
	.option('-p, --port [number]', 'client port', 80)
	.option('-f, --folder [folderpath]', 'root folder path', './' )
	.parse(process.argv);

// client pages, styles and scripts
var extensions = {
	"html" 	: "text/html; charset=UTF-8", 
	"htm" 	: "text/html; charset=UTF-8", 
	"css" 	: "text/css",
	"json" 	: "text/json; charset=UTF-8",
	"jsonp"	: "text/json; charset=UTF-8",
	"js" 	: "text/javascript; charset=UTF-8",
	"ico" 	: "image/x-icon",
	"text"	: "text/plain",
	""		: "text/plain"
}

var handle = {};

// file handlers (index.html shorcut not supported)
handle[null] = function (pathname, response) {
	// known bug: does not understant filenames with dots in it:
	var regex = pathname.match( /^\/([^\.]*\.(.*))$/ );
	var extension;
	if(regex) {
		extension = regex[2].toLowerCase();
		pathname = regex[1];
	} else {
		extension = '';
		pathname = '';
	}
	console.log("About to read file (" + extension + ':' + extensions[extension] + ")" + pathname);
	fs.readFile(args.folder + pathname, function (err, filedata) {
		if (err) {
			console.log("No request handler found nor file for " + pathname);
			response.writeHead(404, {
					"Content-Type": "text/plain"
				});
			response.write("404 Not found");
			response.end();
		} else {
			response.writeHead(200, {
					"Content-Type": extensions[extension]
				});
			response.write(filedata);
			response.end();
		}
	});

}

// sample: gets a JSON POST and stores it in a file:
handle["/append"] = function (response, postData) {
	response.writeHead(200, {"Content-Type": extensions.json });
	var fileName = args.folder + '_APPEND/A_' + ((new Date()).getTime()) + '.json';
		console.log('write to ' + fileName + ' data:' + postData + '\n');
	fs.writeFile(fileName, 'var mostra = \n\t' + postData + '\n;\n', function (err) {
		if (err) {
			response.write('resp({ "status": false });');
		} else {
			response.write('resp({ "status": true });');
		}
		response.end();
	});
}

handle["/"] = function (response) {
  response.writeHead(200, {"Content-Type": extensions.text });
  response.write("Virtual Keyboard Test Facility");
  response.end();
}

server.start(args.port, handle);
