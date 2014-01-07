# PDF-Generator Jugendspielordnung

Kommandozeilentool, mit dem aus dem Markdown-Format der [Jugendspielordnung der Deutschen Schachjugend](https://github.com/Schachjugend/Jugendspielordnung) eine PDF-Datei generiert wird.

## Installation

(Node.js](http://nodejs.org/) wird benötigt. Danach kann das Programm wie folgt installiert werden:

	git clone https://github.com/Schachjugend/Jugendspielordnung-PDF.git
	cd Jugendspielordnung-PDF
	npm install

Eine Veröffentlichung auf [npm](http://nodejs.org/) ist derzeit nicht geplant.

## Nutzung

	Usage: jugendspielordnung2pdf [options] <markdown-file-path>

	Options:

	    -h, --help            output usage information
	    -V, --version         output the version number
	    <markdown-file-path>  Path of the markdown file to convert
	    -o, --out [path]      Path of where to save the PDF