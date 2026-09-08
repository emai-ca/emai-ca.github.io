# EMAI website

Static Jekyll site for **Embodying AI: Music Making Beyond the Prompt** (EMAI), a
four-year SSHRC research-creation project at Concordia University and Université
de Montréal.

Five content pages plus a home page:

| Page | File | URL |
| --- | --- | --- |
| Home | `index.md` | `/` |
| About | `about.md` | `/about/` |
| Call | `call.md` | `/call/` |
| People | `people.md` | `/people/` |
| Publications | `publications.md` | `/publications/` |
| Works | `works.md` | `/works/` |

All pages share `_layouts/default.html`. Styles live in `assets/css/style.css`
(minified base) and `assets/css/overrides.css` (readable additions — put new CSS
here). Interactions are in `assets/js/site.js`. No build step, no dependencies
beyond Jekyll itself.

## Publishing to GitHub Pages

1. Create a repository on GitHub and push this folder to the default branch.
2. **Settings → Pages → Build and deployment → Deploy from a branch**, and pick
   that branch with `/ (root)` as the source.
3. Wait for the first build (~1 min), then open the URL GitHub shows you.

### Set `baseurl` before you publish

This is the one setting that breaks a deploy if it is wrong. In `_config.yml`:

- **Project page** — `https://username.github.io/REPO-NAME` — set
  `baseurl: "/REPO-NAME"` (matching the repo name exactly) and
  `url: "https://username.github.io"`. Without this every link and the
  stylesheet will 404 and the site renders as unstyled text.
- **Custom domain** (e.g. `emai.ca`) — leave `baseurl: ""`, set
  `url: "https://emai.ca"`, add a `CNAME` file containing `emai.ca`, and point
  the domain's DNS at GitHub Pages.
- **User/org root page** (repo named `username.github.io`) — leave
  `baseurl: ""` and set `url` to that address.

## Local preview

```sh
bundle install     # once
bundle exec jekyll serve --livereload
```

Then open `http://localhost:4000`.

## Content status

The About and Call pages are drawn directly from the official Call for
Applications and should be accurate.

**Verify before publishing:** the entries on Publications and Works, and the
research-focus lines on People, were assembled from public sources rather than
supplied by the team. Check every title, author list, DOI, year, and outbound
link with the investigators before this goes live.

Do not publish protected SSHRC application material or private contact details.
Only the addresses already public in the call (`info@emai.ca` and the
supervisors' institutional addresses) appear on the site.
