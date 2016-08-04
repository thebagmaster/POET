var express = require("express");
var app = express();

var pub = '/build/';

/* serves main page */
app.get("/", function(req, res) {
    res.sendFile(__dirname + pub + 'index.html')
});

/* serves all the static files */
app.get(/^(.+)$/, function(req, res){
    console.log('static file request : ' + req.params);
    res.sendFile( __dirname + pub + req.params[0]);
});

var port = 3000;
app.listen(port, function() {
    console.log("Listening on " + port);
});
