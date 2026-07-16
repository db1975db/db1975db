"""Scan-to-PDF Tool für den Canon TS6351.

Scannt Belege ueber den Windows-Scannertreiber (WIA) und speichert sie als
einzelne PDF-Dateien - sortiert nach Kreditoren (Eingangsrechnungen) und
Debitoren (Ausgangsrechnungen), passend fuer den Upload ins hmd.dts /
HMD Netarchiv Portal des Steuerbueros.

Voraussetzungen: Windows, Canon-Scannertreiber installiert,
`pip install -r requirements.txt`
"""

import io
import json
import re
import sys
import tkinter as tk
from datetime import date
from pathlib import Path
from tkinter import filedialog, messagebox

from PIL import Image

try:
    import win32com.client
except ImportError:
    win32com = None

CONFIG_FILE = Path(__file__).with_name("config.json")

CATEGORIES = {
    "kreditor": "Kreditoren (Eingangsrechnungen)",
    "debitor": "Debitoren (Ausgangsrechnungen)",
}

# WIA Automation Layer Konstanten (wiaaut.h)
WIA_DEVICE_TYPE_SCANNER = 1
WIA_INTENT_TEXT = 4          # fuer Dokumente optimiert (statt Foto)
WIA_BIAS_MINIMIZE_SIZE = 0x10000


def load_base_folder(root: tk.Tk) -> Path:
    if CONFIG_FILE.exists():
        try:
            data = json.loads(CONFIG_FILE.read_text(encoding="utf-8"))
            path = Path(data.get("base_folder", ""))
            if path.is_dir():
                return path
        except (json.JSONDecodeError, OSError):
            pass

    messagebox.showinfo(
        "Ordner waehlen",
        "Bitte den Basis-Ordner waehlen, in dem die Unterordner\n"
        "'Kreditoren' und 'Debitoren' angelegt werden sollen.",
    )
    folder = filedialog.askdirectory(title="Basis-Ordner fuer gescannte Belege waehlen")
    if not folder:
        sys.exit(0)
    path = Path(folder)
    save_base_folder(path)
    return path


def save_base_folder(path: Path) -> None:
    CONFIG_FILE.write_text(json.dumps({"base_folder": str(path)}), encoding="utf-8")


def sanitize_filename(name: str) -> str:
    name = name.strip()
    name = re.sub(r"[^\w\-. äöüÄÖÜß]", "_", name)
    return name or "Beleg"


def unique_path(path: Path) -> Path:
    if not path.exists():
        return path
    stem, suffix = path.stem, path.suffix
    counter = 2
    while True:
        candidate = path.with_name(f"{stem}_{counter}{suffix}")
        if not candidate.exists():
            return candidate
        counter += 1


