var client = require("../redis").client,
    injectable = require("../inject").injectable,
    keys = require("../dataKeys");

var toString = function(value) {
    return value && value.toString();
};

var fetchUsers = function(redis, callback) {
    redis.lrange("users", 0, -1, function(error, rawUsernames) {
        var usernames = rawUsernames.map(toString);
        var users = [];
        usernames.forEach(function(username) {
            var userKeys = keys.forUser(username);
            redis.mget(userKeys.realName, userKeys.email, userKeys.salt, userKeys.password, userKeys.authToken, function(error, result) {
                result = result.map(toString);
                
                fetchGrammarsForUsername(redis, username, function(grammars) {
                    users.push({
                        username: username,
                        realName: result[0],
                        emailAddress: result[1],
                        salt: result[2],
                        password: result[3],
                        authToken: result[4],
                        grammars: grammars
                    });
                    if (users.length === usernames.length) {
                        callback(users);
                    }
                });
            });
        });
    });
};

var fetchGrammarsForUsername = function(redis, username, callback) {
    var grammarKeys = keys.forGrammar(username);
    redis.get(grammarKeys.revision, function(error, result) {
        if (result === null) {
            callback([]);
        } else {
            var numberOfRevisions = parseInt(result, 10);
            var revisions = [];
            var addRevisions = function(revisionNumber) {
                redis.get(grammarKeys.forRevision(revisionNumber).body, function(error, body) {
                    revisions.push(body.toString());
                    if (revisionNumber === numberOfRevisions) {
                        callback(revisions);
                    } else {
                        addRevisions(revisionNumber + 1);
                    }
                });
            };
            addRevisions(1);
        }
    });
};

module.exports = injectable(
    module, "to-json",
    [client, "response"],
    function(redis, response) {
        response.writeHead(200, {"Content-Type": "text/plain"});
        fetchUsers(redis, function(users) {
            response.end(JSON.stringify(users));
        });
        //~ redis.keys("*", function(error, rawKeys) {
            //~ var keys = rawKeys.map(toString);
            //~ response.end(JSON.stringify(keys));
        //~ });
    }
);
