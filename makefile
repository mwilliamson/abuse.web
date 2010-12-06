.PHONY: test

start-server:
	NODE_PATH=src node src/ZWOBBLE/abuse/web/handler.js

test:
	NODE_PATH=src nodeunit `find test -type d`
