.PHONY: test integration-test

start-server:
	NODE_PATH=lib node lib/abuse-web/handler.js

test:
	NODE_PATH=lib node_modules/.bin/nodeunit `find test -type d`

integration-test:
	redis-server redis-integration-tests.conf
	NODE_PATH=lib node_modules/.bin/nodeunit `find integration-test -name \*_test.js`
	redis-cli -p 6380 shutdown
