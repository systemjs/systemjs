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

all: system system-jspm

system:
	$(START) \
	$(FORMATS) \
	lib/system-module.js \
	lib/system-plugins.js \
	lib/system-map.js \
	lib/system-versions.js \
	$(END)

system-jspm:
	$(START) \
	$(FORMATS) \
	lib/system-module.js \
	lib/system-plugins.js \
	lib/system-map.js \
	lib/system-versions.js \
	lib/system-jspm.js \
	$(END)
