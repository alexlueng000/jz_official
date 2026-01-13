# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static website for **深圳市深业晋展物料供应有限公司** (Shenzhen Shenye Jinzhan Materials Supply Co., Ltd), a Chinese supply chain and procurement service company.

**Tech Stack:**
- Pure HTML/CSS/JavaScript (no build tools, no package managers)
- jQuery 3.6.0
- Bootstrap 5
- Various third-party libraries (Swiper, Owl Carousel, Magnific Popup, etc.)

**Company Focus:**
- Research procurement one-stop supply chain solutions
- Import/export agency services
- Supply chain financing
- Tax consulting for import/export
- Integrated logistics services
- Offshore outsourcing services

## Architecture

### Modular Header/Footer System

The site uses a **client-side include pattern** for shared components:

- `header.html` - Main navigation and header (loaded via fetch into `#site-header`)
- `footer.html` - Site footer (loaded via fetch into `#site-footer`)

**Key pages using dynamic includes:**
- index.html
- contact.html
- introduction.html
- services.html
- solutions.html

**Loading mechanism** (at the bottom of each HTML page):
```javascript
fetch('header.html')
  .then(res => res.text())
  .then(html => {
    const siteHeader = document.getElementById('site-header');
    siteHeader.innerHTML = html;
    // Copies menu to sticky header
    const stickyContent = document.querySelector('.sticky-header__content');
    const mainMenu = siteHeader.querySelector('nav.main-menu');
    if (stickyContent && mainMenu) {
      stickyContent.innerHTML = mainMenu.outerHTML;
    }
  });

fetch('footer.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('site-footer').innerHTML = html;
  });
```

**Legacy pages** have inline header/footer (not using includes):
- about.html, news.html, team.html, project.html, faq.html, industry-specific pages

### Directory Structure

```
jz_official/
├── *.html              # Page files (25+ pages)
├── header.html         # Shared header component
├── footer.html         # Shared footer component
└── static/
    ├── css/
    │   ├── kontin.css              # Main template styles
    │   ├── kontin-responsive.css   # Responsive styles
    │   ├── global.css              # Custom overrides (ACTIVE FILE)
    │   └── [3rd-party libs].css    # Bootstrap, Swiper, Owl, etc.
    ├── js/
    │   ├── kontin.js               # Main template scripts
    │   └── [3rd-party libs].js     # jQuery, plugins
    ├── image/          # Images (banners, logos, photos)
    ├── picture/        # Additional images
    └── font/           # Font files
```

### CSS Architecture

1. **kontin.css** - Template base styles (don't edit unless necessary)
2. **kontin-responsive.css** - Template responsive breakpoints
3. **global.css** - **Primary customization file** for all site-specific overrides

When styling:
- Add custom styles to `global.css`
- Use CSS custom properties: `var(--thm-base)` (yellow), `var(--thm-primary)` (blue)
- Template uses BEM-like naming: `.component-name__element--modifier`

### JavaScript Architecture

- jQuery-based with vanilla ES6 fetch for includes
- Main logic in `static/js/kontin.js`
- Third-party libs loaded before kontin.js
- Sticky header behavior requires header content to be loaded first

## Key Pages

| Page | Purpose |
|------|---------|
| index.html | Homepage with hero slider, services, company highlights |
| services.html | Service center (5 core services) |
| solutions.html | Industry solutions (education, research, medical) |
| introduction.html | Company introduction/about page |
| contact.html | Contact information and form |
| about.html | Legacy about page (being phased out) |
| news.html, news-details.html | News section |
| project.html, project-details.html | Project showcase |

## Common Tasks

### Adding a New Page

1. Create new HTML file following existing page structure
2. Include `#site-header` and `#site-footer` divs
3. Add fetch scripts before closing `</body>` tag
4. Link CSS files in `<head>` (same as other pages)
5. Add navigation link in `header.html`

```html
<div id="site-header"></div>
<!-- page content -->
<div id="site-footer"></div>

<script>
fetch('header.html').then(res => res.text()).then(html => {
  document.getElementById('site-header').innerHTML = html;
  // ... sticky header logic
});
fetch('footer.html').then(res => res.text()).then(html => {
  document.getElementById('site-footer').innerHTML = html;
});
</script>
```

### Modifying Navigation

Edit `header.html` - changes will apply to all pages using dynamic includes. Menu structure:
```html
<ul class="main-menu__list">
  <li><a href="index.html">首页</a></li>
  <li><a href="services.html">服务中心</a></li>
  <li><a href="solutions.html">行业解决方案</a></li>
  <li class="dropdown">
    <a href="#">关于我们</a>
    <ul>
      <li><a href="introduction.html">公司简介</a></li>
      <li><a href="contact.html">联系我们</a></li>
    </ul>
  </li>
</ul>
```

### Customizing Styles

Edit `static/css/global.css` for all custom styles. Key areas:
- `.main-menu-two` - Navigation styling
- `.about-page` - Company introduction layout
- `.company-special` - Company features cards
- `.partner-logo` - Partner/customer logo grid
- Responsive breakpoints at bottom of file

### Testing Changes

Since there's no build process:
1. Open HTML files directly in browser or
2. Use a local server (e.g., `python -m http.server`, VS Code Live Server)
3. The fetch() calls for header/footer require a server (file:// protocol has CORS restrictions)

## Important Notes

- **No build tools** - Direct file editing, no npm/yarn
- **Dynamic includes require HTTP server** - Cannot test with file:// protocol due to CORS
- **Two footer patterns** - New pages use `footer.html` include, legacy pages have inline footer
- **Images** are in `static/image/` directory
- **Chinese language** - Site is in Simplified Chinese
- **Contact info**: Phone 0755-86533396 / 0755-86933396, Email: syjz@szsyjz.com
- **Address**: 深圳市罗湖区深南东路鸿昌广场1504-05

## Third-Party Libraries

Key libraries used (all in `static/`):
- jQuery 3.6.0
- Bootstrap 5 (bundle, select)
- Swiper (slider)
- Owl Carousel
- Magnific Popup (lightbox)
- WOW.js (animations)
- Isotope (filtering)
- jQuery UI + plugins
- Google Maps API
