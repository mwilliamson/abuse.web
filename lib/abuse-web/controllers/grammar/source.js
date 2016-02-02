var grammarRepository = require("../../grammarRepository"),
    injectable = require("../../inject").injectable,
    content = require("../../content");

module.exports = injectable(
    [grammarRepository, content, "pathParameters"],
    function(grammars, content, pathParameters) {
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
            grammars.fetchByName(name, sourceContent, content.http404);
        } else {
            grammars.fetchByNameAndRevision(name, revision, sourceContent, content.http404);
        }
    }
);
