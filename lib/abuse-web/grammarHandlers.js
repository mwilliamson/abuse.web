var content = require("./content").content,
    injectable = require("./inject").injectable,
    abuse = require("abuse");

generateMessage = function(grammar) {
    return abuse.generate(abuse.parse(grammar).rules, abuse.randomSelector);
};

exports.front = injectable("grammarRepository", content, function(grammars, content) {
    grammars.fetchRandom(function(error, grammar) {
        content("index", {
            message: generateMessage(grammar.grammar),
            title: grammar.title
        });
    }, function() {
        content("index");
    });
});

exports.index = injectable("grammarRepository", content, "pathParameters",
                                 function(grammars, content, pathParameters) {
    grammars.fetchAllNamesAndTitles(function (err, grammars) {
        content("grammars/index", {grammars: grammars});
    });
});

exports.show = injectable("grammarRepository", content, "pathParameters", "http404",
                            function(grammars, content, pathParameters, http404) {
    var name = pathParameters.name;
    grammars.fetchByName(name, function(error, grammar) {
        content("grammars/grammar", {
            name: grammar.name,
            title: grammar.title,
            message: generateMessage(grammar.grammar)
        });
    }, http404);
});

exports.source = injectable("grammarRepository", content, "pathParameters", "http404",
                                  function(grammars, content, pathParameters, http404) {
    var name = pathParameters.name;
    grammars.fetchByName(name, function(error, grammar) {
        content("grammars/source", {
            name: grammar.name,
            title: grammar.title,
            grammar: grammar.grammar
        });
    }, http404);
});

exports.edit = injectable("grammarRepository", content, "pathParameters", "postParameters", "http404",
                          function(grammars, content, pathParameters, post, http404) {
    var name = pathParameters.name;
    grammars.fetchByName(name, function(error, grammar) {
        content("grammars/edit", {
            name: grammar.name,
            title: grammar.title,
            grammar: grammar.grammar
        });
    }, http404);
});
