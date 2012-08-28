test:
	@./node_modules/.bin/mocha
		--reporter spec \
		--bail \
		--timeout 30s \
		--require test/common.js

.PHONY: test