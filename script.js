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

    // Theme Configurations
    const themeConfigs = {
        modernPurple: {
            primary: '#8B5CF6',
            sidebar: '#0f172a',
            mode: 'gradient',
            bg: 'gradient', // light gradient
            font: 'Inter, sans-serif'
        },
        oceanBlue: {
            primary: '#0EA5E9',
            sidebar: '#0c4a6e',
            mode: 'gradient',
            bg: 'light',
            font: 'Roboto, sans-serif'
        },
        classicBrown: {
            primary: '#8D6E63',
            sidebar: '#3E2723',
            mode: 'solid',
            bg: 'light',
            font: 'Georgia, serif' // Fallback for "Classic" look
        },
        forestGreen: {
            primary: '#10B981',
            sidebar: '#064E3B',
            mode: 'gradient',
            bg: 'light',
            font: 'Inter, sans-serif'
        },
        sunsetOrange: {
            primary: '#F97316',
            sidebar: '#431407',
            mode: 'gradient',
            bg: 'light',
            font: 'Poppins, sans-serif'
        },
        crimsonRed: {
            primary: '#DC2626',
            sidebar: '#450a0a',
            mode: 'solid',
            bg: 'light',
            font: 'Inter, sans-serif'
        },
        darkStealth: {
            primary: '#94a3b8', // Muted slate
            sidebar: '#000000',
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

    // Theme Preset Handler
    if (themePresetInput) {
        themePresetInput.addEventListener('change', () => {
            const theme = themeConfigs[themePresetInput.value];
            if (theme) {
                // Apply values to inputs
                primaryColorInput.value = theme.primary;
                sidebarColorInput.value = theme.sidebar;
                colorModeInput.value = theme.mode;
                bgStyleInput.value = theme.bg;

                // Try to match font if option exists, otherwise default
                // Simple logic: just set it, browser handles fallback if option missing from select? 
                // Actually select inputs need valid value. 
                // Let's just assume standard fonts or generic families.
                // Current options in HTML: Inter, Roboto, Poppins, Lato
                // For Classic Brown we might want a serif. HTML doesn't have it yet.
                // Let's map strict to available options or just leave current if no match.

                const fontMap = {
                    'Georgia, serif': 'Inter, sans-serif', // Fallback as HTML options are limited
                    'Courier New, monospace': 'Inter, sans-serif'
                };

                // If the exact font isn't in the list, stick to Inter or current.
                // But let's try to set if it matches one of the values.
                fontFamilyInput.value = theme.font;

                // Trigger update
                updatePreview();
            }
        });
    }

    // Live update triggers
    // IMPORTANT: Include themePresetInput? No, its change listener handles it.
    // However, if manual input changes, we should set preset to 'custom'
    const inputs = [brandNameInput, sloganInput, logoUrlInput, companyNameInput, primaryColorInput, colorModeInput, fontFamilyInput, bgStyleInput, navPositionInput, sidebarColorInput];

    inputs.forEach(input => {
        if (input) {
            input.addEventListener('input', (e) => {
                // If user changes style manually, switch dropdown to Custom
                if ([primaryColorInput, sidebarColorInput, colorModeInput, bgStyleInput, fontFamilyInput].includes(e.target)) {
                    themePresetInput.value = 'custom';
                }
                updatePreview();
            });
        }
    });

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
            'header h1', 'header h2', '.app-name', '.site-title'
        ];

        for (let sel of brandSelectors) {
            const el = doc.querySelector(sel);
            if (el && el.innerText.trim().length > 0 && el.innerText.trim().length < 40) {
                detectedBrandName.value = el.innerText.trim();
                brandFound = true;
                break;
            }
        }

        // Strategy B: If no explicit selector, look for the first H1 or significant H2 in a sidebar/header
        if (!brandFound) {
            const headings = doc.querySelectorAll('h1, h2');
            for (let h of headings) {
                // Check if it's likely a title (not too long, usually at top)
                if (h.innerText.trim().length > 2 && h.innerText.trim().length < 30) {
                    detectedBrandName.value = h.innerText.trim();
                    brandFound = true;
                    break;
                }
            }
        }

        // Final Fallback
        if (!brandFound && doc.title) {
            detectedBrandName.value = doc.title;
        } else if (!brandFound) {
            detectedBrandName.value = "Not detected";
        }

        // --- Detect Slogan ---
        let sloganFound = false;
        const sloganSelectors = [
            '.slogan', '.subtitle', '.tagline', '.description',
            '.sidebar-header p', '.sidebar-header small', '.sidebar-header span',
            'header p', 'header small'
        ];

        for (let sel of sloganSelectors) {
            const el = doc.querySelector(sel);
            if (el && el.innerText.trim().length > 0 && el.innerText.trim().length < 60) {
                // Filter out common UI text if it looks like a slogan
                if (!el.innerText.toLowerCase().includes('admin') && !el.innerText.toLowerCase().includes('menu')) {
                    detectedSlogan.value = el.innerText.trim();
                    sloganFound = true;
                    break;
                }
            }
        }
        if (!sloganFound) detectedSlogan.value = "Not detected";

        // --- Detect Logo ---
        const logoImg = doc.querySelector('.brand img, .logo img, .navbar-brand img, header img, .sidebar-header img, img.logo');
        if (logoImg && logoImg.src) {
            detectedLogo.value = "Found image";
            detectedLogo.title = logoImg.src;
            if (!logoUrlInput.value) logoUrlInput.placeholder = "Paste new URL";
        } else {
            detectedLogo.value = "Not detected";
        }

        // --- Detect Company (Footer) ---
        const footerCopyright = doc.querySelectorAll('footer p, footer div, .copyright, .footer-text, .footer-copyright');
        let companyFound = false;
        for (let el of footerCopyright) {
            const text = el.innerText.toLowerCase();
            if (text.includes('©') || text.includes('copyright') || text.includes('by ')) {
                // Extract just the name if possible, or just show the whole string
                let cleanText = el.innerText.replace(/[\n\r]+/g, ' ').trim();
                if (cleanText.length > 50) cleanText = cleanText.substring(0, 47) + "...";
                detectedCompany.value = cleanText;
                companyFound = true;
                break;
            }
        }
        if (!companyFound) detectedCompany.value = "Not detected";
    }

    // 2. Generate Modified HTML (The "Rebranding" Engine)
    function generateModifiedHtml(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // A. Apply Branding
        // Note: We use the *Detected* value to find the element again and replace it.
        // This is safer than generic selectors which might miss or hit wrong things.

        // 1. App Name
        if (brandNameInput.value) {
            const currentDetected = detectedBrandName.value;
            let replaced = false;

            // Try explicit replacement first
            if (currentDetected && currentDetected !== "Not detected") {
                const allElements = doc.querySelectorAll('*');
                for (let el of allElements) {
                    // Strict match often fails due to hidden chars or spacing. Relax it.
                    if (el.children.length === 0 && el.innerText.includes(currentDetected)) {
                        // Only replace if it's the dominant text
                        if (el.innerText.trim() === currentDetected.trim()) {
                            el.innerText = brandNameInput.value;
                            replaced = true;
                        }
                    }
                }
            }
            // Fallback for tricky structures
            if (!replaced) {
                const candidates = doc.querySelectorAll('.navbar-brand, .brand, .logo, h1, .brand-name');
                candidates.forEach(el => {
                    if (el.innerText.length < 50 && el.innerText.length > 0) el.innerText = brandNameInput.value;
                });
            }
            doc.title = brandNameInput.value;
        }

        // 2. Slogan
        if (sloganInput.value) {
            const currentDetected = detectedSlogan.value;
            let replaced = false;
            if (currentDetected && currentDetected !== "Not detected") {
                const allElements = doc.querySelectorAll('p, span, small, div');
                for (let el of allElements) {
                    if (el.children.length === 0 && el.innerText.trim() === currentDetected.trim()) {
                        el.innerText = sloganInput.value;
                        replaced = true;
                    }
                }
            }
            if (!replaced) {
                const potentialSlogans = doc.querySelectorAll('.slogan, .subtitle, p.description');
                if (potentialSlogans.length > 0) potentialSlogans[0].innerText = sloganInput.value;
            }
        }

        // 3. Logo
        if (logoUrlInput.value) {
            const logoImgs = doc.querySelectorAll('.logo img, .brand img, img.logo, header img, .sidebar-header img');
            logoImgs.forEach(img => img.src = logoUrlInput.value);
        }

        // 4. Company
        if (companyNameInput.value) {
            const footerCopyright = doc.querySelectorAll('footer p, .copyright, .footer-text, .footer-copyright');
            footerCopyright.forEach(el => {
                if (el.innerText.includes('©') || el.innerText.toLowerCase().includes('copyright')) {
                    el.innerText = `© ${new Date().getFullYear()} ${companyNameInput.value}. All rights reserved.`;
                }
            });
        }

        // B. Apply Styling (Injected CSS)
        const styleTag = doc.createElement('style');
        let css = '';
        const pColor = primaryColorInput.value;
        const sColor = sidebarColorInput.value; // New Sidebar Color

        if (colorModeInput.value === 'gradient') {
            css += `:root { --primary: ${pColor}; --primary-gradient: linear-gradient(135deg, ${pColor} 0%, ${adjustHue(pColor, 40)} 100%) !important; }
                     .btn-primary, .primary-btn, button.primary, .active { background: var(--primary-gradient) !important; border-color: transparent !important; color: white !important; }
                     .text-gradient, h1 span, .brand { background: var(--primary-gradient) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; }`;
        } else {
            css += `:root { --primary: ${pColor}; --primary-gradient: ${pColor} !important; }
                     .btn-primary, .primary-btn, button { background: ${pColor} !important; color: white !important;}
                     a { color: ${pColor}; }`;
        }

        // Sidebar Color Override
        if (sColor && sColor !== "#0f172a") {
            css += `
                nav, .sidebar, aside, .drawer, .navbar-vertical {
                    background: ${sColor} !important;
                    background-color: ${sColor} !important;
                }
                nav a, .sidebar a { color: rgba(255,255,255,0.8) !important; }
                nav a:hover, .sidebar a:hover, nav a.active { color: white !important; background: rgba(255,255,255,0.1) !important; }
            `;
        }

        css += `body, button, input, h1, h2, h3, a, span { font-family: ${fontFamilyInput.value} !important; }`;

        if (bgStyleInput.value === 'gradient') css += `body { background: linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%) !important; }`;
        else if (bgStyleInput.value === 'dark') css += `body { background: #0f172a !important; color: #f1f5f9 !important; } .card, .panel, .sidebar { background: #1e293b !important; color: white; } a { color: #fff !important; }`;

        // Layout overrides
        if (navPositionInput.value === 'left') {
            css += `body { display: flex !important; flex-direction: row !important; }
                    nav, header, .sidebar { width: 260px !important; height: 100vh !important; position: sticky !important; top: 0 !important; flex-direction: column !important; border-right: 1px solid rgba(0,0,0,0.1); }
                    main, .content { flex: 1 !important; }`;
        } else if (navPositionInput.value === 'right') {
            css += `body { display: flex !important; flex-direction: row-reverse !important; }
                    nav, header, .sidebar { width: 260px !important; height: 100vh !important; position: sticky !important; top: 0 !important; flex-direction: column !important; border-left: 1px solid rgba(0,0,0,0.1); }
                    main, .content { flex: 1 !important; }`;
        }

        styleTag.innerHTML = css;
        doc.head.appendChild(styleTag);

        // C. Apply Nav Renaming (More Aggressive Strategy)
        if (currentNavItems.length > 0) {
            // Because extractNavItems uses a specific logic, we must mirror it for replacement
            // Or use a more robust "find by original text" approach
            const allLinks = doc.querySelectorAll('a, button, [role="button"], .nav-item, li');

            let navIndex = 0;
            // Iterate our Stored Nav Items because that's the source of truth for "what to replace"

            // Build a map for faster lookup? No, just iterate
            currentNavItems.forEach((item, idx) => {
                const input = document.getElementById(`nav-item-${idx}`);
                if (input && input.value && input.value !== item.original) {
                    // Find element with this original text
                    for (let el of allLinks) {
                        // Clean detection text
                        let rawText = el.innerText;
                        if (!rawText) continue;

                        // Check if this element matches the original text we detected
                        // Note: The detected text 'item.original' already had badges stripped effectively
                        // So we check if the element's text *contains* the original text
                        if (rawText.includes(item.original)) {
                            // Be careful not to wipe icons.
                            // Find the text node that matches.
                            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
                            let textNode = walker.nextNode();
                            while (textNode) {
                                if (textNode.nodeValue.includes(item.original)) {
                                    // Replace specific text
                                    textNode.nodeValue = textNode.nodeValue.replace(item.original, input.value);
                                    break;
                                }
                                textNode = walker.nextNode();
                            }
                        }
                    }
                }
            });
        }

        return doc.documentElement.outerHTML;
    }

    // 3. Extract Nav Items (Improved x2)
    function extractNavItems() {
        const rawHtml = htmlInput.value;
        if (!rawHtml) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(rawHtml, 'text/html');

        // Broader selector to catch buttons and divs acting as links in sidebars
        // Explicitly look for "Gabung Foto" style elements (often inside a button or list item)
        const potentialNavs = doc.querySelectorAll('nav a, .sidebar a, .menu a, .nav-link, button.nav-btn, .sidebar button, .list-group-item, li a, .menu-item');

        currentNavItems = [];
        navEditor.innerHTML = '';

        let count = 0;
        const seenTexts = new Set();

        potentialNavs.forEach((el, index) => {
            // Get text but ignore "New", "Pro", badges
            // Clone to not mess up DOM? No need, just parse text.
            let text = el.innerText;
            if (!text) return;

            // Cleanup: Remove common badge words
            text = text.replace(/New|Pro|Beta|Hot/gi, '').trim();
            // Remove icon chars (simple check)
            text = text.replace(/[\uE000-\uF8FF]/g, '').trim();

            if (text.length < 2) return;
            if (seenTexts.has(text)) return; // Dedupe
            seenTexts.add(text);

            // Filter out obviously non-nav text (too long)
            if (text.length > 30) return;

            currentNavItems.push({ original: text, index: count });

            const row = document.createElement('div');
            row.className = 'comparison-row';
            row.style.marginBottom = "8px";

            row.innerHTML = `
                <div class="dual-input">
                    <input type="text" class="detected-input" value="${text}" readonly title="Original Label">
                    <i class="fa-solid fa-arrow-right"></i>
                    <input type="text" id="nav-item-${count}" placeholder="Rename '${text}'">
                </div>
             `;
            row.querySelector('input:not([readonly])').addEventListener('input', updatePreview);

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
            const content = event.target.result;
            if (!content) {
                alert("File content is empty!");
                return;
            }

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
