VERSION = $(shell cat package.json | sed -n 's/.*"version": "\([^"]*\)",/\1/p')
ESML = node_modules/es6-module-loader/src

define BANNER
/*
 * SystemJS v$(VERSION)
 */
endef
export BANNER

define POLYFILLS_BANNER
/*
 * SystemJS Polyfills for URL and Promise providing IE8+ Support
 */
endef
export POLYFILLS_BANNER

compile: clean-compile dist/system.src.js dist/system-prod.src.js dist/system-register-only.src.js
build: clean dist/system.js dist/system-prod.js dist/system-register-only.js dist/polyfills.js

version:
	@echo $(VERSION)

footprint: build
	@cat dist/system.js | gzip -9f | wc -c
	@cat dist/system-prod.js | gzip -9f | wc -c
	@cat dist/system-register-only.js | gzip -9f | wc -c
	@cat dist/polyfills.js | gzip -9f | wc -c

clean-compile:
	@rm -f dist/system.src.js dist/system-prod.src.js

clean:
	@rm -f dist/*

test: compile
	open test/test-traceur.html test/test-traceur-runtime.html
	sleep 0.1
	open test/test-babel.html test/test-babel-runtime.html
	sleep 0.1
	open test/test-prod.html test/test-tracer.html

dist/polyfills.js: dist/polyfills.src.js
	@echo "$$POLYFILLS_BANNER" > $@
	./node_modules/.bin/uglifyjs $< -cm --source-map dist/polyfills.js.map >> $@ || rm $@

dist/%.js: dist/%.src.js
	@echo "$$BANNER" > $@
	./node_modules/.bin/uglifyjs $< -cm --source-map dist/$*.js.map >> $@ || rm $@

dist/system.src.js: lib/*.js $(ESML)/*.js
	@echo "$$BANNER" > $@;
	cat \
		lib/wrapper-start.js \
		$(ESML)/wrapper-start.js \
			$(ESML)/loader.js \
			$(ESML)/dynamic-only.js \
			$(ESML)/system.js \
			$(ESML)/transpiler.js \
				lib/global-eval.js \
				lib/core.js \
				lib/misc.js \
				lib/scriptLoader.js \
				lib/meta.js \
				lib/register.js \
				lib/node-transpiler-paths.js \
				lib/es.js \
				lib/global.js \
				lib/global-helpers.js \
				lib/cjs.js \
				lib/amd.js \
				lib/map.js \
				lib/package.js \
				lib/plugins.js \
				lib/alias.js \
				lib/bundles.js \
				lib/depCache.js \
				lib/conditionals.js \
				lib/createSystem.js \
		$(ESML)/wrapper-end.js \
		lib/wrapper-end.js \
	>> $@;

dist/system-prod.src.js: lib/*.js $(ESML)/*.js
	@echo "$$BANNER" > $@;
	cat \
		lib/wrapper-start.js \
		$(ESML)/wrapper-start.js \
			$(ESML)/loader.js \
			$(ESML)/dynamic-only.js \
			$(ESML)/system.js \
				lib/core.js \
				lib/misc.js \
				lib/scriptLoader.js \
				lib/meta.js \
				lib/scriptOnly.js \
				lib/register.js \
				lib/global-helpers.js \
				lib/map.js \
				lib/package.js \
				lib/plugins.js \
				lib/alias.js \
				lib/bundles.js \
				lib/depCache.js \
				lib/conditionals.js \
				lib/createSystem.js \
		$(ESML)/wrapper-end.js \
		lib/wrapper-end.js \
	>> $@;

dist/system-register-only.src.js: lib/*.js $(ESML)/*.js
	@echo "$$BANNER" > $@;
	cat \
		$(ESML)/wrapper-start.js \
			$(ESML)/loader.js \
			$(ESML)/dynamic-only.js \
			$(ESML)/system.js \
				lib/register.js \
				lib/createSystem.js \
		$(ESML)/wrapper-end.js \
	>> $@;

dist/polyfills.src.js: lib/*.js $(ESML)/*.js
	@echo "$$POLYFILLS_BANNER" > $@;
	cat \
		$(ESML)/url-polyfill.js \
		node_modules/when/es6-shim/Promise.js \
		lib/polyfills-bootstrap.js \
	>> $@;