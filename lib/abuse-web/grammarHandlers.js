var content = require("./content"),
    injectable = require("./inject").injectable,
    grammarRepository = require("./grammarRepository").grammarRepository,
    abuse = require("abuse"),
    maxDepth = 100,
    generateMessage = function(grammar, selector) {
        return abuse.generate(abuse.parse(grammar).rules, selector, maxDepth);
    },
    generateRandomMessage = function(grammar) {
        return generateMessage(grammar, abuse.randomSelector);
    },
    staticSelector = function(choices) {
        choices = choices.slice(0);
        return function(length) {
            return choices.shift();
        };
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
    },
    grammarUrl = function(grammar, includeRevision) {
        var url = "/grammars/" + grammar.name + "/";
        if (includeRevision) {
            url += "revision/" + grammar.revision + "/";
        }
        return url;
    },
    sentenceUrl = function(grammar, sequence) {
        return grammarUrl(grammar, true) + "sentence/" + sequence.join("-") + "/";
    };

exports.front = injectable(grammarRepository, content, function(grammars, content) {
    grammars.fetchRandom(function(grammar) {
        var message = generateRandomMessage(grammar.grammar);
        content("index", {
            message: message.str,
            sentenceUrl: sentenceUrl(grammar, message.sequence),
            title: grammar.title
        });
    }, function() {
        content("index");
    });
});

exports.index = injectable(grammarRepository, content, "pathParameters",
                           function(grammars, content, pathParameters) {
    grammars.fetchAllNamesAndTitles(function (grammars) {
        content("grammars/index", {grammars: grammars});
    });
});

exports.show = injectable(grammarRepository, content, "pathParameters", "http404",
                            function(grammars, content, pathParameters, http404) {
    var name = pathParameters.name,
        revision = pathParameters.revision,
        isOldRevision = revision !== undefined,
        showGrammarContent = function(grammar) {
            var message,
                sequence;
            if (pathParameters.sequence === undefined) {
                message = generateRandomMessage(grammar.grammar);
            } else {
                sequence = pathParameters.sequence.split("-").filter(function(element) {
                    return element !== "";
                });
                message = generateMessage(grammar.grammar, staticSelector(sequence));
            }
            if (message === undefined) {
                http404();
            } else {
                content("grammars/grammar", {
                    grammar: grammar,
                    name: grammar.name,
                    title: grammar.title,
                    message: message.str,
                    isOldRevision: isOldRevision,
                    grammarUrl: grammarUrl(grammar, isOldRevision),
                    sentenceUrl: sentenceUrl(grammar, message.sequence)
                });
            }
        };
    if (revision === undefined) {
        grammars.fetchByName(name, showGrammarContent, http404);
    } else {
        grammars.fetchByNameAndRevision(name, revision, showGrammarContent, http404);
    }
});

exports.source = injectable(grammarRepository, content, "pathParameters", "http404",
                                  function(grammars, content, pathParameters, http404) {
    var name = pathParameters.name,
        revision = pathParameters.revision,
        sourceContent = function(grammar) {
            content("grammars/source", {
                name: grammar.name,
                title: grammar.title,
                grammar: grammar.grammar
            });
        };
    if (revision === undefined) {
        grammars.fetchByName(name, sourceContent, http404);
    } else {
        grammars.fetchByNameAndRevision(name, revision, sourceContent, http404);
    }
});

exports.edit = injectable(grammarRepository, content, "pathParameters", "postParameters", "userProvider",
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

exports.editLoggedInUsersGrammar = injectable(content, "userProvider", function(content, userProvider) {
    userProvider(function(user) {
        if (user) {
            content.redirect("/grammars/" + user.username + "/edit/");
        } else {
            content.redirect("/login/?next=/edit-my-grammar/");
        }
    });
});
