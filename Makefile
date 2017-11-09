dependencies:
	yarn

develop:
	yarn run dev

package:
	rm -r release/*
	yarn run package-linux
	yarn run package-win
	yarn run package-mac
