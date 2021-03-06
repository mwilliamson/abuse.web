var grammarRepository = require("../../grammarRepository"),
    injectable = require("../../inject").injectable,
    content = require("../../content"),
    grammars = require("../../grammars"),
    staticSelector = function(choices) {
        choices = choices.slice(0);
        return function(length) {
            return choices.shift();
        };
    };

module.exports = injectable(
    [content, "pathParameters"],
    function(content, pathParameters) {
        var name = pathParameters.name,
            revision = pathParameters.revision,
            isOldRevision = revision !== undefined,
            showGrammarContent = function(grammar) {
                var message,
                    sequence;
                if (pathParameters.sequence === undefined) {
                    message = grammars.generateRandomMessage(grammar.grammar);
                } else {
                    sequence = pathParameters.sequence.split("-").filter(function(element) {
                        return element !== "";
                    });
                    message = grammars.generateMessage(grammar.grammar, staticSelector(sequence));
                }
                if (message === undefined) {
                    content.http404();
                } else {
                    content("grammars/grammar", {
                        grammar: grammar,
                        name: grammar.name,
                        title: grammar.title,
                        message: message.str,
                        isOldRevision: isOldRevision,
                        grammarUrl: grammars.grammarUrl(grammar, isOldRevision),
                        sentenceUrl: grammars.sentenceUrl(grammar, message.sequence)
                    });
                }
            };
        if (revision === undefined) {
            grammarRepository.fetchByName(name, showGrammarContent, content.http404);
        } else {
            grammarRepository.fetchByNameAndRevision(name, revision, showGrammarContent, content.http404);
        }
    }
);
