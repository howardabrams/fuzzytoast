// Simple Twitter-client for getting the public timeline from Twitter.
// Useful for showing off the FuzzyToast "regular pull" feature.

var http = require('http');
var twitterClient = http.createClient(80, "api.twitter.com");
var options = {
    host : 'api.twitter.com',
    port : 80,
    path : '/1/statuses/public_timeline.json'
};

function getTweets(cb) {
    var content = "";
    
    http.get(options, function(response) {

        response.addListener("data", function(data) {
            content += data;
        });
        
        response.addListener("end", function() {
            if (cb) {
                cb( JSON.parse(content) );
            }
        });

    }).on('error', function(e) {
        console.log("Got error: " + e.message);
    });
}

function returnTweets(request, response) {
    response.writeHead(200, {"Content-Type" : "application/json"});
    getTweets( function(tweets) {
        response.end(JSON.stringify(tweets));
    });
}
exports.retrieve = returnTweets;
