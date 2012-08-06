// Copyright Jordi Íñigo Griera, 2012
// LGPL

var args = require('commander');
var fs = require('fs');
var server = require("./server");

args
	.version('0.1')
	.option('-p, --port [number]', 'client port', 80)
	.option('-f, --folder [folderpath]', 'root folder path', './' )
	.parse(process.argv);

console.log('Binding to port ', args.port);
console.log('Folder path: ', args.folder);

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

var handle = {
	"": function (pathname, response) {
		// known bug: does not understant filenames with dots in it:
		var extension = '';
		var regex = pathname.match( /^\/([^\.]*\.(.*))$/ );
		if(regex) {
			pathname = regex[1];
			extension = regex[2].toLowerCase();
		}
		fs.readFile(args.folder + pathname, function (err, filedata) {
			if (err) {
				fs.readdir(args.folder + pathname, function (err, fileNames) {
					if(err) {
						console.log("No request handler found nor file for " + pathname);
						response.writeHead(404, { "Content-Type": extensions.text });
						response.write("404 Not found\n" + err);
						response.end();
					} else {
						console.log("Read dir " + args.folder + pathname);
						response.writeHead(200, { "Content-Type": extensions.html });
						for(key in fileNames) {
							response.write('<div class="direntry"><a href="' + fileNames[key] + '">' + fileNames[key] + '</a></div>');
						}
						response.end();
					}
				});
			} else {
				console.log("Read file (" + extension + ': ' + extensions[extension] + "): " + pathname);
				response.writeHead(200, { "Content-Type": extensions[extension] });
				response.write(filedata);
				response.end();
			}
		});
	},

	// sample: gets a JSON POST and stores it in a file (directory _APPEND folder must exist):
	"/append": function (response, postData) {
		response.writeHead(200, {"Content-Type": extensions.json });
		var fileName = args.folder + '_APPEND/A_' + ((new Date()).getTime()) + '.json';
			console.log('Write to ' + fileName + ' data:' + postData);
		fs.writeFile(fileName, postData, function (err) {
			if (err) {
				response.write('resp({ "status": true, "writeLogStatus": false });');
			} else {
				response.write('resp({ "status": true, "writeLogStatus": true });');
			}
			response.end();
		});
	},

	"/datalist": function (response, postData) {
		var folder = args.folder + '/_APPEND';
		fs.readdir(folder, function (err, fileNames) {
			if(!err) {
				var datas = new Array();
				for(var i=0; i<fileNames.length; ++i) {
					fs.readFile(folder + '/' + fileNames[i], 'utf8', function (err, filedata) {
						if(err) {
							console.log(err);
						} else {
							// en asincron no puc passar el nom del fitxer??: console.log(i + ':' + folder + '/' + fileNames[i]);
							var object = JSON.parse(filedata);
							datas.push( object );
							if(datas.length===fileNames.length) {
								console.log('Files read: ' + datas.length);
								response.writeHead(200, {"Content-Type": extensions.text });
								response.write(JSON.stringify(datas));
								response.end();
							}
						}
					});
				}
			}
		});
	},
	
	"/": function (response, postData, urlElements) {
		var query = urlElements.query;
		if(query.samples !== undefined) {
			console.log('Reading samples list');
			fs.readdir(args.folder + '/_APPEND/', function (err, fileNames) {
				if(!err) {	
					response.writeHead(200, {"Content-Type": extensions.json });
					response.write(JSON.stringify(fileNames));
					response.end();
				}
			});
		} else if(query.sample !== undefined) {
			console.log('Reading samples file: ' + query.sample);
			fs.readFile(args.folder + '/_APPEND/' + query.sample, 'utf8', function (err, fileData) {
				if(!err) {	
					response.writeHead(200, {"Content-Type": extensions.json });
					response.write(fileData);
					response.end();
				}
			});
		} else if(query.sample !== undefined) {
			console.log(': ' + query.sample);
			fs.readFile(args.folder + '/_APPEND/' + query.sample, 'utf8', function (err, fileData) {
				if(!err) {	
					response.writeHead(200, {"Content-Type": extensions.json });
					response.write(fileData);
					response.end();
				}
			});
		} else {
			console.log('Wrong command (' + JSON.stringify(urlElements.query) + ').');
			response.writeHead(200, {"Content-Type": extensions.text });
			response.write('Wrong command (' + JSON.stringify(urlElements.query) + ').');
			response.end();
		}
	}
};

server.start(args.port, handle);
