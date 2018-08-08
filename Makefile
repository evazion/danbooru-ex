.ONESHELL:
.PHONY: all bump serve watch clean stable unstable changelog

VERSION := $(shell cat VERSION)

ifeq ($(MAKECMDGOALS),stable)
NAME := Danbooru EX
URL  := https://github.com/evazion/danbooru-ex/raw/stable/dist/danbooru-ex.user.js
else ifeq ($(MAKECMDGOALS),unstable)
NAME := Danbooru EX (Beta)
URL  := https://github.com/evazion/danbooru-ex/raw/unstable/dist/danbooru-ex.user.js
else 
NAME := Danbooru EX (Dev)
URL  := http://localhost:8000/danbooru-ex.user.js
endif

all: dist/danbooru-ex.user.js | bump
dist/danbooru-ex.user.js: $(shell find src) rollup.config.js VERSION Makefile | dist
	NAME="$(NAME)" VERSION="$(VERSION)" URL="$(URL)" npm run exec -- rollup -c

stable unstable: all
release: all
	git tag -a -m "Release $(VERSION)" "v$(VERSION)" 
	git push --tags

changelog:
	bin/changelog.sh CHANGES.md | sponge CHANGES.md

dist:
	mkdir -p dist

bump:
	@date -u "+%Y.%m.%d@%H.%M.%S" > VERSION

serve:
	@cd dist
	nohup python -m http.server > /dev/null 2>&1 &

watch:
	@while true; do
	    inotifywait -q -q -e create -e modify -e move -e delete -r . @./.git && make --no-print-directory
	done

clean:
	rm -rf dist
