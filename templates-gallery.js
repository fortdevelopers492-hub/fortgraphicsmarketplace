// Local Database of Templates with Relative Paths & Array of Previews
const FORT_TEMPLATES_DATA = [
    {
        id: 0,
        type: "design", // Options: "asset" or "design"
        name: "Birthday Flyer With Name (Icy and Colourful)",
        price: 1500,
        previews: [
            "assets/Public/HBD_FortunateOsas_fortgraphics_design_yu2fv3hqfwcd8.png",
            "assets/Private/HBD_FortunateOsas.jfif"
        ],
        downloadSrc: "./assets/private/downloads/templates/unavailable.zip",
    },
    {
        id: 1,
        type: "asset",
        name: "POS Image No Background For Flyer Design",
        price: 500,
        previews: [
            "assets/private/images/External/POS Image_1.png"
        ],
        downloadSrc: "assets/private/downloads/External/Unpacked/POS_Image_1.zip"
    },
    {
        id: 2,
        type: "asset",
        name: "Attractive Blue Background Graphic Design Pack (25 images + Up to 7 addons)",
        price: 2000,
        previews: [
            "assets/Public/Preview3gdsjcs.png",
            "assets/private/images/External/1 5.jpg",
            "assets/private/images/External/1 r.jpg",
            "assets/private/images/External/1f.jpg",
            "assets/private/images/External/8FjWp1r.jpg",
            "assets/private/images/External/12SWKh.jpg",
            "assets/private/images/External/28939158-blue-background-vintage-pattern-hand-drawn-abstract-background-decorative-retro-banner-invitation,-w.jpg",
            "assets/private/images/External/33305554-vintage-floral-pattern-on-a-blue-background.jpg",
            "assets/private/images/External/abstract_blue_background_vector_set_551340.jpg",
            "assets/private/images/External/abstract_blue_vector_background_with_blending_blur_lines_267685.jpg",
            "assets/private/images/External/abstract_blue_wave_311119.jpg",
            "assets/private/images/External/abstract_blue_wave_background_editable_vector_graphic_569506.jpg",
            "assets/private/images/External/Abstract-Blue-Background-Art-Vector-Graphic.jpg",
            "assets/private/images/External/abstract-blue-background-image.jpg",
            "assets/private/images/External/abstract-blue-background-vector-graphic_51-12354.jpg",
            "assets/private/images/External/blue-background-1371587809Phv.jpg",
            "assets/private/images/External/Blue-Background-6A.jpg",
            "assets/private/images/External/blue-abstract-background-texture.jpg",
            "assets/private/images/External/blue-abstract-background-vector-illustration-239532.jpg",
            "assets/private/images/External/webbackground-royalblue.jpg",
            "assets/private/images/External/blue-background_1344-24.jpg",
            "assets/private/images/External/blue-wallpaper20.jpg",
            "assets/private/images/External/Blue-Background-657.jpg",
            "assets/private/images/External/blue-abstract-background-texture.jpg",
            "assets/private/images/External/blue-abstract-background-in-low-poly-style_1035-59.jpg",
            "assets/private/images/External/+ 7 more bluebackgrounds.png"
        ],
        downloadSrc: "assets/private/downloads/External/Packed/Attracrive_Blue_Background_Graphic_Design_Pack_(25 images+More_than_5_Addons).zip"
    },    
];

/**
 * Utility: Converts strings to URL-friendly slugs
 */
