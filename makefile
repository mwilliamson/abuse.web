.PHONY: test

start-server:
	NODE_PATH=lib:deps node lib/ZWOBBLE/abuse/web/handler.js

test:
	NODE_PATH=lib:deps nodeunit `find test -type d`
