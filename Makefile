.ONESHELL:
.PHONY: all bump serve watch clean

HEADER := src/header-dev.js

all: dist/danbooru-ex.user.js rollup.config.js
dist/danbooru-ex.user.js: $(shell find src) | bump
	mkdir -p dist
	rollup --environment HEADER:$(HEADER) -c

bump:
	V=$$(awk '/\/\/ @version      [[:digit:]]+/ { print $$3 + 1 }' $(HEADER))
	sed -i -r -e "s!(// @version      )[[:digit:]]+!\\1$$V!g" $(HEADER)

serve:
	cd dist
	nohup python -m http.server > /dev/null 2>&1 &

watch:
	@while true; do
	    inotifywait -q -q -e create -e modify -e move -e delete -r . @./.git && make -s
	done

clean:
	rm -rf dist