function createTemplateSlug(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

// Helper: Standardize preview array
function getTemplatePreviews(template) {
    if (Array.isArray(template.previews) && template.previews.length > 0) {
        return template.previews;
    }
    if (template.previewSrc) {
        return [template.previewSrc];
    }
    return ["assets/images/placeholder.png"];
}

/**
 * Native Share handler for template preview modal
 */
async function shareTemplateDetails(templateIndex) {
    const template = FORT_TEMPLATES_DATA[templateIndex];
    if (!template) return;

    const shareBtn = document.getElementById(`share-btn-${templateIndex}`);
    if (shareBtn) {
        shareBtn.disabled = true;
        shareBtn.innerText = "⏳ Sharing...";
    }

    const previewImages = getTemplatePreviews(template);
    const hasMultipleImages = previewImages.length > 1;

    const templateSlug = createTemplateSlug(template.name);
    const shareUrl = `${window.location.origin}${window.location.pathname}?template=${templateSlug}&tid=${template.id}`;
    const shareText = `${shareUrl}\n${template.name} | Fort Graphics\nThis template was shared from Fort Graphics - graphics.fort-site.com.ng`;

    if (!hasMultipleImages) {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: `${template.name} | Fort Graphics`,
                    text: shareText,
                    url: shareUrl
                });
            } else {
                await navigator.clipboard.writeText(shareText);
                alert("Share link copied to clipboard!");
            }
        } catch (err) {
            console.warn("User cancelled or share failed:", err);
        } finally {
            if (shareBtn) {
                shareBtn.disabled = false;
                shareBtn.innerText = "🔗 Share";
            }
        }
        return;
    }

    const targetModal = document.querySelector("#template-preview-modal .modal-box-expanded");
    if (!targetModal) {
        if (shareBtn) {
            shareBtn.disabled = false;
            shareBtn.innerText = "🔗 Share";
        }
        return;
    }

    const clone = targetModal.cloneNode(true);
    clone.style.position = "fixed";
    clone.style.top = "-9999px";
    clone.style.left = "-9999px";
    clone.style.width = targetModal.offsetWidth + "px";
    clone.style.backgroundColor = "#ffffff";
    clone.style.padding = "24px";
    clone.style.borderRadius = "8px";
    clone.style.zIndex = "-9999";

    const closeBtn = clone.querySelector("button[onclick*='closeTemplatePreviewModal']");
    if (closeBtn) closeBtn.remove();

    const thumbnails = clone.querySelector("#template-thumbnails-container");
    if (thumbnails) thumbnails.remove();

    const navBtns = clone.querySelectorAll("button[onclick*='changeTemplateSlide']");
    navBtns.forEach(btn => btn.remove());

    const counterBadge = clone.querySelector("#tmpl-counter-badge");
    if (counterBadge) counterBadge.remove();

    const actionRow = clone.querySelector(".template-modal-action-row");
    if (actionRow) actionRow.remove();

    const cloneImg = clone.querySelector("#active-template-preview-img");
    if (cloneImg) {
        cloneImg.src = previewImages[0];
    }

    const brandingTag = document.createElement("div");
    brandingTag.style.marginTop = "15px";
    brandingTag.style.fontWeight = "bold";
    brandingTag.style.color = "#09a5db";
    brandingTag.style.fontSize = "14px";
    brandingTag.style.textAlign = "center";
    brandingTag.textContent = "Visit graphics.fort-site.com.ng";
    clone.appendChild(brandingTag);

    document.body.appendChild(clone);

    try {
        if (typeof html2canvas === "undefined") {
            await new Promise((resolve, reject) => {
                const script = document.createElement("script");
                script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        const canvas = await html2canvas(clone, { useCORS: true, logging: false });
        document.body.removeChild(clone);

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        const imageFileName = `${templateSlug}.png`;
        const imageFile = new File([blob], imageFileName, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [imageFile] })) {
            await navigator.share({
                title: `${template.name} | Fort Graphics`,
                text: shareText,
                files: [imageFile]
            });
        } else if (navigator.share) {
            await navigator.share({
                title: `${template.name} | Fort Graphics`,
                text: shareText,
                url: shareUrl
            });
        } else {
            await navigator.clipboard.writeText(shareText);
            const downloadLink = document.createElement("a");
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = imageFileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(downloadLink.href);

            alert("Share text copied to clipboard and template image downloaded!");
        }
    } catch (error) {
        if (document.body.contains(clone)) {
            document.body.removeChild(clone);
        }
        console.error("Error sharing template:", error);
    } finally {
        if (shareBtn) {
            shareBtn.disabled = false;
            shareBtn.innerText = "🔗 Share";
        }
    }
}

