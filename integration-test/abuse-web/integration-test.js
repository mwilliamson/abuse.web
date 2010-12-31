var inject = require("abuse-web/inject"),
    clientKey = require("abuse-web/redis").client,
    client = require("redis-client").createClient(6380);

exports.integrationTest = function() {
    var args = Array.prototype.slice.call(arguments),
        injector = inject.injector(),
        func = args[arguments.length - 1],
        injectArgs = args.slice(0, -1),
        i;
    
    injector.bind(clientKey).toInstance(client);
    injector.bind("request").toInstance({});
    
    return function(test) {        
        var testDone = test.done();
        injectArgs.push(function(done) {
            done(test)
        });
        injectArgs.push(func);
        inject.injectable.apply(undefined, injectArgs);
        injector.get(func);
        test.done = function() {
            client.flushdb();
            testDone.apply(test, []);
        };
    };
};
