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

// file handlers (index.html shorcut not supported)
handle[null] = function (pathname, response) {
	var regex = pathname.match( /^\/([^\.]*\.(.*))$/ );
	var extension = regex[2].toLowerCase();
	pathname = regex[1];
	
	console.log("About to read file " + pathname);
	fs.readFile(pathname, function (err, filedata) {
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

// server scripts can be done like this (SAMPLE BEGINS, you can remove all this but the last line)
handle["/"] = function (response) {
  response.writeHead(200, {"Content-Type": extensions.text });
  response.write("DEFAULT ROOT PAGE");
  response.end();
}

handle["/time.html"] = function (response) {
  response.writeHead(200, {"Content-Type": extensions.html });
  response.write(
		'<html><head><title>Time Compare</title></head>\n' + 
			'<link rel="stylesheet" type="text/css" href="/css/time.css" />\n' + 
			'<body>' +
				'<h1>Time Compare</h1>' +
				'<div>' + 
					'<p>Client Time: <span id="clientTime" class="time">JAVASCRIPT DOES NOT WORK</span></p>' +
				'</div>' +
				'<div>' +
					'<p>Server Time: <span id="serverTime" class="time">\n' + (new Date()).toString() + '</span></p>' +
				'</div>' +
				'<script type="text/javascript">' +
					'document.getElementById("clientTime").textContent = (new Date()).toString();' +
				'</script>' +
			'</body>' +
		'</html>'
	  );
  response.end();
}

handle["/css/time.css"] = function (response) {
  response.writeHead(200, { "Content-Type": extensions.css });
  response.write(
	'@font-face {\n' + 
		'font-family: "Goudy Bookletter 1911";\n' + 
		'font-style: normal;\n' + 
		'font-weight: 400;\n' + 
		'src:  local("Goudy Bookletter 1911"),\n' + 
		'local("GoudyBookletter1911"),\n' + 
		'url(http://themes.googleusercontent.com/static/fonts/goudybookletter1911/v3/l5lwlGTN3pEY5Bf-rQEuIMvsW7MYFVYsuLRj6jSUyb0.woff)\n' + 
		'format("woff");\n' + 
	'}\n' + 
	'@font-face {\n' + 
		'font-family: "Raleway";\n' + 
		'font-style: normal;\n' + 
		'font-weight: 100;\n' + 
		'src:  local("Raleway-Thin"),\n' + 
		'url(http://themes.googleusercontent.com/static/fonts/raleway/v5/RJMlAoFXXQEzZoMSUteGWD8E0i7KZn-EPnyo3HZu7kw.woff)\n' + 
		'format("woff");\n' + 
	'}\n' + 
	'h1, h2, h3 {\n' + 
		'font-family: "Raleway", Helvetica, Arial, sans-serif;\n' + 
		'font-size: 40px;\n' + 
		'line-height: 60px;\n' + 
	'}\n' +  
	'p, span.time {\n' + 
		'font-family: "Goudy Bookletter 1911", Georgia, Times, serif;\n' +  
		'font-size: 20px;\n' +  
		'line-height: 30px;\n' +  
	'}' +
	'div.time {\n' +
		'float: right\n' + 
	'}' +
	''
	);
  response.end();	
}
// server scripts can be done like this (SAMPLE ENDS)

server.start(args.port, handle);
