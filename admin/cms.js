/**
 * Simple CMS for managing i18n JSON content files
 * Provides a user-friendly interface for editing Chinese and English content
 */

(function() {
    'use strict';

    // Page configuration
    const pages = {
        index: { title: '首页内容', icon: 'fa-home' },
        services: { title: '服务中心内容', icon: 'fa-concierge-bell' },
        solutions: { title: '行业解决方案内容', icon: 'fa-lightbulb' },
        introduction: { title: '公司简介内容', icon: 'fa-building' },
        contact: { title: '联系我们内容', icon: 'fa-envelope' },
        header: { title: '页头导航内容', icon: 'fa-header' },
        footer: { title: '页脚内容', icon: 'fa-footer' }
    };

    // Current state
    let currentPage = 'index';
    let currentLang = 'zh';
    let contentData = { zh: null, en: null };

    // Initialize
    function init() {
        // Get current page from URL
        const urlParams = new URLSearchParams(window.location.search);
        const pageParam = urlParams.get('page');
        if (pageParam && pages[pageParam]) {
            currentPage = pageParam;
        }

        updateSidebarActive();
        updatePageTitle();
        loadContent();
    }

    // Update active state in sidebar
    function updateSidebarActive() {
        document.querySelectorAll('.admin-sidebar__nav a').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === currentPage) {
                link.classList.add('active');
            }
        });
    }

    // Update page title
    function updatePageTitle() {
        document.getElementById('pageTitle').textContent = pages[currentPage].title;
        document.getElementById('filename-zh').textContent = currentPage + '.zh.json';
        document.getElementById('filename-en').textContent = currentPage + '.en.json';
    }

    // Load content files
    async function loadContent() {
        try {
            // Load Chinese content
            const zhRes = await fetch('../content/' + currentPage + '.zh.json?t=' + Date.now());
            if (zhRes.ok) {
                contentData.zh = await zhRes.json();
                document.getElementById('json-zh').value = JSON.stringify(contentData.zh, null, 2);
                document.getElementById('error-zh').classList.remove('show');
            }

            // Load English content
            const enRes = await fetch('../content/' + currentPage + '.en.json?t=' + Date.now());
            if (enRes.ok) {
                contentData.en = await enRes.json();
                document.getElementById('json-en').value = JSON.stringify(contentData.en, null, 2);
                document.getElementById('error-en').classList.remove('show');
            }

            updatePreview();
        } catch (error) {
            console.error('Failed to load content:', error);
            showToast('加载失败', true);
        }
    }

    // Save content
    async function saveContent() {
        const zhEditor = document.getElementById('json-zh');
        const enEditor = document.getElementById('json-en');

        let zhData = null;
        let enData = null;
        let hasError = false;

        // Validate Chinese JSON
        try {
            zhData = JSON.parse(zhEditor.value);
            document.getElementById('error-zh').classList.remove('show');
        } catch (e) {
            document.getElementById('error-zh').textContent = 'JSON 格式错误: ' + e.message;
            document.getElementById('error-zh').classList.add('show');
            hasError = true;
        }

        // Validate English JSON
        try {
            enData = JSON.parse(enEditor.value);
            document.getElementById('error-en').classList.remove('show');
        } catch (e) {
            document.getElementById('error-en').textContent = 'JSON format error: ' + e.message;
            document.getElementById('error-en').classList.add('show');
            hasError = true;
        }

        if (hasError) {
            showToast('请修复 JSON 格式错误', true);
            return;
        }

        // Save both files
        try {
            await Promise.all([
                saveFile(currentPage + '.zh.json', zhData),
                saveFile(currentPage + '.en.json', enData)
            ]);

            contentData.zh = zhData;
            contentData.en = enData;
            updatePreview();
            showToast('保存成功');
        } catch (error) {
            console.error('Failed to save:', error);
            showToast('保存失败: ' + error.message, true);
        }
    }

    // Save individual file
    async function saveFile(filename, data) {
        const response = await fetch('../api/save-content.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ file: filename, content: data })
        });

        if (!response.ok) {
            throw new Error('Failed to save ' + filename);
        }

        return await response.json();
    }

    // Switch language tab
    function switchLangTab(lang) {
        currentLang = lang;

        // Update tab buttons
        document.querySelectorAll('.lang-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.lang === lang);
        });

        // Update editor panels
        document.querySelectorAll('.editor-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === 'editor-' + lang);
        });

        // Update language indicator
        document.querySelector('.lang-indicator .lang-zh').classList.toggle('active', lang === 'zh');
        document.querySelector('.lang-indicator .lang-en').classList.toggle('active', lang === 'en');
    }

    // Update preview
    function updatePreview() {
        if (contentData.zh) {
            document.getElementById('preview-zh').textContent = JSON.stringify(contentData.zh, null, 2);
        }
        if (contentData.en) {
            document.getElementById('preview-en').textContent = JSON.stringify(contentData.en, null, 2);
        }
    }

    // Show toast notification
    function showToast(message, isError = false) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');

        toastMessage.textContent = message;
        toast.classList.toggle('error', isError);
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Expose functions globally
    window.CMS = {
        loadContent,
        saveContent,
        switchLangTab
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
