var inject = require("ZWOBBLE/abuse/web/inject");

exports.bindingInstanceToKeyResultsInThatInstanceAlwaysBeingReturned  = function(test) {
    var injector = inject.injector(),
        user = {name: "Bob"};
    
    injector.bind("user").toInstance(user);
    
    test.equal(user, injector.get("user"));
    test.done();
};

exports.bindingInstanceToFunctionResultsInTheFunctionBeingCalledWhen = function(test) {
    var injector = inject.injector(),
        user = {name: "Bob"};
    
    injector.bind("user").toFunction(function() { return user; });
    
    test.equal(user, injector.get("user"));
    test.done();
};

exports.injectorCanCallInjectableFunction = function(test) {
    var injector = inject.injector(),
        user = {name: "Bob"},
        username = inject.injectable("user", function(user) {
            return user.name;
        });
    
    injector.bind("user").toFunction(function() { return user; });
    
    test.equal("Bob", injector.inject(username));
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
    injector.bind("username").toFunction(inject.injectable("user", function(user) { return user.name; }));
    
    test.equal("Bob", injector.get("username"));
    test.done();
};
