document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const htmlInput = document.getElementById('htmlInput');
    const previewFrame = document.getElementById('previewFrame');
    const refreshNavBtn = document.getElementById('refreshNav');
    const navEditor = document.getElementById('navEditor');

    // Inputs
    const brandNameInput = document.getElementById('brandName');
    const sloganInput = document.getElementById('slogan');
    const logoUrlInput = document.getElementById('logoUrl');
    const primaryColorInput = document.getElementById('primaryColor');
    const colorModeInput = document.getElementById('colorMode'); // solid/gradient
    const fontFamilyInput = document.getElementById('fontFamily');
    const bgStyleInput = document.getElementById('bgStyle');
    const navPositionInput = document.getElementById('navPosition');

    // Controls
    const deviceBtns = document.querySelectorAll('.device-btn');
    const previewContainer = document.querySelector('.preview-container');
    const downloadBtn = document.getElementById('downloadBtn');
    const copyBtn = document.getElementById('copyBtn');

    // State
    let currentNavItems = [];

    // --- Core Logic ---

    // 1. Update Preview
    function updatePreview() {
        const rawHtml = htmlInput.value;
        if (!rawHtml) return;

        const blob = new Blob([generateModifiedHtml(rawHtml)], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        previewFrame.src = url;
    }

    // 2. Generate Modified HTML (The "Rebranding" Engine)
    function generateModifiedHtml(html) {
        // Create a DOM parser to manipulate the string as DOM
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // A. Apply Branding
        // Try to find common Brand Name elements
        const potentialBrandElements = doc.querySelectorAll('.brand, .logo, .navbar-brand, h1, .brand-name');
        if (brandNameInput.value) {
            potentialBrandElements.forEach(el => {
                // Heuristic: If it has text, replace it. Safe? Maybe.
                // Better: Check if it's the *main* brand.
                if (el.innerText.trim().length < 30) {
                    el.innerText = brandNameInput.value;
                }
            });
            // Also update title
            doc.title = brandNameInput.value;
        }

        // Apply Slogan
        if (sloganInput.value) {
            const potentialSlogans = doc.querySelectorAll('.slogan, .tagline, .description, p.subtitle');
            if (potentialSlogans.length > 0) {
                potentialSlogans[0].innerText = sloganInput.value;
            }
        }

        // Apply Logo
        if (logoUrlInput.value) {
            const logoImgs = doc.querySelectorAll('.logo img, .brand img, img.logo');
            logoImgs.forEach(img => img.src = logoUrlInput.value);
        }

        // B. Apply Styling (Injected CSS)
        const styleTag = doc.createElement('style');
        let css = '';

        // Primary Color Logic
        const pColor = primaryColorInput.value;
        if (colorModeInput.value === 'gradient') {
            // Generate a complimentary gradient
            css += `
                :root {
                    --primary: ${pColor};
                    --primary-gradient: linear-gradient(135deg, ${pColor} 0%, ${adjustHue(pColor, 40)} 100%) !important;
                }
                .btn-primary, .primary-btn, button.primary {
                    background: var(--primary-gradient) !important;
                    border: none !important;
                }
                .text-gradient, h1 span {
                    background: var(--primary-gradient) !important;
                    -webkit-background-clip: text !important;
                    -webkit-text-fill-color: transparent !important;
                }
             `;
        } else {
            css += `
                :root { --primary: ${pColor}; --primary-gradient: ${pColor} !important; }
                .btn-primary, .primary-btn, button.primary {
                     background: ${pColor} !important;
                }
                .text-gradient {
                     background: none !important;
                     -webkit-text-fill-color: ${pColor} !important;
                     color: ${pColor} !important;
                }
             `;
        }

        // Font Family
        css += `
            body, button, input, textarea, p, h1, h2, h3, h4, h5, h6 {
                font-family: ${fontFamilyInput.value} !important;
            }
        `;

        // Background
        if (bgStyleInput.value === 'gradient') {
            css += `body { background: linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%) !important; }`;
        } else if (bgStyleInput.value === 'dark') {
            css += `
                body { background: #0f172a !important; color: #f1f5f9 !important; } 
                .card, .panel { background: #1e293b !important; color: #fff !important; } 
             `;
        }

        // Nav Position (CSS override simulation)
        if (navPositionInput.value === 'left') {
            css += `
                /* Left Sidebar Override */
                body { display: flex !important; flex-direction: row !important; }
                nav, header, .navbar { 
                    width: 250px !important; 
                    height: 100vh !important; 
                    position: sticky !important; 
                    top: 0 !important; 
                    flex-direction: column !important;
                    border-right: 1px solid rgba(0,0,0,0.1);
                    border-bottom: none !important;
                    overflow-y: auto !important;
                }
                main, .content-wrapper, .main-content { flex: 1 !important; }
                .nav-links, .navbar-nav { flex-direction: column !important; gap: 10px !important; }
            `;
        } else if (navPositionInput.value === 'right') {
            css += `
                /* Right Sidebar Override */
                body { display: flex !important; flex-direction: row-reverse !important; }
                nav, header, .navbar { 
                    width: 250px !important; 
                    height: 100vh !important; 
                    position: sticky !important; 
                    top: 0 !important; 
                    flex-direction: column !important;
                    border-left: 1px solid rgba(0,0,0,0.1);
                    border-bottom: none !important;
                    overflow-y: auto !important;
                }
                main, .content-wrapper, .main-content { flex: 1 !important; }
                .nav-links, .navbar-nav { flex-direction: column !important; gap: 10px !important; }
            `;
        }

        styleTag.innerHTML = css;
        doc.head.appendChild(styleTag);

        // Font imports
        if (!doc.querySelector('link[href*="fonts.googleapis.com"]')) {
            const fontLink = doc.createElement('link');
            fontLink.rel = 'stylesheet';
            fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=Outfit:wght@400;600&family=Roboto:wght@400;500&family=Open+Sans:wght@400;600&display=swap';
            doc.head.appendChild(fontLink);
        }

        // C. Apply Nav Renaming
        if (currentNavItems.length > 0) {
            // Re-query valid links
            const links = doc.querySelectorAll('nav a, .navbar a, .menu a, .sidebar a');
            let matchIndex = 0;
            links.forEach(link => {
                const cleanText = link.innerText.trim();
                if (!cleanText || cleanText.length < 2) return;

                // Find corresponding input safely
                const input = document.getElementById(`nav-item-${matchIndex}`);
                if (input && input.value) {
                    link.innerText = input.value;
                }
                matchIndex++;
            });
        }

        return doc.documentElement.outerHTML;
    }

    // 3. Extract Nav Items (Heuristic)
    function extractNavItems() {
        const rawHtml = htmlInput.value;
        if (!rawHtml) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(rawHtml, 'text/html');

        const links = doc.querySelectorAll('nav a, .navbar a, .menu a, .sidebar a');
        currentNavItems = [];
        navEditor.innerHTML = '';

        let count = 0;

        if (links.length === 0) {
            navEditor.innerHTML = '<div class="empty-state">No navigation links detected.</div>';
            return;
        }

        links.forEach((link, index) => {
            const text = link.innerText.trim();
            if (text.length < 2) return;

            currentNavItems.push({ original: text, index: count });

            const row = document.createElement('div');
            row.className = 'nav-editor-item';
            row.innerHTML = `
                <input type="text" id="nav-item-${count}" value="${text}" data-original="${text}">
             `;
            row.querySelector('input').addEventListener('input', () => {
                updatePreview();
            });

            navEditor.appendChild(row);
            count++;
        });
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
    const inputs = [brandNameInput, sloganInput, logoUrlInput, primaryColorInput, colorModeInput, fontFamilyInput, bgStyleInput, navPositionInput];
    inputs.forEach(input => {
        input.addEventListener('input', updatePreview);
    });

    htmlInput.addEventListener('input', () => {
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

    // Copy / Download
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

    downloadBtn.addEventListener('click', () => {
        const finalCode = generateModifiedHtml(htmlInput.value);
        const blob = new Blob([finalCode], { type: "text/html" });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = "rebranded_page.html";
        link.click();
    });

});
