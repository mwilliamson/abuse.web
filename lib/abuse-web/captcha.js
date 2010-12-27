var http = require("http"),
    querystring = require("querystring");

exports.verify = function(challenge, usersAnswer, remoteIp, callback) {
    var body = querystring.stringify({
            privatekey: "6LdE6L8SAAAAACIBSo74xJO1sapchoVIQG5_VUYa",
            remoteip: remoteIp,
            challenge: challenge,
            response: usersAnswer
        }),
        client = http.createClient(80, 'www.google.com'),
        request = client.request('POST', '/recaptcha/api/verify', {
            'host': 'www.google.com',
            'Content-Length': body.length,
            'Content-Type': 'application/x-www-form-urlencoded'
        });
    request.end(body);
    request.on("response", function(response) {
        var data = [];
        response.on("data", function(chunk) {
            data.push(chunk.toString());
        });
        
        response.on("end", function() {
            var result = data.join("").split("\n");
            callback(result[0] === "true", result[1]);
        });
    });
};
