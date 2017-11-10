.ONESHELL:
.PHONY: all bump serve watch clean release changelog

VERSION := $(shell cat VERSION)

ifeq ($(MAKECMDGOALS),release)
NAME := Danbooru EX
URL  := https://github.com/evazion/danbooru-ex/raw/stable/dist/danbooru-ex.user.js
else
NAME := Danbooru EX (Beta)
URL  := http://localhost:8000/danbooru-ex.user.js
# URL  := https://github.com/evazion/danbooru-ex/raw/master/dist/danbooru-ex.user.js
endif

all: dist/danbooru-ex.user.js | bump
dist/danbooru-ex.user.js: $(shell find src) rollup.config.js VERSION Makefile | dist
	NAME="$(NAME)" VERSION="$(VERSION)" URL="$(URL)" npm run exec -- rollup -c

release: all
	git tag -a -m "Release $(VERSION)" "v$(VERSION)" 
	git push --tags

changelog:
	bin/changelog.sh CHANGES.md | sponge CHANGES.md

dist:
	mkdir -p dist

bump:
	@gawk -i inplace '/[[:digit:]]+/ { print $$1 + 1 }' VERSION

serve:
	@cd dist
	nohup python -m http.server > /dev/null 2>&1 &

watch:
	@while true; do
	    inotifywait -q -q -e create -e modify -e move -e delete -r . @./.git && make --no-print-directory
	done

clean:
	rm -rf dist
