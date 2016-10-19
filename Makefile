.ONESHELL:
.PHONY: all bump serve watch clean

all: dist/danbooru-ex.user.js
dist/danbooru-ex.user.js: $(shell find src) | bump
	mkdir -p dist
	rollup -c

bump:
	V=$$(awk '/\/\/ @version      [[:digit:]]+/ { print $$3 + 1 }' src/header.js)
	sed -i -r -e "s!(// @version      )[[:digit:]]+!\\1$$V!g" src/header.js

serve:
	cd dist
	nohup python -m http.server > /dev/null 2>&1 &

watch:
	@while true; do
	    inotifywait -q -q -e create -e modify -e move -e delete -r . @./.git && make -s
	done

clean:
	rm -rf dist
