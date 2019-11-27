# Tools zur Jugendspielordnung

Kommandozeilentool, mit dem aus dem Markdown-Format der [Jugendspielordnung der Deutschen Schachjugend](https://github.com/Schachjugend/Spielordnung) verschiedene Ausgabeformate erzeugt werden. Aktuell kann HTML und PDF generiert werden.

## Installation

[Node.js](http://nodejs.org/) in Version 10 oder höher wird benötigt. Danach kann das Programm wie folgt installiert werden:

```sh
git clone https://github.com/Schachjugend/md-tools.git
cd md-tools
npm install
```

Eine Veröffentlichung auf [npm](http://nodejs.org/) ist derzeit nicht geplant.

## Nutzung

```sh
./bin/schachjugend-md spielordnung --help
Usage: schachjugend-md-spielordnung [options] [command]

Options:
  -h, --help                         output usage information

Commands:
  html [options] <markdown>          publish as HTML
  pdf [options] <file> <outputPath>  publish as PDF from a given HTML or Markdown file
  all [options] <markdown> <dir>     publish as HTML and PDF in <dir> from a given Markdown file
```
