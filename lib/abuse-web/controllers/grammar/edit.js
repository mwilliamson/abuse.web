var grammarRepository = require("../../grammarRepository"),
    injectable = require("../../inject").injectable,
    content = require("../../content"),
    grammars = require("../../grammars");

module.exports = injectable(
    module, "edit",
    [grammarRepository, content, "pathParameters", "postParameters", "user"],
    function(grammarRepository, content, pathParameters, post, user) {
        var name = pathParameters.name;
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
    }
);
