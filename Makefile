
START = cat lib/banner.js lib/polyfill-wrapper-start.js > dist/$@.src.js;

END = cat lib/polyfill-wrapper-end.js >> dist/$@.src.js;

SystemJS = core meta register es6 global cjs amd map plugins bundles versions depCache
SystemCSP = core scriptLoader meta register es6 global cjs amd map plugins bundles versions depCache

all: system system-csp uglify

uglify: system system-csp
	cd dist && ../node_modules/.bin/uglifyjs system.src.js -cm --source-map system.js.map > system.js
	cd dist && ../node_modules/.bin/uglifyjs system-csp.src.js -cm --source-map system-csp.js.map > system-csp.js

system:
	$(START)
	for extension in $(SystemJS); do \
		cat lib/extension-$$extension.js >> dist/$@.src.js; \
	done
	for extension in $(SystemJS); do \
		echo $$extension"(System);" >> dist/$@.src.js; \
	done
	$(END)

system-csp:
	$(START)
	for extension in $(SystemCSP); do \
		cat lib/extension-$$extension.js >> dist/$@.src.js; \
	done
	for extension in $(SystemCSP); do \
		echo $$extension"(System);" >> dist/$@.src.js; \
	done
	$(END)
