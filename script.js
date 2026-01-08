document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const htmlInput = document.getElementById('htmlInput');
    const htmlUpload = document.getElementById('htmlUpload');
    const fileNameDisplay = document.getElementById('fileName');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    const previewFrame = document.getElementById('previewFrame');
    const refreshNavBtn = document.getElementById('refreshNav');
    const navEditor = document.getElementById('navEditor');
    const applyBtn = document.getElementById('applyBtn');

    // Inputs (New & Detected)
    const brandNameInput = document.getElementById('brandName');
    const detectedBrandName = document.getElementById('detectedBrandName');

    const sloganInput = document.getElementById('slogan');
    const detectedSlogan = document.getElementById('detectedSlogan');

    const logoUrlInput = document.getElementById('logoUrl');
    const detectedLogo = document.getElementById('detectedLogo');

    const companyNameInput = document.getElementById('companyName');
    const detectedCompany = document.getElementById('detectedCompany');

    const primaryColorInput = document.getElementById('primaryColor');
    const colorModeInput = document.getElementById('colorMode'); // solid/gradient
    const fontFamilyInput = document.getElementById('fontFamily');
    const bgStyleInput = document.getElementById('bgStyle');
    const navPositionInput = document.getElementById('navPosition');
    const sidebarColorInput = document.getElementById('sidebarColor');
    const themePresetInput = document.getElementById('themePreset'); // New Theme Selector

    // --- Helper: Unpack Obfuscated HTML ---
    function unpackHtml(source) {
        // Check for document.write(unescape('...')) pattern
        const pattern = /document\.write\(\s*unescape\(\s*['"]([^'"]+)['"]\s*\)\s*\)/;
        const match = source.match(pattern);
        if (match && match[1]) {
            try {
                const decoded = unescape(match[1]);
                console.log("Automatically unpacked obfuscated HTML.");
                return decoded;
            } catch (e) {
                console.error("Failed to unpack HTML:", e);
                return source;
            }
        }
        // Check for decodeURIComponent pattern
        const pattern2 = /document\.write\(\s*decodeURIComponent\(\s*['"]([^'"]+)['"]\s*\)\s*\)/;
        const match2 = source.match(pattern2);
        if (match2 && match2[1]) {
            try {
                const decoded = decodeURIComponent(match2[1]);
                return decoded;
            } catch (e) {
                return source;
            }
        }
        return source;
    }

    // Theme Configurations
    // Theme Configurations (Strictly Matched / Senada)
    const themeConfigs = {
        modernPurple: {
            primary: '#8B5CF6',   // Violet 500
            sidebar: '#2e1065',   // Violet 950 (Deep Purple) - Matching
            mode: 'gradient',
            bg: 'gradient',
            font: 'Inter, sans-serif'
        },
        oceanBlue: {
            primary: '#0EA5E9',   // Sky 500
            sidebar: '#082f49',   // Sky 950 (Deep Blue) - Matching
            mode: 'gradient',
            bg: 'light',
            font: 'Roboto, sans-serif'
        },
        classicBrown: {
            primary: '#A1887F',   // Brown 300
            sidebar: '#3E2723',   // Brown 900 (Deep Coffee) - Matching
            mode: 'solid',
            bg: 'light',
            font: 'Georgia, serif'
        },
        forestGreen: {
            primary: '#10B981',   // Emerald 500
            sidebar: '#022c22',   // Emerald 950 (Deep Green) - Matching
            mode: 'gradient',
            bg: 'light',
            font: 'Inter, sans-serif'
        },
        sunsetOrange: {
            primary: '#F97316',   // Orange 500
            sidebar: '#431407',   // Orange 950 (Deep Burnt Orange) - Matching
            mode: 'gradient',
            bg: 'light',
            font: 'Poppins, sans-serif'
        },
        crimsonRed: {
            primary: '#EF4444',   // Red 500
            sidebar: '#450a0a',   // Red 950 (Deep Red) - Matching
            mode: 'solid',
            bg: 'light',
            font: 'Inter, sans-serif'
        },
        midnightTeal: {
            primary: '#14b8a6',  // Teal 500
            sidebar: '#042f2e',  // Teal 950
            mode: 'gradient',
            bg: 'dark',
            font: 'Inter, sans-serif'
        },
        darkStealth: {
            primary: '#94a3b8',   // Slate 400
            sidebar: '#020617',   // Slate 950
            mode: 'solid',
            bg: 'dark',
            font: 'Courier New, monospace'
        }
    };

    // Controls
    const deviceBtns = document.querySelectorAll('.device-btn');
    const previewContainer = document.querySelector('.preview-container');
    // const downloadBtn = document.getElementById('downloadBtn');
    const copyBtn = document.getElementById('copyBtn');

    // State
    let currentNavItems = [];

    // --- Core Logic ---

    // ... (Existing Functions) ...

    // --- Event Listeners ---

    // Theme Preset Handler (Direct Update)
    if (themePresetInput) {
        themePresetInput.addEventListener('change', updatePreview);
    }

    // Live update triggers
    // IMPORTANT: Include themePresetInput? No, its change listener handles it.
    // However, if manual input changes, we should set preset to 'custom'
    const inputs = [brandNameInput, sloganInput, logoUrlInput, companyNameInput, primaryColorInput, colorModeInput, fontFamilyInput, bgStyleInput, navPositionInput, sidebarColorInput];



    // 1. Update Preview
    function updatePreview() {
        const rawHtml = htmlInput.value;
        if (!rawHtml) return;

        try {
            const modHtml = generateModifiedHtml(rawHtml);
            const blob = new Blob([modHtml], { type: 'text/html' });
            const url = URL.createObjectURL(blob);

            // Critical Fix: Clear srcdoc so src takes precedence
            previewFrame.removeAttribute('srcdoc');
            previewFrame.src = url;

        } catch (err) {
            console.error("Preview Generation Error:", err);
            previewFrame.removeAttribute('src');
            previewFrame.srcdoc = `<div style="color:red;padding:20px;">Error generating preview: ${err.message}</div>`;
        }
    }



    // 1.5 Smart Detection (Auto-fill)
    function detectBranding(html) {
        if (!html) return;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // --- Detect Brand Name ---
        // Priority: 1. Semantic classes 2. H1/H2 3. Document Title
        let brandFound = false;

        // Strategy A: Explicit Selectors
        const brandSelectors = [
            '.navbar-brand', '.brand', '.logo', '.logo-text', '.brand-name',
            '.sidebar-header h1', '.sidebar-header h2', '.sidebar-header h3',
            'header h1', 'header h2', '.app-name', '.site-title',
            '.sidebar-brand', '.sidebar-title', 'a.brand', 'a.navbar-brand span'
        ];

        for (let sel of brandSelectors) {
            const el = doc.querySelector(sel);
            if (el && el.innerText.trim().length > 0 && el.innerText.trim().length < 40) {
                detectedBrandName.value = el.innerText.trim();
                brandFound = true;
                break;
            }
        }

        // Strategy B: If no explicit selector, look for the first H1 or significant H2
        if (!brandFound) {
            const headings = doc.querySelectorAll('h1, h2');
            for (let h of headings) {
                if (h.innerText.trim().length > 2 && h.innerText.trim().length < 30) {
                    detectedBrandName.value = h.innerText.trim();
                    brandFound = true;
                    break;
                }
            }
        }

        // Strategy C: Document Title (Final Fallback)
        if (!brandFound && doc.title && doc.title.length < 50) {
            // Remove common suffixes like " - Home", " | Official"
            let cleanTitle = doc.title.split(/[-|]/)[0].trim();
            if (cleanTitle.length > 0) {
                detectedBrandName.value = cleanTitle;
                brandFound = true;
            }
        }

        // AUTO-FILL Brand Input
        if (brandFound) {
            brandNameInput.value = detectedBrandName.value;
        } else {
            detectedBrandName.value = "Not detected";
            // Optional: Keep value empty or set placeholder? Keep value empty.
        }

        // --- Detect Slogan ---
        let sloganFound = false;
        // Broader selectors for detection
        const sloganSelectors = [
            '.slogan', '.subtitle', '.tagline', '.description',
            '.sidebar-header p', '.sidebar-header small', '.sidebar-header span',
            'header p', 'header small',
            '.hero-text p', '.hero-section p', '.main-header p'
        ];

        for (let sel of sloganSelectors) {
            const el = doc.querySelector(sel);
            if (el && el.innerText.trim().length > 0 && el.innerText.trim().length < 80) { // Increased length limit slightly
                // Filter out common non-slogan text
                const text = el.innerText.toLowerCase();
                if (!text.includes('admin') && !text.includes('menu') && !text.includes('copyright')) {
                    detectedSlogan.value = el.innerText.trim();
                    sloganFound = true;
                    break;
                }
            }
        }

        // AUTO-FILL Slogan Input
        if (sloganFound) {
            sloganInput.value = detectedSlogan.value;
        } else {
            detectedSlogan.value = "Not detected";
        }

        // --- Detect Logo ---
        // Broader selectors for logo
        const logoSelectors = [
            '.brand img', '.logo img', '.navbar-brand img',
            'header img', '.sidebar-header img', 'img.logo',
            'img.brand-logo', '#logo img', 'a.brand-link img'
        ];

        // Try all logo selectors
        let logoImg = null;
        for (let sel of logoSelectors) {
            logoImg = doc.querySelector(sel);
            if (logoImg) break;
        }

        if (logoImg && logoImg.src) {
            detectedLogo.value = "Found image";
            detectedLogo.title = logoImg.src;
            if (!logoUrlInput.value) logoUrlInput.value = logoImg.src; // Auto-fill URL
        } else {
            detectedLogo.value = "Not detected";
        }

        // --- Detect Company (Footer) ---
        const footerCopyright = doc.querySelectorAll('footer p, footer div, .copyright, .footer-text, .footer-copyright, footer span');
        let companyFound = false;

        // 1. Try standard "Copyright" patterns
        for (let el of footerCopyright) {
            const text = el.innerText.toLowerCase();
            if (text.includes('©') || text.includes('copyright')) {
                let cleanText = el.innerText.replace(/[\n\r]+/g, ' ').trim();
                const match = cleanText.match(/©\s*\d{4}\s*(.*?)(\.|$)/);
                if (match && match[1]) {
                    detectedCompany.value = match[1].replace(/All rights reserved/i, '').trim();
                } else {
                    if (cleanText.length > 50) cleanText = cleanText.substring(0, 47) + "...";
                    detectedCompany.value = cleanText;
                }
                companyFound = true;
                break;
            }
        }

        // 2. Try "By [Name]" pattern (common in footers/sidebars like "by Ichsan Labs")
        if (!companyFound) {
            // Traverse all footer text or sidebar text for "by"
            const allTextEls = doc.querySelectorAll('footer *, .sidebar-footer *, .sidebar *, .panel-footer *');
            for (let el of allTextEls) {
                // Avoid empty or huge blocks
                if (el.children.length > 0) continue;

                const text = el.innerText.trim();
                if (text.toLowerCase().startsWith('by ') && text.length < 40) {
                    let extracted = text.substring(3).trim(); // Remove "by "
                    detectedCompany.value = extracted;
                    companyFound = true;
                    break;
                }
            }
        }

        // 3. Fallback: Search for specific user request "ichsan labs" if it appears anywhere relevant
        if (!companyFound) {
            const bodyText = doc.body.innerText.toLowerCase();
            if (bodyText.includes('ichsan labs')) {
                detectedCompany.value = "Ichsan Labs";
                companyFound = true;
            }
        }

        // AUTO-FILL Company Input
        if (companyFound) {
            companyNameInput.value = detectedCompany.value;
        } else {
            detectedCompany.value = "Not detected";
        }
    }

    // 2. Generate Modified HTML (The "Rebranding" Engine)
    function generateModifiedHtml(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const selectedThemeKey = themePresetInput ? themePresetInput.value : 'original';
        const isOriginal = selectedThemeKey === 'original';
        const theme = themeConfigs[selectedThemeKey] || themeConfigs['modernPurple'];

        // --- Helper: Global Text Replace ---
        // Walks through all text nodes and replaces occurrences of 'search' with 'replace'
        function replaceGlobalText(root, search, replace) {
            if (!search || !replace || search === "Not detected" || search.trim().length === 0) return;

            // Normalize
            const safeSearch = search.trim();
            const safeReplace = replace.trim();

            const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
            let node;
            const nodesToUpdate = [];

            while (node = walker.nextNode()) {
                const parent = node.parentNode;
                if (!parent) continue;
                const tag = parent.tagName;

                // Safety: Skip script, style, and code-related blocks
                if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA' || tag === 'CODE' || tag === 'PRE') continue;

                if (node.nodeValue.includes(safeSearch)) {
                    nodesToUpdate.push(node);
                }
            }

            // Update after walking to avoid messing up the walker
            nodesToUpdate.forEach(n => {
                // Global replaceAll in the text content
                // Simple split/join is safer than regex for literal strings
                n.nodeValue = n.nodeValue.split(safeSearch).join(safeReplace);
            });
        }

        // --- A. Content Replacement (Rebranding) ---

        // 1. App Name
        const brandName = brandNameInput.value;
        const currentDetectedBrand = detectedBrandName.value;
        if (brandName) {
            // Strategy: Global Text Node Replacement (SAFE)
            // This replaces the text wherever it appears without destroying elements
            replaceGlobalText(doc.body, currentDetectedBrand, brandName);

            // Minimal Fallback: Update Title
            doc.title = brandName;
        }

        // 2. Slogan
        const slogan = sloganInput.value;
        const currentDetectedSlogan = detectedSlogan.value;
        if (slogan) {
            // Strategy: Global Text Node Replacement (SAFE)
            replaceGlobalText(doc.body, currentDetectedSlogan, slogan);
        }

        // 3. Logo
        const logoUrl = logoUrlInput.value;
        if (logoUrl) {
            const originalSrc = detectedLogo.title;

            // Strategy A: Global Src Replace
            if (originalSrc) {
                const allImgs = doc.querySelectorAll('img');
                allImgs.forEach(img => {
                    if (img.src === originalSrc || img.getAttribute('src') === originalSrc) {
                        img.src = logoUrl;
                        if (img.srcset) img.removeAttribute('srcset');
                    }
                });
            }

            // Strategy B: Selectors Fallback (Safe, only updates src)
            const logoSelectors = [
                '.logo img', '.brand img', 'img.logo', 'header img',
                '.sidebar-header img', 'img.brand-logo', '.navbar-brand img',
                '#logo img'
            ];
            logoSelectors.forEach(sel => {
                const imgs = doc.querySelectorAll(sel);
                imgs.forEach(img => {
                    img.src = logoUrl;
                    if (img.srcset) img.removeAttribute('srcset');
                });
            });
        }

        // 4. Company Name
        const companyName = companyNameInput.value;
        const currentDetectedComp = detectedCompany.value;
        if (companyName) {
            // Priority 1: Global Replace of detected company
            replaceGlobalText(doc.body, currentDetectedComp, companyName);

            // Priority 2: Targeted Footer Updates (Text Node Walker - SAFE)
            const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null, false);
            let node;
            const copysToUpdate = [];
            while (node = walker.nextNode()) {
                // Skip sensitive tags just in case
                if (node.parentNode && ['SCRIPT', 'STYLE'].includes(node.parentNode.tagName)) continue;

                if (node.nodeValue.includes('©') || node.nodeValue.toLowerCase().includes('copyright')) {
                    copysToUpdate.push(node);
                }
            }

            // Strategy: Element-Level Search for Footer (Handles fragmented nodes)
            // We search for the container, then act on its text/HTML
            const footerContainers = doc.querySelectorAll('footer, .footer, .copyright, .sidebar-footer, small, .legal');

            footerContainers.forEach(container => {
                // Safety Check: Don't nuuke complex sub-trees (but footer containers are usually safe to traverse)
                // We'll use a specific walker for the footer context
                const footerWalker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
                let fNode;
                while (fNode = footerWalker.nextNode()) {
                    let fText = fNode.nodeValue;

                    // 1. Explicit Replacement of "Ichsan Labs" (User reported mismatch)
                    // Because detection might have failed or been exact-match only
                    if (/ichsan\s*labs?/i.test(fText)) {
                        fText = fText.replace(/ichsan\s*labs?/gi, companyName);
                    }

                    // 2. Explicit Replacement of "Sulap Foto" (App Name) in Footer
                    if (/sulap\s*foto/i.test(fText) && brandName) {
                        fText = fText.replace(/sulap\s*foto/gi, brandName);
                    }

                    // 3. Explicit Replacement of "v3.6 pro" (Slogan) in Footer
                    if (/v\s*3\.6\s*pro/i.test(fText) && slogan) {
                        fText = fText.replace(/v\s*3\.6\s*pro/gi, slogan);
                    }

                    // 4. Standard Detected Brand/Slogan Replace (if not caught above)
                    if (currentDetectedBrand && currentDetectedBrand !== "Not detected" && brandName) {
                        const escBrand = currentDetectedBrand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        fText = fText.replace(new RegExp(escBrand, 'gi'), brandName);
                    }

                    // 5. Structure Fix: "by [Company]" 
                    // If we see "by [Company]", ensure [Company] is the new one
                    if (fText.toLowerCase().includes('by ') && companyName) {
                        // Careful not to double replace if we just did it in step 1
                        if (!fText.includes(companyName)) {
                            // This is tricky if "by" and "Ichsan" are split.
                            // But usually they are in the same text node if plain text.
                            // If not, Step 1 helps.
                            // If "by" matches but company not found, maybe append?
                            // No, unsafe. Assume Step 1 covers the explicit "Ichsan Labs" case.
                        }
                    }

                    fNode.nodeValue = fText;
                }
            });

            // Fallback: If "Ichsan Labs" wasn't found in any text node (maybe inside a Link's innerText?)
            // We search ALL links in footer containers
            footerContainers.forEach(container => {
                const links = container.querySelectorAll('a');
                links.forEach(link => {
                    if (/ichsan\s*labs?/i.test(link.innerText)) {
                        link.innerText = companyName;
                    }
                });
            });
        }

        // --- B. CSS Branding Injection (SKIPPED IF ORIGINAL) ---
        if (!isOriginal) {
            const styleTag = doc.createElement('style');

            // 1. Define Variables
            let css = `
                :root {
                    --theme-primary: ${theme.primary} !important;
                    --theme-primary-dark: ${theme.primaryDark} !important;
                    --theme-sidebar: ${theme.sidebar} !important;
                    --theme-sidebar-text: ${theme.sidebarText} !important;
                    --theme-accent: ${theme.accent} !important;
                    --theme-surface: ${theme.surface} !important;
                    --theme-font: ${theme.font} !important;
                }
            `;

            // Just apply the core necessary overrides since user liked the original but wanted rebranding fixes
            css += `
                .btn, button, .primary-btn { background-color: var(--theme-primary) !important; color: white !important; }
                .sidebar, aside, .glass-panel { background-color: var(--theme-sidebar) !important; color: white !important; }
                a { color: var(--theme-primary) !important; }
             `;

            styleTag.innerHTML = css;
            doc.head.appendChild(styleTag);
        }

        // --- D. Runtime Enforcement Information Script ---
        // This script is injected into the preview to aggressively fix the footer 
        // if the original app's JS dynamically renders or reverts it.
        const runtimeScript = doc.createElement('script');
        runtimeScript.innerHTML = `
            (function() {
                const config = {
                    brand: "${brandName || ''}",
                    slogan: "${slogan || ''}",
                    company: "${companyName || ''}",
                    bps: {
                        oldComp: /ichsan\\s*labs?/i,
                        oldBrand: /sulap\\s*foto/i,
                        oldSlogan: /v\\s*3\\.6\\s*pro/i
                    }
                };

                function enforceBranding() {
                    if (!config.brand && !config.company) return;

                    // Target Footer-like elements
                    const targets = document.querySelectorAll('footer, .footer, .copyright, small, div[class*="footer"], div[class*="copyright"]');
                    
                    targets.forEach(el => {
                        // Avoid editing if it contains inputs/scripts
                        if (el.querySelector('input, script, textarea')) return;

                        let text = el.innerText;
                        let modified = false;

                        // 1. Replace "Ichsan Labs" -> Company
                        if (config.company && config.bps.oldComp.test(text)) {
                            text = text.replace(config.bps.oldComp, config.company);
                            modified = true;
                        }

                        // 2. Replace "Sulap Foto" -> Brand
                        if (config.brand && config.bps.oldBrand.test(text)) {
                            text = text.replace(config.bps.oldBrand, config.brand);
                            modified = true;
                        }
                        
                        // 3. Replace "v3.6 pro" -> Slogan
                        if (config.slogan && config.bps.oldSlogan.test(text)) {
                            text = text.replace(config.bps.oldSlogan, config.slogan);
                            modified = true;
                        }

                        // 4. Force "by [Company]" if missing but we are in a copyright line
                        if (config.company && (text.includes('©') || text.toLowerCase().includes('copyright')) && !text.includes(config.company)) {
                             if (text.toLowerCase().includes('by ')) {
                                 // Replace existing "by ..." suffix
                                 const parts = text.split(/by /i);
                                 text = parts[0] + "by " + config.company;
                                 modified = true;
                             }
                        }

                        if (modified) {
                            el.innerText = text;
                        }
                    });
                }

                // Run immediately
                enforceBranding();

                // Run periodically (every 500ms for 5 seconds) to catch delayed scripts
                let count = 0;
                const interval = setInterval(() => {
                    enforceBranding();
                    count++;
                    if (count > 10) clearInterval(interval);
                }, 500);

                // Observe DOM changes (The Nuclear Option)
                const observer = new MutationObserver((mutations) => {
                    enforceBranding();
                });
                observer.observe(document.body, { childList: true, subtree: true, characterData: true });
            })();
        `;
        doc.body.appendChild(runtimeScript);

        // --- C. Nav Renaming (Preserved) ---
        if (currentNavItems.length > 0) {
            const allLinks = doc.querySelectorAll('a, button, [role="button"], .nav-item, li');
            currentNavItems.forEach((item, idx) => {
                const input = document.getElementById(`nav-item-${idx}`);
                if (input && input.value && input.value !== item.original) {
                    replaceGlobalText(doc.body, item.original, input.value);
                }
            });
        }

        // CRITICAL FIX: Preserve DOCTYPE
        return "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
    }

    // 3. Extract Nav Items (Improved x3)
    function extractNavItems() {
        const rawHtml = htmlInput.value;
        if (!rawHtml) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(rawHtml, 'text/html');

        // Target specifically the button spans in this template, plus standard links
        const specificButtons = doc.querySelectorAll('button.sidebar-btn span, button.sidebar-sub-btn');
        const generalLinks = doc.querySelectorAll('nav a, .sidebar a, .menu a, .nav-link, li a');

        // Merge node lists
        const potentialNavs = [...specificButtons, ...generalLinks];

        currentNavItems = [];
        navEditor.innerHTML = '';

        let count = 0;
        const seenTexts = new Set();

        potentialNavs.forEach((el, index) => {
            let text = el.innerText;
            if (!text) return;

            // Cleanup
            text = text.replace(/New|Pro|Beta|Hot/gi, '').trim();
            text = text.replace(/[\uE000-\uF8FF]/g, '').trim(); // Remove icons

            if (text.length < 2) return;
            if (seenTexts.has(text)) return;
            seenTexts.add(text);

            if (text.length > 30) return;

            currentNavItems.push({ original: text, index: count });

            const row = document.createElement('div');
            row.className = 'comparison-row';
            row.style.marginBottom = "8px";

            // Pre-fill the input with the original text for easy editing
            row.innerHTML = `
                <div class="dual-input">
                    <input type="text" class="detected-input" value="${text}" readonly title="Original Label">
                    <i class="fa-solid fa-arrow-right"></i>
                    <input type="text" id="nav-item-${count}" value="${text}" placeholder="Rename '${text}'">
                </div>
            `;
            // Add listener to the NEW input
            const inputField = row.querySelector(`#nav-item-${count}`);
            if (inputField) {
                inputField.addEventListener('input', updatePreview);
            }

            navEditor.appendChild(row);
            count++;
        });

        if (count === 0) {
            navEditor.innerHTML = '<div class="empty-state">No navigation links detected.</div>';
        }
    }

    // --- Helpers ---
    function adjustHue(hex, degree) {
        // Simple distinct color generator
        // Remove hash
        hex = hex.replace('#', '');
        // Parse r, g, b
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);

        // Simple shift (not true HSL rotation but works for generating a variant)
        // Check which channel is dominant and shift others
        if (r > g && r > b) { g += 50; b += 50; }
        else if (g > r && g > b) { r += 50; b += 50; }
        else { r += 50; g += 50; }

        r = Math.min(255, r); g = Math.min(255, g); b = Math.min(255, b);

        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    // --- Event Listeners ---



    htmlInput.addEventListener('input', () => {
        // For simplicity: We call it here.
        if (htmlInput.value.length > 20 && !brandNameInput.value) {
            detectBranding(htmlInput.value);
        }

        extractNavItems();
        updatePreview();
    });

    refreshNavBtn.addEventListener('click', extractNavItems);

    // Device toggles
    deviceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            deviceBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const mode = btn.dataset.mode;
            if (mode === 'mobile') {
                previewContainer.classList.remove('desktop-mode');
                previewContainer.classList.add('mobile-mode');
            } else {
                previewContainer.classList.remove('mobile-mode');
                previewContainer.classList.add('desktop-mode');
            }
        });
    });

    // Apply Button
    applyBtn.addEventListener('click', () => {
        // Just trigger update again (visual feedback)
        updatePreview();
        applyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Applied!';
        fileNameDisplay.style.color = '#1e293b';
        setTimeout(() => {
            applyBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Apply Customisation';
        }, 1500);
    });

    // Copy Code
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const finalCode = generateModifiedHtml(htmlInput.value);
            navigator.clipboard.writeText(finalCode).then(() => {
                copyBtn.innerText = 'Copied!';
                copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy Code';
                }, 2000);
            });
        });
    }

    // File Upload Handler
    htmlUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        fileNameDisplay.innerText = file.name;

        // Show loading state
        previewFrame.srcdoc = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;color:#64748b;">Processing file...</div>';

        const reader = new FileReader();
        reader.onload = (event) => {
            const rawContent = event.target.result;
            if (!rawContent) {
                alert("File content is empty!");
                return;
            }

            // Unpack if necessary
            const content = unpackHtml(rawContent);
            htmlInput.value = content;

            // Reset to "Not Detected" defaults first
            detectedBrandName.value = "Not detected";
            detectedSlogan.value = "Not detected";
            detectedLogo.value = "Not detected";
            detectedCompany.value = "Not detected";

            // Clear inputs
            brandNameInput.value = '';
            sloganInput.value = '';
            logoUrlInput.value = '';
            companyNameInput.value = '';

            // Run logic with safety
            try {
                detectBranding(content);
            } catch (err) {
                console.error("Branding detection failed:", err);
                detectedBrandName.value = "Error scanning";
            }

            try {
                extractNavItems();
            } catch (err) {
                console.error("Nav extraction failed:", err);
                navEditor.innerHTML = '<div class="empty-state">Error loading navigation</div>';
            }

            // Update preview
            updatePreview();
        };

        reader.onerror = (err) => {
            console.error("File reading failed", err);
            alert("Error reading file");
        };

        reader.readAsText(file);
    });

});
