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

compile: clean dist/system.src.js dist/system-prod.src.js
build: clean dist/system.js dist/system-prod.js dist/system-polyfills.js

version:
	@echo $(VERSION)

footprint: build
	@cat dist/system.js | gzip -9f | wc -c
	@cat dist/system-prod.js | gzip -9f | wc -c

clean:
	@rm -f dist/*

test: compile
	open test/test-traceur.html test/test-traceur-runtime.html
	sleep 0.1
	open test/test-babel.html test/test-babel-runtime.html
	sleep 0.1
	open test/test-prod.html test/test-tracer.html

dist/system-polyfills.js: dist/system-polyfills.src.js
	@echo "$$POLYFILLS_BANNER" > $@
	./node_modules/.bin/uglifyjs $< -cm --source-map dist/system-polyfills.js.map >> $@ || rm $@

dist/%.js: dist/%.src.js
	@echo "$$BANNER" > $@
	./node_modules/.bin/uglifyjs $< -cm --source-map dist/$*.js.map >> $@ || rm $@

dist/system.src.js: lib/*.js $(ESML)/*.js
	@echo "$$BANNER" > $@;
	cat \
		$(ESML)/wrapper-start.js \
			$(ESML)/loader.js \
			$(ESML)/dynamic-only.js \
			$(ESML)/system.js \
			lib/wrapper-start.js \
				lib/global-eval.js \
				lib/core.js \
				lib/scriptLoader.js \
				lib/meta.js \
				lib/register.js \
				lib/alias.js \
				$(ESML)/transpiler.js \
				lib/es.js \
				lib/global.js \
				lib/cjs.js \
				lib/amd.js \
				lib/map.js \
				lib/plugins.js \
				lib/bundles.js \
				lib/depCache.js \
				lib/package.js \
			lib/wrapper-end.js \
		$(ESML)/wrapper-end.js \
	>> $@;

dist/system-prod.src.js: lib/*.js $(ESML)/*.js
	@echo "$$BANNER" > $@;
	cat \
		$(ESML)/wrapper-start.js \
			$(ESML)/loader.js \
			$(ESML)/dynamic-only.js \
			$(ESML)/system.js \
			lib/wrapper-start.js \
				lib/core.js \
				lib/scriptLoader.js \
				lib/meta.js \
				lib/scriptOnly.js \
				lib/register.js \
				lib/alias.js \
				lib/map.js \
				lib/plugins.js \
				lib/bundles.js \
				lib/depCache.js \
				lib/package.js \
			lib/wrapper-end.js \
		$(ESML)/wrapper-end.js \
	>> $@;

dist/system-polyfills.src.js: lib/*.js $(ESML)/*.js
	@echo "$$POLYFILLS_BANNER" > $@;
	cat \
		$(ESML)/url-polyfill.js \
		node_modules/when/es6-shim/Promise.js \
	>> $@;