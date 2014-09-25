
START = cat lib/banner.js lib/polyfill-wrapper-start.js > dist/$@.js;

END = cat lib/polyfill-wrapper-end.js >> dist/$@.js;

SystemJS = meta register core global cjs amd map plugins bundles versions depCache
SystemCSP = scriptLoader meta register core global cjs amd map plugins bundles versions depCache

all: system system-csp uglify

uglify:
	cat lib/banner.js > dist/system.min.js;
	./node_modules/.bin/uglifyjs dist/system.js -cm >> dist/system.min.js

	cat lib/banner.js > dist/system-csp.min.js;
	./node_modules/.bin/uglifyjs dist/system-csp.js -cm >> dist/system-csp.min.js


system:
	$(START)
	for extension in $(SystemJS); do \
		cat lib/extension-$$extension.js >> dist/$@.js; \
	done
	for extension in $(SystemJS); do \
		echo $$extension"(System);" >> dist/$@.js; \
	done
	$(END)

system-csp:
	$(START)
	for extension in $(SystemCSP); do \
		cat lib/extension-$$extension.js >> dist/$@.js; \
	done
	for extension in $(SystemCSP); do \
		echo $$extension"(System);" >> dist/$@.js; \
	done
	$(END)
