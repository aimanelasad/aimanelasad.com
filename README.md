# aimanelasad.com

Persönliche Website von Aiman El Asad. Statische Seite – eine `index.html`, ein Stylesheet,
ein kleines Skript. Keine Build-Tools, keine Abhängigkeiten, keine Datenbank.

```
index.html            Inhalt aller Sektionen (About, CV, Publications, Projects, Contact)
assets/css/main.css   Design (angelehnt an HTML5 UP „Dimension“, komplett selbst geschrieben)
assets/js/main.js     Ein-/Ausblenden der Sektionen, Hash-Routing (#cv, #publications, …)
images/profile.jpg    Rundes Profilbild (480×480)
favicon.svg           Browser-Tab-Icon („AE“)
404.html              Fehlerseite
CNAME                 Domain für GitHub Pages (www.aimanelasad.com)
robots.txt, sitemap.xml
```

## Lokal ansehen

```bash
python -m http.server 8765 --directory C:/aimanelasad-website
```

Dann <http://127.0.0.1:8765/> öffnen. Einzelne Sektionen sind direkt verlinkbar,
z. B. <http://127.0.0.1:8765/#publications>.

## Inhalte ändern

Alles steht in `index.html`:

| Was | Wo |
|---|---|
| Name / Untertitel | `<header id="header">` → `<h1>` und `<p>` |
| About-Text | `<article id="about">` |
| Lebenslauf | `<article id="cv">` – je Eintrag ein `<dt>` (Datum) + `<dd>` (Text) |
| Publikationen | `<article id="publications">` – je Eintrag ein `<li>` mit Titel-Link (DOI), `.authors`, `.venue` |
| Projekte | `<article id="projects">` – je Projekt eine `<section class="card">` |
| Kontakt | `<article id="contact">` – **Platzhalter für LinkedIn/GitHub/ORCID/Scholar ersetzen oder Zeile löschen** |
| „Last updated“ | `<footer id="footer">` |

Neue Sektion: `<article id="xyz" hidden>` in `<main>` anlegen und `<li><a href="#xyz">…</a></li>`
in die Navigation – mehr ist nicht nötig, das Skript erkennt alle `<article>`-Elemente automatisch.

Profilbild tauschen: quadratisches JPG als `images/profile.jpg` ablegen (≥ 400×400 px).

## Veröffentlichen: GitHub Pages + eigene Domain

Kosten: nur die Domain (ca. 10–15 €/Jahr für `.com`). Hosting und HTTPS sind bei GitHub Pages kostenlos.

### 1. Domain registrieren (einmalig, selbst erledigen)

`aimanelasad.com` war am 23.08.2026 laut Verisign-RDAP **nicht registriert**.
Registrar-Empfehlungen (alle mit kostenlosem WHOIS-Schutz, ohne Upselling):

- **Porkbun** (porkbun.com) – günstig, einfache DNS-Verwaltung
- **Cloudflare Registrar** – Selbstkostenpreis, setzt ein (kostenloses) Cloudflare-Konto voraus
- **INWX** (inwx.de) – deutscher Anbieter, Rechnung auf Deutsch

Beim Kauf **nichts dazubuchen** (kein Hosting, kein E-Mail-Paket, kein SSL – all das ist hier unnötig).

### 2. Repository auf GitHub anlegen und hochladen

```bash
cd C:/aimanelasad-website
git init
git add .
git commit -m "Initial website"
git branch -M main
git remote add origin https://github.com/<DEIN-GITHUB-NAME>/aimanelasad.com.git
git push -u origin main
```

(Repository vorher auf github.com anlegen: *New repository* → Name `aimanelasad.com`, public, **ohne** README.)

### 3. GitHub Pages einschalten

Repository → **Settings → Pages** → *Build and deployment* → Source: **Deploy from a branch**,
Branch: `main`, Ordner: `/ (root)` → Save. Nach ca. 1 Minute ist die Seite unter
`https://<DEIN-GITHUB-NAME>.github.io/aimanelasad.com/` erreichbar.

### 4. Domain verbinden

**a) Beim Registrar** folgende DNS-Einträge anlegen (DNS-Verwaltung der Domain):

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

Eventuell vorhandene Parking-Einträge des Registrars (A/CNAME auf `@` oder `www`) vorher löschen.

**b) Auf GitHub:** Settings → Pages → *Custom domain*: `www.aimanelasad.com` → Save.
GitHub prüft die DNS-Einträge (kann bis zu 24 h dauern, meist wenige Minuten). Sobald der Haken
grün ist: **Enforce HTTPS** aktivieren. Die Datei `CNAME` im Repo enthält bereits `www.aimanelasad.com`;
`aimanelasad.com` (ohne www) leitet GitHub dann automatisch auf `www` um.

Optional, empfohlen: GitHub → Settings → Pages → *Verified domains* → `aimanelasad.com` hinzufügen
(TXT-Eintrag beim Registrar), damit niemand anders die Domain an ein GitHub-Pages-Projekt binden kann.

### 5. Später etwas ändern

`index.html` bearbeiten, dann:

```bash
cd C:/aimanelasad-website && git add -A && git commit -m "Update" && git push
```

Nach ca. 1 Minute ist die Änderung online.

## Lizenz / Credits

Layout-Idee: „Dimension“ von [HTML5 UP](https://html5up.net) (CC BY 3.0) – hier ohne deren Code
neu umgesetzt. Schrift: [Source Sans 3](https://fonts.google.com/specimen/Source+Sans+3) (OFL) über Google Fonts.
