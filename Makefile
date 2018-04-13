
build: examples/browser/index-bundle.js

%-bundle.js: %
	browserify $? --extension=es6 -t [ babelify --blacklist regenerator ] --outfile $@

clean:
	rm -f examples/browser/index-bundle.js
