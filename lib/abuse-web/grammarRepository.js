var fs = require("fs");
var path = require("path");
    
var grammarsRoot = path.join(__dirname, "../../grammars");
var grammars = fs.readdirSync(grammarsRoot).map(function(directoryName) {
    var grammarRoot = path.join(grammarsRoot, directoryName);
    var title = fs.readFileSync(path.join(grammarRoot, "name"), "utf8").trim();
    var revisions = fs.readdirSync(grammarRoot)
        .filter(function(filename) {
            return filename !== "name";
        })
        .map(function(filename) {
            var grammarBody = fs.readFileSync(path.join(grammarRoot, filename), "utf8");
            return buildGrammar(directoryName, title, grammarBody, parseInt(filename, 10));
        });
    
    revisions.sort(function(first, second) {
        return first.revision - second.revision;
    });
    
    return {
        name: directoryName,
        title: title,
        revisions: revisions,
        latestRevision: revisions[revisions.length - 1]
    };
});

function findGrammarByName(name) {
    return find(grammars, function(grammar) {
        return grammar.name === name;
    });
}

function find(list, predicate) {
    for (var i = 0; i < list.length; i++) {
        if (predicate(list[i])) {
            return list[i];
        }
    }
}

var fetchLatestRevisionNumberByName = function(name, onSuccess, onFailure) {
        var grammar = findGrammarByName(name);
        if (grammar && grammar.latestRevision) {
            onSuccess(grammar.latestRevision.revision);
        } else {
            onFailure();
        }
    },
    fetchByNameAndRevision = function(name, revision, onSuccess, onFailure) {
        var grammar = findGrammarByName(name);
        if (grammar) {
            var revision = grammar.revisions[revision - 1];
            if (revision) {
                onSuccess(revision);
            } else {
                onFailure();
            }
        } else {
            onFailure();
        }
    },
    fetchByName = function(name, onFound, onNotFound) {
        fetchLatestRevisionNumberByName(name, function(revision) {
            fetchByNameAndRevision(name, revision, onFound, onNotFound);
        }, function() {
            (onNotFound || onFound)(null);
        });
    };
    
module.exports = {
    fetchAllNamesAndTitles: function(callback) {
        callback(grammars);
    },
    fetchByName: fetchByName,
    fetchByNameAndRevision: fetchByNameAndRevision,
    fetchRandom: function(onSuccess, onFailure) {
        var index = Math.floor(Math.random() * grammars.length);
        onSuccess(grammars[index].latestRevision);
    }
};


function buildGrammar(name, title, body, revision) {
    return {
        name: name,
        title: title,
        grammar: body,
        revision: revision
    };
}