class ScanApp:
    def __init__(self, root: tk.Tk, base_folder: Path):
        self.root = root
        self.base_folder = base_folder
        self.pages: list[Image.Image] = []

        root.title("Canon TS6351 - Scan zu PDF")
        root.resizable(False, False)

        frame = tk.Frame(root, padx=16, pady=16)
        frame.pack()

        tk.Label(frame, text="Kategorie:", font=("Segoe UI", 10, "bold")).grid(
            row=0, column=0, sticky="w", pady=(0, 4)
        )
        self.category_var = tk.StringVar(value="kreditor")
        cat_frame = tk.Frame(frame)
        cat_frame.grid(row=1, column=0, columnspan=2, sticky="w", pady=(0, 12))
        tk.Radiobutton(
            cat_frame, text="Kreditor (Eingangsrechnung)", variable=self.category_var,
            value="kreditor",
        ).pack(anchor="w")
        tk.Radiobutton(
            cat_frame, text="Debitor (Ausgangsrechnung)", variable=self.category_var,
            value="debitor",
        ).pack(anchor="w")

        tk.Label(frame, text="Bezeichnung (z.B. Lieferant, Rechnungsnr.):").grid(
            row=2, column=0, columnspan=2, sticky="w"
        )
        self.description_var = tk.StringVar()
        tk.Entry(frame, textvariable=self.description_var, width=40).grid(
            row=3, column=0, columnspan=2, sticky="we", pady=(0, 12)
        )

        self.status_var = tk.StringVar(value="Noch keine Seite gescannt.")
        tk.Label(frame, textvariable=self.status_var, fg="#555").grid(
            row=4, column=0, columnspan=2, sticky="w", pady=(0, 12)
        )

        btn_frame = tk.Frame(frame)
        btn_frame.grid(row=5, column=0, columnspan=2, sticky="we")
        tk.Button(
            btn_frame, text="Seite scannen", width=18, command=self.scan_page
        ).pack(side="left", padx=(0, 8))
        tk.Button(
            btn_frame, text="Als PDF speichern", width=18, command=self.save_pdf
        ).pack(side="left", padx=(0, 8))

        tk.Button(
            frame, text="Neuer Beleg (verwerfen)", command=self.reset_document
        ).grid(row=6, column=0, columnspan=2, sticky="we", pady=(12, 0))

        tk.Label(
            frame, text=f"Zielordner: {self.base_folder}", fg="#888", font=("Segoe UI", 8)
        ).grid(row=7, column=0, columnspan=2, sticky="w", pady=(12, 0))
        tk.Button(
            frame, text="Zielordner aendern", command=self.change_base_folder
        ).grid(row=8, column=0, columnspan=2, sticky="we", pady=(4, 0))

    def update_status(self) -> None:
        if not self.pages:
            self.status_var.set("Noch keine Seite gescannt.")
        else:
            self.status_var.set(f"{len(self.pages)} Seite(n) gescannt - bereit zum Speichern.")

    def scan_page(self) -> None:
        if win32com is None:
            messagebox.showerror(
                "Fehlendes Modul",
                "pywin32 ist nicht installiert. Bitte ausfuehren:\n"
                "pip install -r requirements.txt",
            )
            return
        try:
            dialog = win32com.client.Dispatch("WIA.CommonDialog")
            image = dialog.ShowAcquireImage(
                DeviceType=WIA_DEVICE_TYPE_SCANNER,
                Intent=WIA_INTENT_TEXT,
                Bias=WIA_BIAS_MINIMIZE_SIZE,
            )
        except Exception as exc:  # COM-Fehler, z.B. kein Scanner gefunden
            messagebox.showerror("Scan fehlgeschlagen", str(exc))
            return

        if image is None:
            return  # Dialog abgebrochen

        raw = bytes(bytearray(image.FileData.BinaryData))
        try:
            page = Image.open(io.BytesIO(raw)).convert("RGB")
        except OSError as exc:
            messagebox.showerror("Fehler beim Lesen des Scans", str(exc))
            return

        self.pages.append(page)
        self.update_status()

    def save_pdf(self) -> None:
        if not self.pages:
            messagebox.showwarning(
                "Keine Seiten", "Bitte zuerst mindestens eine Seite scannen."
            )
            return

        category = self.category_var.get()
        folder = self.base_folder / CATEGORIES[category]
        folder.mkdir(parents=True, exist_ok=True)

        description = sanitize_filename(self.description_var.get())
        filename = f"{date.today().isoformat()}_{description}.pdf"
        target = unique_path(folder / filename)

        first, rest = self.pages[0], self.pages[1:]
        first.save(target, "PDF", resolution=300.0, save_all=True, append_images=rest)

        messagebox.showinfo("Gespeichert", f"Beleg gespeichert unter:\n{target}")
        self.reset_document()

    def reset_document(self) -> None:
        self.pages = []
        self.description_var.set("")
        self.update_status()

    def change_base_folder(self) -> None:
        folder = filedialog.askdirectory(title="Neuen Basis-Ordner waehlen")
        if not folder:
            return
        self.base_folder = Path(folder)
        save_base_folder(self.base_folder)
        messagebox.showinfo("Ordner geaendert", f"Neuer Zielordner:\n{self.base_folder}")
        self.root.destroy()
        main()


def main() -> None:
    root = tk.Tk()
    root.withdraw()
    base_folder = load_base_folder(root)
    root.deiconify()
    ScanApp(root, base_folder)
    root.mainloop()


if __name__ == "__main__":
    main()
