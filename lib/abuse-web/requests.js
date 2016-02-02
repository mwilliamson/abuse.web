var injectable = require("./inject").injectable,
    querystring = require("querystring"),
    url = require("url");

exports.postParameters = injectable(
    ["request"],
    function(request, done) {
        // FIXME: need request scoping
        // FIXME: possibly implement this as middleware -- by listening for data
        // at injection-time, we might miss the data/end events
        var data = [];
        if (request.method !== "POST") {
            done(null);
            return;
        }
        if (request.post !== undefined) {
            done(request.post);
            return;
        }
        request.on("data", function(chunk) {
            data.push(chunk.toString());
        });
        
        request.on("end", function() {
            request.post = querystring.parse(data.join(""));
            done(request.post);
        });
    }
);

exports.query = injectable(
    ["request"],
    function(request, done) {
        done(url.parse(request.url, true).query || {});
    }
);

exports.userParameters = injectable(
    ["postParameters", "query"],
    function(post, query, done) {
        var params = {},
            key;
        for (key in query) {
            params[key] = query[key];
        }
        for (key in post) {
            params[key] = post[key];
        }
        
        done(params);
    }
);
