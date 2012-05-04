
/**
 * Module dependencies.
 */

var express = require('express');
var port    = 3000;

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '../web'));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});


// Routes

app.get('/', redirectWeb);
app.get('/test', redirectTest);


app.listen(port);
console.log("FuzzyToast hosting server listening on port %d", port);

function redirectWeb( request, response ) {
    response.statusCode = 302;
    response.setHeader("Location", "/index.html");
    response.end('<p>302. Redirecting to index.html</p>');
};

function redirectTest( request, response ) {
    response.statusCode = 302;
    response.setHeader("Location", "/test/index.html");
    response.end('<p>302. Redirecting to test/index.html</p>');
};
