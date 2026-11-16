#!/bin/zsh
# Doppelklick im Finder startet die Test-Instanz. Beenden: Strg+C oder Fenster schließen.
cd "$(dirname "$0")/../.."
exec ../venv-wr/bin/python devtools/testinstanz/start.py "$@"
