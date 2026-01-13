/**
 * i18n Translation Engine
 * Provides client-side internationalization for static websites
 */

(function(window) {
  'use strict';

  const I18N = {
    currentLang: null,
    currentPage: null,
    translations: {},
    defaultLang: 'zh',

    // Get current language from localStorage or browser setting
    getCurrentLang: function() {
      if (this.currentLang) return this.currentLang;

      const stored = localStorage.getItem('lang');
      if (stored && (stored === 'zh' || stored === 'en')) {
        this.currentLang = stored;
        return this.currentLang;
      }

      // Detect from browser
      const browserLang = (navigator.language || 'zh').toLowerCase();
      this.currentLang = browserLang.startsWith('zh') ? 'zh' : 'en';
      return this.currentLang;
    },

    // Set current language
    setLang: function(lang) {
      if (lang !== 'zh' && lang !== 'en') return;
      this.currentLang = lang;
      localStorage.setItem('lang', lang);
      document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
    },

    // Get nested object value by dot notation path
    getValue: function(obj, path) {
      if (!path) return obj;
      const keys = path.split('.');
      let result = obj;
      for (let i = 0; i < keys.length; i++) {
        if (result && typeof result === 'object') {
          const key = keys[i];
          if (Array.isArray(result) && !isNaN(key)) {
            result = result[parseInt(key)];
          } else if (key in result) {
            result = result[key];
          } else {
            return null;
          }
        } else {
          return null;
        }
      }
      return result;
    },

    // Load translation file
    loadTranslation: function(name) {
      const lang = this.getCurrentLang();
      // 使用随机数强制刷新缓存，避免浏览器/代理缓存导致翻译切换失败
      const random = Math.random().toString(36).substring(7);
      const url = 'content/' + name + '.' + lang + '.json?_=' + random;
      console.log('Loading translation:', url, 'for lang:', lang);
      return fetch(url, {
        cache: 'no-store'  // 禁用缓存
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to load: ' + name + '.' + lang + '.json');
          return res.json();
        })
        .catch(err => {
          console.error('Translation load failed:', name, err);
          return {};
        });
    },

    // Load multiple translation files
    loadTranslations: function(names) {
      const promises = names.map(name => this.loadTranslation(name));
      return Promise.all(promises).then(results => {
        names.forEach((name, i) => {
          this.translations[name] = results[i] || {};
          console.log('Loaded translation for:', name, 'keys:', Object.keys(this.translations[name]));
        });
        console.log('All translations loaded, namespaces:', Object.keys(this.translations));
        return this.translations;
      });
    },

    // Translate a single key - prioritize current page namespace
    t: function(key, namespace) {
      // If namespace is specified, try that namespace first, then fall back to others
      if (namespace) {
        // First try the specified namespace
        let result = this.getValue(this.translations[namespace], key);
        if (result !== null && result !== undefined) {
          return result;
        }

        // Fallback: if not found in specified namespace, try current page namespace
        if (this.currentPage && this.currentPage !== namespace) {
          result = this.getValue(this.translations[this.currentPage], key);
          if (result !== null && result !== undefined) {
            console.log('t(): Found in fallback namespace', this.currentPage, 'for key:', key);
            return result;
          }
        }

        // Fallback: try other page namespaces
        const pageNamespaces = ['solutions', 'services', 'index', 'introduction', 'contact'];
        for (const ns of pageNamespaces) {
          if (ns !== namespace && this.translations[ns]) {
            result = this.getValue(this.translations[ns], key);
            if (result !== null && result !== undefined) {
              console.log('t(): Found in fallback namespace', ns, 'for key:', key);
              return result;
            }
          }
        }

        // Fallback: try header/footer
        for (const ns of ['header', 'footer']) {
          result = this.getValue(this.translations[ns], key);
          if (result !== null && result !== undefined) {
            console.log('t(): Found in fallback namespace', ns, 'for key:', key);
            return result;
          }
        }

        console.warn('t(): Key not found in any namespace:', key, 'specified namespace:', namespace);
        return key;
      }

      // Debug: log current page and available namespaces
      console.log('t() called for key:', key, 'currentPage:', this.currentPage, 'namespaces:', Object.keys(this.translations));

      // First, search in current page namespace (priority)
      if (this.currentPage && this.translations[this.currentPage]) {
        const value = this.getValue(this.translations[this.currentPage], key);
        console.log('  Checked', this.currentPage, 'namespace:', value);
        if (value !== null && value !== undefined) {
          return value;
        }
      }

      // Then search in page-specific namespaces (services, solutions, etc.)
      const pageNamespaces = ['services', 'solutions', 'index', 'introduction', 'contact'];
      for (const ns of pageNamespaces) {
        if (this.translations[ns]) {
          const value = this.getValue(this.translations[ns], key);
          console.log('  Checked', ns, 'namespace:', value);
          if (value !== null && value !== undefined) {
            return value;
          }
        }
      }

      // Then search in header/footer
      for (const ns of ['header', 'footer']) {
        if (this.translations[ns]) {
          const value = this.getValue(this.translations[ns], key);
          console.log('  Checked', ns, 'namespace:', value);
          if (value !== null && value !== undefined) {
            return value;
          }
        }
      }

      console.warn('t(): Key not found in any namespace:', key);
      return key;
    },

    // Apply translations to DOM elements
    applyTranslations: function(root) {
      root = root || document;
      const rootId = root === document ? 'FULL_DOCUMENT' : (root.className || root.id || root.tagName);
      console.log('=== applyTranslations called === Root:', rootId);
      console.log('Current language:', this.getCurrentLang(), 'Current page:', this.currentPage);
      console.log('Available namespaces:', Object.keys(this.translations));

      let count = 0;

      // Translate elements with data-i18n attribute
      const elements = root.querySelectorAll('[data-i18n]');
      console.log('Root [' + rootId + '] Found', elements.length, 'elements with data-i18n');

      elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        const namespace = el.getAttribute('data-i18n-ns');
        const value = this.t(key, namespace);
        if (value !== key) {
          el.textContent = value;
          count++;
        }
      });

      // Translate elements with data-i18n-html attribute
      root.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        const namespace = el.getAttribute('data-i18n-ns');
        const value = this.t(key, namespace);
        if (value !== key) {
          el.innerHTML = value;
          count++;
        }
      });

      // Translate attributes
      const attrAttrs = ['data-i18n-attr', 'data-i18n-placeholder', 'data-i18n-title', 'data-i18n-alt'];
      attrAttrs.forEach(attr => {
        const attrName = attr.replace('data-i18n-', '');
        root.querySelectorAll('[' + attr + ']').forEach(el => {
          const key = el.getAttribute(attr);
          const namespace = el.getAttribute('data-i18n-ns');
          const value = this.t(key, namespace);
          if (value !== key) {
            el.setAttribute(attrName, value);
            count++;
          }
        });
      });

      // Update language switcher active state
      root.querySelectorAll('.lang-switcher [data-lang]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === this.getCurrentLang());
      });

      console.log('Root [' + rootId + '] Applied', count, 'translations');
    },

    // Translate entire page
    translatePage: async function() {
      const pageName = this.getPageName();
      this.currentPage = pageName;
      console.log('=== translatePage called ===');
      console.log('Current page:', pageName);
      console.log('Loading translation files: header, footer,' + pageName);
      await this.loadTranslations(['header', 'footer', pageName]);
      this.applyTranslations();
      this.updateMetaTags(pageName);
    },

    // Get current page name
    getPageName: function() {
      const path = window.location.pathname;
      console.log('=== getPageName Debug ===');
      console.log('window.location.pathname:', path);

      // Handle URLs with .html extension (e.g., /services.html or file:///E:/path/services.html)
      let match = path.match(/([^\:\\\/]+)\.html/i);
      if (match) {
        const page = match[1].toLowerCase();
        const pageMap = {
          'index': 'index',
          'services': 'services',
          'solutions': 'solutions',
          'introduction': 'introduction',
          'contact': 'contact'
        };
        const result = pageMap[page] || 'index';
        console.log('Page name detected (with .html):', page, '-> mapped to:', result);
        return result;
      }

      // Handle clean URLs without .html extension (e.g., /services, /solutions)
      // Remove trailing slash and get the last segment
      let cleanPath = path.replace(/\/$/, ''); // Remove trailing slash
      if (cleanPath === '' || cleanPath === '/') {
        console.log('Root path detected, using: index');
        return 'index';
      }

      // Get the last segment of the path
      const segments = cleanPath.split('/');
      let page = segments[segments.length - 1];

      // Map common page names
      const pageMap = {
        'index': 'index',
        'services': 'services',
        'solutions': 'solutions',
        'introduction': 'introduction',
        'contact': 'contact'
      };
      const result = pageMap[page] || 'index';
      console.log('Page name detected (clean URL):', page, '-> mapped to:', result);
      return result;
    },

    // Update meta tags
    updateMetaTags: function(pageName) {
      const pageData = this.translations[pageName];
      if (pageData && pageData.meta) {
        if (pageData.meta.title) {
          document.title = pageData.meta.title;
        }
        if (pageData.meta.description) {
          let metaDesc = document.querySelector('meta[name="description"]');
          if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = 'description';
            document.head.appendChild(metaDesc);
          }
          metaDesc.content = pageData.meta.description;
        }
      }
    }
  };

  // Global language switch function
  window.switchLang = async function(lang) {
    try {
      console.log('=== switchLang called for:', lang, '===');
      I18N.setLang(lang);
      await I18N.translatePage();

      // translatePage() 已经调用了 applyTranslations() 翻译整个 document
      // 但由于 header/footer 是异步加载的，需要确保它们也被翻译
      const header = document.getElementById('site-header');
      const footer = document.getElementById('site-footer');
      const stickyHeader = document.querySelector('.sticky-header__content');

      console.log('Re-translating header/footer/sticky (should add to document translations)');

      if (header) I18N.applyTranslations(header);
      if (footer) I18N.applyTranslations(footer);
      if (stickyHeader) I18N.applyTranslations(stickyHeader);

      console.log('Language switched to:', lang, 'translations loaded for:', Object.keys(I18N.translations));
    } catch (err) {
      console.error('Language switch failed:', err);
    }
  };

  // Expose I18N globally
  window.I18N = I18N;

  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      I18N.translatePage();
    });
  } else {
    I18N.translatePage();
  }

  // Listen for header/footer loaded events
  window.addEventListener('headerLoaded', function() {
    const header = document.getElementById('site-header');
    const stickyHeader = document.querySelector('.sticky-header__content');
    if (header) I18N.applyTranslations(header);
    if (stickyHeader) I18N.applyTranslations(stickyHeader);
  });

  window.addEventListener('footerLoaded', function() {
    I18N.applyTranslations(document.getElementById('site-footer'));
  });

})(window);
