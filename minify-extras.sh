mkdir -p dist/extras
cp src/extras/* dist/extras/
cd dist/extras
rm *.min.js
for f in *.js
do
  short=${f%.js}
  ../../node_modules/.bin/terser $f -c passes=2 --define DEV=false -m --source-map --replace DEV=false -o $short.min.js
  sed 's/DEV/true/' $f
done