// Render Section Content
// Render Section Content
function renderFortTemplatesSection() {
    const container = document.getElementById("templates-grid-container");
    if (!container) return;

    // Get current global search query from APP_STATE
    const query = APP_STATE?.searchQuery || "";

    // Filter templates matching template name or type
    const filteredTemplates = FORT_TEMPLATES_DATA.filter(template => {
        const matchesName = template.name?.toLowerCase().includes(query);
        const matchesType = template.type?.toLowerCase().includes(query);
        return matchesName || matchesType;
    });

    // Handle Empty Search Results State
    if (filteredTemplates.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--fort-gray-slate, #718096);">
                <h4>No templates match "${query}"</h4>
                <p style="font-size: 0.85rem;">Try searching for a different keyword or design type.</p>
            </div>`;
        return;
    }

    container.innerHTML = filteredTemplates.map((template) => {
        // Retrieve original index from main dataset for modal compatibility
        const originalIndex = FORT_TEMPLATES_DATA.findIndex(t => t.id === template.id);
        const previewImages = getTemplatePreviews(template);
        const coverImage = previewImages[0];
        const imageCount = previewImages.length;
        const isDesignType = template.type === "design";        

        // Action text based on template type
        const actionBtnLabel = isDesignType 
            ? `Get your Customized Version (₦${template.price.toLocaleString()})`
            : `Preview & Download (₦${template.price.toLocaleString()})`;

        return `
            <div class="fort-template-card" data-template-id="${template.id}">
                <div class="fort-image-container" onclick="event.preventDefault(); openTemplatePreviewModal(${originalIndex})" oncontextmenu="return false;" style="position:relative;">
                    <img src="${coverImage}" alt="${template.name}" loading="lazy" draggable="false" ondragstart="return false;">
                    <div class="fort-watermark">Designed / Imported By Fort Graphics</div>
                    ${imageCount > 1 ? `<span style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.7); color:white; font-size:0.75rem; padding:4px 8px; border-radius:12px; font-weight:600;">📷 ${imageCount} Images</span>` : ''}
                </div>
                <div class="fort-card-body">
                    <h3 class="fort-template-name">${template.name}</h3>
                    <button class="btn-fort-download" onclick="openTemplatePreviewModal(${originalIndex})">
                        ${actionBtnLabel}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

let currentTemplateSlideIndex = 0;
let currentTemplateActiveId = null;

function closeTemplatePreviewModal(cleanHistory = true) {
    const modal = document.getElementById("template-preview-modal");
    if (modal) {
        modal.remove();
    }

    document.title = "Fort Graphics - Templates & Resources";

    if (cleanHistory && window.location.search) {
        const cleanUrl = `${window.location.origin}${window.location.pathname}`;
        window.history.pushState({}, "", cleanUrl);
    }
}

// Expanded Preview Modal Function
function openTemplatePreviewModal(templateIndex, pushHistory = true) {
    const template = FORT_TEMPLATES_DATA[templateIndex];
    if (!template) return;

    const previewImages = getTemplatePreviews(template);
    currentTemplateSlideIndex = 0; 
    currentTemplateActiveId = templateIndex;

    document.title = `${template.name} | Fort Graphics`;

    if (pushHistory) {
        const templateSlug = createTemplateSlug(template.name);
        const newUrl = `${window.location.origin}${window.location.pathname}?template=${templateSlug}&tid=${template.id}`;
        window.history.pushState({ tid: template.id }, "", newUrl);
    }

    let existingModal = document.getElementById("template-preview-modal");
    if (existingModal) existingModal.remove();

    const previewModal = document.createElement("div");
    previewModal.id = "template-preview-modal";
    previewModal.className = "modal-overlay active";
    previewModal.setAttribute("data-active-template-id", templateIndex);
    previewModal.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.75); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;";


    const thumbnailsHTML = previewImages.length > 1 ? `
        <div style="display:flex; gap:8px; margin-top:12px; overflow-x:auto; padding-bottom:4px;" id="template-thumbnails-container">
            ${previewImages.map((src, idx) => `
                <div onclick="switchTemplateSlide(${idx})" id="tmpl-thumb-${idx}" 
                    oncontextmenu="return false;" 
                    style="width:60px; height:60px; flex-shrink:0; background-image:url('${src}'); background-size:cover; background-position:center; border-radius:4px; cursor:pointer; border: 2px solid ${idx === 0 ? '#09a5db' : 'transparent'}; opacity:${idx === 0 ? '1' : '0.6'}; transition: all 0.2s ease;">
                </div>
            `).join('')}
        </div>
    ` : '';

    const navButtonsHTML = previewImages.length > 1 ? `
        <button type="button" onclick="changeTemplateSlide(-1)" style="position:absolute; left:10px; top:50%; transform:translateY(-50%); background:rgba(0,0,0,0.6); color:white; border:none; width:36px; height:36px; border-radius:50%; cursor:pointer; font-size:1.2rem; display:flex; align-items:center; justify-content:center; z-index:5;">&#10094;</button>
        <button type="button" onclick="changeTemplateSlide(1)" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); background:rgba(0,0,0,0.6); color:white; border:none; width:36px; height:36px; border-radius:50%; cursor:pointer; font-size:1.2rem; display:flex; align-items:center; justify-content:center; z-index:5;">&#10095;</button>
    ` : '';

    const isDesignType = template.type === "design";
    const primaryActionButtonHTML = isDesignType
        ? `<button class="btn-fort-download" style="width:auto; padding:10px 24px; background-color:#09a5db;" onclick="closeTemplatePreviewModal(false); launchCustomDesignRequestModal(${templateIndex});">
            🎨 Request Customized Version
           </button>`
        : `<button class="btn-fort-download" style="width:auto; padding:10px 24px;" onclick="closeTemplatePreviewModal(false); launchTemplatePaymentCheckoutModal(${templateIndex});">
            Proceed to Download
           </button>`;

    // Updated header structure and button wrappers inside openTemplatePreviewModal
    previewModal.innerHTML = `
        <div class="modal-box-expanded scrollable-container" style="background: white; border-radius: 8px; max-width: 700px; width: 100%; padding: 24px; position: relative;">
            <!-- Header Container -->
            <div class="template-modal-header">
                <button onclick="closeTemplatePreviewModal()" class="template-modal-close-btn" aria-label="Close">&times;</button>
                <h3 class="template-modal-title">
                    ${template.name} 
                    ${previewImages.length > 1 ? `<span id="tmpl-counter-badge" style="font-size:0.85rem; color:#64748b; font-weight:normal; margin-left:8px;">(1/${previewImages.length})</span>` : ''}
                </h3>
            </div>
            
            <!-- Image Preview Container -->
            <div class="expanded-template-preview-box" oncontextmenu="return false;" style="position:relative; display:flex; justify-content:center; align-items:center; background:#f8fafc; border-radius:6px; min-height:250px;">
                ${navButtonsHTML}
                <img id="active-template-preview-img" src="${previewImages[0]}" alt="${template.name}" draggable="false" ondragstart="return false;" style="max-height:400px; width:auto; object-fit:contain;">
                <div class="fort-watermark">Designed / Imported By Fort Graphics</div>
            </div>

            ${thumbnailsHTML}

            <!-- Action Row -->
            <div class="template-modal-action-row">
                <span class="template-modal-price">Price: ₦${template.price.toLocaleString()}</span>
                <div class="template-modal-buttons">
                    <button id="share-btn-${templateIndex}" class="btn-green" style="padding:10px 18px; background:#22c55e; color:white; border:none; border-radius:4px; font-weight:600; cursor:pointer;" onclick="shareTemplateDetails(${templateIndex})">
                        📤 Share
                    </button>
                    ${primaryActionButtonHTML}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(previewModal);
}

function changeTemplateSlide(direction) {
    if (currentTemplateActiveId === null) return;
    const template = FORT_TEMPLATES_DATA[currentTemplateActiveId];
    if (!template) return;

    const previewImages = getTemplatePreviews(template);
    if (previewImages.length <= 1) return;

    let targetIndex = (currentTemplateSlideIndex + direction + previewImages.length) % previewImages.length;
    switchTemplateSlide(targetIndex);
}

function switchTemplateSlide(index) {
    if (currentTemplateActiveId === null) return;
    const template = FORT_TEMPLATES_DATA[currentTemplateActiveId];
    if (!template) return;

    const previewImages = getTemplatePreviews(template);
    if (!previewImages[index]) return;

    currentTemplateSlideIndex = index;

    const imgElement = document.getElementById("active-template-preview-img");
    if (imgElement) {
        imgElement.src = previewImages[index];
    }

    previewImages.forEach((_, idx) => {
        const thumb = document.getElementById(`tmpl-thumb-${idx}`);
        if (thumb) {
            thumb.style.borderColor = (idx === index) ? '#09a5db' : 'transparent';
            thumb.style.opacity = (idx === index) ? '1' : '0.6';
        }
    });

    const counterBadge = document.getElementById("tmpl-counter-badge");
    if (counterBadge) {
        counterBadge.textContent = `(${index + 1}/${previewImages.length})`;
    }
}

function handleTemplateUrlRouting() {
    const urlParams = new URLSearchParams(window.location.search);
    const tid = urlParams.get('tid');

    if (tid !== null && tid !== undefined) {
        const templateIndex = FORT_TEMPLATES_DATA.findIndex(t => String(t.id) === String(tid));
        if (templateIndex !== -1) {
            openTemplatePreviewModal(templateIndex, false);
        }
    } else {
        closeTemplatePreviewModal(false);
    }
}

/* ==========================================================================
   ASSET TEMPLATE PAYMENT & DOWNLOAD WORKFLOW
   ========================================================================== */

function launchTemplatePaymentCheckoutModal(templateIndex) {
    const currentUser = (typeof APP_STATE !== 'undefined' && APP_STATE.currentUser) ? APP_STATE.currentUser : null;
    if (!currentUser || !currentUser.uid) {
        if (typeof showTopRightToast === 'function') {
            showTopRightToast("Login to purchase templates", "error");
        } else {
            alert("Login to purchase templates");
        }
        return;
    }

    const template = FORT_TEMPLATES_DATA[templateIndex];
    if (!template) return;

    let existingModal = document.getElementById("paystack-checkout-modal");
    if (existingModal) existingModal.remove();

    const checkoutModalContainer = document.createElement("div");
    checkoutModalContainer.id = "paystack-checkout-modal";
    checkoutModalContainer.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;";

    const userEmail = APP_STATE.currentUser.identifierText || APP_STATE.currentUser.email || 'user@fortmart.com';

    checkoutModalContainer.innerHTML = `
        <div class="paystack-modal-box" style="background: white; border-radius: 8px; max-width: 420px; width: 100%; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.15); border: 1px solid #e2e8f0;">
            <div class="paystack-header-brand" style="background-color: #09a5db; color: white; padding: 20px; text-align: center;">
                <h3 style="margin:0; color:white;">Fort Graphics Gateway</h3>
                <span style="font-size:0.75rem; opacity:0.9;">Template Asset Checkout</span>
            </div>
            <div class="paystack-body-content" style="padding: 24px;">
                <p style="font-size:0.85rem; color:#1e293b; margin-bottom:12px;">You are authorizing payment for <strong>${template.name}</strong>.</p>
                <div class="form-input-container" style="margin-bottom:10px;">
                    <label style="display:block; font-size:0.8rem; margin-bottom:4px;">Email Address</label>
                    <input type="text" id="paystack-email-field" class="form-field-control" value="${userEmail}" disabled style="width:100%; padding:8px; box-sizing:border-box;">
                </div>
                <div class="form-input-container" style="margin-bottom:14px;">
                    <label style="display:block; font-size:0.8rem; margin-bottom:4px;">Price</label>
                    <input type="text" class="form-field-control" value="₦${template.price.toLocaleString()}" disabled style="width:100%; padding:8px; box-sizing:border-box;">
                </div>
            </div>
            <div class="paystack-footer-row" style="padding: 16px 24px; background: #f9f9f9; border-top: 1px solid #eee; display: flex; justify-content: space-between;">
                <button class="btn-gray" onclick="document.getElementById('paystack-checkout-modal').remove()">Cancel</button>
                <button class="btn-blue" style="background-color:#3bb75e; color:white; border:none; padding:8px 16px; border-radius:4px; font-weight:700; cursor:pointer;" onclick="executePaystackTemplateCheckout(${templateIndex})">Proceed to Payment Method</button>
            </div>
        </div>
    `;
    document.body.appendChild(checkoutModalContainer);
}

function executePaystackTemplateCheckout(templateIndex) {
    if (typeof PaystackPop === 'undefined') {
        showTopRightToast("Paystack SDK not loaded! Check your internet connection.", "error");
        return;
    }

    const template = FORT_TEMPLATES_DATA[templateIndex];
    if (!template) return;

    const emailField = document.getElementById("paystack-email-field");
    const userEmail = emailField ? emailField.value : null;

    if (!userEmail) {
        showTopRightToast("Please enter a valid email address.", "info");
        return;
    }

    const userUid = (typeof APP_STATE !== 'undefined' && APP_STATE.currentUser) 
        ? APP_STATE.currentUser.uid 
        : 'GUEST_USER';

    const modal = document.getElementById('paystack-checkout-modal');
    if (modal) modal.remove();

    const paymentConfig = {
        key: 'pk_test_8e350f62114983f1cd23b0944668d435a6e74214',
        email: userEmail,
        amount: template.price * 100,
        currency: "NGN",
        ref: 'FT-TMPL-' + templateIndex + '-' + Math.floor((Math.random() * 1000000000) + 1),
        metadata: {
            template_index: templateIndex,
            user_uid: userUid
        },
        callback: function(response) {
            handleSuccessfulTemplatePayment(templateIndex);
        },
        onClose: function() {
            if (typeof showTopRightToast === 'function') showTopRightToast('Payment session closed.', "info");
        }
    };

    try {
        let handler = PaystackPop.setup(paymentConfig);
        handler.openIframe();
    } catch (error) {
        console.error("Paystack Execution Error:", error);
        showTopRightToast("Error launching Paystack modal: " + error.message, "error");
    }
}

function handleSuccessfulTemplatePayment(templateIndex) {
    const template = FORT_TEMPLATES_DATA[templateIndex];
    if (!template) return;

    if (typeof sendFortMartAdminSystemNotification === 'function' && typeof APP_STATE !== 'undefined') {
        sendFortMartAdminSystemNotification(
            APP_STATE.currentUser.uid,
            `Payment Successful! Purchased template: ${template.name}.`
        );
    }

    showTopRightToast("Payment confirmed! Your download will start automatically.", "success");

    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = template.downloadSrc;
    downloadAnchor.download = `${template.name.toLowerCase().replace(/\s+/g, '-')}-clean`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
}

/* ==========================================================================
   DESIGN TEMPLATE WORKFLOW (CUSTOMIZATION REQUEST MODAL - LOCAL DATA ONLY)
   ========================================================================== */

let DESIGN_TEMPLATE_TEMP_ASSETS = [];

/**
 * Launch Design Modification Request Modal using FORT_TEMPLATES_DATA
 */
function launchCustomDesignRequestModal(templateIndex) {
    const currentUser = (typeof APP_STATE !== 'undefined' && APP_STATE.currentUser) ? APP_STATE.currentUser : null;
    
    // Auth Check
    if (!currentUser || !currentUser.uid) {
        if (typeof triggerAuthenticationModalSequence === 'function') {
            triggerAuthenticationModalSequence();
        } else if (typeof showTopRightToast === 'function') {
            showTopRightToast("Please login to request a design customization.", "error");
        } else {
            alert("Please login to request a design customization.");
        }
        return;
    }

    // Account Type Check
    if (currentUser.accountType !== 'personal' && currentUser.uid !== 'admin') {
        if (typeof launchadvertismentofBusinessUpgrade === 'function') {
            launchadvertismentofBusinessUpgrade();
        } else {
            if (typeof showTopRightToast === 'function') {
                showTopRightToast("Designers can't place project requests", "info");
            }
            if (typeof closeTemplatePreviewModal === 'function') {
                closeTemplatePreviewModal();
            }
        }
        return;
    }

    // Fetch strictly from the local FORT_TEMPLATES_DATA array
    let template = null;
    if (typeof FORT_TEMPLATES_DATA !== 'undefined' && Array.isArray(FORT_TEMPLATES_DATA)) {
        // Try array index first, then fallback to matching item 'id'
        template = FORT_TEMPLATES_DATA[templateIndex] || FORT_TEMPLATES_DATA.find(t => t.id === templateIndex);
    }

    if (!template) {
        console.error("Local Template Error: Could not locate template in FORT_TEMPLATES_DATA for index/id:", templateIndex);
        if (typeof showTopRightToast === 'function') {
            showTopRightToast("Template details could not be found locally.", "error");
        } else {
            alert("Template details could not be found locally.");
        }
        return;
    }

    DESIGN_TEMPLATE_TEMP_ASSETS = [];

    // Clean up existing modal instances if present
    let existingModal = document.getElementById("design-customization-modal");
    if (existingModal) existingModal.remove();

    const modal = document.createElement("div");
    modal.id = "design-customization-modal";
    modal.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.75); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box;";

    const formattedPrice = template.price ? `₦${template.price.toLocaleString()}` : "₦0";

    modal.innerHTML = `
        <div style="background: white; border-radius: 8px; max-width: 500px; width: 100%; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); box-sizing: border-box;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <h3 style="margin:0; font-size:1.2rem; color:#0f172a;">Customization Request</h3>
                <button type="button" onclick="document.getElementById('design-customization-modal')?.remove()" style="background:none; border:none; font-size:1.5rem; cursor:pointer; color:#64748b;">&times;</button>
            </div>
            <p style="font-size:0.85rem; color:#475569; margin-bottom:12px;">
                Request modifications for <strong>${template.name}</strong>.
            </p>
            
            <div style="margin-bottom:14px;">
                <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:4px;">Modification Details / Instructions *</label>
                <textarea id="tmpl-design-instructions" class="form-field-control" rows="4" placeholder="Describe the changes, text modifications, colors, or specifications you need..." style="width:100%; padding:8px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px; font-family:inherit;"></textarea>
            </div>

            <div style="margin-bottom:14px;">
                <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:4px;">Attached Files / Brand Assets</label>
                <div id="tmpl-design-assets-preview" style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin-top:6px;">
                    <!-- Rendered Assets Thumbnail preview -->
                </div>
            </div>

            <div style="margin-bottom:16px;">
                <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:4px;">Indicated Amount</label>
                <input type="text" class="form-field-control" value="${formattedPrice}" disabled style="width:100%; padding:8px; box-sizing:border-box; font-weight:700; color:#09a5db;">
            </div>

            <div id="tmpl-design-error" style="color:red; font-size:0.8rem; margin-bottom:12px; display:none;"></div>

            <div style="display:flex; justify-content:flex-end; gap:10px;">
                <button type="button" class="btn-gray" onclick="document.getElementById('design-customization-modal')?.remove()">Cancel</button>
                <button type="button" class="btn-blue" style="background:#09a5db; color:white; border:none; padding:10px 18px; border-radius:4px; font-weight:600; cursor:pointer;" onclick="processDesignTemplateRequestCheckout(${templateIndex})">Proceed to Payment Gateway</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    if (typeof renderDesignTemplateAssetsGrid === 'function') {
        renderDesignTemplateAssetsGrid();
    }
}

// Attach directly to window object for global visibility
window.launchCustomDesignRequestModal = launchCustomDesignRequestModal;

/**
 * Render Design Customization Assets Preview Grid
 */
function renderDesignTemplateAssetsGrid() {
    const grid = document.getElementById("tmpl-design-assets-preview");
    if (!grid) return;

    let html = "";
    DESIGN_TEMPLATE_TEMP_ASSETS.forEach((asset, index) => {
        html += `
            <div style="position: relative; width: 60px; height: 60px; border-radius: 6px; border: 1px solid #ccc; overflow: hidden; background: #f8f9fa;" title="${asset.name}">
                <img src="${asset.dataUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="${asset.name}" />
                <button type="button" onclick="removeDesignTemplateAsset(${index})" style="position: absolute; top: 2px; right: 2px; background: rgba(220,53,69,0.9); color: white; border: none; border-radius: 50%; width: 16px; height: 16px; font-size: 9px; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
            </div>
        `;
    });

    html += `
        <button type="button" onclick="openFileUploadModalForDesignTemplate()" style="width: 60px; height: 60px; border-radius: 6px; border: 2px dashed #09a5db; background: #f4faff; color: #09a5db; font-size: 22px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center;">
            +
        </button>
    `;

    grid.innerHTML = html;
}

function removeDesignTemplateAsset(index) {
    DESIGN_TEMPLATE_TEMP_ASSETS.splice(index, 1);
    renderDesignTemplateAssetsGrid();
}

function openFileUploadModalForDesignTemplate() {
    window.TEMP_SELECTED_ASSET_FILE = null;

    let modal = document.getElementById("file-upload-modal");
    if (modal) modal.remove();

    modal = document.createElement("div");
    modal.id = "file-upload-modal";
    modal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10001; display: flex; align-items: center; justify-content: center;";
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 8px; max-width: 420px; width: 90%; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
            <h3 style="margin-top:0; color:#0d233a;">Attach Asset File</h3>
            <div style="margin-bottom:12px;">
                <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:4px;">Select File *</label>
                <input type="file" id="asset-file-input" accept="image/*" style="width:100%;" onchange="handleAssetFileSelection(event)">
            </div>
            <div id="asset-preview-wrapper" style="margin-bottom:12px; text-align:center; display:none; background:#f4f5f7; padding:8px; border-radius:6px;">
                <img id="asset-preview-img" src="" alt="Preview" style="max-width:100%; max-height:150px; object-fit:contain;">
            </div>
            <div style="margin-bottom:16px;">
                <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:4px;">Asset Name / Label *</label>
                <input type="text" id="asset-custom-name" class="form-field-control" placeholder="e.g. Logo Reference" style="width:100%; padding:8px; box-sizing:border-box;">
            </div>
            <div id="asset-upload-error" style="color:red; font-size:0.8rem; margin-bottom:12px; display:none;"></div>
            <div style="display:flex; justify-content:flex-end; gap:8px;">
                <button type="button" class="btn-gray" onclick="document.getElementById('file-upload-modal').remove()">Cancel</button>
                <button type="button" class="btn-blue" style="background:#09a5db; color:white; border:none; padding:8px 16px; border-radius:4px;" onclick="confirmAddDesignTemplateAsset()">Add</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function confirmAddDesignTemplateAsset() {
    const errDiv = document.getElementById("asset-upload-error");
    const nameInput = document.getElementById("asset-custom-name");
    const customName = nameInput ? nameInput.value.trim() : "";

    if (!window.TEMP_SELECTED_ASSET_FILE) {
        if (errDiv) { errDiv.innerText = "Please select an image file."; errDiv.style.display = "block"; }
        return;
    }
    if (!customName) {
        if (errDiv) { errDiv.innerText = "Please provide a name for this asset."; errDiv.style.display = "block"; }
        return;
    }

    DESIGN_TEMPLATE_TEMP_ASSETS.push({
        id: "asset_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        name: customName,
        fileName: window.TEMP_SELECTED_ASSET_FILE.file.name,
        dataUrl: window.TEMP_SELECTED_ASSET_FILE.dataUrl
    });

    renderDesignTemplateAssetsGrid();
    document.getElementById("file-upload-modal")?.remove();
}

/**
 * Validates inputs and triggers Paystack Payment Gateway for Design Modifications
 */
function processDesignTemplateRequestCheckout(templateIndex) {
    // Fetch template details strictly from the local array
    let template = null;
    if (typeof FORT_TEMPLATES_DATA !== 'undefined' && Array.isArray(FORT_TEMPLATES_DATA)) {
        template = FORT_TEMPLATES_DATA[templateIndex] || FORT_TEMPLATES_DATA.find(t => t.id === templateIndex);
    }

    if (!template) {
        console.error("Local Template Error: Unable to locate template in FORT_TEMPLATES_DATA for index/id:", templateIndex);
        alert("Template details could not be found locally.");
        return;
    }

    const instructionsInput = document.getElementById("tmpl-design-instructions");
    const errDiv = document.getElementById("tmpl-design-error");
    const instructions = instructionsInput ? instructionsInput.value.trim() : "";

    if (!instructions) {
        if (errDiv) {
            errDiv.innerText = "Please provide modification instructions.";
            errDiv.style.display = "block";
        }
        return;
    }

    if (typeof PaystackPop === 'undefined') {
        alert("Paystack SDK failed to load. Please check your internet connection.");
        return;
    }

    const currentUser = (typeof APP_STATE !== 'undefined' && APP_STATE.currentUser) ? APP_STATE.currentUser : {};
    const userEmail = currentUser.identifierText || currentUser.email || "customer@fortmart.com";
    const userUid = currentUser.uid || currentUser.id || "guest_user";

    const paymentConfig = {
        key: 'pk_test_8e350f62114983f1cd23b0944668d435a6e74214',
        email: userEmail,
        amount: template.price * 100,
        currency: "NGN",
        ref: 'DSGN-TMPL-' + (template.id !== undefined ? template.id : templateIndex) + '-' + Math.floor((Math.random() * 1000000000) + 1),
        metadata: {
            template_id: template.id,
            user_uid: userUid,
            request_type: "custom_design_version"
        },
        callback: function(response) {
            executeCommitDesignTemplateAsBookedProject(templateIndex, instructions, response.reference);
        },
        onClose: function() {
            if (typeof showTopRightToast === 'function') {
                showTopRightToast('Payment session closed.', "info");
            }
        }
    };

    try {
        let handler = PaystackPop.setup(paymentConfig);
        handler.openIframe();
    } catch (error) {
        console.error("Paystack Execution Error:", error);
        alert("Error launching Paystack modal: " + error.message);
    }
}

/**
 * Post-Payment Hook: Saves the project booking and activity logs directly to Firebase Firestore
 */
async function executeCommitDesignTemplateAsBookedProject(templateIndex, instructions, paymentRef) {
    // Resolve template details strictly from the local FORT_TEMPLATES_DATA array
    let template = null;
    if (typeof FORT_TEMPLATES_DATA !== 'undefined' && Array.isArray(FORT_TEMPLATES_DATA)) {
        template = FORT_TEMPLATES_DATA[templateIndex] || FORT_TEMPLATES_DATA.find(t => t.id === templateIndex);
    }

    if (!template) {
        console.error("Post-Payment Error: Template details unavailable in local FORT_TEMPLATES_DATA.");
        return;
    }

    const currentUser = (typeof APP_STATE !== 'undefined' && APP_STATE.currentUser) ? APP_STATE.currentUser : {};
    const userUid = currentUser.uid || currentUser.id || 'guest_user';
    const userName = currentUser.identityName || currentUser.businessName || currentUser.username || "Customer";
    const userCountry = currentUser.country || 'Nigeria';
    const timestamp = new Date().toISOString();
    
    const primaryPreview = (template.previews && template.previews.length > 0) 
        ? template.previews[0] 
        : "assets/Public/placeholder.png";

    const projectId = "prod_tmpl_" + Date.now();
    const logId = "LOG_" + Date.now();

    // Construct Project Payload for Firestore
    const newProjectPayload = {
        pid: projectId,
        ownerUid: userUid,
        name: `${template.name} (Customized)`,
        title: `${template.name} (Customized)`,
        info: instructions,
        instructions: instructions,
        price: template.price,
        countryScope: userCountry,
        coverPhoto: primaryPreview,
        assets: Array.isArray(DESIGN_TEMPLATE_TEMP_ASSETS) ? [...DESIGN_TEMPLATE_TEMP_ASSETS] : [],
        paystackRef: paymentRef,
        createdAt: timestamp,
        updatedAt: timestamp,
        
        // Automatic booking configuration
        isBooked: true,
        status: 'booked',
        bookedByUid: 'admin',
        bookedAt: timestamp,
        modifications: []
    };

    // Construct Activity Log Payload for Firestore
    const logPayload = {
        logId: logId,
        designerUid: 'admin',
        productId: projectId,
        productName: newProjectPayload.name,
        requesterUid: userUid,
        requesterName: userName,
        type: 'booking',
        actionText: 'Template Customization Request booked automatically by Admin',
        timestamp: timestamp
    };

    try {
        const { doc, setDoc, db } = window.FortMartFirebase;

        // 1. Save Project document to Firebase Firestore 'projects' collection
        await setDoc(doc(db, "projects", projectId), newProjectPayload);

        // 2. Save Activity Log document to Firebase Firestore 'activityLogs' collection
        await setDoc(doc(db, "activityLogs", logId), logPayload);

        // Clean Up UI & Memory
        DESIGN_TEMPLATE_TEMP_ASSETS = [];
        document.getElementById("design-customization-modal")?.remove();

        if (typeof showTopRightToast === 'function') {
            showTopRightToast("Payment confirmed! Your project has been posted and assigned to Admin.", "success");
        } else {
            alert("Payment confirmed! Your project has been posted and assigned to Admin.");
        }

        // Safely refresh display grids
        setTimeout(() => {
            if (typeof renderMarketplaceProductsDisplayLoop === 'function') {
                renderMarketplaceProductsDisplayLoop();
            }
        }, 100);

    } catch (error) {
        console.error("Failed to commit booked project details to Firebase:", error);
        alert("Failed to save your project booking to database. Please contact support with payment reference: " + paymentRef);
    }
}

// Global scope attachments
window.processDesignTemplateRequestCheckout = processDesignTemplateRequestCheckout;
window.executeCommitDesignTemplateAsBookedProject = executeCommitDesignTemplateAsBookedProject;

// Global Listener Initialization
document.addEventListener("DOMContentLoaded", () => {
    renderFortTemplatesSection();
    handleTemplateUrlRouting();

    document.addEventListener("dragstart", (e) => {
        if (e.target.tagName === "IMG") {
            e.preventDefault();
        }
    });

    document.addEventListener("click", (e) => {
        if (e.target.tagName === "IMG" && e.target.closest(".fort-image-container")) {
            e.preventDefault();
        }
    });
});