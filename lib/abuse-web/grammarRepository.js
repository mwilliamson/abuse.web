var client = require("./redis").client,
    keys = require("./dataKeys"),
    injectable = require("./inject").injectable;

exports.grammarRepository = injectable(client, function(client, done) {
    var fetchByNameOrDefault = function(name, onSuccess, onFailure) {
            // The "OrDefault" refers to the fact that although a grammar
            // might not exist, we know the title (since it's the user's 
            // real name)
            var grammarKeys = keys.forGrammar(name);
            client.mget(grammarKeys.title, grammarKeys.body, function(error, value) {
                if (value[0] === null) {
                    (onFailure || onSuccess)(null);
                } else {
                    onSuccess({
                        name: name,
                        title: value[0].toString(),
                        grammar: value[1] && value[1].toString()
                    });
                }
            });
        },
        fetchByName = function(name, onFound, onNotFound) {
            fetchByNameOrDefault(name, function(grammar) {
                if (grammar.grammar === null) {
                    (onNotFound || onFound)(null);
                } else {
                    onFound(grammar);
                }
            }, onNotFound || onFound);
        };
    done({
        fetchByNameOrDefault: fetchByNameOrDefault,
        fetchAllNamesAndTitles: function(callback) {
            client.lrange(keys.grammarList, 0, -1, function(error, names) {
                var queryArguments = (names || []).map(function(name) {
                    return keys.forGrammar(name).title;
                });
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
            client.llen(keys.grammarList, function(error, length) {
                var index = Math.floor(Math.random() * length);
                if (length === 0) {
                    onFailure();
                } else {
                    client.lindex(keys.grammarList, index, function(error, name) {
                        fetchByName(name, onSuccess);
                    });
                }
            });
        },
        updateOrCreateGrammar: function(name, body, callback) {
            var bodyKey = keys.forGrammar(name).body;
            client.exists(bodyKey, function(error, exists) {
                if (exists) {
                    client.set(bodyKey, body, callback);
                } else {
                    client.rpush(keys.grammarList, name, function() {
                        client.set(bodyKey, body, callback);
                    });
                }
            });
        }
    });
});
