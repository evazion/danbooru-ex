#!/bin/sh -ue

FILE=${1:-CHANGES.md}
VERSION="$(cat VERSION)"
PREV="$(git tag --sort=-refname | head -n 1)"
DATE="$(date +%Y-%m-%d)"

echo "# Release $VERSION ($DATE)"
echo ""
echo "#### Features"
echo ""
echo "#### Fixes"
echo ""
git log --date=short --pretty='format:%h %ad %s' $PREV..HEAD
echo ""
echo ""
cat $FILE
