.ONESHELL:
.PHONY: all serve watch clean

all: dist/danbooru-ex.user.js
dist/danbooru-ex.user.js: $(shell find src)
	mkdir -p dist
	rollup -c

serve:
	cd dist
	nohup python -m http.server > /dev/null 2>&1 &

watch:
	@while true; do
	    inotifywait -q -q -e create -e modify -e move -e delete -r . @./.git && make -s
	done

clean:
	rm -rf dist
