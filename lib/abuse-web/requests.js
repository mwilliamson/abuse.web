var injectable = require("./inject").injectable,
    querystring = require("querystring");

exports.postParameters = injectable("request", function(request, done) {
    var data = [];
    if (request.method !== "POST") {
        done(null);
    }
    request.on("data", function(chunk) {
      data.push(chunk.toString());
    });
    
    request.on("end", function() {
        done(querystring.parse(data.join("")));
    });
});
