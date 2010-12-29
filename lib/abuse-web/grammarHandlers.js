var content = require("./content").content,
    injectable = require("./inject").injectable,
    abuse = require("abuse"),
    maxDepth = 100,
    generateMessage = function(grammar) {
        return abuse.generate(abuse.parse(grammar).rules, abuse.randomSelector, maxDepth);
    },
    validate = function(body) {
        var parsedGrammar = abuse.parse(body),
            sentences = abuse.generateAll(parsedGrammar.rules, maxDepth);
        return {
            isValid: sentences.length > 0,
            warnings: parsedGrammar.errors.map(function(error) {
                return error.str;
            })
        };
    };

exports.front = injectable("grammarRepository", content, function(grammars, content) {
    grammars.fetchRandom(function(grammar) {
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
    grammars.fetchAllNamesAndTitles(function (grammars) {
        content("grammars/index", {grammars: grammars});
    });
});

exports.show = injectable("grammarRepository", content, "pathParameters", "http404",
                            function(grammars, content, pathParameters, http404) {
    var name = pathParameters.name;
    grammars.fetchByName(name, function(grammar) {
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
    grammars.fetchByName(name, function(grammar) {
        content("grammars/source", {
            name: grammar.name,
            title: grammar.title,
            grammar: grammar.grammar
        });
    }, http404);
});

exports.edit = injectable("grammarRepository", content, "pathParameters", "postParameters", "userProvider",
                          function(grammars, content, pathParameters, post, userProvider) {
    var name = pathParameters.name;
    userProvider(function(user) {
        if (!user || user.username !== name) {
            content.http403();
            return;
        }
        grammars.fetchByNameOrDefault(name, function(grammar) {
            var body,
                validationResult,
                editContent;
            if (post === null) {
                content("grammars/edit", {
                    name: grammar.name,
                    title: grammar.title,
                    grammar: grammar.grammar || ""
                });
            } else {
                body = post.grammarBody || "";
                validationResult = validate(body);
                if (validationResult.isValid) {
                    grammars.updateOrCreateGrammar(name, body, function() {
                        content("grammars/edit", {
                            name: grammar.name,
                            title: grammar.title,
                            grammar: body,
                            warnings: validationResult.warnings,
                            successfulSave: true
                        });
                    });
                } else {
                    content("grammars/edit", {
                        name: grammar.name,
                        title: grammar.title,
                        grammar: body,
                        warnings: validationResult.warnings,
                        failedSave: true
                    });
                }
            }
        }, content.http404);
    });
});

exports.editLoggedInUsersGrammar = injectable("redirect", "userProvider", function(redirect, userProvider) {
    userProvider(function(user) {
        if (user) {
            redirect("/grammars/" + user.username + "/edit/");
        } else {
            redirect("/login/?next=/edit-my-grammar/");
        }
    });
});
