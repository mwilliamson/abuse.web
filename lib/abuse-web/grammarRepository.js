var client = require("./redis").client;

exports.grammarRepository = function(done) {
    var grammarListKey = "grammars",
        keyForGrammar = function(name) {
            return function(key) {
                return grammarListKey + ":" + name + ":" + key;
            };
        },
        keyForGrammarTitle = function(name) {
            // FIXME should delegate to userRepository
            return "users:" + name + ":realname";
        },
        fetchByName = function(name, onFound, onNotFound) {
            var key = keyForGrammar(name);
            onNotFound = onNotFound || onFound;
            client.mget(keyForGrammarTitle(name), key("body"), function(error, value) {
                if (value[1] === null) {
                    onNotFound(error, null);
                } else {
                    onFound({
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
                var queryArguments = (names || []).map(keyForGrammarTitle);
                queryArguments.push(function(error, titles) {
                    var grammars = [],
                        i;
                    titles = titles || [];
                    for (i = 0; i < titles.length; i += 1) {
                        grammars.push({
                            name: names[i].toString(),
                            title: titles[i].toString()
                        });
                    }
                    callback(grammars);
                });
                client.mget.apply(client, queryArguments);
            });
        },
        fetchByName: fetchByName,
        fetchRandom: function(onSuccess, onFailure) {
            client.llen(grammarListKey, function(error, length) {
                var index = Math.floor(Math.random() * length);
                if (length === 0) {
                    onFailure();
                } else {
                    client.lindex(grammarListKey, index, function(error, name) {
                        fetchByName(name, onSuccess);
                    });
                }
            });
        },
        updateOrCreateGrammar: function(name, body, callback) {
            client.set(keyForGrammar(name)("body"), body, callback);
        }
    });
};
