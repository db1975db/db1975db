# Arbeitsstand Home-Assistant-Dashboards

Übergabe für den nächsten Chat. Stand: 25.11.2026.

## Was in Home Assistant eingerichtet ist

### Dashboard „Wetterstation“ (`/wetter-station`)
- **Tab „Wetter“:** eigene Karte `custom:wetterstation-garten-card` (Datei `www/wetterstation-garten-card.js`, v1.3; optional `back`, `back_label`, `base_path`, `inset` – genutzt in „Zuhause (neu)“).
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
- Eine Panel-Ansicht mit eigener Karte `custom:raum-card` (Datei `www/raum-card.js`, v1.13.0; neu: `purifier:` (Luftreiniger-Bereich mit SwitchBot-Tisch-Bild, Luftqualität, Stufen, Licht/Kindersicherung/Laden, Filter mit `filter_max_h`, Standard 4380 h – Wert noch mit Dennis klären) – Küche; Medien mit `style: tv` + `sky:` (Fernseher mit Sky-Q-Sendungsbild, Sender, Live, Steuerung, Lautstärke, App-Knöpfe) – Wohnzimmer; Samsung meldet keine aktive App; Medien mit `style: player` („Jetzt läuft“: Cover, Titel, Fortschritt, Steuerung, Lautstärke, Favoriten aus `source_list` bzw. `sources[]`) – Sonos Küche; `cover_style: scene` (Rollläden als Bild mit Tag/Nacht nach `sun.sun`, Ziehen auf dem Fenster, Schnellwahl Auf/Halb/Schlitze 20 %/Zu; `kind: door|window` optional, sonst aus dem Namen „Tür“) – in allen Räumen aktiv; Rollläden ohne Positionsangabe (Treppe, Flur oben, Eingang „Alle (Zentral)“) zeigen nur hoch/runter/stopp; `type: lantern` (Laterne, optional `socket` – ist die Steckdose aus, schaltet jeder Tipp erst die Steckdose ein); Farbtupfer unter jedem Leuchtenbild (Weißtöne + Farben, wirken auf die ganze Gruppe), langes Drücken auf eine einzelne Lampe im Bild öffnet deren Farbdialog; `fixtures[]`, `locks[]` mit `entity`, `name`, `battery` – Abschließen/Aufschließen/Öffnen, Aufschließen und Öffnen mit Rückfrage). Der frühere Tab „Klassisch“ wurde auf Wunsch entfernt.
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
- Komplette Konfiguration: `dashboards/haus.yaml` (wird aus `haus-start.yaml`, `wohnzimmer.yaml`, `kueche.yaml` erzeugt).
- Ansichten (alle als Unteransichten außer `start`): `wetter`, `erdgeschoss`, `obergeschoss`, `garten`,
  Räume `wohnzimmer`, `kueche`, `eingang`, `flur-unten`, `wc`, `hwr`, `speisekammer`, `schlafzimmer`, `kinderzimmer`, `buero`, `badezimmer`, `flur-oben`, `terrasse`, `carport`,
  dazu `pool` und `bewaesserung` (beide als Raum-Karte). Raum-Konfigurationen: `dashboards/raeume.yaml` (Erstentwurf aus den HA-Bereichen, 25.11.2026).
- Mähroboter: Kachel im Garten verweist vorerst auf das alte Dashboard `/dashboard-mahroboter/robi` (die Dreame-Entitäten `lawn_mower.robi` usw. gibt es derzeit nicht).
- Startseite (`custom:haus-card`, `www/haus-card.js`, v0.8; Energiebereich dunkel mit Tagesverlauf aus der 5-Minuten-Statistik, Batterie-Hinweise aus: `hint_batteries: false`, keine „Alles in Ordnung“-Zeile: `hints_ok: false`): Wetter, Personen mit Fotos, Hinweise, 4 Kacheln ohne Raumliste (`tile_rooms: false`), Energiefluss (`sections: flow`) mit Autarkie-Ring. Im Querformat bis 860 px Höhe kompakt (4 Kacheln nebeneinander), damit das iPad mini (1133×744) nicht scrollen muss.
- Etagen-Ansicht: `haus-card` mit `sections: [header, rooms]` und `floor: …`; Kopf mit „‹ Übersicht“, „Alle Lichter aus“ und Lichtschalter auf jeder Raum-Kachel.
- Raum-Ansichten: `raum-card` mit `back`, `back_label`, `base_path` (Zurück-Knopf, ab raum-card v1.3).
- `inset: ipad` (haus-card ab v0.6, raum-card ab v1.4): Rand für die abgerundeten iPad-Ecken in allen Unteransichten.
- **kiosk-mode** (v16) im Dashboard: `hide_header: '{{ "iPad" in user_agent }}'` → nur auf dem iPad keine Kopfzeile.
  Der ☰-Knopf auf der Startseite ist auf Wunsch entfernt (`menu_button: false`); das randlose Layout ohne Scrollen kommt jetzt über `kiosk: ipad` (haus-card v0.8.2). Die Personen sitzen oben rechts in der Ecke. Seitenleiste auf dem iPad nur noch über den Notausgang: `?disable_km` an die Adresse hängen (oder `menu_button: ipad` wieder setzen).
