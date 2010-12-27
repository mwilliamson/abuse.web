var client = require("./redis").client,
    keys = require("./dataKeys");

exports.grammarRepository = function(done) {
    var fetchByName = function(name, onFound, onNotFound) {
            var grammarKeys = keys.forGrammar(name);
            onNotFound = onNotFound || onFound;
            client.mget(grammarKeys.title, grammarKeys.body, function(error, value) {
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
            client.set(keys.forGrammar(name).body, body, callback);
        }
    });
};
