# aimanelasad.com

Persönliche Website von Aiman El Asad. Statische Seite – eine `index.html`, ein Stylesheet,
ein kleines Skript. Keine Build-Tools, keine Abhängigkeiten, keine Datenbank, kein Tracking.

```
index.html            Inhalt aller Sektionen (About, CV, Publications, Projects, Contact, Legal notice)
assets/css/main.css   Design (angelehnt an HTML5 UP „Dimension“, komplett selbst geschrieben)
assets/js/main.js     Ein-/Ausblenden der Sektionen, Hash-Routing (#cv, #publications, …)
assets/fonts/         Schrift „Source Sans 3“ (OFL-Lizenz), selbst gehostet – kein Google-Fonts-Aufruf
images/profile.jpg    Rundes Profilbild (480×480)
favicon.svg           Browser-Tab-Icon („AE“)
404.html              Fehlerseite
CNAME                 Domain für GitHub Pages (www.aimanelasad.com)
.nojekyll             Schaltet den Jekyll-Build von GitHub Pages ab (Dateien werden 1:1 ausgeliefert)
.gitignore            Lokale Systemdateien und Editor-Konfiguration (.claude/) ausschließen
robots.txt, sitemap.xml
```

## Lokal ansehen

```bash
python -m http.server 8765 --directory C:/aimanelasad-website
```

Dann <http://127.0.0.1:8765/> öffnen. Einzelne Sektionen sind direkt verlinkbar,
z. B. <http://127.0.0.1:8765/#publications>.

## Vor dem Veröffentlichen ausfüllen (TODOs in `index.html`)

1. **Impressum-Adresse** in `<article id="legal">` – nach § 18 Abs. 1 MStV sind Name und
   ladungsfähige Anschrift Pflicht, auch für private Seiten (c/o-Adresse geht, Postfach nicht).
2. **Kontakt-Profile** (LinkedIn, GitHub, ORCID, Google Scholar) in `<article id="contact">`:
   auskommentierten Block aktivieren und echte URLs eintragen – oder Zeilen löschen.
3. **gpu-kernel-lab-Link** in `<article id="projects">`: aktivieren, sobald das Repo auf GitHub liegt.

## Inhalte ändern

Alles steht in `index.html`:

| Was | Wo |
|---|---|
| Name / Untertitel | `<header id="header">` → `<h1>` und `<p>` |
| About-Text | `<article id="about">` |
| Lebenslauf | `<article id="cv">` – je Eintrag ein `<dt>` (Datum) + `<dd>` (Text) |
| Publikationen | `<article id="publications">` – je Eintrag ein `<li>` mit Titel-Link (DOI), `.authors`, `.venue` |
| Projekte | `<article id="projects">` – je Projekt eine `<section class="card">` |
| Kontakt | `<article id="contact">` |
| Impressum / Datenschutz | `<article id="legal">` |
| „Last updated“ | `<footer id="footer">` |

Neue Sektion: `<article id="xyz" aria-labelledby="xyz-title" hidden>` mit `<h2 class="major" id="xyz-title">`
in `<main>` anlegen und `<li><a href="#xyz">…</a></li>` in die Navigation – das Skript erkennt alle
`<article>`-Elemente automatisch.

Profilbild tauschen: quadratisches JPG als `images/profile.jpg` ablegen (≥ 400×400 px).

## Veröffentlichen: GitHub Pages + eigene Domain

Kosten: nur die Domain (ca. 10–15 €/Jahr für `.com`). Hosting und HTTPS sind bei GitHub Pages kostenlos.

### 1. Domain registrieren (einmalig, selbst erledigen)

`aimanelasad.com` war am 23.08.2026 laut Verisign-RDAP **nicht registriert**.
Registrar-Empfehlungen (alle mit kostenlosem WHOIS-Schutz, ohne Upselling):

- **Porkbun** (porkbun.com) – günstig, einfache DNS-Verwaltung
- **INWX** (inwx.de) – deutscher Anbieter, Rechnung auf Deutsch
- **Cloudflare Registrar** – Selbstkostenpreis, setzt ein (kostenloses) Cloudflare-Konto voraus.
  **Wichtig:** bei allen DNS-Einträgen aus Schritt 5 den Proxy-Status auf *DNS only* (graue Wolke)
  stellen, sonst schlägt die DNS-Prüfung von GitHub fehl und *Enforce HTTPS* bleibt ausgegraut.

