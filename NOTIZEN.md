# Arbeitsstand Home-Assistant-Dashboards

Übergabe für den nächsten Chat. Stand: 25.11.2026.

## Was in Home Assistant eingerichtet ist

### Dashboard „Wetterstation“ (`/wetter-station`)
- **Tab „Wetter“:** eigene Karte `custom:wetterstation-garten-card` (Datei `www/wetterstation-garten-card.js`, v1.2).
  Animierter Himmel, Kompass, Windrose (24 h / 3 / 7 / 10 Tage mit Windstärke-Klassen, Monat / Jahr / Gesamt aus der Langzeitstatistik),
  „Das Jahr in Farben“, Monatsvergleich, Monatsbilanz, Rekorde. Die Sensornamen stehen fest im Code (`DEF` oben in der Datei),
  sie lassen sich über `entities:` in der Karten-Konfiguration überschreiben.
- **Tab „Klassisch“:** ältere Fassung mit apexcharts-card, button-card, weather-radar-card und card-mod.
- **Ressource:** inline (data-URI), Resource-ID `d6dca6d9c2c94d5c8e247bf886d99447`.

### 16 Windrosen-Sensoren
- `sensor.windrose_n`, `_nno`, `_no`, `_ono`, `_o`, `_oso`, `_so`, `_sso`, `_s`, `_ssw`, `_sw`, `_wsw`, `_w`, `_wnw`, `_nw`, `_nnw`
- Template-Helfer: 100 %, wenn der Wind aus diesem Sektor kommt und mindestens 1 km/h hat, sonst 0. `state_class: measurement`, damit dauerhaft Stundenwerte gespeichert werden.
- Datenbasis: `sensor.garden_wetterstation_richtung` und `sensor.garden_wetterstation_geschwindigkeit`. Aufzeichnung seit 24.11.2026.
- Hintergrund: Die Recorder-Datenbank ist bei 10 Tagen Speicherdauer schon etwa 3,7 GB groß. Deshalb wurde die Speicherdauer bewusst **nicht** erhöht.

### Dashboard „Wohnzimmer“ (`/dashboard-wohnzimmer`)
- Eine Panel-Ansicht mit eigener Karte `custom:raum-card` (Datei `www/raum-card.js`, v1.1). Der frühere Tab „Klassisch“ wurde auf Wunsch entfernt.
- Konfiguration: `dashboards/wohnzimmer.yaml`.
- Bereiche: Lichtstimmung mit Thermostat-Regler, Licht, Steckdosen, Lichtszenen (Hue-Szenen über `select.wohnzimmer_wohnzimmer_scenen_szene`), Rollläden, Medien, Strom, Raumklima über 24 h, Status.
- Laterne = Gruppe `light.laterne` (ShellyVintage 1–3). Diese Lampen hängen an der Steckdose `switch.shellyplusplugs_e465b893b740`. Ist die Steckdose aus, schaltet ein Tipp auf die Kachel die Steckdose ein.
- Steckdosen: Stern, Laterne, TV. „Alles aus“ schaltet nur die Lichter aus.
- **Ressource:** inline, Resource-ID `1bc3365d5d504c3c9d14d27f5598de9a` (seit 25.11.2026 v1.2, gilt für Wohnzimmer und Küche).

### Dashboard „Küche“ (`/dashboard-kuche`)
- Eine Panel-Ansicht mit `custom:raum-card`, Konfiguration: `dashboards/kueche.yaml`. Angelegt am 25.11.2026.
- Licht: Deckenspots (`light.aqara_led_deckenspots`), Küchentisch (`light.aqara_kuchentisch`), Kleiner Flur (`light.aqara_led_decke`).
- Klima: BTHome-Sensor 28a8 + Thermostat `climate.shellywalldisplay_000822de33c9`.
- Rollläden: Fenster und Terrassentür. Medien: Sonos Era 100 (Quellen = Sonos-Favoriten), Fernseher Bravia.
- Bereich „Geräte“: Luftreiniger (`fan.switchbot_air_purifier`). Kühlschrank und iPad-Ladung bewusst nur in der Stromübersicht, nicht schaltbar (Automationen steuern die iPad-Ladung).
- Keine Hue-Szenen-Auswahl für die Küche vorhanden, deshalb kein Bereich „Lichtszenen“.

