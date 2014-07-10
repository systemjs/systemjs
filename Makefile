
START = cat lib/banner.js lib/polyfill-wrapper-start.js > dist/$@.js;

END = cat lib/polyfill-wrapper-end.js >> dist/$@.js;

SystemJS = meta register core global cjs amd map plugins bundles versions depCache
SystemProductionCSP = scriptLoader meta register core global cjs amd map bundles versions depCache
SystemJSTraceur = register core global depCache

all: system system-production-csp system-traceur uglify

uglify:
	cat lib/banner.js > dist/system.min.js;
	./node_modules/.bin/uglifyjs dist/system.js -cm >> dist/system.min.js

	cat lib/banner.js > dist/system-production-csp.min.js;
	./node_modules/.bin/uglifyjs dist/system-production-csp.js -cm >> dist/system-production-csp.min.js

	cat lib/banner.js > dist/system-traceur.min.js;
	./node_modules/.bin/uglifyjs dist/system-traceur.js -cm >> dist/system-traceur.min.js


system:
	$(START)
	for extension in $(SystemJS); do \
		cat lib/extension-$$extension.js >> dist/$@.js; \
	done
	for extension in $(SystemJS); do \
		echo $$extension"(System);" >> dist/$@.js; \
	done
	$(END)

system-production-csp:
	$(START)
	for extension in $(SystemProductionCSP); do \
		cat lib/extension-$$extension.js >> dist/$@.js; \
	done
	for extension in $(SystemProductionCSP); do \
		echo $$extension"(System);" >> dist/$@.js; \
	done
	$(END)


system-traceur:
	$(START)
	for extension in $(SystemJSTraceur); do \
		cat lib/extension-$$extension.js >> dist/$@.js; \
	done
	for extension in $(SystemJSTraceur); do \
		echo $$extension"(System);" >> dist/$@.js; \
	done
	$(END)
