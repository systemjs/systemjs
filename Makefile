define START
	lib/banner.js \
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
	lib/polyfill-wrapper-end.js
endef

define MINIFY
	cat lib/banner.js > dist/$@.min.js
	uglifyjs dist/$@.js >> dist/$@.min.js
endef

all: system system-jspm

system:
	cat $(START) \
	$(FORMATS) \
	lib/system-map.js \
	lib/system-module.js \
	lib/system-plugins.js \
	$(END) > dist/$@.js
	$(MINIFY)

system-jspm:
	cat $(START) \
	$(FORMATS) \
	lib/system-map.js \
	lib/system-module.js \
	lib/system-plugins.js \
	lib/system-jspm.js \
	$(END) > dist/$@.js
	$(MINIFY)