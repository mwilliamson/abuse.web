var client = require("./redis").client,
    keys = require("./dataKeys"),
    injectable = require("./inject").injectable;

exports.grammarRepository = injectable(client, function(client, done) {
    var fetchByNameAndRevision = function(name, revision, callback) {
            var grammarKeys = keys.forGrammar(name),
                bodyKey = grammarKeys.forRevision(revision).body;
            client.mget(grammarKeys.title, bodyKey, function(error, value) {
                callback({
                    name: name,
                    title: value[0].toString(),
                    grammar: value[1].toString()
                });
            });
        },
    fetchByNameOrDefault = function(name, onSuccess, onFailure) {
            // The "OrDefault" refers to the fact that although a grammar
            // might not exist, we know the title (since it's the user's 
            // real name)
            var grammarKeys = keys.forGrammar(name);
            client.mget(grammarKeys.title, grammarKeys.revision, function(error, value) {
                var title = value[0] && value[0].toString(),
                    revision = value[1];
                if (title === null) {
                    (onFailure || onSuccess)(null);
                    return;
                }
                if (revision === null) {
                    onSuccess({
                        name: name,
                        title: title,
                        grammar: null
                    });
                    return;
                }
                client.get(grammarKeys.forRevision(revision).body, function(error, body) {
                    onSuccess({
                        name: name,
                        title: title,
                        grammar: body.toString()
                    });
                });
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
        fetchByNameAndRevision: fetchByNameAndRevision,
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
            var grammarKeys = keys.forGrammar(name),
                revisionKey = grammarKeys.revision;
            client.incr(revisionKey, function(error, revision) {
                client.set(grammarKeys.forRevision(revision).body, body, function() {
                    if (revision === 1) {
                        client.rpush(keys.grammarList, name, callback);
                    } else {
                        callback();
                    } 
                });
            });
        }
    });
});
