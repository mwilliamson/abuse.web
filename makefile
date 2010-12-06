.PHONY: test

start-server:
	NODE_PATH=lib node src/ZWOBBLE/abuse/web/handler.js

test:
	NODE_PATH=lib nodeunit `find test -type d`
