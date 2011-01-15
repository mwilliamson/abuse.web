var grammarRepository = require("abuse-web/grammarRepository").grammarRepository,
    injectable = require("abuse-web/inject").injectable,
    content = require("abuse-web/content");

module.exports = injectable(grammarRepository, content, "pathParameters",
                           function(grammars, content, pathParameters) {
    grammars.fetchAllNamesAndTitles(function (grammars) {
        content("grammars/index", {grammars: grammars});
    });
});
