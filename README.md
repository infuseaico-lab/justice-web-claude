# Justice Energy Co. — website

SEO-ready website for Justice Energy Co., which offers energy-efficiency upgrades and retrofits in Southern California.
It works on phones, tablets and desktops. It is built for **cPanel / shared hosting with PHP**: the pages are static HTML, and a small PHP admin manages photos and consultation requests. The admin needs no database.

## Pages

| Group | Pages |
| --- | --- |
| Core | Home `/`, About `/about/`, Services `/services/`, Programs `/programs/`, Gallery `/gallery/`, Contact / Request a Consultation `/contact/` |
| Services | `/services/water-heating/`, `/services/hvac-heat-pumps/`, `/services/water-conservation/`, `/services/turf-replacement/`, `/services/led-lighting-retrofits/` |
| Supporting | Privacy Policy `/privacy-policy/` |
| Utility | Form confirmation `/thank-you/` (noindex), `404.html` |
| Private | Website admin `/admin/` (noindex, password protected) |

## Website admin (`/admin/`)

Sign in at `https://justiceenergyco.com/admin/`. It has four sections:

- **Gallery**: upload photos (several at once), add captions, a description for screen readers and Google, and a service category. You can also reorder and delete photos. Changes appear on `/gallery/` immediately. Visitors can filter by category and open photos full size.
- **Page photos**: replace the photo in any of the 11 spots on the site (home page, each service, programs, about, contact banners, privacy). Uploads are cropped to 4:3 and resized automatically. **Restore original** brings the default back.
- **Consultation requests**: every request sent through the contact form, newest first, with click-to-email and click-to-call.
- **Account**: change the admin password.

Uploads accept JPG, PNG or WebP up to 15 MB, at least 1200 px wide. Photos are re-encoded on upload, which removes hidden data such as GPS location and turns phone photos upright.

### First-time setup

1. Visit `/admin/`. It asks for a **setup code**.
2. In cPanel, open **File Manager**, go to `public_html/admin/data/` and open `setup-code.txt`.
3. Enter the code, then choose a username and a password of at least 10 characters. The code is deleted once it has been used.

Forgot the password? In File Manager, delete `public_html/admin/data/auth.json` and visit `/admin/` again. A new setup code is generated.

### Security

- Passwords are stored only as hashes (`password_hash`). Sessions expire after 2 hours of inactivity.
- After 5 wrong passwords, sign-in is locked for 15 minutes for that connection.
- Every admin form carries a CSRF token. The admin cannot be framed and is never indexed.
- `admin/data/` (logins, requests) and the helper files are blocked from the web by `.htaccess`.
- `uploads/` cannot run scripts; only processed images are stored there.

## Consultation form

The contact page form posts to `/contact.php`, which:

- validates the fields and rejects spam (a honeypot field, plus a limit of 8 requests per hour per connection)
- **emails** the request to `info@justiceenergyco.com` (`form.to` in `src/site.config.js`), with Reply-To set to the visitor
- **saves** a copy that appears in the admin under *Consultation requests*, so nothing is lost if an email bounces
- sends the visitor to `/thank-you/`

Email is sent with PHP `mail()` from `no-reply@justiceenergyco.com`. To keep it out of spam, open **cPanel → Email Deliverability** and make sure SPF and DKIM show as valid for the domain.

## Deployment to cPanel

1. Build the site: `node build.js` (this writes `dist/`).
2. In cPanel **File Manager**, upload the *contents* of `dist/` into `public_html/` (zip, upload, extract). Hidden files such as `.htaccess` are included.
3. Check the PHP version is 7.4 or newer with the GD extension (cPanel → **Select PHP Version** / **MultiPHP Manager**). This is standard on most hosts.
4. Recommended: in **MultiPHP INI Editor**, set `upload_max_filesize = 16M` and `post_max_size = 64M` so large phone photos and multi-photo uploads work.
5. Visit `/admin/` and complete the first-time setup.

**When redeploying**, upload the new `dist/` over the old files. `dist/` never contains `uploads/` or `admin/data/`, so uploaded photos, the gallery, requests and the login are kept. Do not delete those two folders on the server. Download `public_html/uploads/` now and then as a backup.

### How replaceable photos work

Pages show photos from `/img/slot/<name>.jpg`. `.htaccess` serves the admin-uploaded version from `uploads/slots/` when one exists, and the default from `assets/slots/` otherwise. This needs Apache `mod_rewrite`, which cPanel hosts have enabled.

## Project layout

```
build.js                  Static site builder (Node, no dependencies) → dist/
src/site.config.js        Business details, form recipient, analytics ID
src/content/              Service, program and photo-slot content
src/assets/               Styles, scripts, drawings, default slot photos (slots/), social share images
src/php/                  Admin (admin/index.php, admin/lib.php) and the form handler (contact.php)
src/static/               Files copied to the site root (.htaccess, favicon.ico)
scripts/illustrations.js  Draws the SVG illustrations
scripts/raster.js         Renders social cards, app icons and the default slot photos (Playwright)
scripts/fetch-photos.js   Downloads chosen Pexels stock photos into src/assets/photos (needs network access)
scripts/dev-router.php    Local preview with PHP that mirrors the .htaccess rules
scripts/demo.js           Builds a static, PHP-free preview copy for sharing
```

## Build and preview locally

```bash
node build.js                                              # writes dist/
php -S localhost:8080 -t dist scripts/dev-router.php       # full preview, admin included
```

When testing locally, the admin creates `dist/uploads/` and `dist/admin/data/`. These are git-ignored, so do not upload them.

## Before launch: checklist

1. **Business details**: phone, email, office address and hours are confirmed in `src/site.config.js`. Still to add: the service area (counties or cities), license number and social profile links.
2. **Programs**: confirm each program's official name, description, participation and eligibility wording in `src/content/programs.js`, and set `approved: true`. Add approved logos if supplied.
3. **Privacy policy**: the text is a general draft and needs the client's approval or legal review.
4. **Photos**: upload real project photos to the gallery and replace the default page images in the admin. Until then the pages show drawings.
5. **Redirects**: map old justiceenergyco.com URLs to the new ones in `src/static/.htaccess`.
6. **Email**: send a test request from the contact page and confirm it arrives at info@justiceenergyco.com.
7. **Search Console**: verify the domain and submit `https://justiceenergyco.com/sitemap.xml`.

## SEO features

- A unique title, meta description and canonical URL on every page
- Open Graph and Twitter cards with a share image for each page
- JSON-LD schema: `HomeAndConstructionBusiness` (with the verified address, phone and hours), `WebSite`, `Service`, `FAQPage`, `BreadcrumbList`, `ItemList`, `CollectionPage`, `AboutPage` and `ContactPage`
- `sitemap.xml`, `robots.txt`, clean URLs, one H1 per page and a logical heading order
- Alt text on every image (editable for gallery photos), fixed image dimensions, lazy loading and a preloaded hero image

Search rankings and specific speed scores are not guaranteed.

## Images

The default page images are original drawings (`scripts/illustrations.js`), rendered to JPG. They explain each service and are not presented as client projects. Replace them with real photos in the admin.
