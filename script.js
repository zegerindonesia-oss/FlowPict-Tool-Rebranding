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

        // Detect Brand Name
        const brandCandidates = doc.querySelectorAll('.navbar-brand, .brand, .logo, h1, .wrapper-logo, .brand-name, .logo-text, a.logo');
        let foundBrand = false;

        for (let el of brandCandidates) {
            if (el.innerText && el.innerText.trim().length > 0 && el.innerText.trim().length < 30) {
                detectedBrandName.value = el.innerText.trim();
                foundBrand = true;
                break;
            }
        }

        // Fallback: Document Title
        if (!foundBrand && doc.title) {
            detectedBrandName.value = doc.title;
        } else if (!foundBrand) {
            detectedBrandName.value = "Not detected";
        }

        // Detect Slogan
        const sloganCandidates = doc.querySelectorAll('.slogan, .subtitle, p.description, .hero-text p');
        let foundSlogan = false;
        for (let el of sloganCandidates) {
            if (el.innerText && el.innerText.trim().length > 0 && el.innerText.trim().length < 60) {
                detectedSlogan.value = el.innerText.trim();
                foundSlogan = true;
                break;
            }
        }
        if (!foundSlogan) detectedSlogan.value = "Not detected";

        // Detect Logo
        const logoImg = doc.querySelector('.brand img, .logo img, .navbar-brand img, header img, img.logo');
        if (logoImg && logoImg.src) {
            detectedLogo.value = "Found image";
            detectedLogo.title = logoImg.src;
            // Pre-fill the new logo URL input with the old one for convenience? 
            // User requested: "muncul semua fitur saat ini dan hendak dirubah menjadi apa"
            // So logic says: Detected = old, Input = new.
            // But if user wants to keep it, they leave new empty.
            if (!logoUrlInput.value) logoUrlInput.placeholder = "Paste new URL to replace";
        } else {
            detectedLogo.value = "Not detected";
        }

        // Detect Company
        const footerCopyright = doc.querySelectorAll('footer p, .copyright, .footer-text, .footer-copyright');
        let foundCompany = false;
        for (let el of footerCopyright) {
            if (el.innerText.includes('©') || el.innerText.toLowerCase().includes('copyright')) {
                detectedCompany.value = el.innerText.replace(/[^a-zA-Z0-9 ]/g, "").trim().substring(0, 30) + "...";
                foundCompany = true;
                break;
            }
        }
        if (!foundCompany) detectedCompany.value = "Not detected";
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

        // Apply Company Name (Footer usually)
        if (companyNameInput.value) {
            const footerCopyright = doc.querySelectorAll('footer p, .copyright, .footer-text');
            footerCopyright.forEach(el => {
                if (el.innerText.includes('©') || el.innerText.toLowerCase().includes('copyright')) {
                    // Start of regex replacement would be better, but simple append/replace for now
                    el.innerText = `© ${new Date().getFullYear()} ${companyNameInput.value}. All rights reserved.`;
                }
            });
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
