/* 
 * Author       : Jai K
 * Purpose      : Server script for Node.JS
 * Created On   : 2017-02-13 14:33
 */

var port    = process.env.PORT || 5000
,   http    = require('http')
,   fs      = require('fs')
,   path    = require('path')
,   mime    = require('mime')
,   cache   = {};

var isCache = false;

/*var server  = http.createServer();
server.on('request', function(request, response){
    response.writeHead(200, {'content-type' : 'image/png'});
    fs.createReadStream('./app/img.png').pipe(response);
    //res.end('Hello Node.JS\n');
});
server.listen(port);
console.log( "Running @ http://localhost:"+port );*/


var server = http.createServer(function(request, response){
    var filePath = 'public/';
    if( request.url == '/' ) {
        // index
        filePath += 'index.html';
    }else {
        filePath += request.url;
    }
    
    serveFile(response, './'+filePath);
});

server.listen(port, function(){
    console.log('Server is running ... @'+port);
});


/*
 * File Not Found
 */
function send404(response){
    response.writeHead(404, {'content-type' : 'text/plain'});
    response.write('Error 404: File is not found!');
    response.end();
}

/*
 * Send File contents
 */
function sendFile(response, filePath, fileContents) {
    response.writeHead(
        200,
        {'content-type'  : mime.lookup(path.basename(filePath))}
    );
    
    response.end(fileContents);
}

/*
 * Caching ...
 */
function serveFile(response, absPath){
    if( cache[absPath] && isCache ) {
        // Exists
        sendFile(response, absPath, cache[absPath]);
    }else { 
        fs.exists(absPath, function(exists){
            if( exists ) {
                
                // Read a file
                fs.readFile(absPath, function(err, data){
                    if( err ) {
                        send404(response);
                    }else {
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                });
                
            }else {
                // 404
                send404(response);
            }
        })
    }
}


/*
var stream      = fs.createReadStream('./app/resource.json');
stream.on('data', function(chunk){
    console.log(chunk);
}).on('end', function(){
    console.log("Reading is finished.");
})*/


// Start
var chatServer = require('./lib/chat_server');
chatServer.listen(server);