### Dashboard „Zuhause (neu)“ (`/dashboard-haus`) – im Aufbau
- Ziel: EIN Dashboard mit mehreren Ansichten statt vieler einzelner Dashboards. Schritt für Schritt, Dennis will jede Ansicht vorher als Vorschau sehen und gibt dann sein Ok.
- Steht vorläufig als **„Zuhause (neu)“** in der Seitenleiste (Symbol Haus mit Herz), damit es nicht mit dem alten „Zuhause“ (`/dashboard-g1`) verwechselt wird.
- Ansicht „Start“ (Panel) mit `custom:haus-card` (Datei `www/haus-card.js`, Konfiguration `dashboards/haus-start.yaml`).
  Inhalt: Wetter mit animiertem Himmel, Personen mit Fotos (grüner Ring = zu Hause), Hinweise (Rauch, offene Fenster, Müll morgen, schwache Batterien),
  vier große Kacheln Erdgeschoss / Obergeschoss / Garten / Pool, Energie-Leiste mit Hausbatterie.
- **Ressource:** inline, Resource-ID `0e363120356147f5a4a40e85bcafc8be`.
- Hausbatterie `sensor.varta_battery_power_signed`: negativ = lädt, positiv = entlädt (aus dem Verlauf geprüft). Abends leer, nachts 0 % ist normal.
- Geplante Ansichten (Pfade sind in der Startseite schon verlinkt): `erdgeschoss`, `obergeschoss`, `garten`, `pool`, `wetter`, `maehroboter`, `bewaesserung`, plus Räume `wohnzimmer`, `kueche` usw.
- Danach sollen die Einzel-Dashboards (Wohnzimmer, Küche, Wetterstation, Mähroboter, Hunter-Bewässerung) überflüssig werden – erst löschen, wenn Dennis das will.

## Die Raum-Karte für weitere Räume
`raum-card` ist allgemein gebaut. Alle Bereiche sind optional:
`name`, `floor`, `icon`, `temperature`, `humidity`, `climate`, `lights[]` (`entity`, `name`, `icon`, optional `socket`),
`switches[]`, `sockets[]` (`entity`, `name`, `icon`, `power`; Überschrift über `sockets_title`/`sockets_icon`, ab v1.2), `scene_select`, `scene_favorites[]`, `covers[]`,
`media[]` (`entity`, `name`, `icon`, `sources`, `play`, `power`, `chip`), `power[]`, `windows[]`, `batteries[]`.

## Offene Punkte
- Name bzw. Gerät für „Aqara Taster“ in der Stromübersicht klären (`sensor.wohnzimmer_aqara_taster_wohnzimmer_leistung`).
- Raum-Karte für weitere Räume bauen, zum Beispiel Schlafzimmer, Büro.
- Küche: Gerät hinter `sensor.kuche_aqara_taster_kuche_leistung` klären (in der Karte vorläufig „Deckenlicht (Aqara Taster)“).
- Küche: Terrassentür-Sensor `binary_sensor.bthome_sensor_d867_window` ist nicht erreichbar, deshalb noch nicht in der Karte.
- Ab 2027: Vorjahresvergleich in der Wetterkarte.

## Hinweise für Änderungen
- Nach jeder Änderung an einer Karte muss der Browser komplett neu laden (Strg+Umschalt+R). In der App: Frontend-Cache zurücksetzen, danach die App neu starten.
- Karten-Code ändern: Die Datei hier ändern, testen und dann die Inline-Ressource in Home Assistant mit derselben Resource-ID aktualisieren.
