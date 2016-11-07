.ONESHELL:
.PHONY: all bump serve watch clean

HEADER := src/header-dev.js

all: dist/danbooru-ex.user.js rollup.config.js
dist/danbooru-ex.user.js: $(shell find src) | bump dist
	rollup --environment HEADER:$(HEADER) -c

dist:
	mkdir -p dist

bump:
	@V=$$(awk '/\/\/ @version      [[:digit:]]+/ { print $$3 + 1 }' $(HEADER))
	@sed -i -r -e "s!(// @version      )[[:digit:]]+!\\1$$V!g" $(HEADER)
	echo VERSION=$$V

serve:
	@cd dist
	nohup python -m http.server > /dev/null 2>&1 &

watch:
	@while true; do
	    inotifywait -q -q -e create -e modify -e move -e delete -r . @./.git && make --no-print-directory
	done

clean:
	rm -rf dist
