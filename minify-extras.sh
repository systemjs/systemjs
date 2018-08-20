cd dist/extras
rm *.min.js
for f in *.js
do
  short=${f%.js}
  ../../node_modules/.bin/terser $f -c passes=2 -m --source-map -o $short.min.js
done