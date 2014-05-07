
START = cat lib/banner.js lib/polyfill-wrapper-start.js > dist/$@.js;

END = cat lib/polyfill-wrapper-end.js >> dist/$@.js;

SystemJS = meta register core global cjs amd map plugins bundles versions
SystemProductionCSP = scriptLoader register core cjs amd map bundles versions

all: system system-production-csp uglify

uglify:
	cat lib/banner.js > dist/system.min.js;
	uglifyjs dist/system.js -cm >> dist/system.min.js

	cat lib/banner.js > dist/system-production-csp.min.js;
	uglifyjs dist/system-production-csp.js -cm >> dist/system-production-csp.min.js
	

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
