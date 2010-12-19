var client = require("./redis").client;

exports.grammarRepository = function(done) {
    var grammarListKey = "grammars",
        fetchByName = function(name, onFound, onNotFound) {
            var key = function(subKey) {
                return "grammars:" + name + ":" + subKey;
            };
            onNotFound = onNotFound || onFound;
            client.mget(key("title"), key("grammar"), function(error, value) {
                if (value[0] === null) {
                    onNotFound(error, null);
                } else {
                    onFound(error, {
                        name: name,
                        title: value[0].toString(),
                        grammar: value[1].toString()
                    });
                }
            });
        };
    done({
        fetchAllNamesAndTitles: function(callback) {
            client.lrange(grammarListKey, 0, -1, function(error, names) {
                var queryArguments = names.map(function(name) {
                    return "grammars:" + name + ":title";
                });
                queryArguments.push(function(error, titles) {
                    var grammars = [],
                        i;
                    for (i = 0; i < titles.length; i += 1) {
                        grammars.push({
                            name: names[i].toString(),
                            title: titles[i].toString()
                        });
                    }
                    callback(error, grammars);
                });
                client.mget.apply(client, queryArguments);
            });
        },
        fetchByName: fetchByName,
        fetchRandom: function(callback) {
            client.llen(grammarListKey, function(error, length) {
                var index = Math.floor(Math.random() * length);
                client.lindex(grammarListKey, index, function(error, name) {
                    fetchByName(name, callback);
                });
            });
        }
    });
};
