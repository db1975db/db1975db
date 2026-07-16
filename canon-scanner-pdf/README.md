# Canon TS6351 – Scan zu PDF (fürs Steuerbüro)

Kleines Windows-Programm mit grafischer Oberfläche: Scannt Belege über den
Canon TS6351, fügt mehrere Seiten zu einer PDF zusammen und speichert sie
automatisch sortiert nach **Kreditoren** (Eingangsrechnungen) und
**Debitoren** (Ausgangsrechnungen) – passend für den Upload ins
hmd.dts / HMD Netarchiv Portal.

Jeder Beleg wird als **eigene PDF-Datei** gespeichert (keine Sammel-PDFs),
wie vom Steuerbüro gefordert.

## Voraussetzungen

1. **Canon-Treiber installieren**: Auf der Canon-Support-Seite nach
   "TS6351" suchen und das *Full Driver & Software Package* für Windows
   herunterladen und installieren. Danach ist der Scanner unter Windows
   (WIA) verfügbar.
2. **Python 3.10+** installieren (von [python.org](https://www.python.org/downloads/),
   beim Installieren "Add python.exe to PATH" ankreuzen).

## Installation

In diesem Ordner ein Terminal öffnen (Rechtsklick → "In Terminal öffnen")
und ausführen:

```
pip install -r requirements.txt
```

## Benutzung

```
python scan_to_pdf.py
```

Beim ersten Start fragt das Programm nach dem Basis-Ordner (z. B.
`Buchhaltung 2026`). Darunter werden automatisch die Unterordner
`Kreditoren (Eingangsrechnungen)` und `Debitoren (Ausgangsrechnungen)`
angelegt.

Ablauf pro Beleg:

1. **Kategorie wählen**: Kreditor oder Debitor
2. **Bezeichnung eingeben** (z. B. Lieferantenname oder Rechnungsnummer)
3. Beleg auf das Vorlagenglas legen, **"Seite scannen"** klicken –
   der Windows-Scandialog öffnet sich. Bei mehrseitigen Belegen einfach
   für jede weitere Seite erneut "Seite scannen" klicken.
4. **"Als PDF speichern"** klicken – die Datei wird als
   `JJJJ-MM-TT_Bezeichnung.pdf` im passenden Ordner abgelegt.
5. Danach direkt den nächsten Beleg scannen (das Formular setzt sich
   automatisch zurück).

Mit **"Neuer Beleg (verwerfen)"** lassen sich bereits gescannte, aber noch
nicht gespeicherte Seiten verwerfen. Über **"Zielordner ändern"** lässt
sich der Basis-Ordner jederzeit anpassen.

## Optional: als eigenständige .exe bauen

Damit man nicht jedes Mal ein Terminal braucht, lässt sich eine
doppelklickbare .exe erzeugen:

```
pip install pyinstaller
pyinstaller --onefile --windowed --name ScanToPDF scan_to_pdf.py
```

Die fertige `ScanToPDF.exe` liegt danach im Ordner `dist/`.

## Anschließend

Die erzeugten PDFs im Ordner `hmd.dts (Upload)` bzw. wie vom Steuerbüro
vorgegeben ins Netarchiv-Portal hochladen (siehe Anleitung "Upload Dateien
über Netarchiv").
