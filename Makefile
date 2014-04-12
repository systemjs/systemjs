
START = \
	cat lib/banner.js \
	lib/polyfill-wrapper-start.js \
	lib/polyfills.js > dist/$@.js;

END = \
	cat lib/polyfill-wrapper-end.js >> dist/$@.js; \
	cat lib/banner.js > dist/$@.min.js; \
	uglifyjs dist/$@.js -cm >> dist/$@.min.js

SystemJS = core formats formatAMD formatCJS formatGlobal map plugins bundles register versions
SystemProductionAMD = core productionAMD bundles register versions

all: system system-production-amd

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
