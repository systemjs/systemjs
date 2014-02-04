define START
	cat lib/banner.js \
	lib/polyfill-wrapper-start.js \
	lib/system-core.js
endef

define FORMATS
	lib/system-formats.js \
	lib/system-format-amd.js \
	lib/system-format-cjs.js \
	lib/system-format-global.js
endef

define END
	lib/polyfill-wrapper-end.js > dist/$@.js
	cat lib/banner.js > dist/$@.min.js
	uglifyjs dist/$@.js -cm >> dist/$@.min.js
endef

all: system system-amd-production

system:
	$(START) \
	$(FORMATS) \
	lib/system-plugins.js \
	lib/system-bundles.js \
	lib/system-map.js \
	lib/system-versions.js \
	$(END)

system-amd-production:
	$(START) \
	lib/system-amd-production.js \
	lib/system-bundles.js \
	lib/system-map.js \
	lib/system-versions.js \
	$(END)
