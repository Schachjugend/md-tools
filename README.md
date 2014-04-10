# Tools zur Jugendspielordnung

Kommandozeilentool, mit dem aus dem Markdown-Format der [Jugendspielordnung der Deutschen Schachjugend](https://github.com/Schachjugend/Jugendspielordnung) verschiedene Ausgabeformate erzeugt werden. Aktuell kann HTML und PDF generiert werden.

## Installation

[Node.js](http://nodejs.org/) wird benötigt. Danach kann das Programm wie folgt installiert werden:

	git clone https://github.com/Schachjugend/Jugendspielordnung-Tools.git
	cd Jugendspielordnung-Tools
	npm install

Eine Veröffentlichung auf [npm](http://nodejs.org/) ist derzeit nicht geplant.

## Nutzung

	Usage: jugendspielordnung publish [options] [command]

	Commands:

	  all [markdown] [directory] create all output formats with default options
	  html [options] [markdown] publish as HTML
	  pdf [options] [markdown] [output] publish as PDF
