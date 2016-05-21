var inject = require("abuse-web/inject");

exports.bindingInstanceToKeyResultsInThatInstanceAlwaysBeingReturned  = function(test) {
    var injector = inject.injector(),
        user = {name: "Bob"};
    
    injector.bind("user").toInstance(user);
    
    injector.get("user", function(value) {
        test.equal(user, value);
        test.done();
    });
};

exports.bindingInstanceToProviderResultsInTheFunctionBeingCalledWhen = function(test) {
    var injector = inject.injector(),
        user = {name: "Bob"};
    
    injector.bind("user").toProvider(function(done) { done(user); });
    
    injector.get("user", function(value) {
        test.equal(user, value);
        test.done();
    });
};

exports.injectorCanCallInjectableFunction = function(test) {
    var injector = inject.injector(),
        user = {name: "Bob"},
        username = inject.injectable(["user"], function(user, done) {
            done(user.name);
        });
    
    injector.bind("user").toProvider(function(done) { done(user); });
    
    injector.get(username, function(value) {
        test.equal("Bob", value);
        test.done();
    });
};

exports.injectorInjectInjectableFunctions = function(test) {
    var injector = inject.injector(),
        user = {name: "Bob"},
        username = inject.injectable(["user"], function(user, done) {
            done(user.name);
        }),
        usernameAgain = inject.injectable([username], function(username, done) {
            done(username);
        });
    
    injector.bind("user").toProvider(function(done) { done(user); });
    
    injector.get(usernameAgain, function(value) {
        test.equal("Bob", value);
        test.done();
    });
};

exports.callingNonInjectableFunctionCallsFunctionWithNoArgs = function(test) {
    var injector = inject.injector(),
        args,
        username = function(done) {
            args = arguments;
            done("Bob");
        };
    
    injector.get(username, function(value) {
        test.equal("Bob", value);
        test.equal(1, args.length);
        test.done();
    });
    
};

exports.canBindKeysToInjectableFunctions = function(test) {
    var injector = inject.injector(),
        user = {name: "Bob"};
    
    injector.bind("user").toInstance(user);
    injector.bind("username").toProvider(
        inject.injectable(["user"], function(user, done) { done(user.name); }));
    
    injector.get("username", function(value) {
        test.equal("Bob", value);
        test.done();
    });
};

exports.bindingToFunctionInjectsAnInjectableFunctionWithParametersAlreadyInjected = function(test) {
    var injector = inject.injector(),
        user = {name: "Bob"},
        username = inject.injectable(["user"], function(user, done) {
            done(user.name);
        }),
        usernameAgain = inject.injectable(["getUsername"], function(getUsername, done) {
            getUsername(done);
        });
    
    injector.bind("user").toInstance(user);
    injector.bind("getUsername").toFunction(username);
    
    injector.get(usernameAgain, function(value) {
        test.equal("Bob", value);
        test.done();
    });
};

exports.canUseAsynchronousProviders = function(test) {
    var injector = inject.injector(),
        user = {name: "Bob"},
        username = inject.injectable(["user"], function(user, done) {
            setTimeout(function() {
                done(user.name);
            }, 0);
        }),
        usernameAgain = inject.injectable(["getUsername"], function(getUsername) {
            return getUsername();
        });
    
    injector.bind("user").toInstance(user);
    injector.get(username, function(value) {
        test.equal("Bob", value);
        test.done();
    });
};
