.PHONY: test integration-test

start-server:
	NODE_PATH=lib node lib/abuse-web/handler.js

test:
	NODE_PATH=lib node_modules/.bin/nodeunit `find test -type d`
