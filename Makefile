
START = cat lib/banner.js lib/polyfill-wrapper-start.js > dist/$@.js;

END = cat lib/polyfill-wrapper-end.js >> dist/$@.js;

SystemJS = core meta register global cjs amd map plugins bundles versions
SystemProductionAMD = core register scriptLoader map bundles versions

all: system system-production-amd uglify

uglify:
	cat lib/banner.js > dist/system.min.js;
	uglifyjs dist/system.js -cm >> dist/system.min.js

	cat lib/banner.js > dist/system-production-amd.min.js;
	uglifyjs dist/system-production-amd.js -cm >> dist/system-production-amd.min.js
	

system:
	$(START)
	for extension in $(SystemJS); do \
		cat lib/extension-$$extension.js >> dist/$@.js; \
	done
	for extension in $(SystemJS); do \
		echo $$extension"(System);" >> dist/$@.js; \
	done
	$(END)

system-production-amd:
	$(START)
	for extension in $(SystemProductionAMD); do \
		cat lib/extension-$$extension.js >> dist/$@.js; \
	done
	for extension in $(SystemProductionAMD); do \
		echo $$extension"(System);" >> dist/$@.js; \
	done
	$(END)
