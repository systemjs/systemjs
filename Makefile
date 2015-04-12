VERSION = $(shell cat package.json | sed -n 's/.*"version": "\([^"]*\)",/\1/p')
ESML = node_modules/es6-module-loader/src

define BANNER
/*
 * SystemJS v$(VERSION)
 */
endef
export BANNER

compile: dist/system.src.js dist/system-prod.src.js dist/system-csp.src.js
build: dist/system.js dist/system-prod.js dist/system-csp.js

version:
	@echo $(VERSION)

clean:
	@rm -f dist/*

test: compile
	open test/test-traceur.html test/test-traceur-runtime.html
	sleep 0.1
	open test/test-babel.html test/test-babel-runtime.html
	sleep 0.1
	open test/test-prod.html test/test-tracer.html test/test-csp.html

dist/%.js: dist/%.src.js
	@echo "$$BANNER" > $@;
	./node_modules/.bin/uglifyjs $< -cm --source-map dist/$*.js.map >> $@ || rm $@

dist/system.src.js: lib/*.js $(ESML)/*.js
	@echo "$$BANNER" > $@;
	cat \
		$(ESML)/wrapper-start.js \
			$(ESML)/loader.js \
			$(ESML)/declarative.js \
			$(ESML)/transpiler.js \
			$(ESML)/url-polyfill.js \
			$(ESML)/system.js \
			$(ESML)/module-tag.js \
			lib/wrapper-start.js \
				lib/global-eval.js \
				lib/core.js \
				lib/meta.js \
				lib/register.js \
				lib/alias.js \
				lib/es.js \
				lib/global.js \
				lib/cjs.js \
				lib/amd.js \
				lib/map.js \
				lib/plugins.js \
				lib/bundles.js \
				lib/depCache.js \
			lib/wrapper-end.js \
		$(ESML)/wrapper-end.js \
	>> $@;

dist/system-prod.src.js: lib/*.js $(ESML)/*.js
	@echo "$$BANNER" > $@;
	cat \
		$(ESML)/wrapper-start.js \
			$(ESML)/loader.js \
			$(ESML)/dynamic-only.js \
			$(ESML)/url-polyfill.js \
			$(ESML)/system.js \
			lib/wrapper-start.js \
				lib/core.js \
				lib/meta.js \
				lib/register.js \
				lib/map.js \
				lib/plugins.js \
				lib/bundles.js \
				lib/depCache.js \
			lib/wrapper-end.js \
		$(ESML)/wrapper-end.js \
	>> $@;

dist/system-csp.src.js: lib/*.js $(ESML)/*.js
	@echo "$$BANNER" > $@;
	cat \
		$(ESML)/wrapper-start.js \
			$(ESML)/loader.js \
			$(ESML)/declarative.js \
			$(ESML)/transpiler.js \
			$(ESML)/url-polyfill.js \
			$(ESML)/system.js \
			$(ESML)/module-tag.js \
			lib/wrapper-start.js \
				lib/core.js \
				lib/scriptLoader.js \
				lib/meta.js \
				lib/register.js \
				lib/alias.js \
				lib/es.js \
				lib/global.js \
				lib/cjs.js \
				lib/amd.js \
				lib/map.js \
				lib/plugins.js \
				lib/bundles.js \
				lib/depCache.js \
			lib/wrapper-end.js \
		$(ESML)/wrapper-end.js \
	>> $@;
