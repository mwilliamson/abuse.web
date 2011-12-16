var grammarRepository = require("abuse-web/grammarRepository"),
    injectable = require("abuse-web/inject").injectable,
    content = require("abuse-web/content");

module.exports = injectable(
    module, "grammarRepository",
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
