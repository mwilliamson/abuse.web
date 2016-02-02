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
        var testDone = test.done;
        test.done = function() {
            client.flushdb();
            testDone.apply(test, []);
        };
        client.flushdb();
        injector.get(inject.injectable(injectArgs, function() {
            var injectedArgs = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
            injectedArgs.push(test);
            console.log(injectedArgs);
            console.log(func.toString());
            var done = arguments[arguments.length - 1];
            func.apply(func, injectedArgs);
            done();
        }));
    };
};