Beim Kauf **nichts dazubuchen** (kein Hosting, kein E-Mail-Paket, kein SSL – all das ist hier unnötig).

### 2. Domain auf GitHub verifizieren (empfohlen, vor dem Veröffentlichen)

Verhindert, dass jemand anders die Domain an ein GitHub-Pages-Projekt binden kann.

Auf github.com: Profilbild → **Settings** (Kontoeinstellungen, *nicht* die Repository-Einstellungen)
→ *Code, planning, and automation* → **Pages** → *Add a domain* → `aimanelasad.com`.
GitHub zeigt einen TXT-Eintrag an; beim Registrar anlegen:
Typ `TXT`, Host `_github-pages-challenge-<DEIN-GITHUB-NAME>`, Wert = angezeigter Code. Danach *Verify*.

### 3. Repository anlegen und hochladen

Auf github.com: *New repository* → Name `aimanelasad.com`, **public**, **ohne** README/.gitignore.

Das lokale Repository ist bereits initialisiert (Branch `main`, alles committet). Es fehlt nur noch:

```bash
cd C:/aimanelasad-website
git remote add origin https://github.com/<DEIN-GITHUB-NAME>/aimanelasad.com.git
git push -u origin main
```

### 4. GitHub Pages einschalten

Repository → **Settings → Pages** → *Build and deployment* → Source: **Deploy from a branch**,
Branch: `main`, Ordner: `/ (root)` → Save.

Weil die Datei `CNAME` (`www.aimanelasad.com`) bereits im Repo liegt, übernimmt GitHub die Domain
sofort als *Custom domain* – das ist die von GitHub empfohlene Reihenfolge (erst Domain auf GitHub,
dann DNS). Die Adresse `https://<DEIN-GITHUB-NAME>.github.io/aimanelasad.com/` leitet deshalb direkt
auf `https://www.aimanelasad.com` um und funktioniert erst, wenn die DNS-Einträge aus Schritt 5 gesetzt sind.

### 5. DNS beim Registrar eintragen

Eventuell vorhandene Parking-Einträge des Registrars (A/CNAME auf `@` oder `www`) vorher löschen, dann:

| Typ | Name/Host | Wert |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `<DEIN-GITHUB-NAME>.github.io` |

(Quelle: GitHub Docs „Managing a custom domain for your GitHub Pages site“, Stand 08/2026.)

### 6. HTTPS aktivieren

Repository → Settings → Pages: Unter *Custom domain* steht `www.aimanelasad.com` (aus der CNAME-Datei).
GitHub prüft die DNS-Einträge (meist wenige Minuten, bis zu 24 h). Sobald der Haken grün ist **und**
die Checkbox *Enforce HTTPS* nicht mehr ausgegraut ist (GitHub stellt zuerst das Zertifikat aus, das
kann ebenfalls bis zu 24 h dauern): **Enforce HTTPS** aktivieren.
`aimanelasad.com` (ohne www) leitet GitHub dann automatisch auf `www.aimanelasad.com` um.

### 7. Später etwas ändern

`index.html` bearbeiten, dann:

```bash
cd C:/aimanelasad-website && git add -A && git commit -m "Update" && git push
```

Nach ca. 1 Minute ist die Änderung online.

## Rechtliches

- **Impressum:** § 5 DDG gilt nur für geschäftsmäßige Angebote; für eine private, nicht-kommerzielle
  Seite greift aber § 18 Abs. 1 MStV (Name + Anschrift). Steht in `<article id="legal">`.
- **Datenschutz:** Die Seite setzt keine Cookies, kein Tracking, keine Inhalte von Drittservern;
  die Schrift wird selbst gehostet (kein Google-Fonts-Aufruf, vgl. LG München I, 20.01.2022, 3 O 17493/20).
  Die Datenschutzhinweise (Hosting bei GitHub, Server-Logs) stehen ebenfalls in `<article id="legal">`.

## Lizenz / Credits

Layout-Idee: „Dimension“ von [HTML5 UP](https://html5up.net) (CC BY 3.0) – hier ohne deren Code
neu umgesetzt. Schrift: [Source Sans 3](https://github.com/adobe-fonts/source-sans) (SIL OFL 1.1),
selbst gehostet in `assets/fonts/`.
