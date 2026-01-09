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
    const deviceBtns = document.querySelectorAll('.device-btn');
    const previewContainer = document.querySelector('.preview-container');
    const copyBtn = document.getElementById('copyBtn');
    const copyPromptBtn = document.getElementById('copyPromptBtn');

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
        purpleModern: {
            primary: '#8B5CF6', primaryHover: '#7C3AED', secondary: '#F472B6',
            gradientMain: '#8B5CF6', gradientAccent: '#EC4899', sidebar: '#2E1065',
            bg: '#F9FAFB', surface: '#FFFFFF', textMain: '#1F2937', textMuted: '#6B7280', border: '#E5E7EB', font: 'Inter, sans-serif',
            bgSoft: 'rgba(139, 92, 246, 0.1)' // Transparent Purple (Fixed from Solid)
        },
        emeraldFresh: {
            primary: '#10B981', primaryHover: '#059669', secondary: '#6EE7B7',
            gradientMain: '#10B981', gradientAccent: '#34D399', sidebar: '#064E3B',
            bg: '#ECFDF5', surface: '#FFFFFF', textMain: '#065F46', textMuted: '#047857', border: '#6EE7B7', font: 'Inter, sans-serif',
            bgSoft: '#D1FAE5' // Light Emerald
        },
        blueOcean: {
            primary: '#0284C7', primaryHover: '#0369A1', secondary: '#7DD3FC',
            gradientMain: '#0284C7', gradientAccent: '#0EA5E9', sidebar: '#0C4A6E',
            bg: '#F0F9FF', surface: '#FFFFFF', textMain: '#0C4A6E', textMuted: '#0369A1', border: '#BAE6FD', font: 'Inter, sans-serif',
            bgSoft: '#E0F2FE' // Light Sky
        },
        darkNeon: {
            primary: '#D946EF', primaryHover: '#C026D3', secondary: '#22D3EE',
            gradientMain: '#D946EF', gradientAccent: '#8B5CF6', sidebar: '#000000',
            bg: '#111827', surface: '#1F2937', textMain: '#F9FAFB', textMuted: '#9CA3AF', border: '#374151', font: 'Inter, sans-serif',
            bgSoft: 'rgba(217, 70, 239, 0.15)' // Transparent Neon Pink
        },
        sunsetCreative: {
            primary: '#F97316', primaryHover: '#EA580C', secondary: '#FDBA74',
            gradientMain: '#F97316', gradientAccent: '#EC4899', sidebar: '#431407',
            bg: '#FFF7ED', surface: '#FFFFFF', textMain: '#431407', textMuted: '#9A3412', border: '#FED7AA', font: 'Poppins, sans-serif',
            bgSoft: '#FFEDD5' // Light Orange
        },
        midnightIndigo: {
            primary: '#6366F1', primaryHover: '#4F46E5', secondary: '#818CF8',
            gradientMain: '#4338CA', gradientAccent: '#312E81', sidebar: '#1E1B4B',
            bg: '#0F172A', surface: '#1E293B', textMain: '#F8FAFC', textMuted: '#94A3B8', border: '#334155', font: 'Inter, sans-serif',
            bgSoft: 'rgba(99, 102, 241, 0.15)' // Transparent Indigo
        },
        mintGlass: {
            primary: '#14B8A6', primaryHover: '#0D9488', secondary: '#5EEAD4',
            gradientMain: '#14B8A6', gradientAccent: '#2DD4BF', sidebar: '#F0FDFA',
            bg: '#F0FDFA', surface: 'rgba(255,255,255,0.7)', textMain: '#134E4A', textMuted: '#0F766E', border: '#99F6E4', font: 'Inter, sans-serif',
            bgSoft: '#CCFBF1' // Light Mint
        },
        roseElegant: {
            primary: '#E11D48', primaryHover: '#BE123C', secondary: '#FB7185',
            gradientMain: '#E11D48', gradientAccent: '#F43F5E', sidebar: '#881337',
            bg: '#FFF1F2', surface: '#FFFFFF', textMain: '#881337', textMuted: '#BE123C', border: '#FDA4AF', font: 'Inter, sans-serif',
            bgSoft: '#FFE4E6' // Light Rose
        },
        tealProfessional: {
            primary: '#0D9488', primaryHover: '#115E59', secondary: '#5EEAD4',
            gradientMain: '#0F766E', gradientAccent: '#115E59', sidebar: '#134E4A',
            bg: '#F1F5F9', surface: '#FFFFFF', textMain: '#0F172A', textMuted: '#475569', border: '#CBD5E1', font: 'Inter, sans-serif',
            bgSoft: '#E2E8F0' // Light Slate
        },
        monochromePro: {
            primary: '#1F2937', primaryHover: '#000000', secondary: '#9CA3AF',
            gradientMain: '#374151', gradientAccent: '#1F2937', sidebar: '#000000',
            bg: '#F3F4F6', surface: '#FFFFFF', textMain: '#111827', textMuted: '#4B5563', border: '#D1D5DB', font: 'Inter, sans-serif',
            bgSoft: '#E5E7EB' // Light Gray
        }
    };

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

            // Inject Aggressive Fix Script
            // We append a script that runs immediately after load to fix stubborn elements
            const fixScript = `
                <script>
                    (function() {
                        function aggressiveFix() {
                            // 1. HEADER SHAPE TERMINATOR
                            const header = document.querySelector('header, .main-header, .app-header');
                            if (header) {
                                // Find any child that has a border-radius > 50% or "circle" class
                                // Or has a background color that is teal/cyan/green
                                const children = header.querySelectorAll('*');
                                children.forEach(child => {
                                    const style = window.getComputedStyle(child);
                                    const bg = style.backgroundColor;
                                    
                                    // Check for dangerous colors (teal, green, cyan)
                                    // Simple check: simple regex for greenish hues or specific hexes if known
                                    // For now, checks for "rgb(..." values that have high G/B and low R
                                    
                                    // SHAPE REMOVAL: Check if it looks like a decorative shape
                                    if (style.position === 'absolute' || style.borderRadius === '50%' || style.borderRadius.includes('100%') || style.borderRadius.includes('999px')) {
                                         // Hide it
                                         child.style.display = 'none';
                                    }
                                });
                            }

                            // 4. ULTRA-AGGRESSIVE INFO BOX FIX (For "green transparent table")
                            // We look specifically for the element structure shown in screenshots:
                            // A box with an icon (i) and text.
                            const potentialInfoBoxes = document.querySelectorAll('div, table, section, .alert, .box');
                            potentialInfoBoxes.forEach(el => {
                                const style = window.getComputedStyle(el);
                                const bg = style.backgroundColor;
                                
                                // Check if it matches the "Unggah 2-5 gambar" text content
                                if (el.innerText && el.innerText.includes('Unggah 2-5 gambar')) {
                                     el.style.backgroundColor = 'var(--color-bg-soft)';
                                     el.style.borderColor = 'var(--color-primary)';
                                     el.style.color = 'var(--color-text-main)';
                                     // Also color the icon inside if any
                                     const icon = el.querySelector('i, svg');
                                     if(icon) icon.style.color = 'var(--color-primary)';
                                     return;
                                }

                                // General Green/Cyan detection (low R, high G/B)
                                if (bg.includes('rgba') || bg.includes('rgb')) {
                                    const rgb = bg.match(/\\d+/g);
                                    if (rgb && rgb.length >= 3) {
                                        const r = parseInt(rgb[0]);
                                        const g = parseInt(rgb[1]);
                                        const b = parseInt(rgb[2]);
                                        
                                        // Mint/Green detection: r~200, g~250, b~240 or r~220, g~252, b~231
                                        if (g > 200 && b > 200 && r < 230) {
                                            el.style.backgroundColor = 'var(--color-bg-soft)';
                                            el.style.borderColor = 'var(--color-primary)';
                                        }
                                    }
                                }
                            });
                        }

                            // 3. TUTORIAL BUTTON TERMINATOR AND HEADER TEXT FIX
                            // Force Header Text to be white explicitly in JS if CSS fails
                            const headerEls = document.querySelectorAll('header *, .main-header *, .app-header *');
                            headerEls.forEach(el => {
                                el.style.color = '#FFFFFF';
                                if (window.getComputedStyle(el).webkitTextFillColor) {
                                    el.style.webkitTextFillColor = '#FFFFFF';
                                }
                            });

                            // Remove "Tonton Video Tutorial" - ROBUST VERSION
                            // 1. Search everything
                            const allElements = document.body.getElementsByTagName('*');
                            for (let i = 0; i < allElements.length; i++) {
                                const el = allElements[i];
                                // Check direct text content to avoid shielding by parents
                                if (el.childNodes.length > 0) {
                                    el.childNodes.forEach(node => {
                                         if (node.nodeType === Node.TEXT_NODE && node.nodeValue.toLowerCase().includes('tonton video tutorial')) {
                                             // Found the text node, now find the actionable parent (button/link/div acting as button)
                                             let target = el;
                                             // Walk up a few levels to see if we are inside a button-like wrapper
                                             let parent = el.parentElement;
                                             while(parent && parent !== document.body && (
                                                 parent.tagName === 'BUTTON' || 
                                                 parent.tagName === 'A' || 
                                                 parent.className.includes('btn') ||
                                                 parent.style.cursor === 'pointer'
                                             )) {
                                                 target = parent;
                                                 parent = parent.parentElement;
                                             }
                                             target.style.display = 'none';
                                             target.style.visibility = 'hidden';
                                         }
                                    });
                                }
                            }
                        }

                        // MutationObserver to catch late arrivals
                        const observer = new MutationObserver((mutations) => {
                            aggressiveFix();
                        });
                        observer.observe(document.body, { childList: true, subtree: true });
                        
                        // Run immediately and after a short delay
                        aggressiveFix();
                        setTimeout(aggressiveFix, 500);
                        setTimeout(aggressiveFix, 1500);
                        window.addEventListener('load', aggressiveFix);
                    })();
                </script>
            `;

            // Insert script before closing body
            const finalHtml = modHtml.replace('</body>', fixScript + '</body>');

            const blob = new Blob([finalHtml], { type: 'text/html' });
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
        const theme = themeConfigs[selectedThemeKey] || themeConfigs['purpleModern'];

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
        if (!isOriginal && theme) {
            const styleTag = doc.createElement('style');

            // 1. Define Variables & Overrides
            const css = `
                :root {
                    --color-primary: ${theme.primary} !important;
                    --color-primary-hover: ${theme.primaryHover} !important;
                    --color-secondary: ${theme.secondary} !important;
                    --color-gradient-main: ${theme.gradientMain} !important;
                    --color-gradient-accent: ${theme.gradientAccent} !important;
                    --color-sidebar: ${theme.sidebar} !important;
                    --color-bg: ${theme.bg} !important;
                    --color-surface: ${theme.surface} !important;
                    --color-text-main: ${theme.textMain} !important;
                    --color-text-muted: ${theme.textMuted} !important;
                    --color-border: ${theme.border} !important;
                    --color-bg-soft: ${theme.bgSoft} !important;
                    --color-bg-soft: ${theme.bgSoft} !important;
                    --theme-font: ${fontFamilyInput.value || theme.font} !important;
                }
                
                body, html {
                    background-color: var(--color-bg) !important;
                    color: var(--color-text-main) !important;
                    font-family: var(--theme-font) !important;
                }
                
                /* Override background style if gradient is selected via manual input */
                ${bgStyleInput.value === 'gradient' ? `
                body, html {
                    background: linear-gradient(135deg, var(--color-bg), var(--color-bg-soft)) !important; 
                }
                ` : ''}

                ${bgStyleInput.value === 'dark' ? `
                body, html {
                   background-color: #0f172a !important;
                   color: #f8fafc !important;
                }
                ` : ''}
                
                /* Sidebar: Enforce Gradient Background */
                .sidebar, aside, .sidebar-wrapper, .nav-sidebar {
                    background: linear-gradient(180deg, var(--color-gradient-main) 0%, var(--color-sidebar) 100%) !important;
                    color: #FFFFFF !important;
                    border-right: 1px solid var(--color-border) !important;
                }

                /* Header: Enforce Gradient Background (Dynamic Theme) */
                header, .main-header, .sidebar-header, .app-header, .brand-section, 
                .hero, .hero-section, .banner, .top-bar {
                    background: linear-gradient(90deg, var(--color-gradient-main), var(--color-gradient-accent)) !important;
                    color: #FFFFFF !important;
                }
                
                /* Ensure Header Text is White */
                header *, .main-header *, .sidebar-header *, .app-header *, .brand-section *, 
                .hero *, .hero-section *, .banner * {
                    color: #FFFFFF !important;
                }

                /* Sidebar Text Elements - NUCLEAR OPTION: FORCE EVERYTHING WHITE */
                /* This fixes the "Edit & Gabung" gray text issue */
                .sidebar *, .sidebar-wrapper *, aside *, .nav-sidebar * {
                    color: #FFFFFF !important;
                    opacity: 1 !important;
                    text-shadow: none !important;
                }
                
                /* Exceptions for Badges (Backgrounds) */
                /* Only reset background/border, keep text white */
                .sidebar .badge, .sidebar .label, .sidebar .tag {
                     background: rgba(255,255,255,0.2) !important;
                     color: #FFFFFF !important;
                }

                /* --- TARGETING THE "CURVED GREEN" SHAPE --- */
                /* Remove commonly used shape dividers or pseudo-elements in headers */
                header::before, header::after, 
                .main-header::before, .main-header::after,
                .header-shape, .wave, .curve, .separator, .divider, .shape-divider,
                .branding-header::before, .branding-header::after {
                    background: none !important;
                    background-image: none !important;
                    display: none !important;
                    opacity: 0 !important;
                    content: none !important;
                }
                
                /* Ensure no background image interferes */
                header, .main-header {
                    background-image: linear-gradient(90deg, var(--color-gradient-main), var(--color-gradient-accent)) !important;
                    position: relative; 
                    z-index: 10;
                    background-image: linear-gradient(90deg, var(--color-gradient-main), var(--color-gradient-accent)) !important;
                    position: relative; 
                    z-index: 10;
                    overflow: visible !important; /* Allow content but hide shapes */
                }
                
                /* Extra Specific Shape Killer */
                header div[class*="shape"], header div[class*="circle"], 
                header div[class*="bg-"], header img[class*="shape"] {
                    display: none !important;
                }

                /* Force Text White in Header - Specific Overrides */
                header h1, header h2, header h3, header p, header span, header small,
                .brand-name, .app-title, .subtitle, .tagline {
                    color: #FFFFFF !important;
                    -webkit-text-fill-color: #FFFFFF !important; /* Override gradients on text */
                }

                /* Sidebar Links & Buttons: CLEAN STYLE */
                .sidebar a, .nav-link, .sidebar button, .sidebar .btn {
                    background: transparent !important;
                    background-image: none !important;
                    color: #FFFFFF !important; /* Force pure white */
                    box-shadow: none !important;
                    border: none !important;
                    text-align: left !important;
                    font-weight: 500 !important;
                    transition: all 0.2s ease !important;
                }

                /* Sidebar Active/Hover: Brighter Gradient */
                .sidebar a:hover, .nav-link:hover, .sidebar button:hover, .sidebar .btn:hover, 
                .sidebar .active, .nav-item.active {
                    background: linear-gradient(90deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1)) !important;
                    color: #FFFFFF !important;
                    border-radius: 8px !important;
                    padding-left: 12px !important;
                }
                
                /* Main Action Buttons (Keep these Bold & Gradient) */
                main .btn, main button, .primary-btn, .action-btn {
                    background: linear-gradient(135deg, var(--color-gradient-main), var(--color-gradient-accent)) !important;
                    color: white !important;
                    border: none !important;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2) !important;
                }
                
                /* Surface / Cards */
                .card, .panel, .glass-panel, .surface {
                    background-color: var(--color-surface) !important;
                    border: 1px solid var(--color-border) !important;
                    color: var(--color-text-main) !important;
                }

                /* --- TARGETING THE "GREEN TABLE" (INFO BOX) --- */
                .alert, .note, .instruction, .info-box, .message-box, 
                div[class*="info"], div[class*="note"], div[class*="alert"],
                .success, .alert-success, div[class*="success"],
                .box, .notice, .callout,
                table[class*="info"], table[class*="note"], table[class*="alert"], table[class*="success"],
                .tutorial-box, .tip {
                    background-color: var(--color-bg-soft) !important; /* Soft Theme Background */
                    border: 1px solid var(--color-primary-hover) !important; /* Slightly darker border */
                    color: var(--color-text-main) !important;
                    border-radius: 12px !important;
                }
                .alert i, .note i, .instruction i, .info-box i {
                    color: var(--color-primary) !important;
                }

                /* General Headings */
                main h1, main h2, main h3, main h4 { color: var(--color-text-main) !important; }
                main p { color: var(--color-text-muted) !important; }
                
                /* Links */
                a { color: var(--color-primary) !important; text-decoration: none; }
            `;

            styleTag.innerHTML = css;
            doc.head.appendChild(styleTag);
        }

        // --- D. Javascript String Literal Replacement (The Root Cause Fix) ---
        // The footer (and other parts) are likely rendered by JS. 
        // Our previous methods skipped <script> tags for safety. 
        // Now we carefully replace specific string literals INSIDE the scripts.

        const scriptTags = doc.querySelectorAll('script');
        scriptTags.forEach(script => {
            if (script.src) return; // Skip external scripts
            let jsContent = script.innerHTML;
            let jsModified = false;

            // Helper to safely replace string literals in JS
            // We look for quotes to ensure we are replacing value strings, not variable names
            // exact match for safe replacement

            // 1. Company Name
            if (currentDetectedComp && currentDetectedComp !== "Not detected" && companyName) {
                // Regex to match "Ichsan Labs" or 'Ichsan Labs'
                // We don't use \b because of spaces. 
                // We hope it's a unique enough string.
                if (jsContent.includes(currentDetectedComp)) {
                    // Global replace of the string
                    const re = new RegExp(currentDetectedComp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                    jsContent = jsContent.replace(re, companyName);
                    jsModified = true;
                }
            }

            // 2. Brand Name
            if (currentDetectedBrand && currentDetectedBrand !== "Not detected" && brandName) {
                if (jsContent.includes(currentDetectedBrand)) {
                    const re = new RegExp(currentDetectedBrand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                    jsContent = jsContent.replace(re, brandName);
                    jsModified = true;
                }
            }

            // 3. Slogan
            if (currentDetectedSlogan && currentDetectedSlogan !== "Not detected" && slogan) {
                if (jsContent.includes(currentDetectedSlogan)) {
                    const re = new RegExp(currentDetectedSlogan.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                    jsContent = jsContent.replace(re, slogan);
                    jsModified = true;
                }
            }

            // 4. Hardcoded Fallbacks (for known patterns like "Ichsan Labs")
            if (companyName) {
                if (/["']Ichsan Labs["']/i.test(jsContent)) {
                    jsContent = jsContent.replace(/Ichsan Labs/gi, companyName);
                    jsModified = true;
                }
            }

            if (jsModified) {
                script.innerHTML = jsContent;
            }
        });

        // --- E. Nav Renaming (Preserved) ---
        if (currentNavItems.length > 0) {
            const allLinks = doc.querySelectorAll('a, button, [role="button"], .nav-item, li');
            currentNavItems.forEach((item, idx) => {
                const input = document.getElementById(`nav-item-${idx}`);
                if (input && input.value && input.value !== item.original) {
                    replaceGlobalText(doc.body, item.original, input.value);
                }
            });
        }

        // CRITICAL: Ensure strict DOCTYPE to prevent Quirks Mode issues
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
    // Copy Prompt
    if (copyPromptBtn) {
        copyPromptBtn.addEventListener('click', () => {
            const brand = brandNameInput.value || "app";
            // Clean filename: lower case, spaces to underscores
            const filename = brand.toLowerCase().replace(/\s+/g, '_') + ".html";
            const promptText = `create an empty file called "${filename}"`;

            navigator.clipboard.writeText(promptText).then(() => {
                const originalHtml = copyPromptBtn.innerHTML;
                copyPromptBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
                setTimeout(() => {
                    copyPromptBtn.innerHTML = originalHtml;
                }, 2000);
            });
        });
    }

    // Copy Code (Obfuscated)
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const rawHtml = generateModifiedHtml(htmlInput.value);

            // Obfuscate using escape/unescape as requested
            // Default company for comment: Flowsstack
            const comp = "Flowsstack";

            const escaped = escape(rawHtml);
            const finalCode = `<script>\n<!--code by ${comp} -->\ndocument.write(unescape("${escaped}"));\n</script>`;

            navigator.clipboard.writeText(finalCode).then(() => {
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
