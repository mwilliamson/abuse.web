var injectableKey = "ZWOBBLE.abuse-web.inject.injectable.tokenKey",
    singleCall = function(func) {
        var called = false;
        return function() {
            if (called) {
                throw {
                    name: "AlreadyCalledError",
                    message: "Function can only be called once"
                };
            }
            called = true;
            func.apply(this, arguments);
        };
    },
    debug = false;

exports.injector = function() {
    var bindings = {},
        indentation = 0,
        printIndentation = function() {
            var i;
            for (i = 0; i < indentation; i += 1) {
                require("sys").print(" ");
            }
        },
        get = function(key, done) {
            if (debug) {
                printIndentation();
                require("sys").print("Injecting: " + key + "\n");
            }
            done = done || function() { };
            if (key in bindings) {
                inject(bindings[key], done);
            } else if (typeof key === "function") {
                inject(key, done);
            } else {
                require("sys").print("Key not in bindings: " + key);
                throw "Key not in bindings: " + key;
            }
        },
        injectInjectable = function(func, done) {
            var tokens = func[injectableKey],
                funcArgs = new Array(tokens.length),
                i = 0,
                nextArg = function() {
                    if (i < tokens.length) {
                        if (debug) {
                            printIndentation();
                            indentation += 2;
                            require("sys").print("Injecting arg" + i + "\n");
                        }
                        get(tokens[i], setNextArg);
                    } else {
                        funcArgs.push(singleCall(done));
                        func.apply(undefined, funcArgs);
                    }
                },
                setNextArg = function(value) {
                    funcArgs[i] = value;
                    if (debug) {
                        indentation -= 2;
                        printIndentation();
                        require("sys").print("Injected arg" + i + "\n");
                    }
                    i += 1;
                    nextArg();
                };
            nextArg();
        },
        inject = function(func, done) {
            if (!(injectableKey in func)) {
                func(done);
            } else {
                injectInjectable(func, done);
            }
        },
        bind = function(key) {
            return {
                toInstance: function(value) {
                    bindings[key] = function(done) { done(value); };
                },
                toProvider: function(func) {
                    bindings[key] = func;
                },
                toFunction: function(func) {
                    bindings[key] = exports.injectable("injector", function(injector, done) {
                        done(function(done) {
                            injector.get(func, done);
                        });
                    });
                }
            };
        },
        injector = {
            bind: bind,
            get: get
        };
    
    injector.bind("injector").toInstance(injector);
    
    return injector;
};

exports.injectable = function() {
    var tokens = Array.prototype.slice.call(arguments, 0, arguments.length - 1),
        func = arguments[arguments.length - 1];
    func[injectableKey] = tokens;
    return func;
};
