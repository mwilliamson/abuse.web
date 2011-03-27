var grammarRepository = require("abuse-web/grammarRepository"),
    injectable = require("abuse-web/inject").injectable,
    content = require("abuse-web/content");

module.exports = injectable(
    module, "grammarRepository",
    [grammarRepository, content, "pathParameters", "http404"],
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
    }
);
