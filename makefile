all: full jspm

full:
	cat lib/banner.js \
	lib/polyfill-wrapper-start.js \
	lib/system-core.js \
	\
	lib/system-formats.js \
	lib/system-format-amd.js \
	lib/system-format-cjs.js \
	lib/system-format-global.js \
	\
	lib/system-map.js \
	lib/system-plugins.js \
	\
  lib/polyfill-wrapper-end.js \
	> dist/system.js
	cat lib/banner.js > dist/system.min.js
	uglifyjs dist/system.js >> dist/system.min.js

jspm:
	cat lib/banner.js \
	lib/polyfill-wrapper-start.js \
	lib/system-core.js \
	\
	lib/system-formats.js \
	lib/system-format-amd.js \
	lib/system-format-cjs.js \
	lib/system-format-global.js \
	\
	lib/system-map.js \
	lib/system-plugins.js \
	lib/system-jspm.js \
	\
  lib/polyfill-wrapper-end.js \
	> dist/system-jspm.js
	cat lib/banner.js > dist/system-jspm.min.js
	uglifyjs dist/system-jspm.js >> dist/system-jspm.min.js