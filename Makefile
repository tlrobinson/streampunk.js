
build: examples/browser/index-bundle.js

%-bundle.js: %.es6
	browserify $? --extension=es6 -t [ babelify --blacklist regenerator ] --outfile $@

clean:
	rm -f examples/browser/index-bundle.js
