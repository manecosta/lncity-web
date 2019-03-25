mkdir -p build
rm -r build
mkdir build
cp -r `ls -A | grep -v "build\|^\..*"` build/

