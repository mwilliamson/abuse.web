var grammarRepository = require("abuse-web/grammarRepository").grammarRepository,
    userRepository = require("abuse-web/userRepository").userRepository,
    integrationTest = require("./integration-test").integrationTest;
    
exports.fetchByNameCallsFirstCallbackWithNullIfSecondCallbackIsUndefinedAndNoSuchGrammarExists =
integrationTest(grammarRepository, function(grammarRepository, test) {
    grammarRepository.fetchByName("mike", function(grammar) {
        test.strictEqual(null, grammar);
        test.done();
    });
});

exports.fetchByNameCallsSecondCallbackWithNullIfNoSuchGrammarExists =
integrationTest(grammarRepository, function(grammarRepository, test) {
    grammarRepository.fetchByName("mike", function(grammar) {
        test.ok(false, "Should call second callback");
        test.done();
    }, function(grammar) {
        test.strictEqual(null, grammar);
        test.done();
    });
});

exports.canCreateANewGrammar =
integrationTest(grammarRepository, userRepository, function(grammarRepository, userRepository, test) {
    userRepository.create({
        username: "mike",
        realName: "Mike",
        password: "password1",
        email: "mike@example.com"
    }, function() {
        grammarRepository.updateOrCreateGrammar("mike", "GRAMMAR", function() {
            grammarRepository.fetchByName("mike", function(grammar) {
                test.strictEqual("mike", grammar.name);
                test.strictEqual("GRAMMAR", grammar.body);
                test.done();
            }, function(grammar) {
                test.ok(false, "Should call first callback");
                test.done();
            });
        });
    });
});