- iPad mini Küche: browser_mod-Browser „iPad mini“, angemeldet als Dennis (wie das iPhone) – deshalb Unterscheidung über die Browserkennung, nicht über den Benutzer.
- **Ressourcen:** haus-card inline `0e363120356147f5a4a40e85bcafc8be`; raum-card `1bc3365d5d504c3c9d14d27f5598de9a` (beide exakt = Repo, per SHA-256 geprüft).
- Hausbatterie `sensor.varta_battery_power_signed`: negativ = lädt, positiv = entlädt (aus dem Verlauf geprüft). Abends leer, nachts 0 % ist normal.
- Nach jeder Karten-Änderung auf iPhone/iPad: Companion App → Debugging → Frontend-Cache zurücksetzen, App neu starten.
- Später: Einzel-Dashboards (Wohnzimmer, Küche, Wetterstation, Mähroboter, Hunter-Bewässerung) erst löschen, wenn Dennis das will.

## Die Raum-Karte für weitere Räume
`raum-card` ist allgemein gebaut. Alle Bereiche sind optional:
`name`, `floor`, `icon`, `temperature`, `humidity`, `climate`, `lights[]` (`entity`, `name`, `icon`, optional `socket`),
`switches[]`, `locks[]`, `fixtures[]` (ab v1.7: Leuchten als Bild – `type: globes` mit `entity` + `bulbs[]`, `type: bar` mit `entity`, `up`, `down`; `type: spots` (Einbaustrahler) und `type: pendants` (Pendel an Deckenschiene) mit `entity` + `bulbs[]`, ab v1.7.2; diese Lampen fallen aus den Licht-Kacheln heraus), `sockets[]` (`entity`, `name`, `icon`, `power`; Überschrift über `sockets_title`/`sockets_icon`, ab v1.2), `scene_select`, `scene_favorites[]`, `covers[]`,
`media[]` (`entity`, `name`, `icon`, `sources`, `play`, `power`, `chip`), `power[]`, `windows[]`, `batteries[]`.

## Offene Punkte
- Stand 25.11. abends: Rückmeldung vom iPad noch offen zu langem Drücken (Farbrad), Ziehen am Rollladen-Bild, Sonos-Cover (Küche) und Sky-Q-Sendungsbild (Wohnzimmer).
- Rollläden Treppe, Flur oben und Eingang „Alle (Zentral)“ melden keine Position – Shellys in der Shelly-App kalibrieren, dann gehen Ziehen und Schnellwahl automatisch.
- Leuchten als Bild bisher nur Wohnzimmer und Küche – weitere Räume nach Fotos von Dennis.
- Laterne Wohnzimmer: Die Shelly-Vintage-Birnen melden in HA nur Helligkeit (kein Kalt-/Warmweiß), daher keine Farbtupfer.
- Esstisch (Hue Ensis): laut Gerätemodell ist `light.tisch` das Uplight und `light.tisch_2` das Downlight – die Namen in HA sagen das Gegenteil. In der Karte gilt vorerst `up: light.tisch_2`; mit Dennis prüfen.
- Räume sind ein Erstentwurf – mit Dennis durchgehen, was raus/rein soll (Batterien stehen je Raum unter „Status“).
- Pool: Wärmepumpe `climate.pool_warmepumpe`, Pumpe/Elektrolyse und Poollicht sind derzeit nicht erreichbar (Winter?). Das alte Pool-Dashboard nutzt teils Entitäten, die es nicht mehr gibt.
- Flur oben hat keinen Temperatursensor (große Temperatur zeigt „–“).
- Mähroboter-Ansicht im neuen Stil bauen, sobald die Dreame-Integration wieder Entitäten liefert.
- Später: „Zuhause (neu)“ umbenennen/als Standard setzen, alte Einzel-Dashboards löschen – nur nach Rückfrage.
- Name bzw. Gerät für „Aqara Taster“ in der Stromübersicht klären (`sensor.wohnzimmer_aqara_taster_wohnzimmer_leistung`).
- Küche: Gerät hinter `sensor.kuche_aqara_taster_kuche_leistung` klären (in der Karte vorläufig „Deckenlicht (Aqara Taster)“).
- Küche: Terrassentür-Sensor `binary_sensor.bthome_sensor_d867_window` ist nicht erreichbar, deshalb noch nicht in der Karte.
- Ab 2027: Vorjahresvergleich in der Wetterkarte.

## Hinweise für Änderungen
- Nach jeder Änderung an einer Karte muss der Browser komplett neu laden (Strg+Umschalt+R). In der App: Frontend-Cache zurücksetzen, danach die App neu starten.
- Karten-Code ändern: Die Datei hier ändern, testen und dann die Inline-Ressource in Home Assistant mit derselben Resource-ID aktualisieren.
