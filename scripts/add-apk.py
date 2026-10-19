#!/usr/bin/env python3
"""Agrega el APK generado por PWABuilder a la web y lo publica (un solo comando)."""
import glob
import json
import os
import re
import shutil
import subprocess
import sys
import time
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
HOME = os.path.expanduser("~")
DL = os.environ.get("KRYPTON_DL", os.path.join(HOME, "storage", "downloads"))
KEYS = os.path.join(HOME, "storage", "shared", "KryptonKeys")
APK_OUT = "public/downloads/krypton-ecosystem.apk"


def find_zip():
    if len(sys.argv) > 1:
        return sys.argv[1]
    for z in sorted(glob.glob(os.path.join(DL, "*.zip")), key=os.path.getmtime, reverse=True):
        try:
            with zipfile.ZipFile(z) as f:
                if any(n.lower().endswith(".apk") for n in f.namelist()):
                    return z
        except zipfile.BadZipFile:
            pass
    return None


zip_path = find_zip()
if not zip_path or not os.path.isfile(zip_path):
    sys.exit(f"No encontré el .zip de PWABuilder en {DL}. Pásalo así: python3 scripts/add-apk.py ruta/archivo.zip")

work = ".apk-tmp"
shutil.rmtree(work, ignore_errors=True)
os.makedirs(work)
with zipfile.ZipFile(zip_path) as f:
    f.extractall(work)

apks = [p for p in glob.glob(os.path.join(work, "**", "*"), recursive=True) if p.lower().endswith(".apk")]
if not apks:
    sys.exit("El zip no trae ningún .apk")
apks.sort(key=lambda p: ("unsigned" in p.lower(), len(p)))

size = os.path.getsize(apks[0]) / 1048576
if size > 24.5:
    sys.exit(f"El APK pesa {size:.1f} MB y Cloudflare solo sirve archivos de hasta 25 MB. Avísame y lo alojamos aparte.")

os.makedirs("public/downloads", exist_ok=True)
shutil.copy(apks[0], APK_OUT)
print(f"APK copiado ({size:.1f} MB)")

# Respaldo de las llaves de firma FUERA del proyecto (sin ellas no se puede actualizar la app instalada)
os.makedirs(KEYS, exist_ok=True)
for p in glob.glob(os.path.join(work, "**", "*"), recursive=True):
    name = os.path.basename(p).lower()
    if os.path.isfile(p) and (name.startswith("signing") or name.endswith((".keystore", ".jks"))):
        shutil.copy(p, KEYS)
shutil.copy(zip_path, KEYS)
print(f"Llaves respaldadas en {KEYS}")

# Paquete y huella para quitar la barra del navegador dentro de la app
package = sha = ""
for f in glob.glob(os.path.join(work, "**", "assetlinks.json"), recursive=True):
    try:
        target = json.load(open(f, encoding="utf-8"))[0]["target"]
        package = target["package_name"]
        sha = ",".join(target["sha256_cert_fingerprints"])
        break
    except Exception:
        pass
if not sha:
    for f in glob.glob(os.path.join(work, "**", "*.txt"), recursive=True):
        m = re.search(r"((?:[0-9A-Fa-f]{2}:){31}[0-9A-Fa-f]{2})", open(f, encoding="utf-8", errors="ignore").read())
        if m:
            sha = m.group(1)
            break
if package and sha:
    with open("lib/app/android.ts", "w", encoding="utf-8") as out:
        out.write(f'export const ANDROID_PACKAGE: string = "{package}";\nexport const ANDROID_SHA256: string = "{sha}";\n')
    print("Paquete:", package)
    print("Huella:", sha[:23] + "...")
else:
    print("Aviso: no pude leer el paquete y la huella. La app funcionará, pero con la barra del navegador.")

shutil.rmtree(work, ignore_errors=True)
ignore = open(".gitignore", encoding="utf-8").read() if os.path.exists(".gitignore") else ""
if ".apk-tmp" not in ignore:
    with open(".gitignore", "a", encoding="utf-8") as g:
        g.write("\n.apk-tmp/\n")

subprocess.run(["node", "scripts/bump.mjs", "App de Android disponible"], check=True)
subprocess.run(["git", "add", "-A"], check=True)
subprocess.run(["git", "commit", "-m", "App de Android (APK)"], check=True)
for attempt in range(1, 4):
    if subprocess.run(["git", "push", "origin", "main"]).returncode == 0:
        print("Listo: cuando termine el despliegue, /download tendrá el botón del APK.")
        break
    print(f"Reintento {attempt}...")
    time.sleep(5)
else:
    print("No se pudo subir. Revisa tu internet y corre: git push origin main")
