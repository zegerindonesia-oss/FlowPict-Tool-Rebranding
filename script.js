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

    // Controls
    const deviceBtns = document.querySelectorAll('.device-btn');
    const previewContainer = document.querySelector('.preview-container');
    // const downloadBtn = document.getElementById('downloadBtn');
    const copyBtn = document.getElementById('copyBtn');

    // State
    let currentNavItems = [];

    // --- Core Logic ---

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

            // Try to find by exact text match first (High Precision)
            if (currentDetected && currentDetected !== "Not detected") {
                const allElements = doc.querySelectorAll('*');
                for (let el of allElements) {
                    // Check specific tags only to avoid replacing body text accidentally? No, brand can be anywhere.
                    // Match exact text to avoid partial replacements in sentences
                    if (el.children.length === 0 && el.innerText.trim() === currentDetected) {
                        el.innerText = brandNameInput.value;
                        replaced = true;
                    }
                }
            }

            // If explicit text match failed, try heuristic selectors again
            if (!replaced) {
                const candidates = doc.querySelectorAll('.navbar-brand, .brand, .logo, h1, .brand-name');
                candidates.forEach(el => { if (el.innerText.length < 50) el.innerText = brandNameInput.value; });
            }

            doc.title = brandNameInput.value;
        }

        // 2. Slogan
        if (sloganInput.value) {
            const currentDetected = detectedSlogan.value;
            let replaced = false;
            if (currentDetected && currentDetected !== "Not detected") {
                const allElements = doc.querySelectorAll('p, span, small, div'); // Limit scope slightly
                for (let el of allElements) {
                    if (el.children.length === 0 && el.innerText.trim() === currentDetected) {
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
            // Heuristic replacement
            const footerCopyright = doc.querySelectorAll('footer p, .copyright, .footer-text, .footer-copyright');
            footerCopyright.forEach(el => {
                if (el.innerText.includes('©') || el.innerText.toLowerCase().includes('copyright')) {
                    el.innerText = `© ${new Date().getFullYear()} ${companyNameInput.value}. All rights reserved.`;
                }
            });
        }

        // B. Apply Styling (Injected CSS) - No change needed here usually
        const styleTag = doc.createElement('style');
        let css = '';
        const pColor = primaryColorInput.value;

        if (colorModeInput.value === 'gradient') {
            css += `:root { --primary: ${pColor}; --primary-gradient: linear-gradient(135deg, ${pColor} 0%, ${adjustHue(pColor, 40)} 100%) !important; } 
                     .btn-primary, .primary-btn, button.primary, .active { background: var(--primary-gradient) !important; border-color: transparent !important; color: white !important; }
                     .text-gradient, h1 span, .brand { background: var(--primary-gradient) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; }`;
        } else {
            css += `:root { --primary: ${pColor}; --primary-gradient: ${pColor} !important; } 
                     .btn-primary, .primary-btn, button { background: ${pColor} !important; color: white !important;}
                     a { color: ${pColor}; }`;
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

        // C. Apply Nav Renaming
        if (currentNavItems.length > 0) {
            // We need to re-find the exact links.
            // Best way: Use the 'data-original' or index we tracked.
            // But since we are parsing fresh DOM, simple selector walk works if structure is same.
            const links = doc.querySelectorAll('nav a, .navbar a, .menu a, .sidebar a, ul.nav li a, .nav-item a');
            // Check if count matches to be safe?
            let navIndex = 0;
            links.forEach(link => {
                if (link.innerText.trim().length > 1) { // Same filter as extract
                    const input = document.getElementById(`nav-item-${navIndex}`);
                    if (input && input.value) {
                        // Replacing innerText destroys icons usually.
                        // Try to replace ONLY the text node if possible.
                        const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT, null, false);
                        let textNode = walker.nextNode();
                        while (textNode) {
                            if (textNode.nodeValue.trim().length > 0) {
                                textNode.nodeValue = input.value;
                                break; // Stop after first text replacement (usually the label)
                            }
                            textNode = walker.nextNode();
                        }
                        // Fallback if no text node found (weird case)
                        if (!textNode) link.innerText = input.value;
                    }
                    navIndex++;
                }
            });
        }

        return doc.documentElement.outerHTML;
    }

    // 3. Extract Nav Items (Improved)
    function extractNavItems() {
        const rawHtml = htmlInput.value;
        if (!rawHtml) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(rawHtml, 'text/html');

        // Broader selector for nav links
        // Includes generic list items if they look like a menu
        const links = doc.querySelectorAll('nav a, .navbar a, .menu a, .sidebar a, ul.nav li a, .nav-item a, a.nav-link');

        currentNavItems = [];
        navEditor.innerHTML = '';

        let count = 0;

        // Filter and Dedupe?
        // Let's just create inputs for all strictly "nav-link" looking things
        links.forEach((link, index) => {
            const text = link.innerText.trim();
            if (text.length < 2) return; // Skip empty/icon-only

            // Check visibility? Hard to do on static DOM parse.

            currentNavItems.push({ original: text, index: count });

            const row = document.createElement('div');
            row.className = 'comparison-row'; // Use the nice grid layout style if possible, or list
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

    // Live update triggers
    const inputs = [brandNameInput, sloganInput, logoUrlInput, companyNameInput, primaryColorInput, colorModeInput, fontFamilyInput, bgStyleInput, navPositionInput];
    inputs.forEach(input => {
        if (input) input.addEventListener('input', updatePreview);
    });

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
