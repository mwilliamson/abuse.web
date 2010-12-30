var grammarRepository = require("abuse-web/grammarRepository").grammarRepository,
    integrationTest = require("./integration-test").integrationTest;
    
exports.fetchByNameCallsFirstCallbackWithNullIfSecondCallbackIsUndefined =
integrationTest(grammarRepository, function(grammarRepository, test) {
    grammarRepository.fetchByName("mike", function(grammar) {
        test.strictEqual(null, grammar);
        test.done();
    });
});
