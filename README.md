# Mohammad Ramjan Hossain: Academic Portfolio

[![Live Site](https://img.shields.io/badge/Live-foyeasy.github.io-1546D9?style=flat-square&logo=github)](https://foyeasy.github.io)
[![GitHub Pages](https://img.shields.io/badge/Hosted-GitHub_Pages-14181F?style=flat-square)](https://pages.github.com)

Personal academic site: research, publications and engineering projects.
Built with **Jekyll** (builds automatically on GitHub Pages). **To add content, edit a file in `_data/` and commit. Nothing else.**

🔗 **https://foyeasy.github.io**

---

## How to update the site

| I want to…                         | Edit this file                | What happens automatically                                  |
|------------------------------------|-------------------------------|-------------------------------------------------------------|
| Add a paper / preprint / talk      | `_data/publications.yml`      | Latest-publication card, counters, filters and years update |
| Add a news item                    | `_data/news.yml`              | Newest items show on the home page                          |
| Add a carousel slide               | `_data/projects.yml` → `carousel` | Slide, dot and caption appear                           |
| Add a project / job / volunteering | `_data/projects.yml`          | Work page updates                                           |
| Add research experience / interest | `_data/research.yml`          | Research page updates                                       |
| Add a course / training / degree   | `_data/background.yml`        | Background page updates                                     |
| Change bio, contact, links, status | `_data/profile.yml`           | Hero, footer, contact page and banner update                |
| Add or rename a menu page          | `_data/navigation.yml`        | Navbar and footer update                                    |
| Turn the "Open to Masters/PhD" banner on/off | `_data/profile.yml` → `open_to_work` | Banner shows or hides                     |

**Example: adding a paper.** Copy any block in `_data/publications.yml`, paste it above or below, edit the fields, commit. Order in the file does not matter; the site sorts by `date`.

```yaml
- id: surname2027short            # unique, used as the BibTeX key
  title: "Full paper title"
  authors: ["Hossain, M. R.", "Co-author, A. B."]   # your name exactly as cite_name in profile.yml
  venue: "Journal name"
  publisher: "Publisher"
  date: 2027-03-01                # YYYY-MM-DD
  type: journal                   # journal | preprint | presentation
  status: published               # published | review
  doi: "10.xxxx/xxxxx"            # "" if none
  url: "https://doi.org/10.xxxx/xxxxx"
  logo: "Wiley"
  logo_sub: "Journal"
  keywords: [keyword one, keyword two]
```

Images: put files in `Assets/…`, then reference the path in the data file. Use `.webp` for the carousel (see *Images* below).

---

## Folder map

```
├── _config.yml            Site settings (form key, CV path, news count)
├── index.html             ┐
├── background.html        │
├── research.html          ├─ Page templates (rarely edited)
├── publications.html      │
├── work.html              │
├── contact.html           ┘
├── _data/                 ★ YOUR CONTENT (see table above)
├── _includes/             Shared pieces: head, navbar, footer, publication card, image pop-up
├── _layouts/default.html  The page frame used by every page
├── Assets/
│   ├── css/main.css       All styling. Colors are defined at the top (section 1)
│   ├── js/                main.js (site-wide) + carousel / gallery / publications / cite / contact
│   ├── Carousel/  Projects/  Research/  Logo/    Images
│   ├── CV_Mohammad_Ramjan_Hossain.pdf
│   └── social-preview.png (1200×630, used when the link is shared)
└── tools/convert_to_webp.py   Image helper (not published)
```

Folders starting with `_` belong to Jekyll. Change `_includes` or `_layouts` only to redesign something; a change there shows on every page.

---

## One-time setup

1. **Contact form:** get a free key at [web3forms.com](https://web3forms.com) and paste it into `web3forms_key` in `_config.yml`.
2. **CV:** save your PDF as `Assets/CV_Mohammad_Ramjan_Hossain.pdf` (or change `cv_file` in `_config.yml`).
3. **Social preview:** create `Assets/social-preview.png` at 1200×630.
4. **Carousel images:** run `pip install pillow` then `python tools/convert_to_webp.py` from the repo root.
5. **GitHub Pages:** Settings → Pages → *Deploy from a branch* → `main` / `(root)`.

---

## Theme

All colors live in **section 1 of `Assets/css/main.css`**. Change a value there and the whole site follows.

| Role           | Light       | Dark        |
|----------------|-------------|-------------|
| Background     | `#EDECE6`   | `#0E1320`   |
| Cards          | `#F6F5F0`   | `#161F33`   |
| Primary (cobalt) | `#1546D9` | `#6C8FF5`   |
| Hover          | `#0F34A8`   | `#8FAAF8`   |
| Accent (sun yellow) | `#F9B318` | `#F9B318` |
| Text           | `#14181F`   | `#EDECE6`   |
| Secondary text | `#4A4F58`   | `#B9BECB`   |

Yellow is used only as a background (badges, banners, buttons with dark text) or as text on cobalt, never as text on beige.
Dark mode follows the visitor's system setting on a first visit, then remembers their choice.

---

## Run it on your computer (optional)

Needs Ruby. Create a `Gemfile` (it is not published):

```ruby
source "https://rubygems.org"
gem "github-pages", group: :jekyll_plugins
gem "webrick"
```

```bash
bundle install
bundle exec jekyll serve      # open http://localhost:4000
```

---

## Images

- Carousel: `.webp`, at most about 1600 px wide. `python tools/convert_to_webp.py` converts `Assets/Carousel`.
- Other folders: `python tools/convert_to_webp.py Assets/Projects Assets/Research`, then change the paths in `projects.yml` / `research.yml` to `.webp`.
- Always write meaningful `alt` text in the data files; screen readers use it.
- Avoid spaces in new file names.

---

## Troubleshooting

| Problem                          | Likely cause                                                                 |
|----------------------------------|------------------------------------------------------------------------------|
| Build fails after an edit        | A YAML mistake: check indentation (spaces, not tabs) and matching quotes     |
| A new paper doesn't show         | Wrong `date` format (use `YYYY-MM-DD`) or the block is indented differently  |
| Carousel images are broken       | The `.webp` files don't exist yet: run the converter                         |
| Contact form says "not set up"   | `web3forms_key` is still the placeholder                                     |
| CV button gives a 404            | The PDF isn't at the path in `cv_file`                                       |
| Page shows the old version       | GitHub Pages takes 1-2 minutes to rebuild; then hard-refresh the browser     |

Check the build status under the repo's **Actions** tab or **Settings → Pages**.

---

## Tech

Jekyll (GitHub Pages) · HTML · CSS variables · vanilla JavaScript · `jekyll-seo-tag` + `jekyll-sitemap` · Google Fonts (Playfair Display, Nunito Sans, DM Mono) · Web3Forms.
