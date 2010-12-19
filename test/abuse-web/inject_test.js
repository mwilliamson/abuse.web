var inject = require("abuse-web/inject");

exports.bindingInstanceToKeyResultsInThatInstanceAlwaysBeingReturned  = function(test) {
    var injector = inject.injector(),
        user = {name: "Bob"};
    
    injector.bind("user").toInstance(user);
    
    test.equal(user, injector.get("user"));
    test.done();
};

exports.bindingInstanceToProviderResultsInTheFunctionBeingCalledWhen = function(test) {
    var injector = inject.injector(),
        user = {name: "Bob"};
    
    injector.bind("user").toProvider(function() { return user; });
    
    test.equal(user, injector.get("user"));
    test.done();
};

exports.injectorCanCallInjectableFunction = function(test) {
    var injector = inject.injector(),
        user = {name: "Bob"},
        username = inject.injectable("user", function(user) {
            return user.name;
        });
    
    injector.bind("user").toProvider(function() { return user; });
    
    test.equal("Bob", injector.inject(username));
    test.done();
};

exports.injectorInjectInjectableFunctions = function(test) {
    var injector = inject.injector(),
        user = {name: "Bob"},
        username = inject.injectable("user", function(user) {
            return user.name;
        }),
        usernameAgain = inject.injectable(username, function(username) {
            return username;
        });
    
    injector.bind("user").toProvider(function() { return user; });
    
    test.equal("Bob", injector.inject(usernameAgain));
    test.done();
};

exports.callingNonInjectableFunctionCallsFunctionWithNoArgs = function(test) {
    var injector = inject.injector(),
        args,
        username = function() {
            args = arguments;
            return "Bob";
        };
    
    test.equal("Bob", injector.inject(username));
    test.equal(0, args.length);
    test.done();
};

exports.canBindKeysToInjectableFunctions = function(test) {
    var injector = inject.injector(),
        user = {name: "Bob"};
    
    injector.bind("user").toInstance(user);
    injector.bind("username").toProvider(inject.injectable("user", function(user) { return user.name; }));
    
    test.equal("Bob", injector.get("username"));
    test.done();
};

exports.bindingToFunctionInjectsAnInjectableFunctionWithParametersAlreadyInjected = function(test) {
    var injector = inject.injector(),
        user = {name: "Bob"},
        username = inject.injectable("user", function(user) {
            return user.name;
        }),
        usernameAgain = inject.injectable("getUsername", function(getUsername) {
            return getUsername();
        });
    
    injector.bind("user").toInstance(user);
    injector.bind("getUsername").toFunction(username);
    
    test.equal("Bob", injector.inject(usernameAgain));
    test.done();
};
