var grammarRepository = require("abuse-web/grammarRepository").grammarRepository,
    injectable = require("abuse-web/inject").injectable,
    content = require("abuse-web/content"),
    grammars = require("abuse-web/grammars");

module.exports = injectable(grammarRepository, content, "pathParameters", "postParameters", "userProvider",
                          function(grammarRepository, content, pathParameters, post, userProvider) {
    var name = pathParameters.name;
    userProvider(function(user) {
        if (!user || user.username !== name) {
            content.http403();
            return;
        }
        grammarRepository.fetchByNameOrDefault(name, function(grammar) {
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
                validationResult = grammars.validate(body);
                if (validationResult.isValid) {
                    grammarRepository.updateOrCreateGrammar(name, body, function() {
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
