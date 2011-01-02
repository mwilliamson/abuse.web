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
                test.strictEqual("GRAMMAR", grammar.grammar);
                test.strictEqual(1, grammar.revision);
                test.done();
            }, function(grammar) {
                test.ok(false, "Should call first callback");
                test.done();
            });
        });
    });
});

exports.canUpdateAGrammar =
integrationTest(grammarRepository, userRepository, function(grammarRepository, userRepository, test) {
    userRepository.create({
        username: "mike",
        realName: "Mike",
        password: "password1",
        email: "mike@example.com"
    }, function() {
        grammarRepository.updateOrCreateGrammar("mike", "GRAMMAR", function() {
            grammarRepository.updateOrCreateGrammar("mike", "BETTER-GRAMMAR", function() {
                grammarRepository.fetchByName("mike", function(grammar) {
                    test.strictEqual("mike", grammar.name);
                    test.strictEqual("BETTER-GRAMMAR", grammar.grammar);
                    test.strictEqual(2, grammar.revision);
                    test.done();
                }, function(grammar) {
                    test.ok(false, "Should call first callback");
                    test.done();
                });
            });
        });
    });
});

exports.listOfGrammarsIsInitiallyEmpty =
integrationTest(grammarRepository, userRepository, function(grammarRepository, userRepository, test) {
    grammarRepository.fetchAllNamesAndTitles(function(grammars) {
        test.strictEqual(0, grammars.length);
        test.done();
    });
});

exports.creatingAGrammarAddsItToTheListOfGrammars =
integrationTest(grammarRepository, userRepository, function(grammarRepository, userRepository, test) {
    userRepository.create({
        username: "mike",
        realName: "Mike",
        password: "password1",
        email: "mike@example.com"
    }, function() {
        grammarRepository.updateOrCreateGrammar("mike", "GRAMMAR", function() {
            grammarRepository.fetchAllNamesAndTitles(function(grammars) {
                test.strictEqual(1, grammars.length);
                test.strictEqual("mike", grammars[0].name);
                test.strictEqual("Mike", grammars[0].title);
                test.done();
            });
        });
    });
});

exports.updatingAnExistingGrammarDoesntAddItToTheListOfGrammars =
integrationTest(grammarRepository, userRepository, function(grammarRepository, userRepository, test) {
    userRepository.create({
        username: "mike",
        realName: "Mike",
        password: "password1",
        email: "mike@example.com"
    }, function() {
        grammarRepository.updateOrCreateGrammar("mike", "GRAMMAR", function() {
            grammarRepository.updateOrCreateGrammar("mike", "BETTER-GRAMMAR", function() {
                grammarRepository.fetchAllNamesAndTitles(function(grammars) {
                    test.strictEqual(1, grammars.length);
                    test.strictEqual("mike", grammars[0].name);
                    test.strictEqual("Mike", grammars[0].title);
                    test.done();
                });
            });
        });
    });
});

exports.canFetchOldRevisionsOfAGrammar =
integrationTest(grammarRepository, userRepository, function(grammarRepository, userRepository, test) {
    userRepository.create({
        username: "mike",
        realName: "Mike",
        password: "password1",
        email: "mike@example.com"
    }, function() {
        grammarRepository.updateOrCreateGrammar("mike", "GRAMMAR", function() {
            grammarRepository.updateOrCreateGrammar("mike", "BETTER-GRAMMAR", function() {
                grammarRepository.fetchByNameAndRevision("mike", 1, function(grammar) {
                    test.strictEqual("mike", grammar.name);
                    test.strictEqual("Mike", grammar.title);
                    test.strictEqual("GRAMMAR", grammar.grammar);
                    grammarRepository.fetchByNameAndRevision("mike", 2, function(grammar) {
                        test.strictEqual("mike", grammar.name);
                        test.strictEqual("Mike", grammar.title);
                        test.strictEqual("BETTER-GRAMMAR", grammar.grammar);
                        test.done();
                    });
                });
            });
        });
    });
});

exports.fetchByNameAndRevisionCallsFailureCallbackIfNameDoesNotExist =
integrationTest(grammarRepository, userRepository, function(grammarRepository, userRepository, test) {
    grammarRepository.fetchByNameAndRevision("mike", 2, function(grammar) {
        test.ok(false, "Should call second callback");
        test.done();
    }, function() {
        test.done();
    });
});

exports.fetchByNameAndRevisionCallsFailureCallbackIfRevisionDoesNotExist =
integrationTest(grammarRepository, userRepository, function(grammarRepository, userRepository, test) {
    userRepository.create({
        username: "mike",
        realName: "Mike",
        password: "password1",
        email: "mike@example.com"
    }, function() {
        grammarRepository.updateOrCreateGrammar("mike", "GRAMMAR", function() {
            grammarRepository.fetchByNameAndRevision("mike", 2, function(grammar) {
                test.ok(false, "Should call second callback");
                test.done();
            }, function() {
                test.done();
            });
        });
    });
});
