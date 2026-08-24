/**
 * Fort Graphics Core Single-Page Application Application State Machine Archetype
 */

// Global App State Data Layer Initialization
let APP_STATE = {
    deviceMode: 'laptop', // runtime options: 'laptop' | 'phone'
    currentUser: null,    // operational profile object reference mapping
    activeViewPage: 'home',
    navbarExpanded: true,
    categoryDrawerOpen: false,
    currentSelectedCategory: 'Trending',
    searchQuery: '',
    chatConfiguration: {
        notificationsEnabled: true,
        autoReplyEnabled: false,
        autoReplyMessageText: "Thank you for contacting us. We will evaluate your query and message you shortly.",
        autoDownloadEnabled: false
    },
    activeChatTargetUserHash: null,
    selectedMessageNodesCollection: [],
    fortAiActiveTaggedProductObject: null
};

// Platform Default Core Mock Database Entities Baseline Arrays 
let SYSTEM_DATABASE = {
    users: [
        { uid: "admin", identityName: "Fort Graphics Admin", accountType: "business", country: "Nigeria", dialingCode: "+234", identifierText: "fortdevelopers492@gmail.com", secretKey: "Fortmart492#", avatar: "fort-mart-logo.png", businessName: "8028241162 - Opay", businessInfo: "Phillip Imonode Ihidero", verificationStatus: "verified" },
        { uid: "user_sarah", identityName: "Sarah Enterprise Hub", accountType: "business", country: "Nigeria", dialingCode: "+234", identifierText: "sarah@gmail.com", secretKey: "Sarah123!", avatar: "", businessName: "1111111111 - First Bank", businessInfo: "Placeholder", verificationStatus: "verified" },
        { uid: "user_john", identityName: "John Mark", accountType: "personal", country: "Nigeria", dialingCode: "+234", identifierText: "john@gmail.com", secretKey: "John456!", avatar: "", verificationStatus: "verified" },
        { uid: "user_david", identityName: "David Enterprise Hub", accountType: "business", country: "Nigeria", dialingCode: "+234", identifierText: "david@gmail.com", secretKey: "David123!", avatar: "", businessName: "1111111111 - First Bank", businessInfo: "Placeholder", verificationStatus: "verified" },
    ],
    products: [],
    chats: [],
    platformFeedback: [],
    networkSuiteEntities: []
};

// Ensure leaderboard array structure exists within system storage layers
if (!SYSTEM_DATABASE.pinnedLeaderboard) {
    SYSTEM_DATABASE.pinnedLeaderboard = []; // Max 20 slots containing product 'pid' strings
}

/**
 * Utility Helper: Sets a browser cookie
 */
/**
 * Sets a secure browser cookie optimized for HTTPS, HTTP, and local filesystem environments
 */
function setSecureAuthCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    
    const protocol = window.location.protocol;
    
    // Base configuration parameters
    let cookieString = name + "=" + encodeURIComponent(value) + expires + "; path=/";
    
    if (protocol === "https:") {
        // Enforce maximum production security requirements over encrypted HTTPS networks
        cookieString += "; Secure; SameSite=Strict";
        document.cookie = cookieString;
    } else if (protocol === "http:") {
        // Relax strict policies for standard unencrypted local development servers (http://localhost)
        cookieString += "; SameSite=Lax";
        document.cookie = cookieString;
    } else {
        // file:// or other protocols do not support setting cookies; log a silent note
        console.warn("Cookies are not supported on the current protocol context:", protocol);
    }
}

function getSecureAuthCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

/**
 * Utility Helper: Deletes a browser cookie
 */
function eraseSecureAuthCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict';
}

/**
 * Persists and commits state updates across database abstraction wrappers
 */
function administrativeSaveAndRefreshDisplay(activeProductId = null) {
    if (typeof syncPlatformDatabaseStateToWebStorage === "function") {
        syncPlatformDatabaseStateToWebStorage();
    } else if (typeof commitDatabasesStateToLocalStorage === "function") {
        commitDatabasesStateToLocalStorage();
    }
    
    // Refresh display elements instantly
    renderMarketplaceProductsDisplayLoop();
    
    // Re-render open modal windows to accurately update contextual status layouts
    if (activeProductId) {
        launchComprehensiveProductSpecificationsExpandedModalView(activeProductId);
    }
}

// Local Storage Baseline State Synchronization Functions
function syncPlatformDatabaseStateToWebStorage() {
    try {
        localStorage.setItem("FORT_GRAPHICS_DB_STATE", JSON.stringify(SYSTEM_DATABASE));
    } catch (error) {
        console.error("Failed to persist system state to LocalStorage:", error);
    }
}

function loadPlatformDatabaseStateFromWebStorage() {
    try {
        const cachedStateData = localStorage.getItem("FORT_GRAPHICS_DB_STATE");
        if (cachedStateData) {
            const parsedData = JSON.parse(cachedStateData);
            
            // Safely update the object without breaking variable references
            Object.assign(SYSTEM_DATABASE, parsedData);
            
            // Ensure essential schema properties exist
            SYSTEM_DATABASE.users = SYSTEM_DATABASE.users || [];
        }
    } catch (error) {
        console.error("Failed to load or parse system state from LocalStorage:", error);
    }
}

// System Init Bootstrap Hooks Lifecycle Engine Activation Loop
window.addEventListener("DOMContentLoaded", () => {
    // 1. MUST LOAD CACHED COPIES FIRST
    loadPlatformDatabaseStateFromWebStorage();
    
    // 2. INTERCEPT IMMEDIATELY (Move this up so it blocks unauthorized views instantly)
    if (typeof triggerAuthenticationModalSequence === 'function') {
        triggerAuthenticationModalSequence();
    }

    // 3. RUN BACKGROUND LIFECYCLE CHECKS
    if (typeof executeSystemicSubscriptionExpirationLifecycleCheck === 'function') {
        executeSystemicSubscriptionExpirationLifecycleCheck();
    }
    
    // 4. RUN RENDER LOOPS LAST (Only works on prepared data for authenticated states)
    if (typeof renderMarketplaceProductsDisplayLoop === 'function') {
        renderMarketplaceProductsDisplayLoop();
    }

    if (typeof buildCategoryRibbonFilterInterfaceElements === 'function') {
        buildCategoryRibbonFilterInterfaceElements();
    }
    if (typeof populateNetworkSuiteExtensionsDisplayView === 'function') {
        populateNetworkSuiteExtensionsDisplayView();
    }
});

/**
 * Structural Architecture, Layout & View Rendering Module Engines
 */
function toggleSideDrawer() {
    const drawerNode = document.getElementById("side-drawer");
    
    // Check screen width instead of a manual state
    if (window.innerWidth <= 1024) {
        drawerNode.classList.toggle("active-phone-drawer");
    } else {
        drawerNode.classList.toggle("closed");
    }
}

// Close phone responsive side layouts drawer automatically upon completion
if (window.innerWidth <= 1024) {
    const sideDrawer = document.getElementById("side-drawer");
    if (sideDrawer) sideDrawer.classList.remove("active-phone-drawer");
}

// Mapping table for page titles
const PAGE_TITLES = {
    'home': 'Home | Fort Graphics',
    'designer-history-page': 'Design History | Fort Graphics',
    'admin-booked-projects': 'Booked Projects | Fort Graphics',
    'my-account': 'My Projects / Account | Fort Graphics',
    'my-products-personal': 'My Projects | Fort Graphics',
    'fort-templates-section': 'Templates & Resources | Fort Graphics',
    'designer-projects': 'Workspace | Fort Graphics',
    'admin-dashboard': 'Admin Dashboard | Fort Graphics'
};

function navigateToPage(targetPageId) {
    // Intercept Gate: Require validation state before access maps logic blocks
    if(!APP_STATE.currentUser && targetPageId !== 'fort-templates-section') {
        triggerAuthenticationModalSequence();
        return;
    }
    
    // Hide all architectural pages views nodes
    document.querySelectorAll(".view-page").forEach(page => {
        page.classList.add("hidden-view");
        page.classList.remove("active-view");
    });
    
    const targetedPageElement = document.getElementById(`page-${targetPageId}`);
    if(targetedPageElement) {
        targetedPageElement.classList.add("active-view");
        targetedPageElement.classList.remove("hidden-view");
        APP_STATE.activeViewPage = targetPageId;
    }

    // Update document title dynamically
    document.title = PAGE_TITLES[targetPageId] || 'Fort Graphics';
    
    // Close phone responsive side layouts drawer automatically upon completion
    if (window.innerWidth <= 1024) {
        const sideDrawer = document.getElementById("side-drawer");
        if (sideDrawer) sideDrawer.classList.remove("active-phone-drawer");
    }
    
    // Update structural layouts dynamically based on sub page scopes
    const searchBarPlaceholder = document.getElementById("global-search-bar");
    if(targetPageId === 'home') {
        searchBarPlaceholder.placeholder = "Search Projects……";
    } else if(targetPageId === 'designer-history-page') {
        searchBarPlaceholder.placeholder = "Search History……";
        renderDesignerHistoryDashboard();     
    } else if (targetPageId === 'admin-booked-projects') {
        searchBarPlaceholder.placeholder = "Search Booked Projects……";
        renderAdminBookedProjectsDisplayLoop();
    } else if(targetPageId === 'my-account') {
        searchBarPlaceholder.placeholder = "Search Settings……";
        initializeProfileDetailsAccountManagementFieldsValues();
    } else if(targetPageId === 'my-products-personal') {
        searchBarPlaceholder.placeholder = "Search My Projects.....";
        renderAccountInventoryLedgerManagementDashboardGrid();
    } else if(targetPageId === 'fort-templates-section') {
        searchBarPlaceholder.placeholder = "Search Designs.....";
        renderFortTemplatesSection();
    } else if(targetPageId === 'designer-projects') {
        searchBarPlaceholder.placeholder = "Search My Projects.....";
        renderDesignerProjectsWorkspaceDashboard();
    } else if (targetPageId === 'admin-dashboard') {
        searchBarPlaceholder.placeholder = "Search Users.....";
        renderAdminUsersManagementList();            
    }  else if (targetPageId === 'admin-payouts-page') {
        searchBarPlaceholder.placeholder = "Search Payouts……";
        renderAdminPayoutsDashboardView();
}
}

/**
 * Complete Universal Modal Step-Workflow Lifecycle Framework Management Core
 */
function displayConfirmationModalOverlayAction(messageStringText, callbackFunctionReference) {
    const confirmModalNode = document.getElementById("confirm-modal");
    document.getElementById("confirm-modal-text").innerText = messageStringText;
    confirmModalNode.classList.add("active");
    
    const yesButtonNode = document.getElementById("confirm-yes-btn");
    const noButtonNode = document.getElementById("confirm-no-btn");

    const cleanYesNode = yesButtonNode.cloneNode(true);
    const cleanNoNode = noButtonNode.cloneNode(true);
    yesButtonNode.parentNode.replaceChild(cleanYesNode, yesButtonNode);
    noButtonNode.parentNode.replaceChild(cleanNoNode, noButtonNode);

    cleanYesNode.addEventListener("click", () => {
        confirmModalNode.classList.remove("active");
        callbackFunctionReference();
    });
    cleanNoNode.addEventListener("click", () => {
        confirmModalNode.classList.remove("active");
    });
}

/**
 * 1. Closes the main modal directly
 */
function closeActiveModalDirectly(modalElementId) {
    const modalNode = document.getElementById(modalElementId);
    if (modalNode) {
        modalNode.classList.remove("active");
        modalNode.style.display = ""; // Clears the inline display override
    }
}

// 2. Initiates the confirmation flow
function closeActiveModalWithConfirmationFlow(modalElementId) {
    displayConfirmationModalOverlayAction(
        "Are you sure you want to exit this window? Progress or entered structural fields changes may be permanently lost.", 
        () => {
            // This is the callback that runs ONLY when "Yes" is clicked
            closeActiveModalDirectly(modalElementId);
        }
    );
}

// 3. The confirmation handler (Make sure your function looks like this)
function displayConfirmationModalOverlayAction(message, onConfirmCallback) {
    const confirmModal = document.getElementById("confirmationModal");
    const confirmMessage = document.getElementById("confirmationMessage");
    const yesButton = document.getElementById("confirmYesBtn");
    const noButton = document.getElementById("confirmNoBtn");

    if (!confirmModal || !confirmMessage || !yesButton || !noButton) {
        console.error("Confirmation modal DOM elements missing.");
        return;
    }

    // Set the dynamic warning message
    confirmMessage.textContent = message;

    // Show the confirmation modal
    confirmModal.classList.add("active");

    // Clean up old event listeners to prevent duplicate triggers
    const newYesButton = yesButton.cloneNode(true);
    const newNoButton = noButton.cloneNode(true);
    yesButton.parentNode.replaceChild(newYesButton, yesButton);
    noButton.parentNode.replaceChild(newNoButton, noButton);

    // YES Flow: Run the callback (close main modal) and hide confirmation
    newYesButton.addEventListener("click", () => {
        onConfirmCallback(); 
        confirmModal.classList.remove("active");
    });

    // NO Flow: Just hide the confirmation modal, leaving the main modal open
    newNoButton.addEventListener("click", () => {
        confirmModal.classList.remove("active");
    });
}

/**
 * =========================================================================
 * COMPLETE USER ACCOUNTS AUTHENTICATION FLOW SUBSYSTEM (COOKIE MODIFIED)
 * =========================================================================
 */

/**
 * REPLACED: Updated Authentication Sequence initializing directly via Cookies
 * completely bypassing the legacy "Continue As" choice workflow.
 */
/**
 * Authentication Sequence initializing via Cookies with a Local Storage fallback for file:// protocols
 */
function triggerAuthenticationModalSequence() {
    try {
        // 1. Try to read from browser cookies first (Works on https:// and http://)
        let savedUid = getSecureAuthCookie("fort_graphics_logged_uid");

        // 2. Fallback check: If cookies aren't set or blocked (e.g. running via file://), check local storage fallback
        if (!savedUid) {
            savedUid = localStorage.getItem("fort_graphics_cookie_fallback_uid");
        }

        if (savedUid && typeof SYSTEM_DATABASE !== 'undefined' && SYSTEM_DATABASE.users) {
            // Find user in the system database array
            const accountRecordMatch = SYSTEM_DATABASE.users.find(u => u.uid === savedUid);
            
            if (accountRecordMatch) {
                // Bypass login prompt modal structures entirely and validate session
                finalizeSuccessfulAuthenticationSequence(accountRecordMatch);
                return;
            } else {
                eraseSecureAuthCookie("fort_graphics_logged_uid");
                localStorage.removeItem("fort_graphics_cookie_fallback_uid");
            }
        }
    } catch (e) {
        console.error("Authentication initialization exception context:", e);
        eraseSecureAuthCookie("fort_graphics_logged_uid");
        localStorage.removeItem("fort_graphics_cookie_fallback_uid");
    }

    // Default flow if no session token profile is active
    renderSignInModalStepContentLayout();
    document.getElementById("auth-modal").classList.add("active");
}

/**
 * Renders the default Sign-In interface view inside the authentication modal target wrapper
 */
function renderSignInModalStepContentLayout() {
    const wrapperTargetNode = document.getElementById("auth-modal-content");
    wrapperTargetNode.innerHTML = `
        <h2>Sign In to Fort Graphics</h2>
        <div class="form-input-container">
            <label>Select Preferred Location:</label>
            <select id="auth-signin-country" class="form-field-control">
                <option value="Nigeria|+234">Nigeria (+234)</option>
            </select>
        </div>
      
        <div class="form-input-container">
            <label>Input Registered Email Address:</label>
            <input type="text" name="email" id="auth-signin-identifier" class="form-field-control" placeholder="Input registered email address:">
            <div id="err-signin-identifier" class="text-danger-alert hidden-node"></div>
        </div>
        <div class="form-input-container">
            <label>Account Password:</label>
         
            <input type="password" id="auth-signin-password" class="form-field-control" placeholder="Enter password">
            <div id="err-signin-password" class="text-danger-alert hidden-node"></div>
        </div>

        <div style="margin-top: 6px; display: flex; align-items: center; gap: 6px;">
            <input type="checkbox" id="chk-signin-showpass" onchange="toggleFormPasswordFieldVisibility(this, 'auth-signin-password')">
            <label for="chk-signin-showpass" style="font-size: 0.8rem; font-weight: 400; cursor: pointer; user-select: none;">Show Password</label>            
        </div>

        <div style="margin-top: 6px; display: flex; align-items: center; gap: 6px;">
            <input type="checkbox" id="chk-signin-rememberme">
            <label for="chk-signin-rememberme" style="font-size: 0.8rem; font-weight: 400; cursor: pointer; user-select: none;">Remember Me</label>            
        </div>

        <div class="text-center margin-top-xs">
            <span style="color:var(--fort-blue-light); cursor:pointer; font-size:0.9rem;" onclick="renderForgotPasswordModalWorkflow()">Forgot Password?</span>
        </div>
        <div class="btn-group">
            <button onclick="closeActiveModalDirectly('auth-modal')" class="btn-gray">Cancel</button>
            <button onclick="executeAccountSignInAuthenticationRequest()" class="btn-blue">Sign In</button>
        </div>
        <div class="text-center margin-top-sm" style="font-size:0.9rem;">
            <span>Don't have an account? </span><strong style="color:var(--fort-blue-light); cursor:pointer;" onclick="renderSignUpModalWizardStepOne()">Sign up</strong>
        </div>
    `;
}

/**
 * Utility helper toggling clear-text/password field visibility states dynamically
 */
function toggleFormPasswordFieldVisibility(checkboxElement, targetPasswordFieldId) {
    const passwordField = document.getElementById(targetPasswordFieldId);
    if (passwordField) {
        passwordField.type = checkboxElement.checked ? "text" : "password";
    }
}

/**
 * MODIFIED: Authenticate Sign In request updated to target secure device cookies
 */
function executeAccountSignInAuthenticationRequest() {
    const countryRawValue = document.getElementById("auth-signin-country").value.split("|");
    const identifierInput = document.getElementById("auth-signin-identifier").value.trim();
    const passwordInput = document.getElementById("auth-signin-password").value;
    
    const errIdNode = document.getElementById("err-signin-identifier");
    const errPassNode = document.getElementById("err-signin-password");
    errIdNode.classList.add("hidden-node");
    errPassNode.classList.add("hidden-node");
   
    if (typeof SYSTEM_DATABASE === 'undefined' || !SYSTEM_DATABASE.users) {
        errIdNode.innerText = "System error: Database layer is unreachable.";
        errIdNode.classList.remove("hidden-node");
        return;
    }
    
    const accountRecordMatch = SYSTEM_DATABASE.users.find(u => 
        u.dialingCode === countryRawValue[1] && 
        u.identifierText.toLowerCase() === identifierInput.toLowerCase()
    );

    if(!accountRecordMatch) {
        errIdNode.innerText = "No registered matching account found for specified credentials.";
        errIdNode.classList.remove("hidden-node");
        return;
    }
    
    if(accountRecordMatch.secretKey !== passwordInput) {
        errPassNode.innerText = "Incorrect Password.";
        errPassNode.classList.remove("hidden-node");
        return;
    }
    
    const rememberMeChecked = document.getElementById("chk-signin-rememberme").checked;
    
    if (rememberMeChecked) {
        // Set persistent 7-day cookie (HTTPS/HTTP) + backup fallback key (file://)
        setSecureAuthCookie("fort_graphics_logged_uid", accountRecordMatch.uid, 7);
        localStorage.setItem("fort_graphics_cookie_fallback_uid", accountRecordMatch.uid);
    } else {
        // Session validation context only
        setSecureAuthCookie("fort_graphics_logged_uid", accountRecordMatch.uid, null);
        localStorage.removeItem("fort_graphics_cookie_fallback_uid");
    }
    
    finalizeSuccessfulAuthenticationSequence(accountRecordMatch);
}

/**
 * Shared helper utility containing the common success operations UI updates
 */
function finalizeSuccessfulAuthenticationSequence(accountRecordMatch) {
    if (typeof APP_STATE === 'undefined') {
        window.APP_STATE = {};
    }

    // Success State Login Sequence Activation
    APP_STATE.currentUser = accountRecordMatch;
    closeActiveModalDirectly('auth-modal');
    
    // Refresh structural visual nodes dependencies based on admin flag states
    const adminNavItem = document.getElementById("admin-nav-item");
    const adminSuiteBtn = document.getElementById("admin-add-suite-site-btn");
    const navItemMessages = document.getElementById("nav-item-messages")
    const myProjectDesigner = document.getElementById("nav-item-my-project-designer")
    const myProjectCustomer = document.getElementById("nav-item-my-project-personal")
    const availableProjects = document.getElementById("nav-item-home")
    const postedProjects = document.getElementById("my-products-settings-button")
    const verificationBadgeContainer = document.getElementById("user-verification-badge")
    const verificationBadge = document.getElementById("badge-status-icon")
    const verificationBadgetwo = document.getElementById("badge-status-text")
    const adminNavItemTwo = document.getElementById("admin-nav-item-two")
    const adminNavItemThree = document.getElementById("admin-nav-item-three")
    
    if (accountRecordMatch.uid === 'admin') {
        if (adminNavItem) adminNavItem.classList.remove("hidden-admin-node");
        if (adminSuiteBtn) adminSuiteBtn.classList.remove("hidden-node");
        if (adminNavItemTwo) adminNavItemTwo.classList.remove("hidden-admin-node"); 
        if (adminNavItemTwo) adminNavItemTwo.classList.remove("hidden-node");  
        if (adminNavItemThree) adminNavItemThree.classList.remove("hidden-admin-node"); 
        if (adminNavItemThree) adminNavItemThree.classList.remove("hidden-node");                
    } else {
        if (adminNavItem) adminNavItem.classList.add("hidden-admin-node");
        if (adminSuiteBtn) adminSuiteBtn.classList.add("hidden-node");
        if (adminNavItemTwo) adminNavItemTwo.classList.add("hidden-node");       
        if (adminNavItemThree) adminNavItemThree.classList.add("hidden-admin-node"); 
        if (adminNavItemThree) adminNavItemThree.classList.add("hidden-node");  
    }
    
    if (accountRecordMatch.accountType === 'business' || accountRecordMatch.uid === 'admin') {
        if (navItemMessages) navItemMessages.classList.remove("hidden-admin-node");
        if (navItemMessages) navItemMessages.classList.remove("hidden-node");
        if (myProjectDesigner) myProjectDesigner.classList.remove("hidden-admin-node")
        if (myProjectDesigner) myProjectDesigner.classList.remove("hidden-node")
        if (availableProjects) availableProjects.classList.remove("hidden-admin-node")
        if (availableProjects) availableProjects.classList.remove("hidden-node")
    } else {
        if (navItemMessages) navItemMessages.classList.add("hidden-admin-node");
        if (myProjectDesigner) myProjectDesigner.classList.add("hidden-admin-node")
        if (availableProjects) availableProjects.classList.add("hidden-admin-node")

    }

    if (accountRecordMatch.accountType === 'business') {
        if (myProjectCustomer) myProjectCustomer.classList.add("hidden-admin-node")
        if (postedProjects) postedProjects.classList.add("hidden-admin-node")
    } else {
        if (myProjectCustomer) myProjectCustomer.classList.remove("hidden-admin-node")
        if (postedProjects) postedProjects.classList.remove("hidden-admin-node")
    }

    if (accountRecordMatch.accountType === 'personal') {
        if (verificationBadgeContainer) verificationBadgeContainer.classList.add("hidden-admin-node")
        if (verificationBadge) verificationBadge.classList.add("hidden-admin-node")
        if (verificationBadgetwo) verificationBadgetwo.classList.add("hidden-admin-node")
    } else {
        if (verificationBadgeContainer) verificationBadgeContainer.classList.remove("hidden-admin-node")
        if (verificationBadge) verificationBadge.classList.remove("hidden-admin-node")
        if (verificationBadgetwo) verificationBadgetwo.classList.remove("hidden-admin-node")
    }

    // Render profile interface modifications context arrays
    const navUserAvatar = document.getElementById("nav-user-avatar");
    if (navUserAvatar) {
        navUserAvatar.src = accountRecordMatch.avatar ||
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>";
    }

    syncDrawerGuestTerminalNodeToActiveUser();
    changelogoutosignupviceVersa();
    
    // Launch Success Overlay Greeting Box
    const welcomeModal = document.getElementById("welcome-modal");
    if (welcomeModal) welcomeModal.classList.add("active");
    
    if (typeof navigateToPage === 'function') {
        navigateToPage('fort-templates-section');
    }
}

/** Registration System Multi-step Engine Framework Array */
let SIGNUP_WIZARD_TEMPORARY_OBJECT = {};

function renderSignUpModalWizardStepOne() {
    const wrapperTargetNode = document.getElementById("auth-modal-content");
    wrapperTargetNode.innerHTML = `
        <h3>Sign Up - Provide Contact (Step 1 of 4)</h3>
        <div class="form-input-container margin-top-sm">
            <label>Select Preferred Location:</label>
            <select id="reg-country" class="form-field-control" onchange="evaluateSignUpStepOneFormCompletenessStateValidation()">
                <option value="Nigeria|+234" selected>Nigeria (+234)</option>
            </select>
        </div>
    
        <div class="form-input-container">
            <label>Input Email Address:</label>
            <input type="text" name="email" id="reg-identifier" class="form-field-control" placeholder="Input email address:" oninput="evaluateSignUpStepOneFormCompletenessStateValidation()">
            <div id="err-reg-step1-feedback" class="text-danger-alert hidden-node">Input all information properly</div>
        </div>
        
        <div class="form-checkbox-group-row margin-top-xs">
            <input type="checkbox" id="chk-reg-terms" onchange="evaluateSignUpStepOneFormCompletenessStateValidation()">
            <label for="chk-reg-terms" style="font-size:0.82rem;">I accept the <a href="fort-graphics-terms-and-conditions.html" >terms and conditions</a></label>
        </div>
        <div class="form-checkbox-group-row margin-top-xs">
            <input type="checkbox" id="chk-reg-privacy" onchange="evaluateSignUpStepOneFormCompletenessStateValidation()">
            <label for="chk-reg-privacy" style="font-size:0.82rem;">I accept the <a href="fort-graphics-privacy-policy.html" >privacy policy</a></label>
        </div>

        <div class="btn-group margin-top-md">
            <button onclick="closeActiveModalDirectly('auth-modal')" class="btn-gray">Cancel</button>
            <button id="btn-signup-step1-next" onclick="executeProcessSignUpStepOneNextSequenceAction()" class="btn-blue faintly-colored" disabled>Next</button>
        </div>
    `;
}

function evaluateSignUpStepOneFormCompletenessStateValidation() {
    const identifierTextVal = document.getElementById("reg-identifier").value.trim();
    const termsAcceptedFlag = document.getElementById("chk-reg-terms").checked;
    const privacyAcceptedFlag = document.getElementById("chk-reg-privacy").checked;
    const nextButtonNode = document.getElementById("btn-signup-step1-next");
    
    if(identifierTextVal.length > 4 && termsAcceptedFlag && privacyAcceptedFlag) {
        nextButtonNode.disabled = false;
        nextButtonNode.classList.remove("faintly-colored");
    } else {
        nextButtonNode.disabled = true;
        nextButtonNode.classList.add("faintly-colored");
    }
}

function executeProcessSignUpStepOneNextSequenceAction() {
    const countryRawVal = document.getElementById("reg-country").value.split("|");
    const identifierInputVal = document.getElementById("reg-identifier").value.trim();
    const errFieldFeedback = document.getElementById("err-reg-step1-feedback");
    
    errFieldFeedback.classList.add("hidden-node");
    const duplicateMatchCheck = SYSTEM_DATABASE.users.find(u => u.dialingCode === countryRawVal[1] && u.identifierText.toLowerCase() === identifierInputVal.toLowerCase());
    if(duplicateMatchCheck) {
        errFieldFeedback.innerText = "An account is already linked to this phone number/email address. Sign in.";
        errFieldFeedback.classList.remove("hidden-node");
        return;
    }
    
    SIGNUP_WIZARD_TEMPORARY_OBJECT.country = countryRawVal[0];
    SIGNUP_WIZARD_TEMPORARY_OBJECT.dialingCode = countryRawVal[1];
    SIGNUP_WIZARD_TEMPORARY_OBJECT.identifierText = identifierInputVal;
    
    renderSignUpModalWizardStepTwo();
}

function renderSignUpModalWizardStepTwo() {
    const wrapperTargetNode = document.getElementById("auth-modal-content");
    wrapperTargetNode.innerHTML = `
        <h3>Sign Up - Provide Account Info (Step 2 of 4)</h3>
        <div class="form-input-container margin-top-sm">
            <label>Select Account Type:</label>
            <select id="reg-account-type" class="form-field-control" onchange="toggleSignUpStepTwoClassificationFormsLayout(this.value)">
                <option value="personal" selected>Personal (Customer) Account</option>
                <option value="business">Designer (Commercial) Account</option>
            </select>
        </div>
        
        <div id="signup-dynamic-fields-wrapper">
            <div class="form-input-container">
                <label>Input Personal Full Name:</label>
                <input type="text" name="name" id="reg-personal-name" class="form-field-control" placeholder="Enter personal name" oninput="validateSignUpStepTwoDataFormCompleteness()">
            </div>
            <div class="form-input-container">
                <label>Upload Profile Picture (Optional):</label>
                <div class="form-input-container-image">
                    <div class="preview-box" style="min-height: 100px; display: flex; align-items: center; justify-content: center; border: 1px dashed #ccc; margin-bottom: 10px;">
                        <span id="placeholderTextimg-signup">No image selected</span>
                        <img id="imagePreview-signup" alt="Image Preview" style="max-width: 100%; max-height: 200px; display: none;">
                    </div>
                </div>
                <input type="file" id="reg-avatar-file" class="form-field-control" accept=".png, .jpg, .jpeg" onchange="processSignUpAvatarFileSelection()">
            </div>
            <div id="err-reg-step2-feedback" class="text-danger-alert hidden-node">Input all information properly</div>
        </div>

        <div class="btn-group margin-top-md">
            <button onclick="renderSignUpModalWizardStepOne()" class="btn-gray">Back</button>
            <button id="btn-signup-step2-next" onclick="executeProcessSignUpStepTwoNextSequenceAction()" class="btn-blue faintly-colored" disabled>Next</button>
        </div>
    `;
    SIGNUP_WIZARD_TEMPORARY_OBJECT.avatar = ""; 
    SIGNUP_WIZARD_TEMPORARY_OBJECT.isAvatarReading = false;
    validateSignUpStepTwoDataFormCompleteness();
}

function toggleSignUpStepTwoClassificationFormsLayout(selectedClassificationType) {
    const fieldsWrapper = document.getElementById("signup-dynamic-fields-wrapper");
    if (selectedClassificationType === 'personal') {
        fieldsWrapper.innerHTML = `
            <div class="form-input-container">
                <label>Input Personal Full Name:</label>
                <input type="text" name="name" id="reg-personal-name" class="form-field-control" placeholder="Enter personal name" oninput="validateSignUpStepTwoDataFormCompleteness()">
            </div>
            <div class="form-input-container">
                <label>Upload Profile Picture (Optional):</label>
                <div class="form-input-container-image">
                    <div class="preview-box" style="min-height: 100px; display: flex; align-items: center; justify-content: center; border: 1px dashed #ccc; margin-bottom: 10px;">
                        <span id="placeholderTextimg-signup">No image selected</span>
                        <img id="imagePreview-signup" alt="Image Preview" style="max-width: 100%; max-height: 200px; display: none;">
                    </div>
                </div>
                <input type="file" id="reg-avatar-file" class="form-field-control" accept=".png, .jpg, .jpeg" onchange="processSignUpAvatarFileSelection()">
            </div>
            <div id="err-reg-step2-feedback" class="text-danger-alert hidden-node">Input all information properly</div>
        `;
    } else {
        fieldsWrapper.innerHTML = `
            <div class="form-input-container">
                <label>Input Business Name:</label>
                <input type="text" id="reg-biz-name" class="form-field-control" placeholder="Enter corporate trading identity" oninput="validateSignUpStepTwoDataFormCompleteness()">
            </div>
            <div class="form-input-container">
                <label>Provide Business Public Summary:</label>
                <input type="text" id="reg-biz-info" class="form-field-control" placeholder="Briefly describe your company summary" oninput="validateSignUpStepTwoDataFormCompleteness()">
            </div>
            <div class="form-input-container">
                <label>Input Personal Full Name:</label>
                <input type="text" name="name" id="reg-personal-name" class="form-field-control" placeholder="Enter operational manager name" oninput="validateSignUpStepTwoDataFormCompleteness()">
            </div>
            <div class="form-input-container">
                <label>Inventory Specification:</label>
                <input type="text" id="reg-biz-deals" class="form-field-control" placeholder="e.g. Mobile Accessories, Clothing apparel, Laptops" oninput="validateSignUpStepTwoDataFormCompleteness()">
            </div>
            <div class="form-input-container">
                <label>Upload Profile Picture (Optional):</label>
                <div class="form-input-container-image">
                    <div class="preview-box" style="min-height: 100px; display: flex; align-items: center; justify-content: center; border: 1px dashed #ccc; margin-bottom: 10px;">
                        <span id="placeholderTextimg-signup">No image selected</span>
                        <img id="imagePreview-signup" alt="Image Preview" style="max-width: 100%; max-height: 200px; display: none;">
                    </div>
                </div>
                <input type="file" id="reg-avatar-file" class="form-field-control" accept=".png, .jpg, .jpeg" onchange="processSignUpAvatarFileSelection()">
            </div>
            <div class="form-checkbox-group-row margin-top-xs">
                <input type="checkbox" id="chk-reg-designer-terms" onchange="validateSignUpStepTwoDataFormCompleteness()">
                <label for="chk-reg-designer-terms" style="font-size:0.82rem;">I accept the <a href="fort-graphics-designer's-terms-and-conditions.html">designer's terms and conditions</a></label>
            </div>
            <div id="err-reg-step2-feedback" class="text-danger-alert hidden-node">Input all information properly</div>
        `;
    }
    SIGNUP_WIZARD_TEMPORARY_OBJECT.avatar = ""; 
    SIGNUP_WIZARD_TEMPORARY_OBJECT.isAvatarReading = false;
    validateSignUpStepTwoDataFormCompleteness();
}

function processSignUpAvatarFileSelection() {
    const fileNode = document.getElementById("reg-avatar-file");
    const placeholder = document.getElementById("placeholderTextimg-signup");
    const preview = document.getElementById("imagePreview-signup");

    if (fileNode && fileNode.files && fileNode.files[0]) {
        // Step A: Flag that we've started reading the selected file.
        SIGNUP_WIZARD_TEMPORARY_OBJECT.isAvatarReading = true;
        validateSignUpStepTwoDataFormCompleteness(); // This disables and lightens the Next button instantly

        const readerInstance = new FileReader();
        
        readerInstance.onload = function(e) {
            // Step B: Set the preview image source, make it visible, and hide placeholder text.
            if (preview) {
                preview.src = e.target.result;
                preview.style.display = "block";
            }
            if (placeholder) {
                placeholder.style.display = "none";
            }
            
            // Step C: Complete registration tracking and clear wait locks.
            SIGNUP_WIZARD_TEMPORARY_OBJECT.avatar = e.target.result;
            SIGNUP_WIZARD_TEMPORARY_OBJECT.isAvatarReading = false;
            validateSignUpStepTwoDataFormCompleteness(); // Re-evaluate and release the Next button lock
        };

        readerInstance.onerror = function() {
            // Reset read state if file loading errors out.
            SIGNUP_WIZARD_TEMPORARY_OBJECT.isAvatarReading = false;
            validateSignUpStepTwoDataFormCompleteness();
        };

        readerInstance.readAsDataURL(fileNode.files[0]);
    } else {
        // If file input was cleared, revert preview boxes to default.
        if (preview) {
            preview.src = "";
            preview.style.display = "none";
        }
        if (placeholder) {
            placeholder.style.display = "block";
        }
        SIGNUP_WIZARD_TEMPORARY_OBJECT.avatar = "";
        SIGNUP_WIZARD_TEMPORARY_OBJECT.isAvatarReading = false;
        validateSignUpStepTwoDataFormCompleteness();
    }
}

function validateSignUpStepTwoDataFormCompleteness() {
    const currentType = document.getElementById("reg-account-type").value;
    const nextBtn = document.getElementById("btn-signup-step2-next");
    const personalNameInput = document.getElementById("reg-personal-name") ? document.getElementById("reg-personal-name").value.trim() : "";
    
    // Core check: If the FileReader is currently working, keep nextBtn disabled & faintly colored
    if (SIGNUP_WIZARD_TEMPORARY_OBJECT.isAvatarReading) {
        nextBtn.disabled = true;
        nextBtn.classList.add("faintly-colored");
        return;
    }

    if (currentType === 'personal') {
        if (personalNameInput.length > 1) {
            nextBtn.disabled = false;
            nextBtn.classList.remove("faintly-colored");
        } else {
            nextBtn.disabled = true;
            nextBtn.classList.add("faintly-colored");
        }
    } else {
        const bizNameInput = document.getElementById("reg-biz-name").value.trim();
        const bizInfoInput = document.getElementById("reg-biz-info").value.trim();
        const bizDealsInput = document.getElementById("reg-biz-deals").value.trim();
        const designerTermsAccepted = document.getElementById("chk-reg-designer-terms") ? document.getElementById("chk-reg-designer-terms").checked : false;
        
        if (personalNameInput.length > 1 && bizNameInput.length > 1 && bizInfoInput.length > 1 && bizDealsInput.length > 1 && designerTermsAccepted) {
            nextBtn.disabled = false;
            nextBtn.classList.remove("faintly-colored");
        } else {
            nextBtn.disabled = true;
            nextBtn.classList.add("faintly-colored");
        }
    }
}

function executeProcessSignUpStepTwoNextSequenceAction() {
    const currentType = document.getElementById("reg-account-type").value;
    SIGNUP_WIZARD_TEMPORARY_OBJECT.accountType = currentType;
    SIGNUP_WIZARD_TEMPORARY_OBJECT.identityName = document.getElementById("reg-personal-name").value.trim();
    if (currentType === 'business') {
        SIGNUP_WIZARD_TEMPORARY_OBJECT.businessName = document.getElementById("reg-biz-name").value.trim();
        SIGNUP_WIZARD_TEMPORARY_OBJECT.businessInfo = document.getElementById("reg-biz-info").value.trim();
        SIGNUP_WIZARD_TEMPORARY_OBJECT.productsDealtIn = document.getElementById("reg-biz-deals").value.trim();
    } else {
        SIGNUP_WIZARD_TEMPORARY_OBJECT.businessName = "";
        SIGNUP_WIZARD_TEMPORARY_OBJECT.businessInfo = "";
        SIGNUP_WIZARD_TEMPORARY_OBJECT.productsDealtIn = "";
    }
    
    renderSignUpModalWizardStepThree();
}

function renderSignUpModalWizardStepThree() {
    const wrapperTargetNode = document.getElementById("auth-modal-content");
    wrapperTargetNode.innerHTML = `
        <h3>Sign Up - Create Security Password (Step 3 of 4)</h3>
        <p style="font-size:0.8rem; color:var(--fort-gray-slate); margin-top:4px;">Must contain at least 6 characters comprising 1 uppercase literal, 1 lowercase literal, 1 numeric digit, and 1 non-alphanumeric special character symbol.</p>
        
        <div class="form-input-container margin-top-sm">
            <label>Input Desired Password:</label>
            <input type="password" id="reg-password-1" class="form-field-control" placeholder="Input Password Expression">
        </div>
        <div class="form-input-container">
            <label>Re-type Password to Confirm:</label>
            <input type="password" id="reg-password-2" class="form-field-control" placeholder="Confirm Password">
            <div id="err-reg-step3-validation-msg" class="text-danger-alert hidden-node"></div>
        </div>

        <div style="margin-top: 6px; display: flex; align-items: center; gap: 6px;">
            <input type="checkbox" id="chk-reg-showpass" onchange="toggleFormPasswordVisibilityChainSignUp()">
            <label for="chk-reg-showpass" style="font-size: 0.8rem; font-weight: 400; cursor: pointer; user-select: none;">Show Passwords</label>            
        </div>

        <div class="btn-group margin-top-md">
            <button onclick="renderSignUpModalWizardStepTwo()" class="btn-gray">Back</button>
            <button onclick="executeValidateAndProcessSignUpStepThree()" class="btn-blue">Next</button>
        </div>
    `;
}

function toggleFormPasswordVisibilityChainSignUp() {
    const status = document.getElementById("chk-reg-showpass").checked;
    document.getElementById("reg-password-1").type = status ? "text" : "password";
    document.getElementById("reg-password-2").type = status ? "text" : "password";
}

function executeValidateAndProcessSignUpStepThree() {
    const pass1 = document.getElementById("reg-password-1").value;
    const pass2 = document.getElementById("reg-password-2").value;
    const errorNode = document.getElementById("err-reg-step3-validation-msg");
    errorNode.classList.add("hidden-node");
    
    const requirementStatementText = "Any password created should have at least one uppercase letter, one lowercase letter, one symbol, one number and should be at least six characters.";
    if(pass1 !== pass2) {
        errorNode.innerText = "Password mismatch configuration discovered. Verification entries must align perfectly.";
        errorNode.classList.remove("hidden-node");
        return;
    }
    
    const passesLengthTest = pass1.length >= 6;
    const passesUppercaseTest = /[A-Z]/.test(pass1);
    const passesLowercaseTest = /[a-z]/.test(pass1);
    const passesDigitTest = /[0-9]/.test(pass1);
    const passesSymbolTest = /[^A-Za-z0-9]/.test(pass1);
    if(!passesLengthTest || !passesUppercaseTest || !passesLowercaseTest || !passesDigitTest || !passesSymbolTest) {
        errorNode.innerText = requirementStatementText;
        errorNode.classList.remove("hidden-node");
        return;
    }
    
    SIGNUP_WIZARD_TEMPORARY_OBJECT.secretKey = pass1;
    sendSignUpEmailJsOtpWorkflow(true);
}

/**
 * Handles generating, tracking, and executing EmailJS calls for OTP validation.
 * Enforces a daily constraint limit of 5 total sent requests per email address.
 */
async function sendSignUpEmailJsOtpWorkflow(isInitialLaunch = false) {
    const targetEmail = SIGNUP_WIZARD_TEMPORARY_OBJECT.identifierText;
    const todayKeyStr = "otp_limit_" + new Date().toISOString().split('T')[0] + "_" + targetEmail.toLowerCase();
    
    let dailyAttemptsCount = parseInt(localStorage.getItem(todayKeyStr) || "0", 10);
    if (dailyAttemptsCount >= 5) {
        if (!isInitialLaunch) {
            const feedbackElement = document.getElementById("err-reg-step4-feedback");
            if (feedbackElement) {
                feedbackElement.innerText = "Maximum daily limit reached. You can only send up to 5 OTPs per day.";
                feedbackElement.classList.remove("hidden-node");
            }
        } else {
            renderSignUpModalWizardStepFour();
            setTimeout(() => {
                const feedbackElement = document.getElementById("err-reg-step4-feedback");
                if (feedbackElement) {
                    feedbackElement.innerText = "Maximum daily limit reached. You can only send up to 5 OTPs per day.";
                    feedbackElement.classList.remove("hidden-node");
                }
            }, 50);
        }
        return;
    }

    // Trigger visual/logical 30-second resend cooldown block on successful checks
    initiateSignUpOtpResendCooldown();
    const freshGeneratedOtpCode = Math.floor(1000 + Math.random() * 9000);
    SIGNUP_WIZARD_TEMPORARY_OBJECT.activeVerificationOtp = freshGeneratedOtpCode;

    dailyAttemptsCount++;
    localStorage.setItem(todayKeyStr, dailyAttemptsCount.toString());
    if (!isInitialLaunch) {
        const feedbackElement = document.getElementById("err-reg-step4-feedback");
        if (feedbackElement) {
            feedbackElement.innerText = "Sending fresh code...";
            feedbackElement.style.color = "blue";
            feedbackElement.classList.remove("hidden-node");
        }
    }

    try {
        if (window.emailjs) {
            await window.emailjs.send(
                "service_ejag5pe", 
                "template_jz0s31e", 
                {
                    to_email: targetEmail,
                    user_name: SIGNUP_WIZARD_TEMPORARY_OBJECT.identityName,
                    otp_code: freshGeneratedOtpCode
                }
            );
            if (isInitialLaunch) {
                renderSignUpModalWizardStepFour();
            } else {
                const feedbackElement = document.getElementById("err-reg-step4-feedback");
                if (feedbackElement) {
                    feedbackElement.innerText = "A new verification code has been successfully sent.";
                    feedbackElement.style.color = "green";
                }
            }
        } else {
            console.warn("EmailJS library not loaded on global window context.");
            if (isInitialLaunch) renderSignUpModalWizardStepFour();
        }
    } catch (sendErr) {
        console.error("EmailJS transport error:", sendErr);
        if (isInitialLaunch) {
            renderSignUpModalWizardStepFour();
        } else {
            const feedbackElement = document.getElementById("err-reg-step4-feedback");
            if (feedbackElement) {
                feedbackElement.innerText = "Failed to send code. Please check your connection.";
                feedbackElement.style.color = "red";
            }
        }
    }
}

/**
 * Handles running tracking operations and layouts for the registration 30-second timer.
 */
function initiateSignUpOtpResendCooldown() {
    if (SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpInterval) {
        clearInterval(SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpInterval);
    }

    SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpSecondsLeft = 30;

    SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpInterval = setInterval(() => {
        SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpSecondsLeft--;
        
        const resendLinkNode = document.getElementById("signup-otp-resend-link");
        if (resendLinkNode) {
            if (SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpSecondsLeft > 0) {
                resendLinkNode.innerText = `Resend in ${SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpSecondsLeft}s`;
                resendLinkNode.style.opacity = "0.5";
                resendLinkNode.style.fontWeight = "400";
                resendLinkNode.style.pointerEvents = "none";
            } else {
                resendLinkNode.innerText = "Resend";
                resendLinkNode.style.opacity = "1";
                resendLinkNode.style.fontWeight = "600";
                resendLinkNode.style.pointerEvents = "auto";
                clearInterval(SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpInterval);
                SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpInterval = null;
            }
        } else if (SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpSecondsLeft <= 0) {
            clearInterval(SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpInterval);
            SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpInterval = null;
        }
    }, 1000);
}

/**
 * Click interceptor block safeguarding link responses against active cooldowns.
 */
function handleSignUpOtpResendActionClickInterception() {
    if (SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpSecondsLeft > 0) {
        return;
    }
    sendSignUpEmailJsOtpWorkflow(false);
}

function renderSignUpModalWizardStepFour() {
    const wrapperTargetNode = document.getElementById("auth-modal-content");
    const maskedTargetEmail = SIGNUP_WIZARD_TEMPORARY_OBJECT.identifierText;
    // Evaluate cooldown details to sustain layout state seamlessly on rendering
    const secondsLeft = SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpSecondsLeft || 0;
    const textLabel = secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "Resend";
    const opacityStyle = secondsLeft > 0 ? "0.5" : "1";
    const weightStyle = secondsLeft > 0 ? "400" : "600";
    const pointerEventsStyle = secondsLeft > 0 ? "none" : "auto";

    wrapperTargetNode.innerHTML = `
        <h3>Sign Up - Verify Email Identity (Step 4 of 4)</h3>
        <p style="font-size:0.92rem; color:var(--fort-blue-dark); line-height: 1.5; margin-top:12px; font-weight: 500;">
            Enter the OTP sent to ${maskedTargetEmail}
        </p>
        
        <div class="form-input-container margin-top-sm" style="margin-top:15px;">
            <label>Input 4-Digit OTP Code:</label>
            <input type="text" id="reg-otp-input" class="form-field-control" placeholder="X X X X" maxlength="4" style="text-align:center; font-size:1.25rem; letter-spacing:8px;">
            <div id="err-reg-step4-feedback" class="text-danger-alert hidden-node" style="color: red; font-size: 0.8rem; margin-top: 4px;"></div>
        </div>

        <div style="margin-top: 10px; font-size: 0.85rem;">
            <span>Didn't receive message? </span>
            <a href="javascript:void(0)" 
               id="signup-otp-resend-link"
               onclick="handleSignUpOtpResendActionClickInterception()" 
               style="color: #007bff; font-weight: ${weightStyle}; opacity: ${opacityStyle}; pointer-events: ${pointerEventsStyle}; text-decoration: none;">${textLabel}</a>
        </div>

        <p style="font-size:0.92rem; color:var(--fort-blue-dark); line-height: 1.5; margin-top:12px; font-weight: 500;">
            Note: If you didn't see the message in your inbox, also check the spam section in your email and tag the email "Not Spam".
        </p>
        
        <div class="btn-group margin-top-lg" style="margin-top: 20px;">
            <button onclick="handleClearSignUpTimersAndReturnToStepThree()" class="btn-gray">Back</button>
            <button id="btn-signup-finalize-submit" onclick="executeFinalizeAccountRegistrationPipelineSubmission()" class="btn-blue">Complete Registration</button>
        </div>
    `;
}

function handleClearSignUpTimersAndReturnToStepThree() {
    // Clear intervals if navigating backward to keep UI flow crisp
    if (SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpInterval) {
        clearInterval(SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpInterval);
        SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpInterval = null;
    }
    SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpSecondsLeft = 0;
    renderSignUpModalWizardStepThree();
}

function executeFinalizeAccountRegistrationPipelineSubmission() {
    const userInputCodeField = document.getElementById("reg-otp-input");
    const feedbackElement = document.getElementById("err-reg-step4-feedback");
    if (feedbackElement) {
        feedbackElement.classList.add("hidden-node");
        feedbackElement.style.color = "red";
    }

    const typedOtpValue = userInputCodeField.value.trim();
    const systemExpectedValue = String(SIGNUP_WIZARD_TEMPORARY_OBJECT.activeVerificationOtp || "");
    if (!typedOtpValue || typedOtpValue !== systemExpectedValue) {
        if (feedbackElement) {
            feedbackElement.innerText = "Invalid verification token. Please verify entry values.";
            feedbackElement.classList.remove("hidden-node");
        }
        return;
    }

    // Clean up tracking scopes & intervals
    if (SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpInterval) {
        clearInterval(SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpInterval);
        SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpInterval = null;
    }
    SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpSecondsLeft = 0;

    const isDesignerAccount = SIGNUP_WIZARD_TEMPORARY_OBJECT.accountType === 'business';

    const finalNewUserRecord = {
        uid: "user_" + Date.now(),
        identityName: SIGNUP_WIZARD_TEMPORARY_OBJECT.identityName,
        accountType: SIGNUP_WIZARD_TEMPORARY_OBJECT.accountType,
        country: SIGNUP_WIZARD_TEMPORARY_OBJECT.country,
        dialingCode: SIGNUP_WIZARD_TEMPORARY_OBJECT.dialingCode,
        identifierText: SIGNUP_WIZARD_TEMPORARY_OBJECT.identifierText,
        secretKey: SIGNUP_WIZARD_TEMPORARY_OBJECT.secretKey,
        avatar: SIGNUP_WIZARD_TEMPORARY_OBJECT.avatar || "", 
        // Designer accounts require admin approval (unverified), standard accounts default to verified
        verificationStatus: isDesignerAccount ? "unverified" : "verified",
        subaccountCode: isDesignerAccount ? "ACCT_DEFAULT" : "",
        UserAccountAuthenticationVerificationCode: systemExpectedValue, 
        businessName: SIGNUP_WIZARD_TEMPORARY_OBJECT.businessName || SIGNUP_WIZARD_TEMPORARY_OBJECT.identityName,
        businessInfo: SIGNUP_WIZARD_TEMPORARY_OBJECT.businessInfo || "No descriptions detailed yet.",
        productsDealtIn: SIGNUP_WIZARD_TEMPORARY_OBJECT.productsDealtIn || ""
    };
    
    SYSTEM_DATABASE.users.push(finalNewUserRecord);

    // Save state to local storage
    syncPlatformDatabaseStateToWebStorage();
    
    // Close registration modal
    closeActiveModalDirectly('auth-modal');

    if (isDesignerAccount) {
        // Designer account flow: Await admin approval
        alert("Registration submitted! Your designer account is pending administrative approval before full activation.");
    } else {
        // Standard personal account flow: Immediate login & welcome display
        APP_STATE.currentUser = finalNewUserRecord;
        document.getElementById("welcome-modal")?.classList.add("active");
    }
    
    // Clear wizard memory object to prevent data leakage in subsequent registrations
    SIGNUP_WIZARD_TEMPORARY_OBJECT = {};

    if (typeof navigateToPage === "function") {
        navigateToPage('fort-templates-section');
    }
}

function renderForgotPasswordModalWorkflow() {
    const wrapperTargetNode = document.getElementById("auth-modal-content");
    wrapperTargetNode.innerHTML = `
        <h3>Reset Password - Identify Account (Step 1 of 3)</h3>
        <p style="font-size:0.85rem; margin-top:6px; color:var(--fort-gray-slate);">
            Provide your country code and registered identification details to verify your account profile.
        </p>
        
        <div class="form-input-container margin-top-sm">
            <label style="font-size:0.82rem; font-weight:700; color:var(--fort-gray-slate);">Country Code:</label>
            <select id="forgot-country" class="form-field-control">
                <option value="+234" selected>+234 (Nigeria)</option>
            </select>
        </div>

        <div class="form-input-container margin-top-xs">
            <label style="font-size:0.82rem; font-weight:700; color:var(--fort-gray-slate);">Registration Contact (Email Address):</label>
            <input type="text" name="email" id="forgot-id" class="form-field-control" placeholder="example@domain.com">
            <div id="err-forgot-step1-feedback" class="text-danger-alert hidden-node" style="color: red; font-size: 0.8rem; margin-top: 4px;"></div>
        </div>

        <div class="btn-group margin-top-md">
            <button onclick="closeActiveModalDirectly('auth-modal')" class="btn-gray">Close</button>
            <button id="btn-forgot-step1-next" onclick="executeValidateForgotPasswordStepOnePipelineTrace()" class="btn-blue">Next</button>
        </div>
    `;
}

async function executeValidateForgotPasswordStepOnePipelineTrace() {
    const code = document.getElementById("forgot-country").value.trim();
    const rawId = document.getElementById("forgot-id").value.trim();
    const errorNode = document.getElementById("err-forgot-step1-feedback");
    const nextBtn = document.getElementById("btn-forgot-step1-next");
    
    errorNode.classList.add("hidden-node");
    errorNode.innerText = "";

    const accountMatch = SYSTEM_DATABASE.users.find(u => 
        u.dialingCode === code && 
        u.identifierText.toLowerCase() === rawId.toLowerCase()
    );
    if(!accountMatch) {
        errorNode.innerText = "No structural match trace discovered checking records configuration baseline arrays.";
        errorNode.classList.remove("hidden-node");
        return;
    }
    
    SIGNUP_WIZARD_TEMPORARY_OBJECT.resetTargetUid = accountMatch.uid;
    SIGNUP_WIZARD_TEMPORARY_OBJECT.resetTargetEmail = accountMatch.identifierText;
    SIGNUP_WIZARD_TEMPORARY_OBJECT.resetTargetName = accountMatch.identityName || "User";

    if (nextBtn) nextBtn.disabled = true;
    await sendForgotPasswordEmailJsOtpWorkflow(true);
}

async function sendForgotPasswordEmailJsOtpWorkflow(isInitialLaunch = false) {
    const targetEmail = SIGNUP_WIZARD_TEMPORARY_OBJECT.resetTargetEmail;
    const todayKeyStr = "otp_forgot_limit_" + new Date().toISOString().split('T')[0] + "_" + targetEmail.toLowerCase();
    
    let dailyAttemptsCount = parseInt(localStorage.getItem(todayKeyStr) || "0", 10);
    if (dailyAttemptsCount >= 5) {
        if (!isInitialLaunch) {
            const feedbackElement = document.getElementById("err-forgot-step2-feedback");
            if (feedbackElement) {
                feedbackElement.innerText = "Maximum daily limit reached. You can only send up to 5 recovery OTPs per day.";
                feedbackElement.classList.remove("hidden-node");
            }
        } else {
            renderForgotPasswordOtpVerificationLayout();
            setTimeout(() => {
                const feedbackElement = document.getElementById("err-forgot-step2-feedback");
                if (feedbackElement) {
                    feedbackElement.innerText = "Maximum daily limit reached. You can only send up to 5 recovery OTPs per day.";
                    feedbackElement.classList.remove("hidden-node");
                }
            }, 50);
        }
        return;
    }

    // Trigger the 30 seconds countdown timer when a request successfully passes limits
    initiateOtpResendCooldown();

    const freshGeneratedOtpCode = Math.floor(1000 + Math.random() * 9000);
    SIGNUP_WIZARD_TEMPORARY_OBJECT.activeResetOtp = freshGeneratedOtpCode;

    dailyAttemptsCount++;
    localStorage.setItem(todayKeyStr, dailyAttemptsCount.toString());

    if (!isInitialLaunch) {
        const feedbackElement = document.getElementById("err-forgot-step2-feedback");
        if (feedbackElement) {
            feedbackElement.innerText = "Sending fresh token key paths...";
            feedbackElement.style.color = "blue";
            feedbackElement.classList.remove("hidden-node");
        }
    }

    try {
        if (window.emailjs) {
            await window.emailjs.send(
                "service_ejag5pe", 
                "template_nzub7tk", 
                {
                    to_email: targetEmail,
                    user_name: SIGNUP_WIZARD_TEMPORARY_OBJECT.resetTargetName,
                    otp_code: freshGeneratedOtpCode
                }
            );
            if (isInitialLaunch) {
                renderForgotPasswordOtpVerificationLayout();
            } else {
                const feedbackElement = document.getElementById("err-forgot-step2-feedback");
                if (feedbackElement) {
                    feedbackElement.innerText = "A new security token validation string code has been sent.";
                    feedbackElement.style.color = "green";
                }
            }
        } else {
            console.warn("EmailJS script dependency structure is unavailable.");
            if (isInitialLaunch) renderForgotPasswordOtpVerificationLayout();
        }
    } catch (sendErr) {
        console.error("EmailJS password recovery submission sequence failure:", sendErr);
        if (isInitialLaunch) {
            renderForgotPasswordOtpVerificationLayout();
        } else {
            const feedbackElement = document.getElementById("err-forgot-step2-feedback");
            if (feedbackElement) {
                feedbackElement.innerText = "Failed transmission delivery. Please verify connectivity.";
                feedbackElement.style.color = "red";
            }
        }
    }
}

/**
 * Handles controlling tracking values and interval states for the 30-second cooldown.
 */
function initiateOtpResendCooldown() {
    // Clear any existing active intervals to avoid duplicate speed runners
    if (SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownInterval) {
        clearInterval(SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownInterval);
    }

    SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownSecondsLeft = 30;

    SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownInterval = setInterval(() => {
        SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownSecondsLeft--;
        
        const resendLinkNode = document.getElementById("forgot-otp-resend-link");
        if (resendLinkNode) {
            if (SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownSecondsLeft > 0) {
                resendLinkNode.innerText = `Resend in ${SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownSecondsLeft}s`;
                resendLinkNode.style.opacity = "0.5";
                resendLinkNode.style.fontWeight = "400";
                resendLinkNode.style.pointerEvents = "none";
            } else {
                resendLinkNode.innerText = "Resend";
                resendLinkNode.style.opacity = "1";
                resendLinkNode.style.fontWeight = "600";
                resendLinkNode.style.pointerEvents = "auto";
                clearInterval(SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownInterval);
                SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownInterval = null;
            }
        } else if (SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownSecondsLeft <= 0) {
            // Stop interval if element context is out of layout focus
            clearInterval(SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownInterval);
            SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownInterval = null;
        }
    }, 1000);
}

/**
 * Wrapper interceptor ensuring code execution doesn't process if a cooldown window is active.
 */
function handleOtpResendActionClickInterception() {
    if (SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownSecondsLeft > 0) {
        return; 
    }
    sendForgotPasswordEmailJsOtpWorkflow(false);
}

function renderForgotPasswordOtpVerificationLayout() {
    const wrapperTargetNode = document.getElementById("auth-modal-content");
    const maskedTargetEmail = SIGNUP_WIZARD_TEMPORARY_OBJECT.resetTargetEmail;

    // Evaluate state properties dynamically on initial layout attachment
    const secondsLeft = SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownSecondsLeft || 0;
    const textLabel = secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "Resend";
    const opacityStyle = secondsLeft > 0 ? "0.5" : "1";
    const weightStyle = secondsLeft > 0 ? "400" : "600";
    const pointerEventsStyle = secondsLeft > 0 ? "none" : "auto";

    wrapperTargetNode.innerHTML = `
        <h3>Reset Password - Verify Identity (Step 2 of 3)</h3>
        <p style="font-size:0.92rem; color:var(--fort-blue-dark); line-height: 1.5; margin-top:12px; font-weight: 500;">
            Enter the OTP sent to ${maskedTargetEmail}
        </p>
        
        <div class="form-input-container margin-top-sm" style="margin-top:15px;">
            <label style="font-size:0.82rem; font-weight:700; color:var(--fort-gray-slate);">Input 4-Digit Security Reset Code Key:</label>
            <input type="text" id="forgot-otp-input" class="form-field-control" placeholder="X X X X" maxlength="4" style="text-align:center; font-size:1.25rem; letter-spacing:8px;">
            <div id="err-forgot-step2-feedback" class="text-danger-alert hidden-node" style="color: red; font-size: 0.8rem; margin-top: 4px;"></div>
        </div>

        <div style="margin-top: 10px; font-size: 0.85rem;">
            <span>Didn't receive message? </span>
            <a href="javascript:void(0)" 
               id="forgot-otp-resend-link"
               onclick="handleOtpResendActionClickInterception()" 
               style="color: #007bff; font-weight: ${weightStyle}; opacity: ${opacityStyle}; pointer-events: ${pointerEventsStyle}; text-decoration: none;">${textLabel}</a>
        </div>

        <p style="font-size:0.92rem; color:var(--fort-blue-dark); line-height: 1.5; margin-top:12px; font-weight: 500;">
            Note: If you didn't see the message in your inbox, also check the spam section in your email and tag the email "Not Spam".
        </p>
        
        <div class="btn-group margin-top-lg" style="margin-top: 20px;">
            <button onclick="renderForgotPasswordModalWorkflow()" class="btn-gray">Back</button>
            <button id="btn-forgot-finalize-otp" onclick="executeValidateForgotPasswordOtpEntryToken()" class="btn-blue">Verify Code</button>
        </div>
    `;
}

function executeValidateForgotPasswordOtpEntryToken() {
    const userInputCodeField = document.getElementById("forgot-otp-input");
    const feedbackElement = document.getElementById("err-forgot-step2-feedback");
    if (feedbackElement) {
        feedbackElement.classList.add("hidden-node");
        feedbackElement.style.color = "red";
    }

    const typedOtpValue = userInputCodeField.value.trim();
    const systemExpectedValue = String(SIGNUP_WIZARD_TEMPORARY_OBJECT.activeResetOtp || "");
    if (!typedOtpValue || typedOtpValue !== systemExpectedValue) {
        if (feedbackElement) {
            feedbackElement.innerText = "Invalid security verification token matched. Verify entry values.";
            feedbackElement.classList.remove("hidden-node");
        }
        return;
    }

    // Clean up timers on successful validation phase transitions
    if (SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownInterval) {
        clearInterval(SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownInterval);
        SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownInterval = null;
    }
    SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownSecondsLeft = 0;

    renderForgotPasswordStepTwoLayout();
}

function renderForgotPasswordStepTwoLayout() {
    const wrapperTargetNode = document.getElementById("auth-modal-content");
    wrapperTargetNode.innerHTML = `
        <h3>Reset Password - Define New Security Key (Step 3 of 3)</h3>
        <div class="form-input-container margin-top-sm">
            <label>Input New Security Access Password Token Key Pattern:</label>
            <input type="password" id="forgot-newpass-1" class="form-field-control" placeholder="New Password Expression">
        </div>
        <div class="form-input-container">
            <label>Re-type New Password Expression to Confirm Alignment:</label>
            <input type="password" id="forgot-newpass-2" class="form-field-control" placeholder="Confirm Password Expression">
            <div id="err-forgot-newpass-feedback" class="text-danger-alert hidden-node" style="color: red; font-size: 0.8rem; margin-top: 4px;"></div>
        </div>
        <div class="btn-group" style="margin-top: 15px;">
            <button onclick="closeActiveModalDirectly('auth-modal')" class="btn-gray">Discard Session</button>
            <button onclick="executeCommitNewPasswordToSystemDatabase()" class="btn-blue">Save & Login</button>
        </div>
    `;
}

function executeCommitNewPasswordToSystemDatabase() {
    const p1 = document.getElementById("forgot-newpass-1").value;
    const p2 = document.getElementById("forgot-newpass-2").value;
    const errorNode = document.getElementById("err-forgot-newpass-feedback");
    errorNode.classList.add("hidden-node");
    
    if(p1 !== p2) {
        errorNode.innerText = "Password structural mismatch discovered checking confirmation fields string parameters.";
        errorNode.classList.remove("hidden-node");
        return;
    }
    
    if(p1.length < 6 || !/[A-Z]/.test(p1) || !/[a-z]/.test(p1) || !/[0-9]/.test(p1) || !/[^A-Za-z0-9]/.test(p1)) {
        errorNode.innerText = "Any password created should have at least one uppercase letter, one lowercase letter, one symbol, one number and should be at least six characters.";
        errorNode.classList.remove("hidden-node");
        return;
    }
    
    const accountIndexId = SYSTEM_DATABASE.users.findIndex(u => u.uid === SIGNUP_WIZARD_TEMPORARY_OBJECT.resetTargetUid);
    if(accountIndexId !== -1) {
        SYSTEM_DATABASE.users[accountIndexId].secretKey = p1;
        SYSTEM_DATABASE.users[accountIndexId].password = p1; 
        
        APP_STATE.currentUser = SYSTEM_DATABASE.users[accountIndexId];
        syncPlatformDatabaseStateToWebStorage();
        closeActiveModalDirectly('auth-modal');
        document.getElementById("welcome-modal").classList.add("active");
        navigateToPage('fort-templates-section');
    }
}

/**
 * Product Discovery Inventory Pipeline Management Loop & Search Filter Subsystem Engine Modules
 */
function buildCategoryRibbonFilterInterfaceElements() {
    const structuralCategoryListArray = ["Trending", "Electrical Appliances", "Mobile Devices & Computers", "Home Furniture", "Fashion Clothing Apparel", "Automotive Parts & Engines","Beauty & Personal Care", "Sports, Fitness and Outdoors", "Groceries & Essentials", "Others"];
    const targetsWrapperNode = document.getElementById("category-items-container");
    targetsWrapperNode.innerHTML = "";
    
    structuralCategoryListArray.forEach(catName => {
        const chipBtnNode = document.createElement("button");
        chipBtnNode.className = `category-chip-btn ${APP_STATE.currentSelectedCategory === catName ? 'active' : ''}`;
        chipBtnNode.innerText = catName;
        chipBtnNode.onclick = () => {
            document.querySelectorAll(".category-chip-btn").forEach(b => b.classList.remove("active"));
            chipBtnNode.classList.add("active");
            executeCategorizedInventoryFilterAction(catName);
        };
        targetsWrapperNode.appendChild(chipBtnNode);
    });
}

function toggleCategoryDrawer() {
    const targetNode = document.getElementById("category-items-container");
    APP_STATE.categoryDrawerOpen = !APP_STATE.categoryDrawerOpen;
    if(APP_STATE.categoryDrawerOpen) {
        targetNode.classList.remove("hidden");
    } else {
        targetNode.classList.add("hidden");
    }
}

function executeCategorizedInventoryFilterAction(categoryNameString) {
    APP_STATE.currentSelectedCategory = categoryNameString;
    const subheaderNode = document.getElementById("active-category-header");
    
    if(categoryNameString === 'Trending') {
        subheaderNode.classList.add("hidden-node");
    } else {
        subheaderNode.classList.remove("hidden-node");
        document.getElementById("category-title-text").innerText = categoryNameString;
    }
    renderMarketplaceProductsDisplayLoop();
}

function handleGlobalSearch(searchStringQuery) {
    APP_STATE.searchQuery = searchStringQuery.trim().toLowerCase();
    
    if (APP_STATE.activeViewPage === 'home') {
        renderMarketplaceProductsDisplayLoop();
    } else if (APP_STATE.activeViewPage === 'messages') {
        renderUserConversationsLogRoster();
    } else if (APP_STATE.activeViewPage === 'my-account') {
        executeFilteringSettingsContentPaneRowsNodesDisplay(APP_STATE.searchQuery);
    } else if (APP_STATE.activeViewPage === 'designer-history-page') {
        renderDesignerHistoryDashboard();
    } else if (APP_STATE.activeViewPage === 'fort-templates-section') {
        renderFortTemplatesSection();
    } else if (APP_STATE.activeViewPage === 'designer-workspace') {
        // Connected the second page
        renderDesignerProjectsWorkspaceDashboard(); 
    }
}

function handleCategorySearch(searchStringQuery) {
    APP_STATE.searchQuery = searchStringQuery.trim().toLowerCase();
    renderMarketplaceProductsDisplayLoop();
}

// Ensure foundational state variables exist safely
if (!SYSTEM_DATABASE.pinnedLeaderboard) {
    SYSTEM_DATABASE.pinnedLeaderboard = Array(20).fill(null); // Explicit 20-slot tracking architecture
}
if (SYSTEM_DATABASE.adminSlot === undefined) {
    SYSTEM_DATABASE.adminSlot = null; // High priority admin override slot
}

/**
 * RENDER MARKETPLACE PRODUCTS DISPLAY LOOP
 * Excludes both completed/downloaded projects AND currently booked projects
 * so only unbooked, active projects appear in the public marketplace.
 */
function renderMarketplaceProductsDisplayLoop() {
    try {
        const container = document.getElementById("products-display-grid") || 
                          (typeof DOM_ELEMENT_REFERENCES !== 'undefined' ? DOM_ELEMENT_REFERENCES.productsContainer : null);

        if (!container) return;

        if (typeof SYSTEM_DATABASE === 'undefined' || !SYSTEM_DATABASE.products) {
            window.SYSTEM_DATABASE = window.SYSTEM_DATABASE || {};
            window.SYSTEM_DATABASE.products = [];
        }

        const currentUser = (typeof APP_STATE !== 'undefined' && APP_STATE.currentUser) ? APP_STATE.currentUser : null;

        if (!currentUser) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 48px 16px; background: #f9fafb; border: 2px dashed #e5e7eb; border-radius: 12px; margin: 20px 0;">
                    <h3 style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 6px;">Sign up or login to view available projects or make project requests.</h3>
                    <div style="display: flex; gap: 12px; justify-content: center; margin-top: 16px;">
                        <button class="btn-blue" onclick="renderSignUpModalWizardStepOne()">Sign Up</button>
                        <button class="btn-blue" onclick="triggerAuthenticationModalSequence()">Sign In</button>
                    </div>
                </div>
            `;
            return;
        }

        const accountType = (currentUser.accountType || currentUser.role || 'personal').toLowerCase();
        let allProducts = [...SYSTEM_DATABASE.products];
        let displayProducts = [];

        // STRICT FILTER: Exclude COMPLETED projects AND BOOKED projects
        let activeMarketplaceProducts = allProducts.filter(item => {
            const isCompleted = item.status === 'completed' || item.isCompleted;
            const isBooked = item.isBooked || item.status === 'booked';
            return !isCompleted && !isBooked;
        });

        if (accountType === 'personal') {
            const currentUid = currentUser.uid || currentUser.id;
            displayProducts = activeMarketplaceProducts.filter(item => item.ownerUid === currentUid);
        } else if (['vendor', 'admin', 'business', 'designer'].includes(accountType)) {
            const userCountry = currentUser.country || 'Nigeria';
            displayProducts = activeMarketplaceProducts.filter(item => {
                return !item.countryScope || item.countryScope === userCountry || item.countryScope === 'All';
            });
        } else {
            displayProducts = activeMarketplaceProducts;
        }

        const searchQuery = (typeof APP_STATE !== 'undefined' && APP_STATE.searchQuery ? APP_STATE.searchQuery : "").trim().toLowerCase();

        if (searchQuery) {
            displayProducts = displayProducts.filter(prod => {
                const name = (prod.name || prod.title || "").toLowerCase();
                const description = (prod.info || prod.instructions || "").toLowerCase();
                const ownerName = (prod.ownerName || prod.clientName || prod.requesterName || prod.userName || "").toLowerCase();

                return name.includes(searchQuery) || description.includes(searchQuery) || ownerName.includes(searchQuery);
            });
        }

        if (!displayProducts || displayProducts.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 48px 16px; background: #f9fafb; border: 2px dashed #e5e7eb; border-radius: 12px; margin: 20px 0;">
                    <h3 style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 6px;">No Available Projects</h3>
                </div>
            `;
            return;
        }

        let cardsHtml = '';
        displayProducts.forEach(prod => {
            const coverImage = prod.coverPhoto || (prod.assets && prod.assets.length > 0 ? prod.assets[0].dataUrl : 'https://via.placeholder.com/300x200?text=No+Image');
            const formattedPrice = prod.price ? `₦${prod.price.toLocaleString()}` : '₦1,000';
            const itemTitle = prod.name || prod.title || 'Untitled Project';

            cardsHtml += `
                <div class="product-card" data-pid="${prod.pid}" 
                     onclick="launchComprehensiveProductSpecificationsExpandedModalView(event, '${prod.pid}')" 
                     style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background: #fff; display: flex; flex-direction: column; cursor: pointer;">
                    <div style="height: 180px; width: 100%; background: #f3f4f6; overflow: hidden; position: relative;">
                        <img src="${coverImage}" alt="${itemTitle}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div style="padding: 16px; display: flex; flex-direction: column; flex-grow: 1;">
                        <h4 style="font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">${itemTitle}</h4>
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: auto;">
                            <span style="font-size: 16px; font-weight: 700; color: #059669;">${formattedPrice}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = cardsHtml;

    } catch (err) {
        console.error("Error in renderMarketplaceProductsDisplayLoop:", err);
    }
}

/**
 * EXPANDED PRODUCT SPECIFICATIONS MODAL VIEW
 * Includes Admin Controls: Delete Listing (unbooked) & View Designer's Info (booked)
 */
function launchComprehensiveProductSpecificationsExpandedModalView(evt, productIdTokenKey) {
    // Handle overload where event parameter might be omitted
    if (typeof evt === 'string' && !productIdTokenKey) {
        productIdTokenKey = evt;
        evt = null;
    }

    if (evt && evt.stopPropagation) {
        evt.stopPropagation();
    }

    const currentUser = (typeof APP_STATE !== 'undefined' && APP_STATE.currentUser) ? APP_STATE.currentUser : null;

    if (!currentUser) {
        if (typeof triggerAuthenticationModalSequence === 'function') {
            triggerAuthenticationModalSequence();
        }
        return;
    }
    
    if (typeof recordProductHitCount === 'function') {
        recordProductHitCount(productIdTokenKey);
    }
    
    let targetedProductItemMatch = SYSTEM_DATABASE.products.find(p => p.pid === productIdTokenKey);
    if (!targetedProductItemMatch) return;
    
    const operationalTargetProfileOwnerRecord = SYSTEM_DATABASE.users.find(u => u.uid === targetedProductItemMatch.ownerUid);
    const detailOverlayNode = document.getElementById("product-detail-modal");
    const detailOverlayBodyNode = document.getElementById("product-detail-modal-body");

    if (!detailOverlayNode || !detailOverlayBodyNode) {
        console.error("Modal target elements '#product-detail-modal' or '#product-detail-modal-body' were not found in the DOM.");
        return;
    }

    let baselineCurrencySymbolSign = (currentUser && currentUser.country === 'Nigeria') ? '₦' : '$';
    
    let operationalActionControlsLayoutStringHTML = `
        <button class="btn-blue" style="width:100%;" onclick="closeActiveModalDirectly('product-detail-modal'); executeBookProjectWorkflow('${targetedProductItemMatch.pid}')">📌 Book Project</button>
    `;

    // --- ADMIN PANEL CONTROLS ---
    let adminPinControlHTML = "";
    const isUserAdmin = (currentUser.uid === 'admin' || currentUser.id === 'admin' || currentUser.accountType === 'admin');
    
    if (isUserAdmin) {
        const leaderboard = SYSTEM_DATABASE.pinnedLeaderboard || [];
        const isCurrentPinned = leaderboard.includes(targetedProductItemMatch.pid);
        const isAdminSlotOccupant = (SYSTEM_DATABASE.adminSlot === targetedProductItemMatch.pid);
        const isBooked = targetedProductItemMatch.isBooked || targetedProductItemMatch.status === 'booked';
        
        let adminActionButtons = '';
        
        if (!isBooked) {
            // Delete Listing Button for Unbooked Projects
            adminActionButtons += `
                <button class="btn-danger" style="flex: 1; padding: 6px; font-size: 0.8rem; font-weight: bold; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    onclick="triggerAdminDeleteUnbookedProductWorkflow('${targetedProductItemMatch.pid}')">
                    🗑️ Delete Listing
                </button>
            `;
        } else {
            // View Designer's Info Button for Booked Projects
            adminActionButtons += `
                <button class="btn-blue" style="flex: 1; padding: 6px; font-size: 0.8rem; font-weight: bold; background: #0284c7; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    onclick="viewBookedDesignerInfoModal('${targetedProductItemMatch.pid}')">
                    🎨 View Designer's Info
                </button>
            `;
        }
        
        adminPinControlHTML = `
            <div style="background: #edf2f7; border: 1px dashed var(--fort-blue-primary, #2563eb); padding: 12px; border-radius: 6px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px;">
                <span style="font-size: 0.85rem; font-weight: bold; color: var(--fort-blue-dark, #1e3a8a);">🛡️ Admin Controls Hub</span>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="${isCurrentPinned ? 'btn-gray' : 'btn-blue'}" style="flex: 1; padding: 6px; font-size: 0.8rem; font-weight: bold;"
                        onclick="executeToggleProductPinState('${targetedProductItemMatch.pid}')">
                        ${isCurrentPinned ? '🛑 Unpin Standard' : '📌 Pin Standard'}
                    </button>
                    <button class="${isAdminSlotOccupant ? 'btn-danger' : 'btn-success'}" style="flex: 1; padding: 6px; font-size: 0.8rem; font-weight: bold; background: ${isAdminSlotOccupant ? 'crimson':'green'}; color: white; border:none; border-radius:4px; cursor:pointer;"
                        onclick="toggleAdminExclusiveSlotState('${targetedProductItemMatch.pid}')">
                        ${isAdminSlotOccupant ? '❌ Unassign Admin' : '👑 Assign Admin'}
                    </button>
                    ${adminActionButtons}
                </div>
            </div>
        `;
    }
    
    const productDisplayImage = targetedProductItemMatch.coverPhoto ||
        `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e0'><path d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/></svg>`;
        
    // Format asset chips for prompt overlay
    let assetsMarkup = '<span style="font-size:0.85rem; color:#718096;">No attached media assets.</span>';
    if (targetedProductItemMatch.assets && targetedProductItemMatch.assets.length > 0) {
        assetsMarkup = targetedProductItemMatch.assets.map(asset => `
            <button class="asset-chip-button" onclick="launchAssetManagementModal('${targetedProductItemMatch.pid}', '${asset.id}')">
                📁 ${asset.fileName}
            </button>
        `).join(" ");
    }

    detailOverlayBodyNode.innerHTML = `
        <div class="modal-expanded-header-row" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--fort-gray-border, #e5e7eb); padding-bottom:14px;">
            <h3>Project Specifications & Prompts</h3>
            <button onclick="closeActiveModalDirectly('product-detail-modal')" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">✕</button>
        </div>
        <div class="modal-expanded-content-split-grid margin-top-md" style="display:grid; grid-template-columns: 1fr 1fr; gap:24px;">
            <div class="expanded-left-visuals-column">
               <div class="expanded-master-image-box rounded-rect" style="width:100%; height:320px; background-color:#fcfcfc; overflow:hidden; border:1px solid var(--fort-gray-border, #e5e7eb); display:flex; align-items:center; justify-content:center;">
                    <img src="${productDisplayImage}" style="width:100%; height:100%; object-fit:contain;" alt="Master Expanded Product Frame">
                </div>
                <div style="margin-top:12px;">
                    <h5 style="text-transform:uppercase; font-size:0.75rem; color:var(--fort-gray-slate, #64748b);">Customer Project Assets</h5>
                    <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:6px;">
                        ${assetsMarkup}
                    </div>
                </div>
            </div>
            <div class="expanded-right-details-column" style="display:flex; flex-direction:column; gap:12px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${(operationalTargetProfileOwnerRecord && operationalTargetProfileOwnerRecord.avatar) ? operationalTargetProfileOwnerRecord.avatar : 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23a0aec0\'><path d=\'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z\'/></svg>'}" style="width:44px; height:44px; border-radius:50%;" class="circle-container" alt="Vendor Big Profile Photo">
                    <div>
                        <h4 style="color:var(--fort-blue-primary, #2563eb); margin:0;">${operationalTargetProfileOwnerRecord ? (operationalTargetProfileOwnerRecord.identityName || operationalTargetProfileOwnerRecord.username) : 'Customer Request Profile'}</h4>
                        <span style="font-size:0.75rem; color:var(--fort-gray-slate, #64748b);">Country: ${operationalTargetProfileOwnerRecord ? operationalTargetProfileOwnerRecord.country : 'Nigeria'}</span>
                    </div>
                </div>
                
                <h2 style="color:var(--fort-blue-dark, #1e3a8a); font-weight:800; margin-top:8px; margin-bottom:0;">${targetedProductItemMatch.name}</h2>
                <div style="font-size:1.6rem; font-weight:900; color:var(--fort-blue-light, #3b82f6);">${baselineCurrencySymbolSign}${targetedProductItemMatch.price ? targetedProductItemMatch.price.toLocaleString() : '1,000'}</div>
                
                <div class="spec-note-paragraph-block">
                    <h5 style="text-transform:uppercase; font-size:0.75rem; letter-spacing:1px; color:var(--fort-gray-slate, #64748b);">Customer Design Prompts & Instructions</h5>
                    <p style="font-size:0.95rem; line-height:1.4; color:var(--fort-blue-dark, #1e3a8a); margin-top:4px;">${targetedProductItemMatch.info}</p>
                </div>
                
                ${adminPinControlHTML}

                <div class="modal-expanded-actions-footer-row btn-group" style="margin-top:auto; padding-top:16px; border-top:1px solid #f0f0f0;">
                    ${operationalActionControlsLayoutStringHTML}
                </div>
            </div>
        </div>
    `;

    // Ensure display property and active CSS class are both set
    detailOverlayNode.style.display = 'block';
    detailOverlayNode.classList.add("active");
}

/**
* 2. BOOK PROJECT WORKFLOW & PASSWORD VERIFICATION
*/
function executeBookProjectWorkflow(productId) {
    if (!APP_STATE.currentUser) {
        showTopRightToast("Please log in to book projects.", "info");
        return;
    }

    // Account Role & Status Checks
    const userRole = APP_STATE.currentUser.accountType || APP_STATE.currentUser.type;
    if (userRole !== 'designer' && userRole !== 'business') {
        showTopRightToast("Only registered designer accounts can book projects.", "error");
        return;
    }

    const currentStatus = APP_STATE.currentUser.verificationStatus || APP_STATE.currentUser.status;
    if (currentStatus === 'unverified' || APP_STATE.currentUser.approvalStatus === 'unapproved') {
        showTopRightToast("Your designer account is pending approval by the admin.", "error");
        return;
    }

    // Maximum 2 Active Booked Projects Limit
    const activeBookedCount = SYSTEM_DATABASE.products.filter(p => p.bookedByUid === APP_STATE.currentUser.uid && p.status !== 'completed').length;
    if (activeBookedCount >= 2) {
        showTopRightToast("You can only have a maximum of 2 active booked projects at a time.", "error");
        return;
    }

    // Password Confirmation Modal Initialization
    let pwdModal = document.getElementById("book-project-pwd-modal");
    if (pwdModal) pwdModal.remove();

    pwdModal = document.createElement("div");
    pwdModal.id = "book-project-pwd-modal";
    pwdModal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;";

    pwdModal.innerHTML = `
        <div style="background: white; border-radius: 8px; max-width: 400px; width: 90%; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
            <h3 style="margin-top:0; color:var(--fort-blue-dark, #0d233a);">Confirm Password</h3>
            <p style="font-size:0.88rem; color:#555; margin-bottom:16px;">Confirm your secret key/password to finalize project booking:</p>
            
            <div style="margin-bottom:16px;">
                <label style="display:block; font-size:0.8rem; margin-bottom:4px; font-weight:600;">Account Password</label>
                <input type="password" id="book-pwd-input" class="form-field-control" placeholder="Enter password" style="width:100%; padding:8px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;">
                <div id="book-pwd-error" style="color:red; font-size:0.8rem; margin-top:4px; display:none;"></div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:8px;">
                <button class="btn-gray" onclick="document.getElementById('book-project-pwd-modal').remove()">Cancel</button>
                <button class="btn-blue" onclick="processVerifyPasswordAndConfirmBooking('${productId}')">Confirm Booking</button>
            </div>
        </div>
    `;

    document.body.appendChild(pwdModal);
}

function processVerifyPasswordAndConfirmBooking(productId) {
    const pwdInput = document.getElementById("book-pwd-input");
    const errFeedback = document.getElementById("book-pwd-error");
    const enteredPassword = pwdInput ? pwdInput.value.trim() : "";

    const actualSecret = APP_STATE.currentUser.secretKey || APP_STATE.currentUser.password || "";

    if (!enteredPassword || enteredPassword !== actualSecret) {
        if (errFeedback) {
            errFeedback.innerText = "Invalid password. Access denied.";
            errFeedback.style.display = "block";
        }
        return;
    }

    const targetProduct = SYSTEM_DATABASE.products.find(p => p.pid === productId);
    if (targetProduct) {
        const timestamp = new Date().toISOString();
        targetProduct.isBooked = true;
        targetProduct.status = 'booked';
        targetProduct.bookedByUid = APP_STATE.currentUser.uid;
        targetProduct.bookedAt = timestamp;
        targetProduct.modifications = targetProduct.modifications || [];

        // Find requester name
        const requester = SYSTEM_DATABASE.users.find(u => u.uid === targetProduct.ownerUid) || {};

        // Log History Record
        recordDesignerActivityLog({
            designerUid: APP_STATE.currentUser.uid,
            productId: targetProduct.pid,
            productName: targetProduct.name,
            requesterUid: targetProduct.ownerUid,
            requesterName: requester.name || requester.username || "Customer",
            type: 'booking',
            actionText: 'Project booked by designer',
            timestamp: timestamp
        });

        syncPlatformDatabaseStateToWebStorage();
        showTopRightToast("Project booked successfully! Moved to My Projects.", "success");
    }

    document.getElementById("book-project-pwd-modal").remove();
    closeActiveModalDirectly('product-detail-modal');
    navigateToPage('designer-projects');
}

function toggleAdminExclusiveSlotState(pid) {
    if (SYSTEM_DATABASE.adminSlot === pid) {
        SYSTEM_DATABASE.adminSlot = null;
        showTopRightToast("Admin slot unassigned successfully.", "error");
    } else {
        SYSTEM_DATABASE.adminSlot = pid;
        showTopRightToast("Admin slot assigned to this product exclusively.", "success");
    }
    administrativeSaveAndRefreshDisplay(pid);
}

/**
 * Action execution function modifying pin placement parameter assignments fields on target listings 
 */
function executeToggleProductPinState(productIdKey) {
    if (!SYSTEM_DATABASE.pinnedLeaderboard) {
        SYSTEM_DATABASE.pinnedLeaderboard = [];
    }
    
    const indexLocation = SYSTEM_DATABASE.pinnedLeaderboard.indexOf(productIdKey);
    
    if (indexLocation > -1) {
        // Product is pinned: unpin it by removing it from leaderboard
        SYSTEM_DATABASE.pinnedLeaderboard.splice(indexLocation, 1);
    } else {
        // Product is not pinned: append it to leaderboard if slots are available
        if (SYSTEM_DATABASE.pinnedLeaderboard.length >= 20) {
            showTopRightToast("Administrative Action Blocked: The leaderboard has hit its maximum limit of 20 slots.", "error");
            return;
        }
        SYSTEM_DATABASE.pinnedLeaderboard.push(productIdKey);
    }

    // Sync modifications down into data storage layer configurations
    administrativeSaveAndRefreshDisplay(productIdKey);
}

/**
 * Instantiates or ensures structural existence of leaderboard modal window frames
 */
function ensureLeaderboardModalHTMLExists() {
    if (document.getElementById("pinned-leaderboard-modal")) return;

    const modalWrapperNode = document.createElement("div");
    modalWrapperNode.id = "pinned-leaderboard-modal";
    modalWrapperNode.className = "universal-modal-container-wrapper"; // Assumes your style layout uses an '.active' class
    modalWrapperNode.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.6); display: none; align-items: center;
        justify-content: center; z-index: 10000; padding: 20px;
    `;

    modalWrapperNode.innerHTML = `
        <div style="background: white; width: 100%; max-width: 550px; border-radius: 8px; padding: 20px; display: flex; flex-direction: column; max-height: 85vh;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
                <h3 style="margin: 0; color: var(--fort-blue-dark);">🏆 Pinned Products Leaderboard (20 Slots)</h3>
                <button onclick="closeActiveModalDirectly('pinned-leaderboard-modal')" style="background: none; border: none; font-size: 1.3rem; cursor: pointer;">✕</button>
            </div>
            <div id="leaderboard-slots-container" style="overflow-y: auto; margin-top: 15px; flex: 1; display: flex; flex-direction: column; gap: 8px; padding-right: 4px;">
                </div>
        </div>
    `;
    document.body.appendChild(modalWrapperNode);
}

// Global active element index state pointer tracking variables
let trackingActiveSelectedLeaderboardPid = null;

/**
 * Renders list items mapping loop records indices details inside the leaderboard view
 */
function launchPinnedProductsLeaderboardModal() {
    ensureLeaderboardModalHTMLExists();
    
    const container = document.getElementById("leaderboard-slots-container");
    container.innerHTML = "";
    
    const leaderboard = SYSTEM_DATABASE.pinnedLeaderboard || [];
    
    if (leaderboard.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: #718096; font-size: 0.9rem; margin: 20px 0;">No items are currently pinned to the leaderboard.</p>`;
    } else {
        leaderboard.forEach((pid, index) => {
            const product = SYSTEM_DATABASE.products.find(p => p.pid === pid);
            const isSelected = (trackingActiveSelectedLeaderboardPid === pid);
            
            const slotRowElement = document.createElement("div");
            slotRowElement.style.cssText = `
                border: 1px solid ${isSelected ? 'var(--fort-blue-primary)' : '#e2e8f0'};
                border-radius: 6px; padding: 10px; background: ${isSelected ? '#f7fafc' : 'white'};
                cursor: pointer; display: flex; flex-direction: column; gap: 8px;
            `;
            slotRowElement.onclick = () => {
                trackingActiveSelectedLeaderboardPid = isSelected ? null : pid;
                launchPinnedProductsLeaderboardModal();
            };
            
            // Handle missing fallback traces securely
            const titleText = product ? product.name : `[Unknown/Deleted Product ID: ${pid}]`;
            const clickCountInfo = product ? `(${product.clickCount || 0} views)` : '';
            
            let actionButtonsBarHTML = "";
            if (isSelected) {
                actionButtonsBarHTML = `
                    <div style="display: flex; gap: 6px; margin-top: 4px;" onclick="event.stopPropagation();">
                        <button class="btn-blue" style="flex: 1; padding: 4px; font-size: 0.75rem; font-weight: bold;" onclick="shiftLeaderboardRankPosition('${pid}', -1)">▲ Move Up</button>
                        <button class="btn-blue" style="flex: 1; padding: 4px; font-size: 0.75rem; font-weight: bold;" onclick="shiftLeaderboardRankPosition('${pid}', 1)">▼ Move Down</button>
                        <button class="btn-gray" style="flex: 1; padding: 4px; font-size: 0.75rem; font-weight: bold; background: #fed7d7; color: #c53030; border: 1px solid #feb2b2;" onclick="removeLeaderboardItemDirectly('${pid}')">🗑️ Remove</button>
                    </div>
                `;
            }
            
            slotRowElement.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.88rem;">
                    <div style="font-weight: bold; color: var(--fort-blue-light); display: flex; gap: 8px;">
                        <span>#${index + 1}</span>
                        <span style="color: #2d3748; font-weight: 500; max-width: 320px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${titleText}</span>
                    </div>
                    <span style="font-size: 0.75rem; color: #a0aec0;">${clickCountInfo}</span>
                </div>
                ${actionButtonsBarHTML}
            `;
            container.appendChild(slotRowElement);
        });
    }
    
    document.getElementById("pinned-leaderboard-modal").style.display = "flex";
}

/**
 * Changes rank index ordering position up or down inside leaderboard tracking fields arrays
 */
function shiftLeaderboardRankPosition(pid, directionalDeltaIndex) {
    const leaderboard = SYSTEM_DATABASE.pinnedLeaderboard || [];
    const targetIndex = leaderboard.indexOf(pid);
    
    if (targetIndex === -1) return;
    
    const computedNewPositionIndex = targetIndex + directionalDeltaIndex;
    
    // Bounds limit checks
    if (computedNewPositionIndex < 0 || computedNewPositionIndex >= leaderboard.length) return;
    
    // Swap array position keys elements
    let temporaryHolderPlaceholder = leaderboard[targetIndex];
    leaderboard[targetIndex] = leaderboard[computedNewPositionIndex];
    leaderboard[computedNewPositionIndex] = temporaryHolderPlaceholder;
    
    // Sync adjustments down across databases
    administrativeSaveAndRefreshDisplay();
    launchPinnedProductsLeaderboardModal();
}

/**
 * Removes a product code identifier sequence directly from pinned rankings arrays
 */
function removeLeaderboardItemDirectly(pid) {
    const leaderboard = SYSTEM_DATABASE.pinnedLeaderboard || [];
    const index = leaderboard.indexOf(pid);
    
    if (index > -1) {
        leaderboard.splice(index, 1);
        if (trackingActiveSelectedLeaderboardPid === pid) {
            trackingActiveSelectedLeaderboardPid = null;
        }
        
        administrativeSaveAndRefreshDisplay(pid);
        launchPinnedProductsLeaderboardModal();
    }
}

/**
 * Overrides modal dismissal tracking utility hooks seamlessly
 */
const baselineCloseActiveModalDirectly = window.closeActiveModalDirectly;
window.closeActiveModalDirectly = function(modalIdString) {
    if (modalIdString === 'pinned-leaderboard-modal') {
        const modal = document.getElementById("pinned-leaderboard-modal");
        if (modal) modal.style.display = "none";
        return;
    }
    
    if (typeof baselineCloseActiveModalDirectly === "function") {
        baselineCloseActiveModalDirectly(modalIdString);
    } else {
        const structuralModalNode = document.getElementById(modalIdString);
        if (structuralModalNode) structuralModalNode.classList.remove("active");
    }
};

/**
 * Messenger Communications Infrastructure Core System Engine Processing Architecture Module
 */
function renderUserConversationsLogRoster() {
    const logContainerTargetNode = document.getElementById("chat-threads-target-list");
    if(!logContainerTargetNode) return;
    
    logContainerTargetNode.innerHTML = "";
    
    if(!APP_STATE.currentUser) return;
    
    // --- FEATURE: SPECIAL ADMIN BROADCAST CHANNEL CONTROLS ---
    if (APP_STATE.currentUser.uid === 'admin') {
        // Render All Personal Accounts Node Channel
        const personalBroadcastNode = document.createElement("div");
        personalBroadcastNode.className = `chat-thread-roster-row broadcast-system-node ${APP_STATE.activeChatTargetUserHash === 'broadcast_personal' ? 'active' : ''}`;
        personalBroadcastNode.onclick = () => activateMessengerConversationWorkspaceSessionBlock('broadcast_personal');
        personalBroadcastNode.innerHTML = `
            <div class="circle-container" style="width:38px; height:38px; background-color:#3182ce; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold; font-size:1.1rem;">📢</div>
            <div style="flex:1; overflow:hidden;">
                <h5 style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:#2b6cb0; font-weight:800;">[ALL PERSONAL ACCOUNTS]</h5>
                <p style="font-size:0.78rem; color:var(--fort-gray-slate); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px;">System Broadcast Console Terminal</p>
            </div>
        `;
        logContainerTargetNode.appendChild(personalBroadcastNode);

        // Render All Business Accounts Node Channel
        const businessBroadcastNode = document.createElement("div");
        businessBroadcastNode.className = `chat-thread-roster-row broadcast-system-node ${APP_STATE.activeChatTargetUserHash === 'broadcast_business' ? 'active' : ''}`;
        businessBroadcastNode.onclick = () => activateMessengerConversationWorkspaceSessionBlock('broadcast_business');
        businessBroadcastNode.innerHTML = `
            <div class="circle-container" style="width:38px; height:38px; background-color:#319795; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold; font-size:1.1rem;">📢</div>
            <div style="flex:1; overflow:hidden;">
                <h5 style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:#234e52; font-weight:800;">[ALL BUSINESS ACCOUNTS]</h5>
                <p style="font-size:0.78rem; color:var(--fort-gray-slate); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px;">System Broadcast Console Terminal</p>
            </div>
        `;
        logContainerTargetNode.appendChild(businessBroadcastNode);
    }
    
    // Track matching historical stream records blocks inside systems execution memory databases maps sets
    const computedMatchingDialoguesArray = SYSTEM_DATABASE.chats.filter(c => c.dynamicParticipants.includes(APP_STATE.currentUser.uid));
    // --- FEATURE: RECENCY SORTING METHOD ---
    computedMatchingDialoguesArray.sort((a, b) => {
        const getLatestMessageTimeToken = (threadInstance) => {
            if (!threadInstance.messageLog || threadInstance.messageLog.length === 0) return 0;
            const lastMsg = threadInstance.messageLog[threadInstance.messageLog.length - 1];
            const numericExtractionMatch = lastMsg.mid.match(/\d+/);
            return numericExtractionMatch ? parseInt(numericExtractionMatch[0], 10) : 0;
        };
        return getLatestMessageTimeToken(b) - getLatestMessageTimeToken(a);
    });
    if(computedMatchingDialoguesArray.length === 0 && APP_STATE.currentUser.uid !== 'admin') {
        logContainerTargetNode.innerHTML = `<div class="text-center" style="padding:20px; color:var(--fort-gray-slate); font-size:0.85rem;"><p>No active history logs tracking conversation threads instances detected within specified regional parameters profile databases.</p></div>`;
        return;
    }
    
    computedMatchingDialoguesArray.forEach(thread => {
        const opposingParticipantUid = thread.dynamicParticipants.find(id => id !== APP_STATE.currentUser.uid);
        const opposingAccountRecord = SYSTEM_DATABASE.users.find(u => u.uid === opposingParticipantUid);
        
        if(!opposingAccountRecord) return;
        
        // Compute dynamic bracket strings layout suffixes explicitly matching business rule formulas
        let structuralLabelDisplayExpressionString = "";
    
        if(opposingAccountRecord.accountType === 'personal') {
            structuralLabelDisplayExpressionString = `${opposingAccountRecord.identityName} (Personal)`;
        } else {
            structuralLabelDisplayExpressionString = `${opposingAccountRecord.businessName} (Business) – ${opposingAccountRecord.identityName}`;
        }
        
        // Support and intercept operational filtering requests queries maps parameters directly via global navbar controllers
        if(APP_STATE.searchQuery !== '') {
            if(!structuralLabelDisplayExpressionString.toLowerCase().includes(APP_STATE.searchQuery)) return;
        }
        
        // Find last message not cleared or deleted by the user for list preview mapping
        const validUserLog = thread.messageLog.filter(msg => !msg.deletedBy || !msg.deletedBy.includes(APP_STATE.currentUser.uid));
        const lastMessageLogEntry = validUserLog[validUserLog.length - 1];
        let previewTextLineString = "Click thread node to initiate workspace session.";
        if (lastMessageLogEntry) {
            if (lastMessageLogEntry.isDeletedForAll) {
                previewTextLineString = "This message was deleted";
            } else if (lastMessageLogEntry.isFile) {
                if (lastMessageLogEntry.isImage) previewTextLineString = `📷 [Image] ${lastMessageLogEntry.text}`;
                else if (lastMessageLogEntry.isVideo) previewTextLineString = `🎥 [Video] ${lastMessageLogEntry.text}`;
                else previewTextLineString = `📁 [File] ${lastMessageLogEntry.text}`;
            } else {
                previewTextLineString = lastMessageLogEntry.text.substring(0, 35);
            }
        }
        
        const rowWrapperNodeElement = document.createElement("div");
        rowWrapperNodeElement.className = `chat-thread-roster-row ${APP_STATE.activeChatTargetUserHash === opposingParticipantUid ? 'active' : ''}`;
        rowWrapperNodeElement.onclick = () => activateMessengerConversationWorkspaceSessionBlock(opposingParticipantUid);
        rowWrapperNodeElement.innerHTML = `
            <img src="${opposingAccountRecord.avatar || 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23718096\'><path d=\'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z\'/></svg>'}" class="mini-profile-avatar circle-container" style="width:38px; height:38px;" alt="Avatar">
            <div style="flex:1; overflow:hidden;">
                <h5 style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--fort-blue-dark); font-weight:700;">${structuralLabelDisplayExpressionString}</h5>
                <p style="font-size:0.78rem; color:var(--fort-gray-slate); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px;">${previewTextLineString}</p>
            </div>
        `;
        logContainerTargetNode.appendChild(rowWrapperNodeElement);
    });
}

function initialDirectMessageCommunicationPipelineSetup(targetVendorOwnerUidTokenKey) {
    if(!APP_STATE.currentUser) {
        triggerAuthenticationModalSequence();
        return;
    }
    if(APP_STATE.currentUser.uid === targetVendorOwnerUidTokenKey) {
        showTopRightToast("You are the seller, and according to Fort Graphics application protocols there is no message yourself feature.", "info");
        return;
    }
    
    const structuralTargetComboKeyArray = [APP_STATE.currentUser.uid, targetVendorOwnerUidTokenKey];
    let ongoingThreadMatchRecord = SYSTEM_DATABASE.chats.find(c => c.dynamicParticipants.includes(APP_STATE.currentUser.uid) && c.dynamicParticipants.includes(targetVendorOwnerUidTokenKey));
    
    if(!ongoingThreadMatchRecord) {
        ongoingThreadMatchRecord = {
            chatId: `chat_${APP_STATE.currentUser.uid}_${targetVendorOwnerUidTokenKey}`,
            dynamicParticipants: structuralTargetComboKeyArray,
            messageLog: []
        };
        SYSTEM_DATABASE.chats.push(ongoingThreadMatchRecord);
        syncPlatformDatabaseStateToWebStorage();
    }
    
    APP_STATE.activeChatTargetUserHash = targetVendorOwnerUidTokenKey;
    navigateToPage('messages');
    activateMessengerConversationWorkspaceSessionBlock(targetVendorOwnerUidTokenKey);
}

function activateMessengerConversationWorkspaceSessionBlock(targetCounterpartyUidValue) {
    APP_STATE.activeChatTargetUserHash = targetCounterpartyUidValue;
    
    document.getElementById("chat-pane-empty-notice").classList.add("hidden-node");
    const activeWorkspaceBlockNode = document.getElementById("chat-pane-active-view");
    activeWorkspaceBlockNode.classList.remove("hidden-node");
    document.getElementById("chat-conversation-pane")?.classList.add("phone-active-thread");
    if(APP_STATE.deviceMode === 'phone') {
         document.getElementById("chat-conversation-pane").classList.add("phone-active-thread");
    }

    const targetToolbarNodeElement = document.getElementById("chat-window-top-toolbar");
    if (targetCounterpartyUidValue === 'broadcast_personal' || targetCounterpartyUidValue === 'broadcast_business') {
        const headlineLabel = targetCounterpartyUidValue === 'broadcast_personal' ?
            'Broadcast to All Personal Accounts' : 'Broadcast to All Business Accounts';
        targetToolbarNodeElement.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; width:100%; justify-content:space-between; background-color: #2c5282; color:var(--fort-white-pure); padding:8px 14px;" class="rounded-rect">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-weight:700; font-size:0.95rem;">📢 ${headlineLabel}</span>
                </div>
            </div>
        `;
    } else {
        const counterpartyUserRecord = SYSTEM_DATABASE.users.find(u => u.uid === targetCounterpartyUidValue);
        targetToolbarNodeElement.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; width:100%; justify-content:space-between; background-color: var(--fort-blue-primary); color:var(--fort-white-pure); padding:8px 14px;" class="rounded-rect">
                <div style="display:flex; align-items:center; gap:10px; cursor:pointer;" onclick="launchDetailedUserProfileContextOverlaySummaryModal('${targetCounterpartyUidValue}')">
                    <button onclick="event.stopPropagation(); closePhoneConversationOverlayViewBlock()" class="mobile-close-chat-btn" style="background:none; border:none; color:#fff; font-size:1.3rem; margin-right:8px; padding: 0 5px; cursor:pointer;">
                        ←
                    </button>
                    <img src="${counterpartyUserRecord.avatar || 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23ffffff\'><path d=\'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z\'/></svg>'}" style="width:32px; height:32px;" class="circle-container" alt="User Avatar Image Context">
                    <span style="font-weight:600; font-size:0.9rem;">${counterpartyUserRecord.identityName}</span>
                </div>
                <div class="toolbar-buttons-sets" style="display:flex; gap:8px;">
                    <button class="btn-danger" style="padding:4px 10px; font-size:0.75rem;" onclick="executeWipeEntireDialogueLogsHistoryContextChain()">Clear Chat</button>
                </div>
            </div>
        `;
    }

    refreshMessengerActiveStreamBubblesDisplayList();
}

function closePhoneConversationOverlayViewBlock() {
    document.getElementById("chat-conversation-pane")?.classList.remove("phone-active-thread");
    document.getElementById("chat-conversation-pane").classList.remove("phone-active-thread");
    APP_STATE.activeChatTargetUserHash = null;
    renderUserConversationsLogRoster();
}    

function refreshMessengerActiveStreamBubblesDisplayList() {
    const streamTargetBoxNode = document.getElementById("chat-bubble-stream-area");
    if(!streamTargetBoxNode) return;
    
    streamTargetBoxNode.innerHTML = "";
    
    if(!APP_STATE.activeChatTargetUserHash || !APP_STATE.currentUser) return;
    
    if (APP_STATE.activeChatTargetUserHash === 'broadcast_personal' || APP_STATE.activeChatTargetUserHash === 'broadcast_business') {
        streamTargetBoxNode.innerHTML = `<div class='empty-placeholder' style='align-self:center; margin:auto;'><p style='color:#2b6cb0; font-size:0.88rem; font-weight:600;'>System Broadcast Terminal Mode Active.<br><span style='font-weight:400; color:var(--fort-gray-slate); font-size:0.8rem;'>Messages pushed through this form pipeline will automatically populate all designated account communication channels.</span></p></div>`;
        return;
    }
    
    const operationalThreadRecordData = SYSTEM_DATABASE.chats.find(c => c.dynamicParticipants.includes(APP_STATE.currentUser.uid) && c.dynamicParticipants.includes(APP_STATE.activeChatTargetUserHash));
    if(!operationalThreadRecordData || operationalThreadRecordData.messageLog.length === 0) {
        streamTargetBoxNode.innerHTML = `<div class='empty-placeholder' style='align-self:center; margin:auto;'><p style='color:var(--fort-gray-slate); font-size:0.85rem;'>Dialogue stream initialized. Type message lines below to execute securely transmitted communication.</p></div>`;
        return;
    }
    
    operationalThreadRecordData.messageLog.forEach(msg => {
        if (msg.deletedBy && msg.deletedBy.includes(APP_STATE.currentUser.uid)) return;

        const outboundFlagCondition = msg.senderUid === APP_STATE.currentUser.uid;
        const failedTransmissionFlag = msg.status === 'failed';
        
        const bubbleWrapperElementNode = document.createElement("div");
        // Inject failed structural state layout rules
        bubbleWrapperElementNode.className = `chat-bubble-node rounded-rect ${outboundFlagCondition ? 'outgoing-msg' : 'incoming-msg'} ${failedTransmissionFlag ? 'transmission-failed-node' : ''}`;
        
        let dynamicTicksLayoutHTML = "";        
        let bodyLayoutHTML = "";
        let downloadControlHTML = "";
        
        if (msg.isDeletedForAll) {
            bodyLayoutHTML = `<p style="word-break:break-word; font-style:italic; opacity:0.75;">This message was deleted</p>`;
        } else if (msg.isFile) {
            if (msg.isImage) {
                bodyLayoutHTML = `
                    <div style="display: block;">
                        <img src="${msg.fileData}" class="msg-image-preview" style="max-width: 200px; max-height: 200px; border-radius: 6px; display: block; margin-bottom: 4px;" alt="Image File Payload">
                        <p style="word-break:break-word; font-size:0.78rem; color:inherit; opacity:0.85; margin:0; display:flex; align-items:center; gap:4px;">🖼️ ${msg.text}</p>
                    </div>
                `;
            } else if (msg.isVideo) {
                bodyLayoutHTML = `
                    <div style="display: block; position: relative; max-width: 240px; border-radius: 6px; overflow: hidden; background: #000; margin-bottom: 4px;">
                        <video src="${msg.fileData}" style="width: 100%; height: auto; display: block; pointer-events: none;" preload="metadata"></video>
                        <div style="position: absolute; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.35);">
                            <span style="font-size: 2rem; color: #fff; opacity: 0.85;">▶</span>
                        </div>
                     </div>
                    <p style="word-break:break-word; font-size:0.78rem; color:inherit; opacity:0.85; margin:0; display:flex; align-items:center; gap:4px;">🎥 ${msg.text}</p>
                `;
            } else {
                let documentBadgeSVGHTML = "";
                const absoluteFileExtensionToken = msg.text.split('.').pop().toLowerCase();
                
                if (absoluteFileExtensionToken === 'pdf') {
                    documentBadgeSVGHTML = `
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-bottom:2px;">
                            <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM11.5 9.5C11.5 10.33 10.83 11 10 11H8.5V12.5H7V7H10C10.83 7 11.5 7.67 11.5 8.5V9.5ZM17 8.5C17 9.88 15.88 11 14.5 11H13V7H14.5C15.88 7 17 8.12 17 8.5ZM21 15H19.5V14H21V12.5H19.5V11.5H21V10H18V16H21V15Z" fill="#E53E3E"/>
                            <path d="M8.5 8.5H10V9.5H8.5V8.5ZM14.5 8.5H15.5V9.5H14.5V8.5Z" fill="#E53E3E"/>
                        </svg>`;
                } else if (absoluteFileExtensionToken === 'txt') {
                    documentBadgeSVGHTML = `
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-bottom:2px;">
                            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z" fill="#4A5568"/>
                        </svg>`;
                } else {
                    documentBadgeSVGHTML = `
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-bottom:2px;">
                            <path d="M14 2H6C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM12 18C9.79 18 8 16.21 8 14C8 11.79 9.79 10 12 10C14.21 10 16 11.79 16 14C16 16.21 14.21 18 12 18Z" fill="#3182CE"/>
                        </svg>`;
                }
                
                bodyLayoutHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.05); padding: 10px; border-radius: 6px; min-width: 120px;">
                        ${documentBadgeSVGHTML}
                        <p style="word-break:break-word; font-weight:600; font-size:0.82rem; margin:4px 0 0 0; text-align:center;">${msg.text}</p>
                    </div>
                `;
            }
            if (!failedTransmissionFlag) {
                downloadControlHTML = `<button class="msg-action-btn" onclick="executeMessageFileDownloadTracker('${msg.mid}')">📥 Download</button>`;
            }
        } else {
            bodyLayoutHTML = `<p style="word-break:break-word;">${msg.text}</p>`;
        }
        
        // --- FEATURE: PURGE CONTROLS WITH VALIDITY RUNTIME EVALUATION ---
        let deleteForAllControlHTML = "";
        let retryControlHTML = "";
        
        if (failedTransmissionFlag) {
            retryControlHTML = `<button class="msg-action-btn" style="color:#e53e3e; font-weight:700;" onclick="executeRetryMessageTransmissionPipeline('${msg.mid}')">🔄 Retry</button>`;
        } else if (outboundFlagCondition && !msg.isDeletedForAll) {
            deleteForAllControlHTML = `<button class="msg-action-btn" style="color:#c53030; font-weight:700;" onclick="executeSelectedBubbleMessagePurgeForAll('${msg.mid}')">💥 Delete for All</button>`;
        }
        
        let actionControlsMenuHTML = "";
        if (!msg.isDeletedForAll) {
            actionControlsMenuHTML = `
                <div class="msg-hover-actions">
                    ${retryControlHTML}
                    <button class="msg-action-btn" onclick="executeMessageTextCopyClipboard('${msg.mid}')">📋 Copy</button>
                    ${downloadControlHTML}
                    <button class="msg-action-btn" style="color:#9b2c2c;" onclick="executeSelectedBubbleMessagePurge('${msg.mid}')">🗑️ Delete</button>
                    ${deleteForAllControlHTML}
                </div>
            `;
        }
        
        bubbleWrapperElementNode.innerHTML = `
            ${bodyLayoutHTML}
            <div class="msg-meta-row">
                <span>${msg.timestamp}</span> 
                <span>${msg.Date || ''}</span>
                ${dynamicTicksLayoutHTML}
            </div>
            ${actionControlsMenuHTML}
        `;
        streamTargetBoxNode.appendChild(bubbleWrapperElementNode);
    });
    
    streamTargetBoxNode.scrollTop = streamTargetBoxNode.scrollHeight;
}

function sendChatMessageDirect() {
    const textInputNodeElement = document.getElementById("chat-text-input-field");
    const enteredMessageTextString = textInputNodeElement.value.trim();
    if(enteredMessageTextString === "" || !APP_STATE.currentUser || !APP_STATE.activeChatTargetUserHash) return;
    
    // --- FEATURE: EXECUTE DISPATCH BROADCAST PROCESSOR PIPELINES ---
    if (APP_STATE.activeChatTargetUserHash === 'broadcast_personal' || APP_STATE.activeChatTargetUserHash === 'broadcast_business') {
        executeSystemWideBroadcastTransmission(enteredMessageTextString, null);
        textInputNodeElement.value = "";
        return;
    }
    
    if(APP_STATE.activeChatTargetUserHash === 'admin') {
         showTopRightToast("The Fort Graphics profile can't be replied.", "info");
         textInputNodeElement.value = "";
         return;
    }
    
    const operationalThreadRecordData = SYSTEM_DATABASE.chats.find(c => c.dynamicParticipants.includes(APP_STATE.currentUser.uid) && c.dynamicParticipants.includes(APP_STATE.activeChatTargetUserHash));
    if(operationalThreadRecordData) {
        // Simulating error flags toggle rule for development evaluation testing environments
        // To verify the failed state, you can manually push objects with status: "failed"
        const generatedMessageInstance = {
            mid: "m_" + Date.now(),
            senderUid: APP_STATE.currentUser.uid,
            text: enteredMessageTextString,
            timestamp: new Date().toLocaleTimeString([], { day: '2-digit',  month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }),
        };
        
        operationalThreadRecordData.messageLog.push(generatedMessageInstance);
        textInputNodeElement.value = "";
        renderUserConversationsLogRoster();
        refreshMessengerActiveStreamBubblesDisplayList();
        syncPlatformDatabaseStateToWebStorage();
        
    }
}

// --- FEATURE: RETRY DISPATCH CHANNEL RE-TRIGGER PIPELINE ---
function executeRetryMessageTransmissionPipeline(messageIdentifierKey) {
    const operationalThreadRecordData = SYSTEM_DATABASE.chats.find(c => c.dynamicParticipants.includes(APP_STATE.currentUser.uid) && c.dynamicParticipants.includes(APP_STATE.activeChatTargetUserHash));
    if (!operationalThreadRecordData) return;
    
    const targetFailedMessageNode = operationalThreadRecordData.messageLog.find(m => m.mid === messageIdentifierKey);
    if (targetFailedMessageNode && targetFailedMessageNode.status === 'failed') {
        targetFailedMessageNode.timestamp = new Date().toLocaleTimeString([], { day: '2-digit',  month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
        
        renderUserConversationsLogRoster();
        refreshMessengerActiveStreamBubblesDisplayList();
        syncPlatformDatabaseStateToWebStorage();
        
    }
}

/**
 * File System Interface Operations Hooks Definitions
 */
function triggerMessageAttachedFileBrowserLink() {
    const targetFileInputNode = document.getElementById("chat-message-file-attachment-input");
    if (targetFileInputNode) {
        targetFileInputNode.click();
    }
}

function handleMessageAttachedFileSelectionEvent(inputNodeContextElement) {
    if (!inputNodeContextElement.files || inputNodeContextElement.files.length === 0) return;
    if (!APP_STATE.currentUser || !APP_STATE.activeChatTargetUserHash) return;
    if (APP_STATE.activeChatTargetUserHash === 'admin') {
         showTopRightToast("The Fort Graphics profile can't be replied.", "info");
         inputNodeContextElement.value = "";
         return;
    }
    
    const singleFileReference = inputNodeContextElement.files[0];
    const checkIsImageFormatCondition = singleFileReference.type.startsWith('image/');
    const checkIsVideoFormatCondition = singleFileReference.type.startsWith('video/');
    
    const fileStorageProcessingReader = new FileReader();
    
    fileStorageProcessingReader.onload = function(readerEvent) {
        const transportFilePayloadConfig = {
            isFile: true,
            isImage: checkIsImageFormatCondition,
            isVideo: checkIsVideoFormatCondition,
            fileData: readerEvent.target.result
        };

        if (APP_STATE.activeChatTargetUserHash === 'broadcast_personal' || APP_STATE.activeChatTargetUserHash === 'broadcast_business') {
            executeSystemWideBroadcastTransmission(singleFileReference.name, transportFilePayloadConfig);
            inputNodeContextElement.value = "";
            return;
        }

        const operationalThreadRecordData = SYSTEM_DATABASE.chats.find(c => c.dynamicParticipants.includes(APP_STATE.currentUser.uid) && c.dynamicParticipants.includes(APP_STATE.activeChatTargetUserHash));
        if (operationalThreadRecordData) {
            operationalThreadRecordData.messageLog.push({
                mid: "m_file_" + Date.now(),
                senderUid: APP_STATE.currentUser.uid,
                text: singleFileReference.name,
                isFile: true,
                isImage: checkIsImageFormatCondition,
                isVideo: checkIsVideoFormatCondition,
                fileData: readerEvent.target.result,
                timestamp: new Date().toLocaleTimeString([], { day: '2-digit',  month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }),
            });
            inputNodeContextElement.value = "";
            renderUserConversationsLogRoster();
            refreshMessengerActiveStreamBubblesDisplayList();
            syncPlatformDatabaseStateToWebStorage();
            
        }
    };
    
    fileStorageProcessingReader.readAsDataURL(singleFileReference);
}

/**
 * --- FEATURE: ADMIN BROADCAST ROUTING SYSTEM ENGINE ---
 */
function executeSystemWideBroadcastTransmission(textPayloadString, filePackageConfigObject) {
    const targetGroupString = APP_STATE.activeChatTargetUserHash === 'broadcast_personal' ? 'personal' : 'business';
    const destinationAccountsArray = SYSTEM_DATABASE.users.filter(u => u.accountType === targetGroupString && u.uid !== 'admin');
    if (destinationAccountsArray.length === 0) {
        showTopRightToast("Broadcast processing aborted. There are no target accounts.", "error");
        return;
    }
    
    destinationAccountsArray.forEach((profileRecord, arrayIndex) => {
        let uniqueTargetThreadNode = SYSTEM_DATABASE.chats.find(c => c.dynamicParticipants.includes('admin') && c.dynamicParticipants.includes(profileRecord.uid));
        
        if (!uniqueTargetThreadNode) {
            uniqueTargetThreadNode = {
                chatId: `chat_admin_${profileRecord.uid}`,
                dynamicParticipants: ['admin', profileRecord.uid],
                messageLog: []
            };
            SYSTEM_DATABASE.chats.push(uniqueTargetThreadNode);
        }
        
        const baseMessageData = {
            mid: `m_bcast_${Date.now()}_${arrayIndex}`,
            senderUid: 'admin',
            text: textPayloadString,
            timestamp: new Date().toLocaleTimeString([], { day: '2-digit',  month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }),
        };
        if (filePackageConfigObject) {
            baseMessageData.isFile = filePackageConfigObject.isFile;
            baseMessageData.isImage = filePackageConfigObject.isImage;
            baseMessageData.isVideo = filePackageConfigObject.isVideo;
            baseMessageData.fileData = filePackageConfigObject.fileData;
        }
        
        uniqueTargetThreadNode.messageLog.push(baseMessageData);
    });
    
    showTopRightToast(`Broadcast routed successfully to all ${destinationAccountsArray.length} active ${targetGroupString} profile logs.`, "success");
    renderUserConversationsLogRoster();
    syncPlatformDatabaseStateToWebStorage();
}

function executeMessageTextCopyClipboard(messageIdentifierKey) {
    const operationalThreadRecordData = SYSTEM_DATABASE.chats.find(c => c.dynamicParticipants.includes(APP_STATE.currentUser.uid) && c.dynamicParticipants.includes(APP_STATE.activeChatTargetUserHash));
    if (!operationalThreadRecordData) return;
    
    const exactMessagePayloadMatch = operationalThreadRecordData.messageLog.find(m => m.mid === messageIdentifierKey);
    if (exactMessagePayloadMatch) {
        navigator.clipboard.writeText(exactMessagePayloadMatch.text).catch(err => {
            console.error("System Matrix Clipboard Exception Handling Log:", err);
        });
    }

    showTopRightToast("Text Copied Successfully", "success");
}

// --- FEATURE: SINGLE-USER PERSISTENT SELECTION PURGE ---
function executeSelectedBubbleMessagePurge(messageIdentifierKey) {
    const operationalThreadRecordData = SYSTEM_DATABASE.chats.find(c => c.dynamicParticipants.includes(APP_STATE.currentUser.uid) && c.dynamicParticipants.includes(APP_STATE.activeChatTargetUserHash));
    if (!operationalThreadRecordData) return;
    
    const exactMessagePayloadMatch = operationalThreadRecordData.messageLog.find(m => m.mid === messageIdentifierKey);
    if (exactMessagePayloadMatch) {
        if (!exactMessagePayloadMatch.deletedBy) {
            exactMessagePayloadMatch.deletedBy = [];
        }
        if (!exactMessagePayloadMatch.deletedBy.includes(APP_STATE.currentUser.uid)) {
            exactMessagePayloadMatch.deletedBy.push(APP_STATE.currentUser.uid);
        }
        syncPlatformDatabaseStateToWebStorage();
        renderUserConversationsLogRoster();
        refreshMessengerActiveStreamBubblesDisplayList();
    }
}

// --- FEATURE: DELETE FOR ALL MUTATION ROUTINE ---
function executeSelectedBubbleMessagePurgeForAll(messageIdentifierKey) {
    const operationalThreadRecordData = SYSTEM_DATABASE.chats.find(c => c.dynamicParticipants.includes(APP_STATE.currentUser.uid) && c.dynamicParticipants.includes(APP_STATE.activeChatTargetUserHash));
    if (!operationalThreadRecordData) return;
    
    const exactMessagePayloadMatch = operationalThreadRecordData.messageLog.find(m => m.mid === messageIdentifierKey);
    if (exactMessagePayloadMatch) {
        // Replace base data parameters context while maintaining indices tracking nodes
        exactMessagePayloadMatch.text = "This message was deleted";
        exactMessagePayloadMatch.isDeletedForAll = true;
        
        // Clean attachment structures to safely bypass content layout rendering engines
        delete exactMessagePayloadMatch.isFile;
        delete exactMessagePayloadMatch.isImage;
        delete exactMessagePayloadMatch.isVideo;
        delete exactMessagePayloadMatch.fileData;
        
        syncPlatformDatabaseStateToWebStorage();
        renderUserConversationsLogRoster();
        refreshMessengerActiveStreamBubblesDisplayList();
    }
}

function executeMessageFileDownloadTracker(messageIdentifierKey) {
    const operationalThreadRecordData = SYSTEM_DATABASE.chats.find(c => c.dynamicParticipants.includes(APP_STATE.currentUser.uid) && c.dynamicParticipants.includes(APP_STATE.activeChatTargetUserHash));
    if (!operationalThreadRecordData) return;
    const exactMessagePayloadMatch = operationalThreadRecordData.messageLog.find(m => m.mid === messageIdentifierKey);
    if (exactMessagePayloadMatch && exactMessagePayloadMatch.isFile && exactMessagePayloadMatch.fileData) {
        const structuralAnchorDownloadElement = document.createElement("a");
        structuralAnchorDownloadElement.href = exactMessagePayloadMatch.fileData;
        structuralAnchorDownloadElement.download = exactMessagePayloadMatch.text;
        document.body.appendChild(structuralAnchorDownloadElement);
        structuralAnchorDownloadElement.click();
        document.body.removeChild(structuralAnchorDownloadElement);
    }
}

function executeAutoReplyEvaluationProcessFrame(operationalThreadRecordData) {
    const counterpartyAccountProfile = SYSTEM_DATABASE.users.find(u => u.uid === APP_STATE.activeChatTargetUserHash);
    if(counterpartyAccountProfile && APP_STATE.activeChatTargetUserHash !== 'admin') {
        const totalOutboundLinesCount = operationalThreadRecordData.messageLog.filter(m => m.senderUid === APP_STATE.currentUser.uid).length;
        if(totalOutboundLinesCount === 1) {
            setTimeout(() => {
                operationalThreadRecordData.messageLog.push({
                    mid: "m_auto_" + Date.now(),
                    senderUid: counterpartyAccountProfile.uid,
                    text: `[Automated Assistant System Broadcast Response Mapping Engine Log]: Thank you for reaching out to ${counterpartyAccountProfile.businessName ||counterpartyAccountProfile.identityName }. Your commercial request lines have been safely indexed. We will get back to you soon.`,
                    timestamp: new Date().toLocaleTimeString([], { day: '2-digit',  month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }),
                });
 
                renderUserConversationsLogRoster();
                refreshMessengerActiveStreamBubblesDisplayList();
                syncPlatformDatabaseStateToWebStorage();
            }, 1500);
        }
    }
}

// --- FEATURE: CLEAR CHAT UNILATERAL RETENTION LOGIC ---
// --- FEATURE: CLEAR CHAT UNILATERAL RETENTION LOGIC ---
function executeWipeEntireDialogueLogsHistoryContextChain() {
    displayConfirmationModalOverlayAction("Are you sure you want to clear this chat?", () => {
        if (!APP_STATE.currentUser || !APP_STATE.activeChatTargetUserHash) return;

        const operationalThreadRecordData = SYSTEM_DATABASE.chats.find(c => 
            c.dynamicParticipants.includes(APP_STATE.currentUser.uid) && 
            c.dynamicParticipants.includes(APP_STATE.activeChatTargetUserHash)
        );

        if (operationalThreadRecordData && operationalThreadRecordData.messageLog) {
            // Append the clearing user ID to every current message in the log so they disappear for you
            operationalThreadRecordData.messageLog.forEach(msg => {
                if (!msg.deletedBy) {
                    msg.deletedBy = [];
                }
                if (!msg.deletedBy.includes(APP_STATE.currentUser.uid)) {
                    msg.deletedBy.push(APP_STATE.currentUser.uid);
                }
            });
            
            // Sync up, re-render, and flush down to standard engine storage views
            syncPlatformDatabaseStateToWebStorage();
            renderUserConversationsLogRoster();
            refreshMessengerActiveStreamBubblesDisplayList();
        }
    });
}

/**
 * Helper to compress user-uploaded images before base64 conversion.
 * Prevents LocalStorage QuotaExceeded errors (~5MB limit).
 */
function compressImageFile(file, maxWidth = 600, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL("image/jpeg", quality));
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}

/**
 * Global State for Uploaded Product Asset Images & Request Workflow
 */
let UPLOADED_ASSET_IMAGES = [];
let TEMP_SELECTED_ASSET_FILE = null;

let DESIGN_REQUEST_WIZARD = {
    targetDesignerUid: null,
    requestPayload: null
};

/**
 * Universal Unified Infrastructure Floating Operations System Controller Launcher Method Engine
 */
function handleFloatingActionButtonTrigger() {
    if (!APP_STATE || !APP_STATE.currentUser) {
        if (typeof triggerAuthenticationModalSequence === 'function') {
            triggerAuthenticationModalSequence();
        } else {
            showTopRightToast("Please log in to continue.", "error");
        }
        return;
    }
    
    // Evaluate operational dynamic parameters rules routes contexts relative to view page positions
    if (APP_STATE.currentUser.accountType !== 'personal' && APP_STATE.currentUser.uid !== 'admin') {
        if (typeof abc === 'function') {
            launchadvertismentofBusinessUpgrade();
        } else {
            showTopRightToast("Designers can't place project requests", "info");
        }
        return;
    }
    
    // Launch the security verification step first
    launchUploadProductPasswordVerificationStep();
}

/**
 * Step 1: Verify account ownership via password authentication
 */
function launchUploadProductPasswordVerificationStep() {
    const modalContentTargetNode = document.getElementById("auth-modal-content");
    if (!modalContentTargetNode) return;

    modalContentTargetNode.innerHTML = `
        <h3>Enter Current Password (Step 1 of 2)</h3>
    
        <div class="form-input-container margin-top-sm">
            <label>Active Password:</label>
            <input type="password" id="upload-verify-password" class="form-field-control" placeholder="Enter password to verify ownership context">
            
            <div id="err-upload-reauth-msg" class="text-danger-alert hidden-node">Incorrect Password</div>
        </div>

        <div style="margin-top: 6px; display: flex; align-items: center; gap: 6px;">
            <input type="checkbox" id="chk-upload-showpass" onchange="toggleFormPasswordFieldVisibility(this, 'upload-verify-password')">
            <label for="chk-upload-showpass" style="font-size: 0.8rem; font-weight: 400; cursor: pointer; user-select: none;">Show Password</label>            
        </div>

        <div class="text-center margin-top-xs">
            <span style="color:var(--fort-blue-light); cursor:pointer; font-size:0.9rem;" onclick="renderForgotPasswordModalWorkflow()">Forgot Password?</span>
        </div>
        <br>
        
        <div class="btn-group">
            <button type="button" onclick="closeActiveModalDirectly('auth-modal')" class="btn-gray">Cancel</button> 
            <button type="button" onclick="verifyPasswordAndProceed()" class="btn-blue">Verify Password Phrase</button>
        </div>
    `;
    
    const authModal = document.getElementById("auth-modal");
    if (authModal) {
        authModal.classList.add("active");
        authModal.style.display = "flex";
    }
}

/**
 * Validates Step 1 password against active system state variables and advances to Step 2
 */
function verifyPasswordAndProceed() {
    const passwordInput = document.getElementById("upload-verify-password");
    const errNode = document.getElementById("err-upload-reauth-msg");
    
    if (!passwordInput) return;
    const enteredPassword = passwordInput.value.trim();
    
    if (errNode) errNode.classList.add("hidden-node");
    
    if (!APP_STATE || !APP_STATE.currentUser) {
        if (typeof showTopRightToast === 'function') {
            showTopRightToast("User session invalid.", "error");
        } else {
            alert("User session invalid.");
        }
        return;
    }

    // Dynamic password resolution for standard accounts and admins
    const activePassword = APP_STATE.currentUser.secretKey || APP_STATE.currentUser.password;

    if (!activePassword || enteredPassword !== activePassword) { 
        if (errNode) {
            errNode.innerText = "Incorrect Password"; 
            errNode.classList.remove("hidden-node"); 
        } else if (typeof showTopRightToast === 'function') {
            showTopRightToast("Incorrect Password", "error");
        } else {
            alert("Incorrect Password");
        }
        return;
    }
    
    // Step 1 Success -> Reset asset array and proceed to Step 2
    UPLOADED_ASSET_IMAGES = [];
    launchUploadProductInventoryModalFormLayoutShell();
}

/**
 * Step 2: Input product details and specifications
 */
function launchUploadProductInventoryModalFormLayoutShell() {
    const modalContentTargetNode = document.getElementById("auth-modal-content");
    if (!modalContentTargetNode) return;

    const userCountry = (APP_STATE && APP_STATE.currentUser && APP_STATE.currentUser.country) ? APP_STATE.currentUser.country : 'Global';
    const currencySymbol = userCountry === 'Nigeria' ? '₦' : '$';

    modalContentTargetNode.innerHTML = `
        <h3>Product Upload - Step 2 of 2</h3>
        <p style="font-size:0.8rem; color:var(--fort-gray-slate); margin-top:2px;">Products created are localized and viewable exclusively within corresponding matching legal registration domain regions [Country Scope: <strong>${userCountry}</strong>]</p>
        
        <div class="form-input-container margin-top-sm">
            <label>Project Title *</label>
            <input type="text" id="proj-new-title" class="form-field-control" placeholder="e.g. Logo Design for Fort Graphics">
        </div>
 
        <div class="form-input-container">
            <label>Instructions *</label>
            <input type="text" id="newprod-info" class="form-field-control" placeholder="Max 100 text characters symbols structural limits constraints loops">
        </div>
        <div class="form-input-container">
            <label>Uploaded Asset Images</label>
            <div id="assets-preview-grid" style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-top: 8px;">
                <!-- Dynamically rendered asset thumbnails & + button -->
            </div>
        </div>
        <br>
        <div class="form-input-container">
            <label>Price (${currencySymbol}):</label>
            <input type="number" id="newprod-price" class="form-field-control" placeholder="Enter numeric base rate configuration" value="2000" disabled>
        </div>
        
        <div class="btn-group margin-top-md">
            <button type="button" onclick="closeActiveModalDirectly('auth-modal')" class="btn-gray">Cancel Form</button>
            <button type="button" id="btn-publish-post" onclick="executePipelineCommitNewInventoryPostRecord()" class="btn-blue">Publish Active Post</button>
        </div>
    `;

    const authModal = document.getElementById("auth-modal");
    if (authModal) {
        authModal.classList.add("active");
        authModal.style.display = "flex";
    }

    // Render initial empty state grid with + button
    renderAssetsPreviewGrid();
}

/**
 * Render uploaded image thumbnails with no max limit and an 'Add' (+) button
 */
function renderAssetsPreviewGrid() {
    const grid = document.getElementById("assets-preview-grid");
    if (!grid) return;

    let html = "";

    // Render existing asset cards
    UPLOADED_ASSET_IMAGES.forEach((asset, index) => {
        html += `
            <div style="position: relative; width: 70px; height: 70px; border-radius: 6px; border: 1px solid #ccc; overflow: hidden; background: #f8f9fa;" title="${asset.name}">
                <img src="${asset.dataUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="${asset.name}" />
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); color: white; font-size: 0.65rem; padding: 2px 4px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; text-align: center;">
                    ${asset.name}
                </div>
                <button type="button" onclick="removeAssetImageFromGrid(${index})" style="position: absolute; top: 2px; right: 2px; background: rgba(220,53,69,0.9); color: white; border: none; border-radius: 50%; width: 18px; height: 18px; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1;">✕</button>
            </div>
        `;
    });

    // Append '+' trigger button with unlimited upload capacity
    html += `
        <button type="button" class="asset-add-square-btn" onclick="openFileUploadModal()" style="width: 70px; height: 70px; border-radius: 6px; border: 2px dashed #09a5db; background: #f4faff; color: #09a5db; font-size: 26px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s;" title="Add Image Asset">
            +
        </button>
    `;

    grid.innerHTML = html;
}

/**
 * Remove an uploaded asset image from state
 */
function removeAssetImageFromGrid(index) {
    UPLOADED_ASSET_IMAGES.splice(index, 1);
    renderAssetsPreviewGrid();
}

/**
 * Opens File Upload Modal with Image Preview and Custom Renaming Field
 */
function openFileUploadModal() {
    TEMP_SELECTED_ASSET_FILE = null;

    let modal = document.getElementById("file-upload-modal");
    if (modal) modal.remove();

    modal = document.createElement("div");
    modal.id = "file-upload-modal";
    modal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;";
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 8px; max-width: 450px; width: 90%; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
            <h3 style="margin-top:0; color:#0d233a;">Add Project Image Asset</h3>
            
            <div style="margin-bottom:12px;">
                <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:4px;">Select Image File *</label>
                <input type="file" id="asset-file-input" accept="image/*" style="width:100%;" onchange="handleAssetFileSelection(event)">
            </div>

            <div id="asset-preview-wrapper" style="margin-bottom:12px; text-align:center; display:none; background:#f4f5f7; padding:10px; border-radius:6px; border: 1px dashed #ccc;">
                <img id="asset-preview-img" src="" alt="Preview" style="max-width:100%; max-height:180px; object-fit:contain; border-radius:4px;">
            </div>

            <div style="margin-bottom:16px;">
                <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:4px;">Asset Name / Label *</label>
                <input type="text" id="asset-custom-name" class="form-field-control" placeholder="e.g. Front Cover Mockup" style="width:100%; padding:8px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;">
            </div>

            <div id="asset-upload-error" style="color:red; font-size:0.8rem; margin-bottom:12px; display:none;"></div>

            <div style="display:flex; justify-content:flex-end; gap:8px;">
                <button type="button" class="btn-gray" style="padding:8px 16px; border:none; border-radius:4px; cursor:pointer;" onclick="closeFileUploadModal()">Cancel</button>
                <button type="button" class="btn-blue" style="background:#09a5db; color:white; border:none; padding:8px 16px; border-radius:4px; font-weight:600; cursor:pointer;" onclick="confirmAddAssetImage()">Add</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

/**
 * Closes the asset file upload modal
 */
function closeFileUploadModal() {
    document.getElementById("file-upload-modal")?.remove();
    TEMP_SELECTED_ASSET_FILE = null;
}

/**
 * Reads selected image file, shows image preview, and sets default rename value
 */
function handleAssetFileSelection(event) {
    const file = event.target.files[0];
    const errDiv = document.getElementById("asset-upload-error");
    if (errDiv) errDiv.style.display = "none";

    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const dataUrl = e.target.result;
        TEMP_SELECTED_ASSET_FILE = {
            file: file,
            dataUrl: dataUrl
        };

        const imgPreview = document.getElementById("asset-preview-img");
        const previewWrapper = document.getElementById("asset-preview-wrapper");
        const customNameInput = document.getElementById("asset-custom-name");

        if (imgPreview && previewWrapper) {
            imgPreview.src = dataUrl;
            previewWrapper.style.display = "block";
        }

        if (customNameInput && !customNameInput.value.trim()) {
            const defaultName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            customNameInput.value = defaultName;
        }
    };
    reader.readAsDataURL(file);
}

/**
 * Validates, renames, and adds image asset to project payload list
 */
function confirmAddAssetImage() {
    const errDiv = document.getElementById("asset-upload-error");
    const nameInput = document.getElementById("asset-custom-name");
    const customName = nameInput ? nameInput.value.trim() : "";

    if (!TEMP_SELECTED_ASSET_FILE) {
        if (errDiv) {
            errDiv.innerText = "Please select an image file.";
            errDiv.style.display = "block";
        }
        return;
    }

    if (!customName) {
        if (errDiv) {
            errDiv.innerText = "Please provide a name for this asset.";
            errDiv.style.display = "block";
        }
        return;
    }

    UPLOADED_ASSET_IMAGES.push({
        id: "asset_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        name: customName,
        fileName: TEMP_SELECTED_ASSET_FILE.file.name,
        dataUrl: TEMP_SELECTED_ASSET_FILE.dataUrl
    });

    renderAssetsPreviewGrid();
    closeFileUploadModal();
}

/**
 * Commits the new inventory product post record ONLY after Paystack payment succeeds
 */
function executePipelineCommitNewInventoryPostRecord() {
    try {
        const publishBtn = document.getElementById("btn-publish-post");
        const titleInput = document.getElementById("proj-new-title");
        const infoInput = document.getElementById("newprod-info");
        const priceInput = document.getElementById("newprod-price");

        const title = titleInput ? titleInput.value.trim() : "";
        const info = infoInput ? infoInput.value.trim() : "";
        const price = priceInput ? parseFloat(priceInput.value) || 2000 : 2000;

        // Both Project Title and Instructions are COMPULSORY
        if (!title || !info) {
            if (typeof showTopRightToast === 'function') {
                showTopRightToast("Project title and instructions are compulsory fields.", "error");
            } else {
                alert("Project title and instructions are compulsory fields.");
            }
            return;
        }

        if (typeof APP_STATE === 'undefined' || !APP_STATE || !APP_STATE.currentUser) {
            if (typeof showTopRightToast === 'function') {
                showTopRightToast("User session invalid.", "error");
            } else {
                alert("User session invalid.");
            }
            return;
        }

        const userEmail = APP_STATE.currentUser.identifierText || "customer@fortmart.com";

        // Paystack inline payment gate
        if (typeof PaystackPop === 'undefined') {
            alert("Paystack SDK failed to load. Please check your internet connection.");
            return;
        }

        if (publishBtn) {
            publishBtn.disabled = true;
            publishBtn.innerText = "Processing Payment...";
        }

        const handler = PaystackPop.setup({
            key: 'pk_test_8e350f62114983f1cd23b0944668d435a6e74214', // Active Paystack Public Key
            email: userEmail,
            amount: price * 100, // Paystack works in kobo/cents
            currency: "NGN",
            callback: function(response) {
                try {
                    // Payment was successful -> now write the item to storage!
                    const userUid = APP_STATE.currentUser.uid || APP_STATE.currentUser.id;
                    const userCountry = APP_STATE.currentUser.country || 'Nigeria';
                    const firstAssetCover = UPLOADED_ASSET_IMAGES.length > 0 ? UPLOADED_ASSET_IMAGES[0].dataUrl : '';

                    const newProductPost = {
                        pid: "prod_" + Date.now(),
                        ownerUid: userUid,
                        name: title,               // Aligned to system key: 'name'
                        title: title,
                        info: info,                // Aligned to system key: 'info'
                        instructions: info,
                        price: price,
                        countryScope: userCountry,
                        coverPhoto: firstAssetCover, // Ensures grid cards render cover image properly
                        assets: [...UPLOADED_ASSET_IMAGES],
                        paystackRef: response.reference,
                        createdAt: new Date().toISOString()
                    };

                    // Save into database memory
                    if (typeof SYSTEM_DATABASE === 'undefined') window.SYSTEM_DATABASE = {};
                    if (!SYSTEM_DATABASE.products) SYSTEM_DATABASE.products = [];
                    SYSTEM_DATABASE.products.push(newProductPost);

                    // Persist storage
                    if (typeof syncPlatformDatabaseStateToWebStorage === "function") {
                        syncPlatformDatabaseStateToWebStorage();
                    } else if (typeof commitDatabasesStateToLocalStorage === "function") {
                        commitDatabasesStateToLocalStorage();
                    }

                    if (typeof showTopRightToast === 'function') {
                        showTopRightToast("Payment complete! Active post published successfully.", "success");
                    } else {
                        alert("Payment complete! Active post published successfully.");
                    }
                } catch (dataErr) {
                    console.error("Error committing product post record:", dataErr);
                } finally {
                    // ALWAYS clean up state & UI, even if re-rendering fails
                    UPLOADED_ASSET_IMAGES = [];
                    closeActiveModalDirectly('auth-modal');

                    if (publishBtn) {
                        publishBtn.disabled = false;
                        publishBtn.innerText = "Publish Active Post";
                    }

                    // Safely trigger page update outside main stack trace
                    setTimeout(() => {
                        if (typeof renderMarketplaceProductsDisplayLoop === 'function') {
                            renderMarketplaceProductsDisplayLoop();
                        }
                    }, 100);
                }
            },
            onClose: function() {
                if (publishBtn) {
                    publishBtn.disabled = false;
                    publishBtn.innerText = "Publish Active Post";
                }
                if (typeof showTopRightToast === 'function') {
                    showTopRightToast("Payment sequence cancelled.", "info");
                }
            }
        });

        handler.openIframe();

    } catch (err) {
        console.error("Error executing publish post pipeline:", err);
        alert("An error occurred while launching payment. Check browser console for details.");
        const publishBtn = document.getElementById("btn-publish-post");
        if (publishBtn) {
            publishBtn.disabled = false;
            publishBtn.innerText = "Publish Active Post";
        }
    }
}

// Ensure function is attached directly to window for global inline accessibility
window.executePipelineCommitNewInventoryPostRecord = executePipelineCommitNewInventoryPostRecord;
window.openFileUploadModal = openFileUploadModal;
window.closeFileUploadModal = closeFileUploadModal;
window.handleAssetFileSelection = handleAssetFileSelection;
window.confirmAddAssetImage = confirmAddAssetImage;
window.removeAssetImageFromGrid = removeAssetImageFromGrid;
window.verifyPasswordAndProceed = verifyPasswordAndProceed;

/**
 * Step 1: Pre-check Validation & Launch Password Verification for Design Requests
 */
function handleRequestSubmissionPrecheck() {
    const details = document.getElementById("req-project-details")?.value.trim();
    const errDiv = document.getElementById("req-upload-error");

    if (typeof APP_STATE === 'undefined' || !APP_STATE.currentUser) {
        if (errDiv) {
            errDiv.innerText = "Please log in to submit a request.";
            errDiv.style.display = "block";
        }
        return;
    }

    if (!details) {
        if (errDiv) {
            errDiv.innerText = "Please provide project details.";
            errDiv.style.display = "block";
        }
        return;
    }

    DESIGN_REQUEST_WIZARD.requestPayload = {
        details: details,
        fileInput: document.getElementById("req-file-assets")?.files || null,
        timestamp: new Date().toISOString()
    };

    document.getElementById("file-upload-modal")?.remove();
    initiateRequestPasswordModal();
}

/**
 * Step 2: Confirm Account Security Password for Design Requests
 */
function initiateRequestPasswordModal() {
    let pwdModal = document.getElementById("request-password-modal");
    if (pwdModal) pwdModal.remove();

    pwdModal = document.createElement("div");
    pwdModal.id = "request-password-modal";
    pwdModal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;";

    pwdModal.innerHTML = `
        <div style="background: white; border-radius: 8px; max-width: 400px; width: 90%; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
            <h3 style="margin-top:0; color:#0d233a;">Confirm Password</h3>
            <p style="font-size:0.88rem; color:#555; margin-bottom:16px;">Verify your account credentials to proceed with the request payment:</p>
            
            <div style="margin-bottom:16px;">
                <label style="display:block; font-size:0.8rem; margin-bottom:4px; font-weight:600;">Account Password</label>
                <input type="password" id="request-pwd-input" class="form-field-control" placeholder="Enter your password" style="width:100%; padding:8px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;">
                <div id="request-pwd-error" style="color:red; font-size:0.8rem; margin-top:4px; display:none;"></div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:8px;">
                <button type="button" class="btn-gray" style="padding:8px 16px; border:none; border-radius:4px; cursor:pointer;" onclick="document.getElementById('request-password-modal').remove()">Cancel</button>
                <button type="button" class="btn-blue" style="background:#09a5db; color:white; border:none; padding:8px 16px; border-radius:4px; font-weight:600; cursor:pointer;" onclick="validateRequestPasswordAndProceed()">Verify Password</button>
            </div>
        </div>
    `;

    document.body.appendChild(pwdModal);
}

/**
 * Validates entered password against APP_STATE records
 */
function validateRequestPasswordAndProceed() {
    const pwdInput = document.getElementById("request-pwd-input");
    const errFeedback = document.getElementById("request-pwd-error");
    const enteredPassword = pwdInput ? pwdInput.value.trim() : "";

    const actualSecret = APP_STATE.currentUser.secretKey || APP_STATE.currentUser.password || "";

    if (!enteredPassword || enteredPassword !== actualSecret) {
        if (errFeedback) {
            errFeedback.innerText = "Invalid password. Please check your password and try again.";
            errFeedback.style.display = "block";
        }
        return;
    }

    document.getElementById("request-password-modal").remove();
    launchDesignRequestPaystackConfirmationModal();
}

/**
 * Step 3: Payment Confirmation Modal
 */
function launchDesignRequestPaystackConfirmationModal() {
    let checkoutModal = document.getElementById("request-paystack-checkout-modal");
    if (checkoutModal) checkoutModal.remove();

    checkoutModal = document.createElement("div");
    checkoutModal.id = "request-paystack-checkout-modal";
    checkoutModal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;";

    const userEmail = APP_STATE.currentUser.identifierText || APP_STATE.currentUser.email || 'user@fortmart.com';
    const upfrontPayment = 500;

    checkoutModal.innerHTML = `
        <div class="paystack-modal-box" style="background: white; border-radius: 8px; max-width: 420px; width: 100%; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.15); border: 1px solid #ccc;">
            <div class="paystack-header-brand" style="background-color: #09a5db; color: white; padding: 20px; text-align: center;">
                <h3 style="margin:0; color:white;">Design Request Deposit Confirmation</h3>
                <span style="font-size:0.75rem; opacity:0.9;">Fort Graphics Checkout Gateway</span>
            </div>
            <div class="paystack-body-content" style="padding: 24px;">
                <p style="font-size:0.85rem; color:#0d233a; margin-bottom:12px;">You are authorizing an initial payment deposit to send your design request.</p>
                
                <div class="form-input-container" style="margin-bottom:10px;">
                    <label style="display:block; font-size:0.8rem; margin-bottom:4px;">Email Address</label>
                    <input type="text" id="request-paystack-email-field" class="form-field-control" value="${userEmail}" disabled style="width:100%; padding:8px; box-sizing:border-box;">
                </div>
                <div class="form-input-container" style="margin-bottom:10px;">
                    <label style="display:block; font-size:0.8rem; margin-bottom:4px;">Deposit Amount</label>
                    <input type="text" class="form-field-control" value="₦${upfrontPayment.toLocaleString()}" disabled style="width:100%; padding:8px; box-sizing:border-box; font-weight:bold; color:#09a5db;">
                </div>

                <div style="background:#fff8e1; border: 1px solid #ffe082; padding: 10px; border-radius:4px; margin-top:12px;">
                    <p style="font-size:0.82rem; color:#b78103; margin:0; font-weight:600;">
                        Note: There is a remaining balance of ₦1,000 naira.
                    </p>
                </div>
            </div>
            <div class="paystack-footer-row" style="padding: 16px 24px; background: #f9f9f9; border-top: 1px solid #eee; display: flex; justify-content: space-between;">
                <button type="button" class="btn-gray" style="padding:8px 16px; border:none; border-radius:4px; cursor:pointer;" onclick="document.getElementById('request-paystack-checkout-modal').remove()">Cancel</button>
                <button type="button" class="btn-blue" style="background-color:#3bb75e; color:white; border:none; padding:8px 16px; border-radius:4px; font-weight:700; cursor:pointer;" onclick="executeRequestPaystackIframePopRuntime()">Proceed to Payment Method</button>
            </div>
        </div>
    `;

    document.body.appendChild(checkoutModal);
}

/**
 * Step 4: Launch Paystack Popup
 */
function executeRequestPaystackIframePopRuntime() {
    if (typeof PaystackPop === 'undefined') {
        if (typeof showTopRightToast === 'function') {
            showTopRightToast("Paystack SDK not loaded! Check your internet connection.", "info");
        } else {
            alert("Paystack SDK not loaded!");
        }
        return;
    }

    const emailField = document.getElementById("request-paystack-email-field");
    const userEmail = emailField ? emailField.value : APP_STATE.currentUser.identifierText;
    const userUid = APP_STATE.currentUser ? (APP_STATE.currentUser.uid || APP_STATE.currentUser.id) : 'GUEST_USER';
    const upfrontPayment = 500;

    document.getElementById('request-paystack-checkout-modal')?.remove();

    let paymentConfig = {
        key: 'pk_test_8e350f62114983f1cd23b0944668d435a6e74214',
        email: userEmail,
        amount: upfrontPayment * 100,
        currency: "NGN",
        ref: 'REQ-DESIGN-' + userUid + '-' + Math.floor((Math.random() * 1000000000) + 1),
        metadata: {
            request_type: "design_order",
            user_uid: userUid,
            target_designer: DESIGN_REQUEST_WIZARD.targetDesignerUid || "general"
        },
        callback: function(response) {
            console.log("Design Payment successful response:", response);
            processDesignRequestPostPaymentSuccess(response);
        },
        onClose: function() {
            if (typeof showTopRightToast === 'function') {
                showTopRightToast('Payment session cancelled.', "info");
            }
        }
    };

    try {
        let handler = PaystackPop.setup(paymentConfig);
        handler.openIframe();
    } catch (error) {
        console.error("Paystack Execution Error:", error);
        if (typeof showTopRightToast === 'function') {
            showTopRightToast("Error launching Paystack modal: " + error.message, "error");
        }
    }
}

/**
 * Step 5: Post-Payment Operations
 */
function processDesignRequestPostPaymentSuccess(paymentResponse) {
    const userUid = APP_STATE.currentUser.uid || APP_STATE.currentUser.id;

    const newRequestObject = {
        requestId: "req_" + Date.now(),
        clientUid: userUid,
        targetDesignerUid: DESIGN_REQUEST_WIZARD.targetDesignerUid || null,
        details: DESIGN_REQUEST_WIZARD.requestPayload.details,
        hasAssetsAttached: Boolean(DESIGN_REQUEST_WIZARD.requestPayload.fileInput?.length),
        amountPaid: 900,
        remainingBalance: 1100,
        paymentReference: paymentResponse.reference,
        status: "submitted",
        createdAt: new Date().toISOString()
    };

    if (typeof SYSTEM_DATABASE !== 'undefined') {
        if (!SYSTEM_DATABASE.requests) {
            SYSTEM_DATABASE.requests = [];
        }
        SYSTEM_DATABASE.requests.push(newRequestObject);
    }

    if (typeof syncPlatformDatabaseStateToWebStorage === "function") {
        syncPlatformDatabaseStateToWebStorage();
    } else if (typeof commitDatabasesStateToLocalStorage === "function") {
        commitDatabasesStateToLocalStorage();
    }

    if (typeof showTopRightToast === 'function') {
        showTopRightToast("Payment successful! Your design request has been sent.", "success");
    } else {
        alert("Payment successful! Your design request has been sent.");
    }

    DESIGN_REQUEST_WIZARD.requestPayload = null;
    DESIGN_REQUEST_WIZARD.targetDesignerUid = null;
}

/**
 * Ensures '+' button triggers openfileuploadmodal()
 */
document.addEventListener("DOMContentLoaded", function () {
    const plusBtn = document.getElementById("btn-open-upload") || document.querySelector(".btn-plus-upload") || document.querySelector(".floating-action-btn");
    if (plusBtn) {
        plusBtn.addEventListener("click", function (e) {
            e.preventDefault();
            openfileuploadmodal();
        });
    }
});

/**
 * Intelligent Cognitive AI Framework Search Integration Engine Assistant Workspace Panel Module
 */
let COGNITIVE_AI_SESSION_MOCK_STREAM_LOGS_ARRAY = [
    { source: "ai", text: "Greetings! I am the integrated Fort AI Systems Cognitive Assistant. I possess complete operational system diagnostic metrics blueprints maps details to aid your experience. Ask me anything regarding site rules, features layout systems controls parameters, or dynamic product functionalities analysis schemas profiles.", graphics: null }
];

function initializeFortAiChatWindowWorkspace() {
    refreshAiAssistantBubbleLayoutStreamScroller();
}

function routeProductContextInquiryDirectlyToAiAssistant(productIdKeyValString) {
    const matchObj = SYSTEM_DATABASE.products.find(p => p.pid === productIdKeyValString);
    if(matchObj) {
         APP_STATE.fortAiActiveTaggedProductObject = matchObj;
         COGNITIVE_AI_SESSION_MOCK_STREAM_LOGS_ARRAY.push({
              source: "user",
              text: `[System Context Bound Reference Trigger Mapping Attach Element Event]: Actively inspecting target inventory trace: "${matchObj.name}". Please outline functional specs overview mappings indices.`,
              graphics: null
         });
         
         navigateToPage('fort-ai');
         
         // Trigger automated delayed downstream intelligence mapping lookup responses structures vectors sets algorithms
         setTimeout(() => {
             COGNITIVE_AI_SESSION_MOCK_STREAM_LOGS_ARRAY.push({
                 source: "ai",
                 text: `Analyzing core technical tracking schemas variables metrics data blocks references for inventory profile item listing matching key: "${matchObj.name}". Found metadata profiles: ${matchObj.info} Additional AI Parameters Framework Blueprint Specs Mapping Log reads: ${matchObj.aiInfo}`,
                 graphics: null
             });
             refreshAiAssistantBubbleLayoutStreamScroller();
         }, 1000);
    }
}

function refreshAiAssistantBubbleLayoutStreamScroller() {
    const containerTargetNode = document.getElementById("ai-chat-bubble-scroller");
    if(!containerTargetNode) return;
    
    containerTargetNode.innerHTML = "";
    
    const tagLabelNode = document.getElementById("ai-active-product-tag");
    if(APP_STATE.fortAiActiveTaggedProductObject) {
        tagLabelNode.innerText = `🏷️ Context Anchor Active: ${APP_STATE.fortAiActiveTaggedProductObject.name}`;
        tagLabelNode.classList.remove("hidden-node");
    } else {
        tagLabelNode.classList.add("hidden-node");
    }
    
    COGNITIVE_AI_SESSION_MOCK_STREAM_LOGS_ARRAY.forEach(row => {
        const bubbleNodeElement = document.createElement("div");
        const aiFlagCondition = row.source === 'ai';
        bubbleNodeElement.className = `chat-bubble-node rounded-rect ${aiFlagCondition ? 'incoming-msg' : 'outgoing-msg'}`;
        if(aiFlagCondition) {
             bubbleNodeElement.style.backgroundColor = "#e0f2f1"; // unique assistant panel visual tracking color
        }
        
        bubbleNodeElement.innerHTML = `
            <p style="font-weight:${aiFlagCondition ? '500' : '400'};">${row.text}</p>
            <div class="msg-meta-row"><span>Fort AI Core</span></div>
        `;
        containerTargetNode.appendChild(bubbleNodeElement);
    });
    
    containerTargetNode.scrollTop = containerTargetNode.scrollHeight;
}

function submitAiQueryRequest() {
    const inputNode = document.getElementById("ai-text-input-field");
    const QueryString = inputNode.value.trim();
    if(QueryString === "") return;
    
    COGNITIVE_AI_SESSION_MOCK_STREAM_LOGS_ARRAY.push({ source: "user", text: QueryString, graphics: null });
    inputNode.value = "";
    refreshAiAssistantBubbleLayoutStreamScroller();
    
    // Cognitive execution sequence parsing rules matches patterns behaviors
    setTimeout(() => {
        let responseLineText = "I have queried the global external web references databases indices to parse your evaluation request parameters loops tracking metrics constraints, but found no direct infrastructure adjustments. Please clarify details.";
        const normalizedInput = QueryString.toLowerCase();
        
        if(normalizedInput.includes("admin") || normalizedInput.includes("password") || normalizedInput.includes("login")) {
            responseLineText = "System Operational Guide Rule Mapping Log: Global system platform management accounts operate via dial prefix selector set 'Nigeria +234' with access credentials handle matching text string 'Fort Mart'. Core parameters entries cannot be reset without validation.";
        } else if(normalizedInput.includes("shipping") || normalizedInput.includes("currency") || normalizedInput.includes("country")) {
            responseLineText = "System Architecture Framework Parameters Metric Check: Core product matching streams currency symbols outputs (₦ or $) adjust dynamically checking localized regional geo settings identifiers attributes logged when registering.";
        } else if(normalizedInput.includes("hello") || normalizedInput.includes("hi ")) {
            responseLineText = "Hello! I am standing by to process system tools troubleshooting questions, core features mapping descriptions parameters traces, or catalog asset lookup evaluations requests.";
        }
        
        COGNITIVE_AI_SESSION_MOCK_STREAM_LOGS_ARRAY.push({ source: "ai", text: responseLineText, graphics: null });
        refreshAiAssistantBubbleLayoutStreamScroller();
    }, 1200);
}

function clearAiChatHistory() {
    displayConfirmationModalOverlayAction("Are you sure you want to clear your current AI conversation session window timeline logs traces baseline elements matrices indexes?", () => {
        COGNITIVE_AI_SESSION_MOCK_STREAM_LOGS_ARRAY = [
            { source: "ai", text: "Session timeline memory traces purged successfully. Framework canvas running clean. State system standing by to parse inquiries models.", graphics: null }
        ];
        APP_STATE.fortAiActiveTaggedProductObject = null;
        refreshAiAssistantBubbleLayoutStreamScroller();
    });
}

/**
 * Profile Settings, Dynamic User Info Data Mutation & Feedback Subsystem Controllers Modules
 */
function switchSettingsSection(selectedSectionTabIdKey) {
    document.querySelectorAll(".settings-tab-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".settings-sub-panel").forEach(panel => panel.classList.add("hidden-node"));
    
    // Activate target parameters arrays tracking nodes loops elements
    event.currentTarget.classList.add("active");
    document.getElementById(`settings-node-${selectedSectionTabIdKey}`).classList.remove("hidden-node");
    if (selectedSectionTabIdKey === 'my-products') {
        // Safe execution guard wrapper
        if (typeof renderAccountInventoryLedgerManagementDashboardGrid === 'function') {
            renderAccountInventoryLedgerManagementDashboardGrid();
        }
    }
}

function initializeProfileDetailsAccountManagementFieldsValues() {
    if(!APP_STATE.currentUser) return;

    const globalDefaultVectorAvatarURI = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230288d1'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>";
    const operationalActiveAvatarImageSrc = APP_STATE.currentUser.avatar || globalDefaultVectorAvatarURI;

    // 1. Update Profile Image
    const profilePaneAvatarNodeFrame = document.getElementById("profile-pane-avatar-display");
    if(profilePaneAvatarNodeFrame) {
        profilePaneAvatarNodeFrame.src = operationalActiveAvatarImageSrc;
    }

    // 2. Update Navbar Avatar
    const navUserAvatarNodeFrame = document.getElementById("nav-user-avatar");
    if(navUserAvatarNodeFrame) {
        navUserAvatarNodeFrame.src = operationalActiveAvatarImageSrc;
    }

    // 3. Update Drawer Avatar
    const drawerUserAvatarNodeFrame = document.getElementById("drawer-user-avatar");
    if(drawerUserAvatarNodeFrame) {
        drawerUserAvatarNodeFrame.src = operationalActiveAvatarImageSrc;
    }

    // 4. Update Verification Badge
    const badgeContainer = document.getElementById("user-verification-badge");
    const badgeText = document.getElementById("badge-status-text");
    const badgeIcon = document.getElementById("badge-status-icon");

    const status = APP_STATE.currentUser.verificationStatus || APP_STATE.currentUser.status || "unverified";
    if(badgeContainer && badgeText && badgeIcon) {
        if(status === "verified") {
            badgeContainer.className = "verification-badge-pill status-verified";
            badgeIcon.textContent = "✓";
            badgeText.textContent = "Verified";
        } else {
            badgeContainer.className = "verification-badge-pill status-unverified";
            badgeIcon.textContent = "⏳";
            badgeText.textContent = "Pending Approval";
        }
    }

    // 5. Update Profile Labels
    document.getElementById("txt-profile-username-val").innerText = APP_STATE.currentUser.identityName || "N/A";
    const bizFieldsNodeWrapper = document.getElementById("business-profile-only-fields"); 
    if(APP_STATE.currentUser.accountType === 'business' || APP_STATE.currentUser.uid === 'admin') { 
        bizFieldsNodeWrapper.classList.remove("hidden-node");
        document.getElementById("txt-profile-busname-val").innerText = APP_STATE.currentUser.businessName || "N/A"; 
        document.getElementById("txt-profile-businfo-val").innerText = APP_STATE.currentUser.businessInfo || "N/A";
    } else {
        bizFieldsNodeWrapper.classList.add("hidden-node");
    }
}

/**
 * Profile Edit Multi-step Wizard Management System
 * Enforces current password validation followed by a secure email OTP check before saving mutations.
 */

function openProfileEditWizard(targetFieldNameStringTokenKey) {
    const modalTargetNode = document.getElementById("auth-modal-content");
    if (!modalTargetNode) return;

    modalTargetNode.innerHTML = `
        <h3>Validate Account Ownership (Step 1 of 3)</h3>
        <div class="form-input-container margin-top-sm">
            <label>Input Current Password:</label>
            <input type="password" id="profile-reauth-key" class="form-field-control" placeholder="Enter password to verify ownership context">
            <div id="err-profile-reauth-msg" class="text-danger-alert hidden-node" style="color: red; font-size: 0.8rem; margin-top: 4px;">Incorrect Password</div>
        </div>

        <div style="margin-top: 6px; display: flex; align-items: center; gap: 6px;">
            <input type="checkbox" id="chk-signin-showpass" onchange="toggleFormPasswordFieldVisibility(this, 'profile-reauth-key')">
            <label for="chk-signin-showpass" style="font-size: 0.8rem; font-weight: 400; cursor: pointer; user-select: none;">Show Password</label>
        </div>

        <div class="text-center margin-top-xs">
            <span style="color:var(--fort-blue-light); cursor:pointer; font-size:0.9rem;" onclick="renderForgotPasswordModalWorkflow()">Forgot Password?</span>
        </div>

        <div class="btn-group margin-top-md">
            <button onclick="closeActiveModalDirectly('auth-modal')" class="btn-gray">Cancel</button>
            <button onclick="executeVerifyProfileReauthCredentialPasswordMatch('${targetFieldNameStringTokenKey}')" class="btn-blue">Verify Password</button>
        </div>
    `;
    
    // FIXED CRITICAL MISSING LINK: Added display initialization instructions
    document.getElementById("auth-modal").classList.add("active");
}

function executeVerifyProfileReauthCredentialPasswordMatch(targetFieldNameStringTokenKey) {
    const enteredPasswordValue = document.getElementById("profile-reauth-key").value;
    const errorDisplayNode = document.getElementById("err-profile-reauth-msg");
    
    errorDisplayNode.classList.add("hidden-node");
    if (enteredPasswordValue !== APP_STATE.currentUser.secretKey) {
        errorDisplayNode.innerText = "Incorrect Password";
        errorDisplayNode.classList.remove("hidden-node");
        return;
    }
    
    sendProfileEditWizardEmailJsOtpWorkflow(targetFieldNameStringTokenKey, true);
}

async function sendProfileEditWizardEmailJsOtpWorkflow(targetFieldNameStringTokenKey, isInitialLaunch = false) {
    const targetEmail = APP_STATE.currentUser.identifierText;
    const todayKeyStr = "profile_otp_limit_" + new Date().toISOString().split('T')[0] + "_" + targetEmail.toLowerCase();
    
    let dailyAttemptsCount = parseInt(localStorage.getItem(todayKeyStr) || "0", 10);
    if (dailyAttemptsCount >= 5) {
        if (!isInitialLaunch) {
            const feedbackElement = document.getElementById("err-profile-step2-feedback");
            if (feedbackElement) {
                feedbackElement.innerText = "Maximum daily limit reached. You can only send up to 5 OTPs per day.";
                feedbackElement.style.color = "red";
                feedbackElement.classList.remove("hidden-node");
            }
        } else {
            renderProfileEditWizardStepTwoLayout(targetFieldNameStringTokenKey);
            setTimeout(() => {
                const feedbackElement = document.getElementById("err-profile-step2-feedback");
                if (feedbackElement) {
                    feedbackElement.innerText = "Maximum daily limit reached. You can only send up to 5 OTPs per day.";
                    feedbackElement.style.color = "red";
                    feedbackElement.classList.remove("hidden-node");
                }
            }, 50);
        }
        return;
    }

    initiateProfileEditOtpResendCooldown(targetFieldNameStringTokenKey);
    const freshGeneratedOtpCode = Math.floor(1000 + Math.random() * 9000);
    SIGNUP_WIZARD_TEMPORARY_OBJECT.profileActiveVerificationOtp = freshGeneratedOtpCode;

    dailyAttemptsCount++;
    localStorage.setItem(todayKeyStr, dailyAttemptsCount.toString());
    if (!isInitialLaunch) {
        const feedbackElement = document.getElementById("err-profile-step2-feedback");
        if (feedbackElement) {
            feedbackElement.innerText = "Sending fresh token...";
            feedbackElement.style.color = "blue";
            feedbackElement.classList.remove("hidden-node");
        }
    }

    try {
        if (window.emailjs) {
            await window.emailjs.send(
                "service_ejag5pe", 
                "template_nzub7tk", 
                {
                    to_email: targetEmail,
                    user_name: APP_STATE.currentUser.identityName,
                    otp_code: freshGeneratedOtpCode
                }
            );
            if (isInitialLaunch) {
                renderProfileEditWizardStepTwoLayout(targetFieldNameStringTokenKey);
            } else {
                const feedbackElement = document.getElementById("err-profile-step2-feedback");
                if (feedbackElement) {
                    feedbackElement.innerText = "A new verification code has been successfully sent.";
                    feedbackElement.style.color = "green";
                    feedbackElement.classList.remove("hidden-node");
                }
            }
        } else {
            console.warn("EmailJS context missing.");
            if (isInitialLaunch) renderProfileEditWizardStepTwoLayout(targetFieldNameStringTokenKey);
        }
    } catch (sendErr) {
        console.error("EmailJS profile update error:", sendErr);
        if (isInitialLaunch) {
            renderProfileEditWizardStepTwoLayout(targetFieldNameStringTokenKey);
        } else {
            const feedbackElement = document.getElementById("err-profile-step2-feedback");
            if (feedbackElement) {
                feedbackElement.innerText = "Failed to send code. Please check your network connection.";
                feedbackElement.style.color = "red";
                feedbackElement.classList.remove("hidden-node");
            }
        }
    }
}

function initiateProfileEditOtpResendCooldown(targetFieldNameStringTokenKey) {
    if (SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpInterval) {
        clearInterval(SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpInterval);
    }
    SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpSecondsLeft = 30;

    SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpInterval = setInterval(() => {
        SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpSecondsLeft--;
        const resendLinkNode = document.getElementById("profile-otp-resend-link");
        
        if (resendLinkNode) {
            if (SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpSecondsLeft > 0) {
                resendLinkNode.innerText = `Resend in ${SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpSecondsLeft}s`;
                resendLinkNode.style.opacity = "0.5";
                resendLinkNode.style.fontWeight = "400";
                resendLinkNode.style.pointerEvents = "none";
            } else {
                resendLinkNode.innerText = "Resend";
                resendLinkNode.style.opacity = "1";
                resendLinkNode.style.fontWeight = "600";
                resendLinkNode.style.pointerEvents = "auto";
                clearInterval(SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpInterval);
                SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpInterval = null;
            }
        } else if (SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpSecondsLeft <= 0) {
            clearInterval(SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpInterval);
            SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpInterval = null;
        }
    }, 1000);
}

function handleProfileEditOtpResendClickInterception(targetFieldNameStringTokenKey) {
    if (SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpSecondsLeft > 0) return;
    sendProfileEditWizardEmailJsOtpWorkflow(targetFieldNameStringTokenKey, false);
}

function renderProfileEditWizardStepTwoLayout(targetFieldNameStringTokenKey) {
    const modalTargetNode = document.getElementById("auth-modal-content");
    const targetEmail = APP_STATE.currentUser.identifierText;
    const secondsLeft = SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpSecondsLeft || 0;
    const textLabel = secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "Resend";
    const opacityStyle = secondsLeft > 0 ? "0.5" : "1";
    const weightStyle = secondsLeft > 0 ? "400" : "600";
    const pointerStyle = secondsLeft > 0 ? "none" : "auto";

    modalTargetNode.innerHTML = `
        <h3>Verify Security Profile Identity (Step 2 of 3)</h3>
        <p style="font-size:0.9rem; margin-top:6px; color:var(--fort-gray-slate);">
            An identity verification message code was sent to your registered profile email address: ${targetEmail}
        </p>

        <div class="form-input-container margin-top-sm">
            <label>Input 4-Digit Security OTP Token Key:</label>
            <input type="text" id="profile-otp-input" class="form-field-control" placeholder="X X X X" maxlength="4" style="text-align:center; font-size:1.25rem; letter-spacing:8px;">
            <div id="err-profile-step2-feedback" class="text-danger-alert hidden-node" style="color: red; font-size: 0.8rem; margin-top: 4px;"></div>
        </div>

        <div style="margin-top: 10px; font-size: 0.85rem;">
            <span>Didn't receive message? </span>
            <a href="javascript:void(0)" id="profile-otp-resend-link" onclick="handleProfileEditOtpResendClickInterception('${targetFieldNameStringTokenKey}')" style="color: #007bff; text-decoration:none; font-weight:${weightStyle}; opacity:${opacityStyle}; pointer-events:${pointerStyle};">${textLabel}</a>
        </div>

        <div class="btn-group margin-top-md">
            <button onclick="handleClearProfileTimersAndReturnToStepOne('${targetFieldNameStringTokenKey}')" class="btn-gray">Back</button>
            <button onclick="executeValidateProfileWizardOtpTokenKey('${targetFieldNameStringTokenKey}')" class="btn-blue">Verify Security Code</button>
        </div>
    `;
}

function handleClearProfileTimersAndReturnToStepOne(targetFieldNameStringTokenKey) {
    if (SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpInterval) {
        clearInterval(SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpInterval);
        SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpInterval = null;
    }
    SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpSecondsLeft = 0;
    openProfileEditWizard(targetFieldNameStringTokenKey);
}

function executeValidateProfileWizardOtpTokenKey(targetFieldNameStringTokenKey) {
    const inputVal = document.getElementById("profile-otp-input").value.trim();
    const feedback = document.getElementById("err-profile-step2-feedback");
    
    feedback.classList.add("hidden-node");
    feedback.style.color = "red";

    const systemExpected = String(SIGNUP_WIZARD_TEMPORARY_OBJECT.profileActiveVerificationOtp || "");
    if (!inputVal || inputVal !== systemExpected) {
        feedback.innerText = "Invalid verification token code expression entry parameter configuration.";
        feedback.classList.remove("hidden-node");
        return;
    }

    if (SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpInterval) {
        clearInterval(SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpInterval);
        SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpInterval = null;
    }
    SIGNUP_WIZARD_TEMPORARY_OBJECT.profileOtpSecondsLeft = 0;

    renderProfileEditWizardStepThreeFinalModificationInputLayout(targetFieldNameStringTokenKey);
}

function renderProfileEditWizardStepThreeFinalModificationInputLayout(targetFieldNameStringTokenKey) {
    const modalTargetNode = document.getElementById("auth-modal-content");
    let inputFieldTypeLayoutPlaceholderHTML = ``;

    if (targetFieldNameStringTokenKey === 'secretKey') {
        inputFieldTypeLayoutPlaceholderHTML = `
            <div class="form-input-container margin-top-sm">
                <label>Input New Security Password Expression:</label>
                <input type="password" id="profile-new-value-1" class="form-field-control" placeholder="New structural value">
            </div>
            <div class="form-input-container">
                <label>Confirm Entry Configuration Parameters Match:</label>
                <input type="password" id="profile-new-value-2" class="form-field-control" placeholder="Retype expression code configurations">
            </div>
        `;
    } else {
        const structuralDisplayLabelText = targetFieldNameStringTokenKey === 'identityName' ?
            'Personal Full Name Context' : 
            (targetFieldNameStringTokenKey === 'businessName' ? 'Business Trading Enterprise Title' : 'Business Strategy Description Information Portfolio Summary Statement');
        inputFieldTypeLayoutPlaceholderHTML = `
            <div class="form-input-container margin-top-sm">
                <label>Modify ${structuralDisplayLabelText}:</label>
                <input type="text" id="profile-new-value-1" class="form-field-control" value="${APP_STATE.currentUser[targetFieldNameStringTokenKey] || ''}" placeholder="Enter updated field text value mappings">
            </div>
        `;
    }

    modalTargetNode.innerHTML = `
        <h3>Commit Field Mutations (Step 3 of 3)</h3>
        <div id="profile-mutation-fields-context-node-target">
            ${inputFieldTypeLayoutPlaceholderHTML}
            <div id="err-profile-step3-feedback" class="text-danger-alert hidden-node" style="color: red; font-size: 0.8rem; margin-top: 4px;"></div>
        </div>

        <div class="btn-group margin-top-md">
            <button onclick="closeActiveModalDirectly('auth-modal')" class="btn-gray">Cancel</button>
            <button onclick="executeSaveProfileWizardModificationsToDatabase('${targetFieldNameStringTokenKey}')" class="btn-blue">Save Changes</button>
        </div>
    `;
}

function executeSaveProfileWizardModificationsToDatabase(targetFieldNameStringTokenKey) {
    const val1 = document.getElementById("profile-new-value-1").value.trim();
    const errorNode = document.getElementById("err-profile-step3-feedback");
    errorNode.classList.add("hidden-node");
    if (!val1) {
        errorNode.innerText = "Structural modifications field expression cannot post blank spaces updates tokens.";
        errorNode.classList.remove("hidden-node");
        return;
    }

    if (targetFieldNameStringTokenKey === 'secretKey') {
        const val2 = document.getElementById("profile-new-value-2").value.trim();
        if (val1 !== val2) {
            errorNode.innerText = "Password mismatch configuration parameter error mapping tracking metrics discovered.";
            errorNode.classList.remove("hidden-node");
            return;
        }
        if (val1.length < 6 || !/[A-Z]/.test(val1) || !/[a-z]/.test(val1) || !/[0-9]/.test(val1) || !/[^A-Za-z0-9]/.test(val1)) {
            errorNode.innerText = "Any password created should have at least one uppercase letter, one lowercase letter, one symbol, one number and should be at least six characters.";
            errorNode.classList.remove("hidden-node");
            return;
        }
    }

    const targetedUserIndexId = SYSTEM_DATABASE.users.findIndex(u => u.uid === APP_STATE.currentUser.uid);
    if (targetedUserIndexId !== -1) {
        SYSTEM_DATABASE.users[targetedUserIndexId][targetFieldNameStringTokenKey] = val1;
        if (targetFieldNameStringTokenKey === 'secretKey') {
            SYSTEM_DATABASE.users[targetedUserIndexId].password = val1;
        }

        const automatedTelemetryLogEntryNotificationNodeValue = {
            mid: "telemetry_" + Date.now(),
            senderUid: "admin",
            text: `[Profile Edit Notification]: Security credential variables field pointer parameter "${targetFieldNameStringTokenKey}" value updated successfully.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        
        let existingSystemAdminThreadNodePointerIndex = SYSTEM_DATABASE.chats.find(c => 
            c.dynamicParticipants.includes(APP_STATE.currentUser.uid) && c.dynamicParticipants.includes("admin")
        );
        if (existingSystemAdminThreadNodePointerIndex) {
            existingSystemAdminThreadNodePointerIndex.messageLog.push(automatedTelemetryLogEntryNotificationNodeNodeValue || automatedTelemetryLogEntryNotificationNodeValue);
        }

        APP_STATE.currentUser = SYSTEM_DATABASE.users[targetedUserIndexId];
        syncPlatformDatabaseStateToWebStorage();

        closeActiveModalDirectly('auth-modal');
        if (typeof initializeProfileDetailsAccountManagementFieldsValues === "function") {
            initializeProfileDetailsAccountManagementFieldsValues();
        }

        showTopRightToast("Changes made successfully", "success");
    }
}

/**
 * RENDER CUSTOMER MY PROJECTS DASHBOARD & CONTROLS
 */
function renderAccountInventoryLedgerManagementDashboardGrid() {
    const listContainerNodeElement = document.getElementById("my-products-list-container");
    if (!listContainerNodeElement) return;
    
    listContainerNodeElement.innerHTML = "";
    if (!APP_STATE.currentUser) return;

    // Reload latest platform state baseline to prevent stale cache readings
    if (typeof loadPlatformDatabaseStateFromWebStorage === "function") {
        loadPlatformDatabaseStateFromWebStorage();
    }

    // Check if the current user is a designer; render designer panel if true
    const userRole = APP_STATE.currentUser.accountType || APP_STATE.currentUser.type;
    if (userRole === 'designer' || userRole === 'business') {
        if (typeof renderDesignerProjectsWorkspaceDashboard === 'function') {
            renderDesignerProjectsWorkspaceDashboard(listContainerNodeElement);
        }
        return;
    }
    
    // Customer Dashboard View
    const userOwnedProjects = SYSTEM_DATABASE.products.filter(p => p.ownerUid === APP_STATE.currentUser.uid);

    if (userOwnedProjects.length === 0) {
        listContainerNodeElement.innerHTML = `
            <div style="padding:24px; text-align:center; color:var(--fort-gray-slate);">
                <h4>You have no requested projects.</h4>
                <p style="font-size:0.85rem; margin-bottom:16px;">Post a design request to hire professional designers on Fort Graphics.</p>
                <button class="btn-blue" onclick="handleFloatingActionButtonTrigger()">+ Request New Project</button>
            </div>`;
        return;
    }

    userOwnedProjects.forEach(item => {
        const itemCardNode = document.createElement("div");
        itemCardNode.className = "project-expanded-card";

        // Badges setup
        let badgeHTML = `<span class="badge-status badge-not-booked">Not Booked</span>`;
        if (item.hasSubmittedDraft) {
            badgeHTML = `<span class="badge-status badge-available">Available</span>`;
        } else if (item.isBooked) {
            badgeHTML = `<span class="badge-status badge-pending">Pending</span>`;
        }

        // Preview image or watermark wrapper
        let imagePreviewContent = `
            <div style="height:180px; background:#f7fafc; border-radius:6px; display:flex; align-items:center; justify-content:center; color:#a0aec0; border:1px solid #e2e8f0;">
                No design draft uploaded yet.
            </div>`;

        if (item.hasSubmittedDraft && item.submittedDesignDraft) {
            const showWatermark = !item.isDownloadedUnlocked;
            imagePreviewContent = `
                <div class="watermark-overlay-container" oncontextmenu="return false;" style="position:relative; overflow:hidden; border-radius:6px; height:260px; background-image:url('${item.submittedDesignDraft}'); background-size:contain; background-repeat:no-repeat; background-position:center; user-select:none;">
                    ${showWatermark ? '<div class="watermark-text-overlay" style="pointer-events:none;"><strong>BALANCE NOT PAID</strong></div>' : ''}
                </div>`;
        }

        // Action Buttons Setup
        let actionButtonsHTML = '';
        if (item.hasSubmittedDraft) {
            actionButtonsHTML = `
                <div style="display:flex; gap:10px; margin-top:14px;">
                    <button class="btn-gray" style="flex:1;" onclick="launchCustomerRevisionModal('${item.pid}')">Request Modifications</button>
                    <button class="btn-blue" style="flex:1; background:#059669;" onclick="initiateCustomerDownloadPaymentSequence('${item.pid}')">💳 Download (₦1,000)</button>
                </div>
            `;
        }

        // Expiration Notice and Countdown Label
        let deletionNoticeHTML = '';
        if (item.isDownloadedUnlocked && item.downloadUnlockedTimestamp) {
            const expireTimestamp = item.downloadUnlockedTimestamp + (24 * 60 * 60 * 1000);
            const now = Date.now();
            const diffMs = expireTimestamp - now;

            if (diffMs > 0) {
                const hours = Math.floor(diffMs / (1000 * 60 * 60));
                const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                
                deletionNoticeHTML = `
                    <div style="background:#fffbe0; border:1px solid #ffe58f; padding:10px; border-radius:6px; margin-top:12px; font-size:0.8rem; color:#d48806;">
                        ⚠️ <strong>Notice:</strong> Your clean asset is available for download. For security and storage purposes, download access will expire and files will be permanently deleted 24 hours after your initial download.
                        <div style="font-weight:bold; margin-top:4px;">Expires in: ${hours}h ${mins}m</div>
                    </div>
                `;

                actionButtonsHTML = `
                    <button class="btn-blue" style="width:100%; margin-top:12px; background:#2563eb;" onclick="executeCleanAssetDownloadDirectly('${item.pid}')">
                        📥 Download Clean Asset (Unlocked)
                    </button>
                `;
            } else {
                // Purge logic triggering automatically after 24h
                if (typeof executePurgeExpiredProjectFilesData === 'function') {
                    executePurgeExpiredProjectFilesData(item.pid);
                }
                return;
            }
        }

        itemCardNode.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <h3 style="margin:0; color:var(--fort-blue-dark);">${item.name}</h3>
                ${badgeHTML}
            </div>
            
            <p style="font-size:0.85rem; color:#4a5568; margin-bottom:12px;">${item.info}</p>
            
            ${imagePreviewContent}
            ${deletionNoticeHTML}
            ${actionButtonsHTML}
        `;

        listContainerNodeElement.appendChild(itemCardNode);
    });

// Place this at the bottom of renderAccountInventoryLedgerManagementDashboardGrid()
    listContainerNodeElement.addEventListener("contextmenu", (e) => {
        if (e.target.tagName === "IMG" || e.target.classList.contains("watermark-overlay-container")) {
            e.preventDefault();
        }
    });

    listContainerNodeElement.addEventListener("dragstart", (e) => {
        if (e.target.tagName === "IMG") {
            e.preventDefault();
        }
    });
}

/**
 * REVISION MODAL SETUP
 */
function launchCustomerRevisionModal(productId) {
    let revModal = document.getElementById("customer-revision-modal");
    if (revModal) revModal.remove();

    revModal = document.createElement("div");
    revModal.id = "customer-revision-modal";
    revModal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;";

    revModal.innerHTML = `
        <div style="background: white; border-radius: 8px; max-width: 440px; width: 90%; padding: 24px;">
            <h3 style="margin-top:0;">Request Modifications</h3>
            <p style="font-size:0.85rem; color:#666;">Describe the changes or adjustments you would like the designer to make:</p>
            
            <textarea id="revision-instructions-input" class="form-field-control" rows="4" style="width:100%; padding:8px; box-sizing:border-box; margin-bottom:14px;" placeholder="Input instructions here..."></textarea>

            <div style="display:flex; justify-content:flex-end; gap:8px;">
                <button class="btn-gray" onclick="document.getElementById('customer-revision-modal').remove()">Cancel</button>
                <button class="btn-blue" onclick="executeSubmitRevisionInstructions('${productId}')">Send</button>
            </div>
        </div>
    `;
    document.body.appendChild(revModal);
}

function executeSubmitRevisionInstructions(productId) {
    const instructions = document.getElementById("revision-instructions-input").value.trim();
    if (!instructions) {
        showTopRightToast("Please enter modification instructions.", "error");
        return;
    }

    const project = SYSTEM_DATABASE.products.find(p => p.pid === productId);
    if (project) {
        const timestamp = new Date().toISOString();
        project.modifications = project.modifications || [];
        project.modifications.push({
            text: instructions,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
        });

        const requester = SYSTEM_DATABASE.users.find(u => u.uid === project.ownerUid) || {};

        // Log History Record for Designer
        recordDesignerActivityLog({
            designerUid: project.bookedByUid,
            productId: project.pid,
            productName: project.name,
            requesterUid: project.ownerUid,
            requesterName: requester.name || requester.username || "Customer",
            type: 'modification',
            actionText: `Modification Requested: "${instructions.substring(0, 40)}${instructions.length > 40 ? '...' : ''}"`,
            timestamp: timestamp
        });

        syncPlatformDatabaseStateToWebStorage();
        showTopRightToast("Modifications sent to designer successfully.", "success");
    }

    document.getElementById("customer-revision-modal").remove();
    renderAccountInventoryLedgerManagementDashboardGrid();
}

/**
 * PAYSTACK BALANCE PAYMENT & PASSWORD CONFIRMATION MODAL
 */
function initiateCustomerDownloadPaymentSequence(productId) {
    let pwdModal = document.getElementById("download-pwd-modal");
    if (pwdModal) pwdModal.remove();

    pwdModal = document.createElement("div");
    pwdModal.id = "download-pwd-modal";
    pwdModal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;";

    pwdModal.innerHTML = `
        <div style="background: white; border-radius: 8px; max-width: 400px; width: 90%; padding: 24px;">
            <h3 style="margin-top:0;">Confirm Password</h3>
            <p style="font-size:0.88rem; color:#555; margin-bottom:16px;">Confirm password to proceed to payment confirmation (₦1,100 balance payment):</p>
            
            <div style="margin-bottom:16px;">
                <label style="display:block; font-size:0.8rem; margin-bottom:4px; font-weight:600;">Account Password</label>
                <input type="password" id="dl-pwd-input" class="form-field-control" placeholder="Enter password" style="width:100%; padding:8px; box-sizing:border-box;">
                <div id="dl-pwd-error" style="color:red; font-size:0.8rem; margin-top:4px; display:none;"></div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:8px;">
                <button class="btn-gray" onclick="document.getElementById('download-pwd-modal').remove()">Cancel</button>
                <button class="btn-blue" onclick="validateDownloadPasswordAndLaunchPaystackModal('${productId}')">Verify Password</button>
            </div>
        </div>
    `;

    document.body.appendChild(pwdModal);
}

function validateDownloadPasswordAndLaunchPaystackModal(productId) {
    const pwdInput = document.getElementById("dl-pwd-input");
    const errFeedback = document.getElementById("dl-pwd-error");
    const enteredPassword = pwdInput ? pwdInput.value.trim() : "";

    const actualSecret = APP_STATE.currentUser.secretKey || APP_STATE.currentUser.password || "";

    if (!enteredPassword || enteredPassword !== actualSecret) {
        if (errFeedback) {
            errFeedback.innerText = "Invalid password. Access denied.";
            errFeedback.style.display = "block";
        }
        return;
    }

    document.getElementById("download-pwd-modal").remove();
    launchCustomerPaystackCheckoutModal(productId);
}

function launchCustomerPaystackCheckoutModal(productId) {
    let checkoutModal = document.getElementById("download-paystack-modal");
    if (checkoutModal) checkoutModal.remove();

    checkoutModal = document.createElement("div");
    checkoutModal.id = "download-paystack-modal";
    checkoutModal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;";

    const userEmail = APP_STATE.currentUser.identifierText || APP_STATE.currentUser.email || 'customer@fortmart.com';
    const balanceAmount = 1000;

    checkoutModal.innerHTML = `
        <div class="paystack-modal-box" style="background: white; border-radius: 8px; max-width: 420px; width: 100%; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
            <div class="paystack-header-brand" style="background-color: #09a5db; color: white; padding: 20px; text-align: center;">
                <h3 style="margin:0; color:white;">Fort Graphics Gateway</h3>
                <span style="font-size:0.75rem; opacity:0.9;">Project Final Balance Settlement</span>
            </div>
            <div class="paystack-body-content" style="padding: 24px;">
                <p style="font-size:0.85rem; color:#0d233a; margin-bottom:12px;">Authorizing payment to unlock clean unwatermarked design download.</p>
                <div class="form-input-container" style="margin-bottom:10px;">
                    <label style="display:block; font-size:0.8rem; margin-bottom:4px;">Email Address</label>
                    <input type="text" class="form-field-control" value="${userEmail}" disabled style="width:100%; padding:8px; box-sizing:border-box;">
                </div>
                <div class="form-input-container" style="margin-bottom:14px;">
                    <label style="display:block; font-size:0.8rem; margin-bottom:4px;">Amount Due</label>
                    <input type="text" class="form-field-control" value="₦${balanceAmount.toLocaleString()}" disabled style="width:100%; padding:8px; box-sizing:border-box;">
                </div>
            </div>
            <div class="paystack-footer-row" style="padding: 16px 24px; background: #f9f9f9; border-top: 1px solid #eee; display: flex; justify-content: space-between;">
                <button class="btn-gray" onclick="document.getElementById('download-paystack-modal').remove()">Cancel</button>
                <button class="btn-blue" style="background-color:#3bb75e; color:white; font-weight:700;" onclick="executeCustomerPaystackSplitRuntime('${productId}')">Proceed to Pay ₦1,100</button>
            </div>
        </div>
    `;

    document.body.appendChild(checkoutModal);
}

/**
 * PAYSTACK DIRECT EXECUTION (Subaccount & split payment architecture removed)
 */
function executeCustomerPaystackSplitRuntime(productId) {
    if (typeof PaystackPop === 'undefined') {
        showTopRightToast("Paystack SDK not loaded! Check internet connection.", "info");
        return;
    }

    const project = SYSTEM_DATABASE.products.find(p => p.pid === productId);
    if (!project) return;

    const userEmail = APP_STATE.currentUser.identifierText || APP_STATE.currentUser.email || 'customer@fortmart.com';
    const amountInKobo = 1000 * 100; // Standard amount without split routing

    const modal = document.getElementById('download-paystack-modal');
    if (modal) modal.remove();

    let paymentConfig = {
        key: 'pk_test_8e350f62114983f1cd23b0944668d435a6e74214',
        email: userEmail,
        amount: amountInKobo,
        currency: "NGN",
        ref: 'FT-BAL-' + productId + '-' + Math.floor((Math.random() * 1000000000) + 1),
        callback: function(response) {
            console.log("Paystack Direct Payment Success Response:", response);
            processPostPaymentDownloadUnlock(productId);
        },
        onClose: function() {
            showTopRightToast('Payment window closed by user.', "info");
        }
    };

    try {
        let handler = PaystackPop.setup(paymentConfig);
        handler.openIframe();
    } catch (error) {
        console.error("Paystack Execution Error:", error);
        // Fallback for local/testing execution context
        processPostPaymentDownloadUnlock(productId);
    }
}

/**
 * UNLOCK FILE & AUTOMATICALLY CREDIT DESIGNER WALLET
 */
function processPostPaymentDownloadUnlock(productId) {
    const project = SYSTEM_DATABASE.products.find(p => p.pid === productId);
    if (!project) return;

    const timestamp = new Date().toISOString();

    // Mark completed status flags
    project.isDownloadedUnlocked = true;
    project.downloadUnlockedTimestamp = Date.now();
    project.status = 'completed';
    project.isCompleted = true;

    const designerUid = project.bookedByUid;
    const requester = SYSTEM_DATABASE.users.find(u => u.uid === project.ownerUid) || {};
    const designerUser = SYSTEM_DATABASE.users.find(u => u.uid === designerUid);

    const creditAmount = 1000; // Amount paid upon asset download

    // 1. Credit Designer Wallet Balance in Database
    if (designerUser) {
        designerUser.walletBalance = Number(designerUser.walletBalance || 0) + creditAmount;
        // Record timestamp of most recent wallet credit
        designerUser.lastWalletCreditTimestamp = Date.now();
    }

    // 2. Log Approval Record
    if (typeof recordDesignerActivityLog === 'function') {
        recordDesignerActivityLog({
            designerUid: designerUid,
            productId: project.pid,
            productName: project.name,
            requesterUid: project.ownerUid,
            requesterName: requester.name || requester.username || "Customer",
            type: 'approved',
            actionText: 'Project approved & downloaded by customer',
            timestamp: timestamp
        });

        // 3. Log Wallet Credited Record
        recordDesignerActivityLog({
            designerUid: designerUid,
            productId: project.pid,
            productName: project.name,
            requesterUid: project.ownerUid,
            requesterName: requester.name || requester.username || "Customer",
            type: 'payment',
            actionText: 'Wallet Credited',
            amountText: '₦' + creditAmount.toLocaleString(),
            rawAmount: creditAmount,
            timestamp: timestamp
        });
    }

    // Unmark active booking status
    project.isBooked = false; 

    // Persist updated database state
    if (typeof syncPlatformDatabaseStateToWebStorage === 'function') {
        syncPlatformDatabaseStateToWebStorage();
    }
    
    if (typeof showTopRightToast === 'function') {
        showTopRightToast("Payment Successful! Generating clean design download...", "success");
    }

    // Refresh UI components across all views
    if (typeof renderMarketplaceProductsDisplayLoop === 'function') {
        renderMarketplaceProductsDisplayLoop();
    }
    if (typeof renderAccountInventoryLedgerManagementDashboardGrid === 'function') {
        renderAccountInventoryLedgerManagementDashboardGrid();
    }
    if (typeof renderDesignerProjectsWorkspaceDashboard === 'function') {
        renderDesignerProjectsWorkspaceDashboard();
    }
    if (typeof renderDesignerHistoryDashboard === 'function') {
        renderDesignerHistoryDashboard();
    }

    executeCleanAssetDownloadDirectly(productId);
}

function executeCleanAssetDownloadDirectly(productId) {
    const project = SYSTEM_DATABASE.products.find(p => p.pid === productId);
    if (!project || !project.submittedDesignDraft) return;

    // Render Clean Image onto HTML5 Canvas with Branding Strip
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = project.submittedDesignDraft;

    img.onload = function() {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const brandingHeight = 36;
        canvas.width = img.width;
        canvas.height = img.height + brandingHeight;

        // Draw unwatermarked clean image
        ctx.drawImage(img, 0, 0);

        // Render black branding footer strip
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, img.height, canvas.width, brandingHeight);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 14px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Design By Fort Graphics: graphics.fort-site.com.ng", canvas.width / 2, img.height + 22);

        // Trigger Instant Browser Download
        const cleanedDataUrl = canvas.toDataURL("image/png");
        const downloadAnchor = document.createElement("a");
        downloadAnchor.href = cleanedDataUrl;
        downloadAnchor.download = `${project.name.replace(/\s+/g, '_')}_Final_Design.png`;
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        document.body.removeChild(downloadAnchor);
    };
}

/**
 * PURGE FILE & ASSETS AFTER 24 HOURS EXPIRATION
 */
function executePurgeExpiredProjectFilesData(productId) {
    const projectIndex = SYSTEM_DATABASE.products.findIndex(p => p.pid === productId);
    if (projectIndex !== -1) {
        SYSTEM_DATABASE.products.splice(projectIndex, 1);
        syncPlatformDatabaseStateToWebStorage();
        showTopRightToast("Expired project files have been securely purged.", "info");
        renderAccountInventoryLedgerManagementDashboardGrid();
    }
}

function displayConfirmationModalOverlayAction(messageStringText, callbackFunctionReference) {
    const confirmModalNode = document.getElementById("confirm-modal");
    if (!confirmModalNode) return;

    document.getElementById("confirm-modal-text").innerHTML = `
        <p style="margin-bottom: 12px; font-weight: 500;">${messageStringText}</p>
        <div class="form-input-container" style="text-align: left; margin-top: 14px;">
            <label style="font-weight: 700; font-size: 0.85rem; color: var(--fort-blue-dark);">Confirm Security Password Phrase:</label>
            <input type="password" id="delete-verify-password" class="form-field-control" placeholder="Enter secret key to authenticate operation" style="margin-top: 6px; width: 100%; box-sizing: border-box; padding: 6px;">
            <div id="err-delete-reauth-msg" class="text-danger-alert" style="color: red; font-size: 0.8rem; margin-top: 6px; display: none;">Incorrect Authentication Key Pattern Entry</div>
        </div>
        <div style="margin-top: 6px; display: flex; align-items: center; gap: 6px;">
            <input type="checkbox" id="chk-delete-showpass" onchange="toggleFormPasswordFieldVisibility(this, 'delete-verify-password')">
            <label for="chk-delete-showpass" style="font-size: 0.8rem; font-weight: 400; cursor: pointer; user-select: none;">Show Password</label>            
        </div>
    `;

    confirmModalNode.classList.add("active");
    
    const yesButtonNode = document.getElementById("confirm-yes-btn");
    const noButtonNode = document.getElementById("confirm-no-btn");
    yesButtonNode.innerText = "Confirm Action";
    
    const cleanYesNode = yesButtonNode.cloneNode(true);
    const cleanNoNode = noButtonNode.cloneNode(true);
    yesButtonNode.parentNode.replaceChild(cleanYesNode, yesButtonNode);
    noButtonNode.parentNode.replaceChild(cleanNoNode, noButtonNode);
    
    cleanYesNode.addEventListener("click", () => {
        const enteredPassword = document.getElementById("delete-verify-password").value;
        const errNode = document.getElementById("err-delete-reauth-msg");
        
        if (enteredPassword !== APP_STATE.currentUser.secretKey) {
            errNode.style.display = "block";
            return;
        }
        
        errNode.style.display = "none";
        callbackFunctionReference();
        confirmModalNode.classList.remove("active");
    });

    cleanNoNode.addEventListener("click", () => {
        confirmModalNode.classList.remove("active");
    });
}

/** Ratings Interactive Node Matrix Parameters Assignment Management Loop Routines Controllers Elements */
let LOCAL_INTERACTIVE_SESSION_STAR_RATING_SELECTION_SCORE_INTEGER = 0;
function setInteractiveStarScoreRating(selectedScoreInteger) {
    LOCAL_INTERACTIVE_SESSION_STAR_RATING_SELECTION_SCORE_INTEGER = selectedScoreInteger;
    const standardStarsSpanElementsCollectionNodes = document.getElementById("star-input-interactive-row").children;
    
    for(let idx = 0; idx < 5; idx++) {
        if(idx < selectedScoreInteger) {
             standardStarsSpanElementsCollectionNodes[idx].style.color = "#ffb300"; // highlighted operational golden amber color rating node status
        } else {
             standardStarsSpanElementsCollectionNodes[idx].style.color = "var(--fort-gray-border)";
        }
    }
}

function submitPlatformFeedbackToAdminChannel() {
    const feedbackNoteTextVal = document.getElementById("txt-feedback-input-box").value.trim();
    if(feedbackNoteTextVal === "" || LOCAL_INTERACTIVE_SESSION_STAR_RATING_SELECTION_SCORE_INTEGER === 0) {
        alert("Platform structural execution exception report error warning notice tracker: Input structural forms components fields values matrix columns maps arrays entries metrics checks mandates score ratings parameters assignment and non-blank narrative feedback logs entries values before pipeline validation processing runs loops controls.");
        return;
    }
    
    const operationalFeedbackReportFormPackagePayloadNode = {
        fid: "feedback_" + Date.now(),
        userUid: APP_STATE.currentUser ? APP_STATE.currentUser.uid : "anonymous_session_user_node",
        score: LOCAL_INTERACTIVE_SESSION_STAR_RATING_SELECTION_SCORE_INTEGER,
        note: feedbackNoteTextVal,
        timestamp: new Date().toISOString()
    };
    
    SYSTEM_DATABASE.platformFeedback.push(operationalFeedbackReportFormPackagePayloadNode);
    syncPlatformDatabaseStateToWebStorage();
    
    document.getElementById("txt-feedback-input-box").value = "";
    setInteractiveStarScoreRating(0);
    
    alert("System Administration Platform Channel Message Broadcast Response Gateway: Form framework telemetry package parsing evaluated, tracked, processed, compiled, and dispatched safely into admin monitoring arrays channels queues data blocks layers pipeline parameters models metrics values logs records indices.");
}

function openAdminAddSuiteSiteModal() {
    const modalTargetNode = document.getElementById("auth-modal-content");
    modalTargetNode.innerHTML = `
        <h3>[Privileged Admin Link Integration Switch Command Node Framework]</h3>
        <div class="form-input-container margin-top-sm">
            <label>Network Suite Platform Platform Entity Label Label Display Name:</label>
            <input type="text" id="adm-suite-name" class="form-field-control" placeholder="Enter entity system label name string text properties value">
        </div>
        <div class="form-input-container">
            <label>Network Suite Profile Core Operational Context Purpose Summary Note Narrative Block Properties Column:</label>
            <input type="text" id="adm-suite-info" class="form-field-control" placeholder="Brief descriptive metadata tracking framework alignment syntax values properties parameters">
        </div>
        <div class="form-input-container">
            <label>Uniform Resource Locator System Endpoint Routing Target Channel URL Link Address Syntax String Path Structure Context:</label>
            <input type="text" id="adm-suite-url" class="form-field-control" placeholder="https://example-suite-node.fort.net">
        </div>
        <div class="btn-group">
            <button onclick="closeActiveModalDirectly('auth-modal')" class="btn-gray">Discard Link Record</button>
            <button onclick="executeAdminPipelineSaveNewSuiteEntityLinkNodeRecordRowItem()" class="btn-blue">Publish Network Node Entity Link</button>
        </div>
    `;
    document.getElementById("auth-modal").classList.add("active");
}

function executeAdminPipelineSaveNewSuiteEntityLinkNodeRecordRowItem() {
    const name = document.getElementById("adm-suite-name").value.trim();
    const info = document.getElementById("adm-suite-info").value.trim();
    const url = document.getElementById("adm-suite-url").value.trim();
    
    if(name === "" || info === "" || url === "") {
        alert("Admin Exception Intercept Report Notification Error Trace Summary Log Warning Pointer Alert Struct: Missing tracking properties baseline parameters metrics columns items records matrix fields checks indices data values mapping configuration models rules parameters keys pointers elements.");
        return;
    }
    
    SYSTEM_DATABASE.networkSuiteEntities.push({ siteId: "s_" + Date.now(), logo: "", name: name, info: info, url: url });
    syncPlatformDatabaseStateToWebStorage();
    closeActiveModalDirectly('auth-modal');
    populateNetworkSuiteExtensionsDisplayView();
    alert("Admin Framework Master Ledger Synchronization Engine: Added entity block safely.");
}

/**
 * Privileged Platform System Monitoring Operations Analytics Calculation Metrics Control Module Subsystem
 */
function recalculateSystemAnalyticalMetricsSummary(selectedTimeframeContextStringValueWindowValueStringKey) {
    // Generate pseudo randomized tracking metrics numbers logs values profiles arrays shifts constrained safely checking filters
    const hoursLabelNode = document.getElementById("lbl-metric-hours");
    const topProdLabelNode = document.getElementById("lbl-metric-top-product");
    const topUserLabelNode = document.getElementById("lbl-metric-top-user");
    
    if(selectedTimeframeContextStringValueWindowValueStringKey === 'Today') {
        hoursLabelNode.innerText = "42 Hrs Active Session Execution Telemetry Logs";
        topProdLabelNode.innerText = "Smart OLED Television Set 4K Set Frame Array [ID: #p2]";
        topUserLabelNode.innerText = "Anonymous Client Broker Session Node Line Trace Vector Pointer #742";
    } else if(selectedTimeframeContextStringValueWindowValueStringKey === 'Yesterday') {
        hoursLabelNode.innerText = "94 Hrs Aggregated Cluster Session Close Log Execution Telemetry Logs";
        topProdLabelNode.innerText = "Premium Wireless Noise-Cancelling Headphones [ID: #p1]";
        topUserLabelNode.innerText = "Sarah Enterprise Hub (ID: #user_sarah)";
    } else {
        hoursLabelNode.innerText = "1,482 Hrs Total Active Running Service Infrastructure Analytics Logs Telemetry Parameters Matrix Units Metrics Data Profiles Elements Lines";
        topProdLabelNode.innerText = "Premium Wireless Noise-Cancelling Headphones System Inventory Component Log Baseline Registry Asset [ID: #p1]";
        topUserLabelNode.innerText = "Sarah Enterprise Hub Tracking Infrastructure Identity Master Accounting Ledger Profile Mapping Key Node Target Token Value Row #user_sarah Register Metrics Analysis";
    }
}

function executeFilteringSettingsContentPaneRowsNodesDisplay(searchQueryStringTextStringSyntaxPhrase) {
     const structuralSettingsPanelsElementsCollectionRowsArray = document.querySelectorAll(".settings-sub-panel div");
     structuralSettingsPanelsElementsCollectionRowsArray.forEach(nodeBlock => {
          if(nodeBlock.innerText.toLowerCase().includes(searchQueryStringTextStringSyntaxPhrase)) {
               nodeBlock.style.opacity = "1";
          } else {
               nodeBlock.style.opacity = "0.4"; // soft dimmer scaling to assist navigation discovery mapping indicators traces bounds
          }
     });
}

/**
 * NEW: Displays the password secure logout prompt layout
 */
function openLogoutConfirmationModal() {
    const passInput = document.getElementById("logout-auth-password");
    const errNode = document.getElementById("err-logout-password");
    
    if (passInput) passInput.value = "";
    if (errNode) errNode.classList.add("hidden-node");
    
    const logoutModal = document.getElementById("logout-confirm-modal");
    if (logoutModal) logoutModal.classList.add("active");
}

/**
 * NEW: Verifies secret key credentials before clearing security cookie tokens 
 */
function executeSecureAccountLogout() {
    const errNode = document.getElementById("err-logout-password");
    const passwordInput = document.getElementById("logout-auth-password").value;
    
    errNode.classList.add("hidden-node");

    if (typeof APP_STATE === 'undefined' || !APP_STATE.currentUser) {
        // Fallback if system app state configuration drops cleanly out of loop bounds
        performGlobalSessionPurge();
        return;
    }

    // Authenticate the current context user against the stored database match record
    if (APP_STATE.currentUser.secretKey !== passwordInput) {
        errNode.innerText = "Incorrect password. Logout verification failed.";
        errNode.classList.remove("hidden-node");
        return;
    }

    // Verification successful, execute state clear
    performGlobalSessionPurge();
    changeNavBarValues();
    changelogoutosignupviceVersafunctionTwo();
    navigateToPage('fort-templates-section');
    triggerAuthenticationModalSequence();
}

/**
 * NEW: Secondary clean workflow execution to clear cookies, DOM classes, and structural roots
 */
function performGlobalSessionPurge() {
    // Clear both the active device cookie trace and local storage fallback keys cleanly
    eraseSecureAuthCookie("fort_graphics_logged_uid");
    localStorage.removeItem("fort_graphics_cookie_fallback_uid");

    // Force application view panels directly back to the home page display layout
    document.querySelectorAll(".view-page").forEach(page => {
        page.classList.add("hidden-view");
        page.classList.remove("active-view");
    });
    
    const homePageElement = document.getElementById("page-home");
    if (homePageElement) {
        homePageElement.classList.add("active-view");
        homePageElement.classList.remove("hidden-view");
        if (typeof APP_STATE !== 'undefined') {
            APP_STATE.activeViewPage = 'home';
        }
    }

    if (typeof APP_STATE !== 'undefined') {
        APP_STATE.currentUser = null;
    }

    closeActiveModalDirectly('logout-confirm-modal');

    const adminNavItem = document.getElementById("admin-nav-item");
    const adminSuiteBtn = document.getElementById("admin-add-suite-site-btn");
    const navItemMessgaes = document.getElementById('nav-item-messages')
    if (adminNavItem) adminNavItem.classList.add("hidden-admin-node");
    if (adminSuiteBtn) adminSuiteBtn.classList.add("hidden-node");
    if (navItemMessgaes) navItemMessgaes.classList.add("hidden-admin-node")

    const navUserAvatar = document.getElementById("nav-user-avatar");
    if (navUserAvatar) {
        navUserAvatar.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>";
    }

    if (typeof navigateToPage === 'function') {
        navigateToPage('fort-templates-section');
    }
    
    syncDrawerGuestTerminalNodeToActiveUserfunctiontwo();
}


/**
 * Updates the user drawer terminal node values based on the active authenticated session state data
 */
function syncDrawerGuestTerminalNodeToActiveUser() {
    // Ensure there is an active logged-in user available
    if (!APP_STATE || !APP_STATE.currentUser) {
        return;
    }

    const currentAccount = APP_STATE.currentUser;
    
    // 1. Resolve DOM node elements references matching target layout criteria
    const drawerAvatarNode = document.getElementById("drawer-user-avatar-frame-node");
    
    // 2. Locate h4 label component and span label component relative to parent layout container card
    const headerCardPane = document.querySelector(".drawer-header-pane-card");
    
    if (headerCardPane) {
        const nameHeadingNode = headerCardPane.querySelector("h4");
        const statusSpanNode = headerCardPane.querySelector("span");
        
        // Update user identity display text label strings context definitions
        if (nameHeadingNode) {
            nameHeadingNode.innerText = currentAccount.identityName; // Changes "Guest Terminal Node" to actual name
        }
        
        if (statusSpanNode) {
            statusSpanNode.innerText = "Logged In Active"; // Changes status
            // Optional: add active system theme layout modification class styles here
            statusSpanNode.style.color = "#48bb78"; // Light green indicating active online node state tracking
        }
    }

    // 3. Update profile avatar display image resource mapping strings fallback paths
    if (drawerAvatarNode) {
        drawerAvatarNode.src = currentAccount.avatar || 
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>";
    }
}

function changelogoutosignupviceVersa() {
    // 2. Locate h4 label component and span label component relative to parent layout container card
    const statusSpanNodetwo = document.getElementById("changeable-logout-btn");
    
    if (statusSpanNodetwo) {
        statusSpanNodetwo.innerText = "Logout"; // Changes status
        statusSpanNodetwo.className = "btn-danger"; // Red indicating Logout
    }   
}

function doubleButtonFunction() {
    if(!APP_STATE.currentUser) {
        triggerAuthenticationModalSequence();
        return;
    }
    
    openLogoutConfirmationModal();
}

function changelogoutosignupviceVersafunctionTwo() {
    // 2. Locate h4 label component and span label component relative to parent layout container card
    const statusSpanNodetwo = document.getElementById("changeable-logout-btn");
    
    if (statusSpanNodetwo) {
        statusSpanNodetwo.innerText = "Sign in"; // Changes status
        statusSpanNodetwo.className = "btn-blue"; // Blue indicating sign in
    }   
}

function syncDrawerGuestTerminalNodeToActiveUserfunctiontwo() {
    
    // 1. Resolve DOM node elements references matching target layout criteria
    const drawerAvatarNode = document.getElementById("drawer-user-avatar-frame-node");
    
    // 2. Locate h4 label component and span label component relative to parent layout container card
    const headerCardPane = document.querySelector(".drawer-header-pane-card");
    
    if (headerCardPane) {
        const nameHeadingNode = headerCardPane.querySelector("h4");
        const statusSpanNode = headerCardPane.querySelector("span");
        
        // Update user identity display text label strings context definitions
        if (nameHeadingNode) {
            nameHeadingNode.innerText = "Guest Terminal Node"; // Changes "Guest Terminal Node" to actual name
        }
        
        if (statusSpanNode) {
            statusSpanNode.innerText = "Logged Out (Guest)"; // Changes status
            // Optional: add active system theme layout modification class styles here
            statusSpanNode.className = "profile-mode-tag-label personal" // Light green indicating active online node state tracking
            statusSpanNode.style.color = "#4a5568"
        }
    }

    // 3. Update profile avatar display image resource mapping strings fallback paths
    if (drawerAvatarNode) {
        drawerAvatarNode.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>";
    }
}

function executeSystemicSubscriptionExpirationLifecycleCheck() {
    // Safety Guard: Force arrays to exist natively if WebStorage didn't have them yet
    if (!SYSTEM_DATABASE.pinnedLeaderboard) {
        SYSTEM_DATABASE.pinnedLeaderboard = Array(20).fill(null);
    }
    if (!SYSTEM_DATABASE.slotMetadata) {
        SYSTEM_DATABASE.slotMetadata = Array(20).fill(null).map(() => ({
            expirationTime: null,
            autoRenew: true,
            previousOwnerUid: null
        }));
    }

    const now = Date.now();
    const leaderboard = SYSTEM_DATABASE.pinnedLeaderboard;
    const metadata = SYSTEM_DATABASE.slotMetadata;
    const oneMonthDurationMs = 30 * 24 * 60 * 60 * 1000;

    for (let idx = 0; idx < 20; idx++) {
        const slotMeta = metadata[idx];
        if (!slotMeta || !slotMeta.expirationTime) continue;

        if (now > slotMeta.expirationTime) {
            const ownerUid = slotMeta.previousOwnerUid;

            if (slotMeta.autoRenew) {
                slotMeta.expirationTime = now + oneMonthDurationMs;
                sendFortMartAdminSystemNotification(
                    ownerUid, 
                    `Auto-Renew Successful! Your subscription for Leaderboard Slot Position #${idx + 1} has been automatically extended for 1 month.`
                );
            } else {
                const gracePeriodEnd = slotMeta.expirationTime + (24 * 60 * 60 * 1000);

                if (leaderboard[idx] !== null) {
                    leaderboard[idx] = null; 
                    sendFortMartAdminSystemNotification(
                        ownerUid, 
                        `Your slot ownership period has expired! Please renew within 24 hours or the slot will become available for other users to purchase.`
                    );
                }

                if (now > gracePeriodEnd) {
                    slotMeta.previousOwnerUid = null;
                    slotMeta.expirationTime = null;
                    sendFortMartAdminSystemNotification(ownerUid, `Your 24-hour grace renewal period has lapsed. Slot Position #${idx + 1} is now public.`);
                }
            }
        }
    }
}

/**
 * Step 1: Launches password confirmation field layout tracking validation checks
 */
function launchEditProductInventoryModalFormLayoutShell(targetProductIdKeyValueString) {
    const targetProduct = SYSTEM_DATABASE.products.find(p => p.pid === targetProductIdKeyValueString);
    if (!targetProduct) {
        showTopRightToast("Product record could not be found.", "error");
        return;
    }

    const modalContentTargetNode = document.getElementById("auth-modal-content");
    modalContentTargetNode.innerHTML = `
        <h3>Enter Current Password (Step 1 of 2)</h3>

        <div class="form-input-container margin-top-sm">
            <label>Active Password:</label>
            <input type="password" id="edit-verify-password" class="form-field-control" placeholder="Enter password to verify ownership context">
            
            <div id="err-edit-reauth-msg" class="text-danger-alert hidden-node">Incorrect Password</div>
        </div>

        <div style="margin-top: 6px; display: flex; align-items: center; gap: 6px;">
            <input type="checkbox" id="chk-edit-showpass" onchange="toggleFormPasswordFieldVisibility(this, 'edit-verify-password')">
            <label for="chk-edit-showpass" style="font-size: 0.8rem; font-weight: 400; cursor: pointer; user-select: none;">Show Password</label>            
        </div>

        <div class="text-center margin-top-xs">
            <span style="color:var(--fort-blue-light); cursor:pointer; font-size:0.9rem;" onclick="renderForgotPasswordModalWorkflow()">Forgot Password?</span>
        </div>
        <br>
        
        <div class="btn-group">
            <button onclick="closeActiveModalDirectly('auth-modal')" class="btn-gray">Cancel</button> 
            <button onclick="verifyEditPasswordAndProceedNonFirebase('${targetProductIdKeyValueString}')" class="btn-blue">Verify Password Phrase</button>
        </div>
    `;
    document.getElementById("auth-modal").classList.add("active");
}

/**
 * Validates the password inline and proceeds to Step 2 form view
 */
function verifyEditPasswordAndProceedNonFirebase(targetProductIdKeyValueString) {
    const enteredPassword = document.getElementById("edit-verify-password").value;
    const errNode = document.getElementById("err-edit-reauth-msg");
    
    errNode.classList.add("hidden-node");
    
    if (enteredPassword !== APP_STATE.currentUser.secretKey) {
        errNode.innerText = "Incorrect Password"; 
        errNode.classList.remove("hidden-node"); 
        return;
    }
    
    // Proceed to Step 2 Form Presentation
    renderActualEditProductFormNonFirebase(targetProductIdKeyValueString);
}

/**
 * Step 2: Displays information inputs for the specified asset post
 */
function renderActualEditProductFormNonFirebase(targetProductIdKeyValueString) {
    const targetProduct = SYSTEM_DATABASE.products.find(p => p.pid === targetProductIdKeyValueString);
    if (!targetProduct) return;

    const modalContentTargetNode = document.getElementById("auth-modal-content");
    modalContentTargetNode.innerHTML = `
        <h3>Edit Product Details (Step 2 of 2)</h3>
        <p style="font-size:0.8rem; color:var(--fort-gray-slate); margin-top:2px;">Updating information for your listed commercial asset.</p>
        
        <div class="form-input-container margin-top-sm">
            <label>Product Name</label>
            <input type="text" id="editprod-name" class="form-field-control" placeholder="Enter concise commercial inventory title text" value="${targetProduct.name}">
        </div>
        
        <div class="form-input-container">
            <label>Select Logistics Catalog Classification Category:</label>
            <select id="editprod-cat" class="form-field-control">
                <option value="Electrical Appliances" ${targetProduct.category === 'Electrical Appliances' ? 'selected' : ''}>Electrical Appliances</option>
                <option value="Mobile Devices & Computers" ${targetProduct.category === 'Mobile Devices & Computers' ? 'selected' : ''}>Mobile Devices & Computers</option>
                <option value="Home Furniture" ${targetProduct.category === 'Home Furniture' ? 'selected' : ''}>Home Furniture</option>
                <option value="Fashion Clothing Apparel" ${targetProduct.category === 'Fashion Clothing Apparel' ? 'selected' : ''}>Fashion Clothing Apparel</option>
                <option value="Beauty & Personal Care" ${targetProduct.category === 'Beauty & Personal Care' ? 'selected' : ''}>Beauty & Personal Care</option>
                <option value="Sports, Fitness and Outdoors" ${targetProduct.category === 'Sports, Fitness and Outdoors' ? 'selected' : ''}>Sports, Fitness and Outdoors</option>
                <option value="Groceries & Essentials" ${targetProduct.category === 'Groceries & Essentials' ? 'selected' : ''}>Groceries & Essentials</option>
                <option value="Others" ${targetProduct.category === 'Others' ? 'selected' : ''}>Others</option>
            </select>
        </div>
        
        <div class="form-input-container">
            <label>Primary Short Public Marketing Overview Description (Max 100 Chars):</label>
            <input type="text" id="editprod-info" class="form-field-control" maxlength="100" placeholder="Max 100 text characters" value="${targetProduct.info}">
        </div>
        
        <div class="form-input-container-image">
            <label>Update Product Image</label>
            <div class="preview-box" style="min-height: 100px; display: flex; align-items: center; justify-content: center; border: 1px dashed #ccc; margin-bottom: 10px;">
                <span id="placeholderTextimg" style="display: none;">No image selected</span>
                <img id="imagePreview" src="${targetProduct.coverPhoto}" alt="Image Preview" style="max-width: 100%; max-height: 200px; display: block;">
            </div>
            <input type="file" id="imageInput" accept="image/*">
        </div>
        <br>
        
        <div class="form-input-container">
            <label>More Info and Specifications</label>
            <textarea id="editprod-aiinfo" class="form-field-control rounded-rect" style="height:60px;" placeholder="A more detailed explanation of product.">${targetProduct.aiInfo}</textarea>
        </div>
        
        <div class="form-input-container">
            <label>Unit Commercial Pricing Valuation Baseline Quote Amount Number (${APP_STATE.currentUser.country === 'Nigeria' ? '₦' : '$'}):</label>
            <input type="number" id="editprod-price" class="form-field-control" placeholder="Enter numeric base rate" value="${targetProduct.price}">
        </div>
        
        <div class="btn-group margin-top-md">
            <button onclick="closeActiveModalDirectly('auth-modal')" class="btn-gray">Cancel Changes</button>
            <button onclick="executePipelineCommitUpdatedInventoryPostRecord('${targetProduct.pid}')" class="btn-blue">Save Changes</button>
        </div>
    `;
    setupImagePreviewListener();
}

function executePipelineCommitUpdatedInventoryPostRecord(targetProductIdKeyValueString) {
    const name = document.getElementById("editprod-name").value.trim();
    const cat = document.getElementById("editprod-cat").value;
    const info = document.getElementById("editprod-info").value.trim();
    const imagePreview = document.getElementById("imagePreview");
    const aiInfo = document.getElementById("editprod-aiinfo").value.trim();
    const priceRaw = document.getElementById("editprod-price").value;
    
    if(name === "" || info === "" || priceRaw === "" || !imagePreview.src || imagePreview.src === "") {
        showTopRightToast("All compulsory info must be imputed.", "info");
        return;
    }
    
    const productStructuralIndexMatchId = SYSTEM_DATABASE.products.findIndex(p => p.pid === targetProductIdKeyValueString);
    if(productStructuralIndexMatchId !== -1) {
        SYSTEM_DATABASE.products[productStructuralIndexMatchId].name = name;
        SYSTEM_DATABASE.products[productStructuralIndexMatchId].category = cat;
        SYSTEM_DATABASE.products[productStructuralIndexMatchId].info = info;
        SYSTEM_DATABASE.products[productStructuralIndexMatchId].price = parseFloat(priceRaw);
        SYSTEM_DATABASE.products[productStructuralIndexMatchId].coverPhoto = imagePreview.src;
        SYSTEM_DATABASE.products[productStructuralIndexMatchId].aiInfo = aiInfo || "Standard platform baseline listed trading stock profile object reference specifications tracking structure model elements values data parameters.";
        
        syncPlatformDatabaseStateToWebStorage();
        
        closeActiveModalDirectly('auth-modal');
        showTopRightToast("Product Details Updated Successfully", "success");
        
        renderAccountInventoryLedgerManagementDashboardGrid();
        renderMarketplaceProductsDisplayLoop();
    } else {
        showTopRightToast("Error mapping product tracking instance registry.", "error");
    }
}

/**
 * Purges a product listing completely using ONLY local SYSTEM_DATABASE memory.
 * Requires user password confirmation directly inside the overlay modal prompt.
 */
function executeDeletePlatformInventoryItemListingPostRecord(targetProductIdKeyValueString) {
    const confirmationPromptMessage = "Are you sure you want to delete this product?";
    
    displayConfirmationModalOverlayAction(confirmationPromptMessage, () => {
        // Splice and remove from local application memory arrays safely
        const structuralIndexMatchPointerId = SYSTEM_DATABASE.products.findIndex(p => p.pid === targetProductIdKeyValueString);
        
        if (structuralIndexMatchPointerId !== -1) {
            SYSTEM_DATABASE.products.splice(structuralIndexMatchPointerId, 1);
            
            // Sync mutated array down to local persistent web storage
            syncPlatformDatabaseStateToWebStorage();

            // REPLACED ALERT: Custom animated success toast
            showTopRightToast("Product successfully purged from system inventory storage registers.", "success");
            
            
            // Trigger user interface lifecycle rendering view loops to instantly refresh screens
            if (typeof renderAccountInventoryLedgerManagementDashboardGrid === "function") {
                renderAccountInventoryLedgerManagementDashboardGrid();
            }
            if (typeof renderMarketplaceProductsDisplayLoop === "function") {
                renderMarketplaceProductsDisplayLoop();
            }
        } else {
            // REPLACED ALERT: Custom animated error toast
            showTopRightToast("Error: Target product identifier mapping reference could not be found.", "error");
        }
    });
}

/**
 * Displays a custom animated toast notification from top-right.
 * @param {string} message - Text content of the alert.
 * @param {'success'|'error'|'info'} type - Theme flavor (default: 'success').
 * @param {number} durationMs - Display duration before sliding out (default: 3500ms).
 */
function showTopRightToast(message, type = 'success', durationMs = 3500) {
    // 1. Ensure the global container exists on the DOM
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    // 2. Create the toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    
    // Add text message + manual close button
    toast.innerHTML = `
        <span>${message}</span>
        <button class="toast-close-btn" aria-label="Close notification">&times;</button>
    `;

    container.appendChild(toast);

    // 3. Trigger entry animation in next animation frame
    requestAnimationFrame(() => {
        toast.classList.add('toast-show');
    });

    // Helper for graceful exit removal
    const dismissToast = () => {
        toast.classList.remove('toast-show');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        }, { once: true });
    };

    // Manual close trigger on button click
    toast.querySelector('.toast-close-btn').addEventListener('click', dismissToast);

    // Auto dismiss timer
    if (durationMs > 0) {
        setTimeout(dismissToast, durationMs);
    }
}

// Global state object for managing account upgrades
let BUSINESS_UPGRADE_WIZARD = {
    otpCode: null,
    cooldownInterval: null,
    cooldownSeconds: 0
};

/**
 * Step 1: Initiate Account Upgrade Workflow - Password Verification Modal
 */
function initiateBusinessAccountUpgradeSequence() {
    if (!APP_STATE.currentUser) {
        showTopRightToast("Please log in to upgrade your account.", "info");
        return;
    }

    const currentAccountType = APP_STATE.currentUser.accountType || APP_STATE.currentUser.type || 'personal';
    if (currentAccountType === 'business') {
        showTopRightToast("Your account is already registered as a Business Account.", "info");
        return;
    }

    // Reuse existing confirm modal or build password verification modal inline
    let pwdModal = document.getElementById("upgrade-password-modal");
    if (pwdModal) pwdModal.remove();

    pwdModal = document.createElement("div");
    pwdModal.id = "upgrade-password-modal";
    pwdModal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;";

    pwdModal.innerHTML = `
        <div style="background: white; border-radius: 8px; max-width: 400px; width: 90%; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
            <h3 style="margin-top:0; color:var(--fort-blue-dark, #0d233a);">Confirm Password</h3>
            <p style="font-size:0.88rem; color:#555; margin-bottom:16px;">Verify your account credentials before upgrading your account to a Business Account (₦2,500 fee):</p>
            
            <div style="margin-bottom:16px;">
                <label style="display:block; font-size:0.8rem; margin-bottom:4px; font-weight:600;">Account Password</label>
                <input type="password" id="upgrade-pwd-input" class="form-field-control" placeholder="Enter your password" style="width:100%; padding:8px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;">
                <div id="upgrade-pwd-error" style="color:red; font-size:0.8rem; margin-top:4px; display:none;"></div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:8px;">
                <button class="btn-gray" style="padding:8px 16px; border:none; border-radius:4px; cursor:pointer;" onclick="document.getElementById('upgrade-password-modal').remove()">Cancel</button>
                <button class="btn-blue" style="background:#09a5db; color:white; border:none; padding:8px 16px; border-radius:4px; font-weight:600; cursor:pointer;" onclick="validateUpgradePasswordAndProceed()">Verify Password</button>
            </div>
        </div>
    `;

    document.body.appendChild(pwdModal);
}

/**
 * Validates password input against APP_STATE user records.
 */
function validateUpgradePasswordAndProceed() {
    const pwdInput = document.getElementById("upgrade-pwd-input");
    const errFeedback = document.getElementById("upgrade-pwd-error");
    const enteredPassword = pwdInput ? pwdInput.value.trim() : "";

    const actualSecret = APP_STATE.currentUser.secretKey || APP_STATE.currentUser.password || "";

    if (!enteredPassword || enteredPassword !== actualSecret) {
        if (errFeedback) {
            errFeedback.innerText = "Invalid password. Please check your password and try again.";
            errFeedback.style.display = "block";
        }
        return;
    }

    // Close password modal
    document.getElementById("upgrade-password-modal").remove();

    // Trigger Step 2: Send OTP and launch OTP Modal
    sendBusinessUpgradeEmailOtpWorkflow(true);
}

/**
 * Step 2: OTP Generation & EmailJS Sending Logic (Fixed)
 */
async function sendBusinessUpgradeEmailOtpWorkflow(isInitialLaunch = false) {
    const userObj = (typeof APP_STATE !== 'undefined' && APP_STATE.currentUser) ? APP_STATE.currentUser : {};
    
    // Fallback email retrieval
    const targetEmail = userObj.identifierText || userObj.email || "";
    
    if (!targetEmail || !targetEmail.includes("@")) {
        const feedbackElement = document.getElementById("err-upgrade-otp-feedback");
        if (feedbackElement) {
            feedbackElement.innerText = "No valid email associated with this account.";
            feedbackElement.style.color = "red";
            feedbackElement.style.display = "block";
        } else {
            alert("No valid email address found for this account.");
        }
        return;
    }

    const todayKeyStr = "otp_limit_" + new Date().toISOString().split('T')[0] + "_" + targetEmail.toLowerCase();
    
    let dailyAttemptsCount = parseInt(localStorage.getItem(todayKeyStr) || "0", 10);
    if (dailyAttemptsCount >= 5) {
        if (!isInitialLaunch) {
            const feedbackElement = document.getElementById("err-upgrade-otp-feedback");
            if (feedbackElement) {
                feedbackElement.innerText = "Maximum daily limit reached (5 OTPs per day).";
                feedbackElement.style.color = "red";
                feedbackElement.style.display = "block";
            }
        } else {
            renderBusinessUpgradeOtpModal();
            setTimeout(() => {
                const feedbackElement = document.getElementById("err-upgrade-otp-feedback");
                if (feedbackElement) {
                    feedbackElement.innerText = "Maximum daily limit reached (5 OTPs per day).";
                    feedbackElement.style.color = "red";
                    feedbackElement.style.display = "block";
                }
            }, 50);
        }
        return;
    }

    // Generate 4-digit code
    const freshOtpCode = Math.floor(1000 + Math.random() * 9000);
    BUSINESS_UPGRADE_WIZARD.otpCode = freshOtpCode;

    if (!isInitialLaunch) {
        const feedbackElement = document.getElementById("err-upgrade-otp-feedback");
        if (feedbackElement) {
            feedbackElement.innerText = "Sending fresh code...";
            feedbackElement.style.color = "blue";
            feedbackElement.style.display = "block";
        }
    } else {
        renderBusinessUpgradeOtpModal();
    }

    // Check if EmailJS SDK is attached to window
    if (!window.emailjs) {
        console.error("EmailJS SDK not loaded on window.");
        const feedbackElement = document.getElementById("err-upgrade-otp-feedback");
        if (feedbackElement) {
            feedbackElement.innerText = "Email service unavailable. Please refresh and try again.";
            feedbackElement.style.color = "red";
            feedbackElement.style.display = "block";
        }
        return;
    }

    try {
        // Start resend cooldown only when send is attempted
        initiateUpgradeOtpResendCooldown();

        const templateParams = {
            to_email: targetEmail,
            email: targetEmail, // Fallback alias
            user_name: userObj.identityName || userObj.username || "Valued Customer",
            to_name: userObj.identityName || userObj.username || "Valued Customer", // Fallback alias
            otp_code: freshOtpCode,
            code: freshOtpCode // Fallback alias
        };

        // Send via EmailJS
        const response = await window.emailjs.send(
            "service_ejag5pe", 
            "template_nzub7tk", 
            templateParams
        );

        console.log("EmailJS Success:", response.status, response.text);

        // Increment attempts count only after successful API call
        dailyAttemptsCount++;
        localStorage.setItem(todayKeyStr, dailyAttemptsCount.toString());

        const feedbackElement = document.getElementById("err-upgrade-otp-feedback");
        if (feedbackElement) {
            feedbackElement.innerText = `Verification code sent to ${targetEmail}`;
            feedbackElement.style.color = "green";
            feedbackElement.style.display = "block";
        }
    } catch (sendErr) {
        console.error("EmailJS dispatch failed:", sendErr);
        const feedbackElement = document.getElementById("err-upgrade-otp-feedback");
        if (feedbackElement) {
            feedbackElement.innerText = "Failed to send code. Verify connection or email setup.";
            feedbackElement.style.color = "red";
            feedbackElement.style.display = "block";
        }
    }
}

/**
 * Handles 30-second resend timer cooldown for Upgrade OTP
 */
function initiateUpgradeOtpResendCooldown() {
    if (BUSINESS_UPGRADE_WIZARD.cooldownInterval) {
        clearInterval(BUSINESS_UPGRADE_WIZARD.cooldownInterval);
    }

    BUSINESS_UPGRADE_WIZARD.cooldownSeconds = 30;

    BUSINESS_UPGRADE_WIZARD.cooldownInterval = setInterval(() => {
        BUSINESS_UPGRADE_WIZARD.cooldownSeconds--;
        
        const resendLinkNode = document.getElementById("upgrade-otp-resend-link");
        if (resendLinkNode) {
            if (BUSINESS_UPGRADE_WIZARD.cooldownSeconds > 0) {
                resendLinkNode.innerText = `Resend in ${BUSINESS_UPGRADE_WIZARD.cooldownSeconds}s`;
                resendLinkNode.style.opacity = "0.5";
                resendLinkNode.style.fontWeight = "400";
                resendLinkNode.style.pointerEvents = "none";
            } else {
                resendLinkNode.innerText = "Resend";
                resendLinkNode.style.opacity = "1";
                resendLinkNode.style.fontWeight = "600";
                resendLinkNode.style.pointerEvents = "auto";
                clearInterval(BUSINESS_UPGRADE_WIZARD.cooldownInterval);
                BUSINESS_UPGRADE_WIZARD.cooldownInterval = null;
            }
        } else if (BUSINESS_UPGRADE_WIZARD.cooldownSeconds <= 0) {
            clearInterval(BUSINESS_UPGRADE_WIZARD.cooldownInterval);
            BUSINESS_UPGRADE_WIZARD.cooldownInterval = null;
        }
    }, 1000);
}

/**
 * Renders Step 2 Modal UI for OTP Input
 */
function renderBusinessUpgradeOtpModal() {
    let otpModal = document.getElementById("upgrade-otp-modal");
    if (otpModal) otpModal.remove();

    const maskedTargetEmail = APP_STATE.currentUser.identifierText || "user@fortmart.com";
    const secondsLeft = BUSINESS_UPGRADE_WIZARD.cooldownSeconds || 0;
    const textLabel = secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "Resend";
    const opacityStyle = secondsLeft > 0 ? "0.5" : "1";
    const weightStyle = secondsLeft > 0 ? "400" : "600";
    const pointerEventsStyle = secondsLeft > 0 ? "none" : "auto";

    otpModal = document.createElement("div");
    otpModal.id = "upgrade-otp-modal";
    otpModal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;";

    otpModal.innerHTML = `
        <div style="background: white; border-radius: 8px; max-width: 420px; width: 90%; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
            <h3 style="margin-top:0; color:var(--fort-blue-dark, #0d233a);">Verify Email Identity</h3>
            <p style="font-size:0.92rem; color:var(--fort-blue-dark); line-height: 1.5; margin-top:12px; font-weight: 500;">
                Enter the OTP sent to <strong>${maskedTargetEmail}</strong>
            </p>
            
            <div style="margin-top:15px;">
                <label style="display:block; font-size:0.8rem; margin-bottom:4px; font-weight:600;">Input 4-Digit OTP Code:</label>
                <input type="text" id="upgrade-otp-input" class="form-field-control" placeholder="X X X X" maxlength="4" style="text-align:center; font-size:1.25rem; letter-spacing:8px; width:100%; padding:8px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;">
                <div id="err-upgrade-otp-feedback" style="color: red; font-size: 0.8rem; margin-top: 4px; display:none;"></div>
            </div>

            <div style="margin-top: 10px; font-size: 0.85rem;">
                <span>Didn't receive message? </span>
                <a href="javascript:void(0)" 
                   id="upgrade-otp-resend-link"
                   onclick="if(BUSINESS_UPGRADE_WIZARD.cooldownSeconds <= 0) sendBusinessUpgradeEmailOtpWorkflow(false);" 
                   style="color: #007bff; font-weight: ${weightStyle}; opacity: ${opacityStyle}; pointer-events: ${pointerEventsStyle}; text-decoration: none;">${textLabel}</a>
            </div>

            <p style="font-size:0.85rem; color:#666; line-height: 1.4; margin-top:12px;">
                Note: Check your spam folder if the code isn't in your primary inbox and tagged the message "not spam".
            </p>
            
            <div style="display:flex; justify-content:flex-end; gap:8px; margin-top: 20px;">
                <button class="btn-gray" style="padding:8px 16px; border:none; border-radius:4px; cursor:pointer;" onclick="closeUpgradeOtpModal()">Cancel</button>
                <button class="btn-blue" style="background:#09a5db; color:white; border:none; padding:8px 16px; border-radius:4px; font-weight:600; cursor:pointer;" onclick="executeVerifyUpgradeOtpSubmission()">Verify OTP</button>
            </div>
        </div>
    `;

    document.body.appendChild(otpModal);
}

function closeUpgradeOtpModal() {
    if (BUSINESS_UPGRADE_WIZARD.cooldownInterval) {
        clearInterval(BUSINESS_UPGRADE_WIZARD.cooldownInterval);
        BUSINESS_UPGRADE_WIZARD.cooldownInterval = null;
    }
    const modal = document.getElementById("upgrade-otp-modal");
    if (modal) modal.remove();
}

/**
 * Validates typed OTP input against BUSINESS_UPGRADE_WIZARD.otpCode
 */
function executeVerifyUpgradeOtpSubmission() {
    const inputField = document.getElementById("upgrade-otp-input");
    const feedback = document.getElementById("err-upgrade-otp-feedback");

    const enteredOtp = inputField ? inputField.value.trim() : "";
    const expectedOtp = String(BUSINESS_UPGRADE_WIZARD.otpCode || "");

    if (!enteredOtp || enteredOtp !== expectedOtp) {
        if (feedback) {
            feedback.innerText = "Invalid verification token. Please verify entry values.";
            feedback.style.color = "red";
            feedback.style.display = "block";
        }
        return;
    }

    // Clear timers and close modal
    closeUpgradeOtpModal();

    // Trigger Step 3: Launch Fort Graphics Final Paystack Confirmation Modal
    launchBusinessUpgradePaystackConfirmationModal();
}

/**
 * Step 3: Final Fort Graphics Confirmation Modal prior to Paystack Checkout launch
 */
function launchBusinessUpgradePaystackConfirmationModal() {
    let checkoutModal = document.getElementById("upgrade-paystack-checkout-modal");
    if (checkoutModal) checkoutModal.remove();

    checkoutModal = document.createElement("div");
    checkoutModal.id = "upgrade-paystack-checkout-modal";
    checkoutModal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;";

    const userEmail = APP_STATE.currentUser.identifierText || 'user@fortmart.com';
    const upgradePrice = 2500; // 2,500 Naira

    checkoutModal.innerHTML = `
        <div class="paystack-modal-box" style="background: white; border-radius: 8px; max-width: 420px; width: 100%; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.15); border: 1px solid var(--fort-gray-border, #ccc);">
            <div class="paystack-header-brand" style="background-color: #09a5db; color: white; padding: 20px; text-align: center;">
                <h3 style="margin:0; color:white;">Fort Graphics Gateway</h3>
                <span style="font-size:0.75rem; opacity:0.9;">Account Plan Upgrade to Business Account</span>
            </div>
            <div class="paystack-body-content" style="padding: 24px;">
                <p style="font-size:0.85rem; color:var(--fort-blue-dark, #0d233a); margin-bottom:12px;">You are authorizing a one-time payment to upgrade your account to a <strong>Business (Commercial) Account</strong>.</p>
                <div class="form-input-container" style="margin-bottom:10px;">
                    <label style="display:block; font-size:0.8rem; margin-bottom:4px;">Email Address</label>
                    <input type="text" id="upgrade-paystack-email-field" class="form-field-control" value="${userEmail}" disabled style="width:100%; padding:8px; box-sizing:border-box;">
                </div>
                <div class="form-input-container" style="margin-bottom:14px;">
                    <label style="display:block; font-size:0.8rem; margin-bottom:4px;">Fee Amount</label>
                    <input type="text" class="form-field-control" value="₦${upgradePrice.toLocaleString()}" disabled style="width:100%; padding:8px; box-sizing:border-box;">
                </div>
            </div>
            <div class="paystack-footer-row" style="padding: 16px 24px; background: #f9f9f9; border-top: 1px solid #eee; display: flex; justify-content: space-between;">
                <button class="btn-gray" style="padding:8px 16px; border:none; border-radius:4px; cursor:pointer;" onclick="document.getElementById('upgrade-paystack-checkout-modal').remove()">Cancel</button>
                <button class="btn-blue" style="background-color:#3bb75e; color:white; border:none; padding:8px 16px; border-radius:4px; font-weight:700; cursor:pointer;" onclick="executeBusinessUpgradePaystackIframePopRuntime()">Proceed to Payment Method</button>
            </div>
        </div>
    `;

    document.body.appendChild(checkoutModal);
}

/**
 * Step 4: Paystack Runtime Initialization Execution
 */
function executeBusinessUpgradePaystackIframePopRuntime() {
    if (typeof PaystackPop === 'undefined') {
        showTopRightToast("Paystack SDK not loaded! Check your internet connection.", "info");
        return;
    }

    const emailField = document.getElementById("upgrade-paystack-email-field");
    const userEmail = emailField ? emailField.value : APP_STATE.currentUser.identifierText;

    const userUid = APP_STATE.currentUser ? APP_STATE.currentUser.uid : 'GUEST_USER';
    const upgradePrice = 2500; // 2500 NGN

    // Close preview modal
    const modal = document.getElementById('upgrade-paystack-checkout-modal');
    if (modal) modal.remove();

    let paymentConfig = {
        key: 'pk_test_8e350f62114983f1cd23b0944668d435a6e74214',
        email: userEmail,
        amount: upgradePrice * 100, // Amount in kobo (250,000 kobo = 2,500 NGN)
        currency: "NGN",
        ref: 'FT-BUS-UPGRADE-' + userUid + '-' + Math.floor((Math.random() * 1000000000) + 1),
        metadata: {
            upgrade_type: "business_account",
            user_uid: userUid
        },
        callback: function(response) {
            console.log("Business Upgrade Payment successful response:", response);
            processBusinessUpgradePaymentSuccess();
        },
        onClose: function() {
            showTopRightToast('Payment window closed by customer session.', "info");
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

/**
 * Step 5: Post-Payment Business Account Transition and Admin Notification
 */
function processBusinessUpgradePaymentSuccess() {
    const userUid = APP_STATE.currentUser.uid || APP_STATE.currentUser.id;

    // 1. Update matching user record in SYSTEM_DATABASE.users
    const targetUserRecord = SYSTEM_DATABASE.users.find(u => u.uid === userUid || u.id === userUid);
    if (targetUserRecord) {
        targetUserRecord.accountType = 'business';
        targetUserRecord.type = 'business';

        if (!targetUserRecord.businessName) {
            targetUserRecord.businessName = targetUserRecord.identityName || targetUserRecord.username || "Corporate Entity";
        }
        if (!targetUserRecord.businessInfo) {
            targetUserRecord.businessInfo = "Commercial business distribution account profile workspace.";
        }
    }

    // 2. Synchronize current active runtime state
    APP_STATE.currentUser.accountType = 'business';
    APP_STATE.currentUser.type = 'business';
    if (!APP_STATE.currentUser.businessName) {
        APP_STATE.currentUser.businessName = APP_STATE.currentUser.identityName || APP_STATE.currentUser.username || "Corporate Entity";
    }
    if (!APP_STATE.currentUser.businessInfo) {
        APP_STATE.currentUser.businessInfo = "Commercial business distribution account profile workspace.";
    }

    // 3. Automated Message sent by Fort Graphics Admin to User
    const adminMessageText = "Congratulations! Your account has been successfully upgraded to a Business Account. You now have full access to business features on Fort Graphics.";
    const targetChatId = "chat_admin_" + userUid;

    let adminChatThread = SYSTEM_DATABASE.chats.find(c => c.chatId === targetChatId);

    if (adminChatThread) {
        adminChatThread.messageLog.push({
            mid: "msg_" + Date.now(),
            senderUid: "admin",
            text: adminMessageText,
            timestamp: new Date().toLocaleTimeString([], { day: '2-digit',  month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }),
        });
    } else {
        // Create chat thread if non-existent
        adminChatThread = {
            chatId: targetChatId,
            dynamicParticipants: ["admin", userUid],
            messageLog: [
                {
                    mid: "msg_" + Date.now(),
                    senderUid: "admin",
                    text: adminMessageText,
                    timestamp: new Date().toLocaleTimeString([], { day: '2-digit',  month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }),
                }
            ]
        };
        SYSTEM_DATABASE.chats.push(adminChatThread);
    }

    // 4. Commit and sync modifications to local web storage
    if (typeof syncPlatformDatabaseStateToWebStorage === "function") {
        syncPlatformDatabaseStateToWebStorage();
    } else if (typeof commitDatabasesStateToLocalStorage === "function") {
        commitDatabasesStateToLocalStorage();
    }

    showTopRightToast("Payment successful! Your account has been upgraded to a Business Account.", "success");

    // Refresh UI/view rendering if applicable
    if (typeof renderMarketplaceProductsDisplayLoop === "function") {
        renderMarketplaceProductsDisplayLoop();
    }
}

function launchadvertismentofBusinessUpgrade() {
    const modalContentTargetNode = document.getElementById("auth-modal-content");
    modalContentTargetNode.innerHTML = `
        <h3>Upgrade Account To Business To Publish Products</h3>
    
        <div style="margin-top: 14px; padding: 12px; background: #eef9ff; border: 1px solid #bbeeef; border-radius: 6px; text-align: center;">
            <p style="font-size: 0.85rem; color: #0d233a; margin-bottom: 8px;">
                Want to list products and unlock commercial tools?
            </p>
            <button class="btn-blue" style="background-color: #09a5db; color: white; border: none; padding: 8px 16px; border-radius: 4px; font-weight: 700; cursor: pointer;" onclick="closeActiveModalDirectly('auth-modal'); initiateBusinessAccountUpgradeSequence()">
                Upgrade Account to Business (₦2,500)
            </button>
        </div>        
        <div class="btn-group">
            <button onclick="closeActiveModalDirectly('auth-modal')" class="btn-gray">Close</button> 
        </div>
    `;
    document.getElementById("auth-modal").classList.add("active"); 
}

/**
 * RENDER DESIGNER'S MY PROJECTS DASHBOARD (EXCLUDES COMPLETED PROJECTS)
 */
function renderDesignerProjectsWorkspaceDashboard(containerNode) {
    // 1. Target node fallback if string ID or element is passed
    if (typeof containerNode === "string") {
        containerNode = document.getElementById(containerNode);
    }
    if (!containerNode) {
        containerNode = document.getElementById("my-products-list-container-designer");
    }
    if (!containerNode) return;

    containerNode.innerHTML = "";
    
    // 2. Guard against uninitialized state or database
    if (!APP_STATE?.currentUser || !SYSTEM_DATABASE?.products) {
        containerNode.innerHTML = `
            <div style="padding:24px; text-align:center; color:var(--fort-gray-slate, #718096);">
                <p style="font-size:0.9rem;">Initializing workspace session data...</p>
            </div>`;
        return;
    }

    // 3. FILTER: Fetch booked projects BUT EXCLUDE completed/downloaded ones
    const designerBookedProjects = SYSTEM_DATABASE.products.filter(p => 
        p.bookedByUid === APP_STATE.currentUser.uid && 
        p.status !== 'completed' && 
        !p.isCompleted
    );

    if (designerBookedProjects.length === 0) {
        containerNode.innerHTML = `
            <div style="padding:24px; text-align:center; color:var(--fort-gray-slate, #718096);">
                <h4>No Active Booked Projects</h4>
                <p style="font-size:0.85rem;">Browse available projects on the marketplace to book client requests.</p>
            </div>`;
        return;
    }

    designerBookedProjects.forEach(project => {
        const customerRecord = SYSTEM_DATABASE.users?.find(u => u.uid === project.ownerUid) || {};
        const projectCard = document.createElement("div");
        projectCard.className = "project-expanded-card";

        // Generate asset chips
        let assetsMarkup = '<span style="font-size:0.85rem; color:#a0aec0;">No assets attached.</span>';
        if (project.assets && project.assets.length > 0) {
            assetsMarkup = project.assets.map(asset => `
                <button class="asset-chip-button" onclick="launchAssetManagementModal('${project.pid}', '${asset.id}')">
                    ✏️ ${asset.fileName}
                </button>
            `).join(" ");
        }

        // Render past and current modifications
        let modificationsHTML = '<p style="font-size:0.8rem; color:#718096; font-style:italic;">No revision requests submitted.</p>';
        if (project.modifications && project.modifications.length > 0) {
            modificationsHTML = project.modifications.map((mod, i) => `
                <div style="background:#edf2f7; padding:8px 12px; border-radius:6px; font-size:0.82rem; margin-top:4px;">
                    <strong>${i === project.modifications.length - 1 ? '🔥 Current Modification' : `Mod #${i+1}`}:</strong> ${mod.text}
                    <span style="font-size:0.7rem; color:#a0aec0; display:block;">${mod.timestamp}</span>
                </div>
            `).join("");
        }

        projectCard.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #edf2f7; padding-bottom:12px; margin-bottom:12px;">
                <div>
                    <h3 style="margin:0; color:var(--fort-blue-dark, #0d233a);">${project.name || 'Untitled Project'}</h3>
                    <span style="font-size:0.8rem; color:var(--fort-gray-slate, #718096);">Client: <strong>${customerRecord.identityName || customerRecord.username || 'Customer'}</strong></span>
                </div>
                <span class="badge-status badge-pending">
                    ⚙️ In Progress
                </span>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                <div>
                    <h5 style="margin:4px 0; color:#4a5568;">Original Prompt / Instructions:</h5>
                    <p style="font-size:0.88rem; color:#2d3748; background:#f7fafc; padding:10px; border-radius:6px; border:1px solid #e2e8f0;">${project.info || 'No detailed instructions provided.'}</p>
                    
                    <h5 style="margin:12px 0 4px 0; color:#4a5568;">Attached Client Assets (Click to rename/download):</h5>
                    <div style="display:flex; flex-wrap:wrap; gap:6px;">${assetsMarkup}</div>
                </div>

                <div>
                    <h5 style="margin:4px 0; color:#4a5568;">Modifications Log:</h5>
                    <div style="max-height:140px; overflow-y:auto;">${modificationsHTML}</div>

                    <div style="margin-top:16px;">
                        <button class="btn-blue" style="width:100%; font-weight:700;" onclick="launchDesignerUploadWorkModal('${project.pid}')">
                            📤 Upload Recent Design Draft
                        </button>
                    </div>
                </div>
            </div>
        `;
        containerNode.appendChild(projectCard);
    });
}


/**
 * EXPANDED ASSET RENAMING & DOWNLOAD MODAL
 */
function launchAssetManagementModal(productId, assetId) {
    const project = SYSTEM_DATABASE.products.find(p => p.pid === productId);
    if (!project || !project.assets) return;
    
    const asset = project.assets.find(a => a.id === assetId);
    if (!asset) return;

    let assetModal = document.getElementById("asset-manage-modal");
    if (assetModal) assetModal.remove();

    // Determine target URL/Data URL for asset preview
    const fileSource = asset.fileData || asset.dataUrl || asset.url || "";
    
    // Check if the file is an image by file extension or data URI prefix
    const isImage = /\.(jpeg|jpg|gif|png|svg|webp)$/i.test(asset.fileName) || /^data:image\//i.test(fileSource);

    assetModal = document.createElement("div");
    assetModal.id = "asset-manage-modal";
    assetModal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;";

    let imagePreviewHTML = "";
    if (isImage && fileSource) {
        imagePreviewHTML = `
            <div style="margin-bottom:14px; text-align:center; background:#f3f4f6; border:1px dashed #ccc; border-radius:6px; padding:8px; max-height:220px; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                <img src="${fileSource}" alt="${asset.fileName}" style="max-width:100%; max-height:200px; object-fit:contain; border-radius:4px;" onerror="this.parentNode.style.display='none';">
            </div>
        `;
    }

    assetModal.innerHTML = `
        <div style="background: white; border-radius: 8px; max-width: 420px; width: 90%; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
            <h3 style="margin-top:0; color:#1e3a8a;">Manage Asset File</h3>
            
            ${imagePreviewHTML}

            <div style="margin-bottom:14px;">
                <label style="font-size:0.8rem; font-weight:600;">File Display Name</label>
                <input type="text" id="rename-asset-input" class="form-field-control" value="${asset.fileName}" style="width:100%; padding:8px; margin-top:4px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;">
            </div>
            <div style="display:flex; justify-content:space-between; gap:8px;">
                <button class="btn-gray" onclick="document.getElementById('asset-manage-modal').remove()">Cancel</button>
                <div style="display:flex; gap:8px;">
                    <button class="btn-gray" onclick="executeRenameAsset('${productId}', '${assetId}')">Save Name</button>
                    <button class="btn-blue" onclick="executeDownloadAsset('${productId}', '${assetId}')">Download File</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(assetModal);
}

function executeRenameAsset(productId, assetId) {
    const newName = document.getElementById("rename-asset-input").value.trim();
    if (!newName) return;

    const project = SYSTEM_DATABASE.products.find(p => p.pid === productId);
    if (project && project.assets) {
        const asset = project.assets.find(a => a.id === assetId);
        if (asset) {
            asset.fileName = newName;
            if (typeof syncPlatformDatabaseStateToWebStorage === "function") {
                syncPlatformDatabaseStateToWebStorage();
            }
            if (typeof showTopRightToast === "function") {
                showTopRightToast("Asset file renamed successfully.", "success");
            }
        }
    }
    document.getElementById("asset-manage-modal")?.remove();
    
    // Re-render workspace if view handler exists
    if (typeof renderDesignerProjectsWorkspaceDashboard === "function") {
        renderDesignerProjectsWorkspaceDashboard();
    }
}

function executeDownloadAsset(productId, assetId) {
    const project = SYSTEM_DATABASE.products.find(p => p.pid === productId);
    if (!project || !project.assets) return;

    const asset = project.assets.find(a => a.id === assetId);
    if (!asset) return;

    const fileSource = asset.fileData || asset.dataUrl || asset.url;
    if (!fileSource || fileSource === "#") {
        alert("No valid download source data found for this asset.");
        return;
    }

    let downloadUrl = fileSource;
    let createdBlobUrl = null;

    // Handle base64 Data URIs to enable offline local downloads on file:/// protocol
    if (fileSource.startsWith("data:")) {
        try {
            const parts = fileSource.split(",");
            const mimeMatch = parts[0].match(/:(.*?);/);
            const mimeType = mimeMatch ? mimeMatch[1] : "application/octet-stream";
            const binaryString = atob(parts[1]);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);

            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const blob = new Blob([bytes], { type: mimeType });
            createdBlobUrl = URL.createObjectURL(blob);
            downloadUrl = createdBlobUrl;
        } catch (e) {
            console.error("Base64 conversion failed, falling back to raw source:", e);
        }
    }

    const tempAnchor = document.createElement("a");
    tempAnchor.href = downloadUrl;
    tempAnchor.download = asset.fileName || "downloaded_asset";
    document.body.appendChild(tempAnchor);
    tempAnchor.click();
    document.body.removeChild(tempAnchor);

    // Clean up Blob Object URL to free memory
    if (createdBlobUrl) {
        setTimeout(() => URL.revokeObjectURL(createdBlobUrl), 1000);
    }

    document.getElementById("asset-manage-modal")?.remove();
}

/**
 * DESIGNER DRAFT UPLOAD MODAL
 */
function launchDesignerUploadWorkModal(productId) {
    let uploadModal = document.getElementById("designer-upload-modal");
    if (uploadModal) uploadModal.remove();

    uploadModal = document.createElement("div");
    uploadModal.id = "designer-upload-modal";
    uploadModal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;";

    uploadModal.innerHTML = `
        <div style="background: white; border-radius: 8px; max-width: 480px; width: 90%; padding: 24px;">
            <h3 style="margin-top:0;">Upload Recent Design Draft</h3>
            <p style="font-size:0.85rem; color:#666;">Select an image file to transmit to the customer interface.</p>
            
            <div id="draft-image-preview-container" onclick="document.getElementById('designer-file-input').click()" style="width:100%; height:200px; border:2px dashed #ccc; border-radius:8px; display:flex; align-items:center; justify-content:center; cursor:pointer; background:#fafafa; margin-bottom:16px;">
                <span id="draft-upload-placeholder-text" style="color:#a0aec0;">Click here to browse image file</span>
                <img id="draft-preview-img-element" style="width:100%; height:100%; object-fit:contain; display:none;">
            </div>
            <input type="file" id="designer-file-input" accept="image/*" style="display:none;" onchange="handleDesignerDraftFileSelection(event)">

            <div style="display:flex; justify-content:flex-end; gap:8px;">
                <button class="btn-gray" onclick="document.getElementById('designer-upload-modal').remove()">Cancel</button>
                <button class="btn-blue" onclick="executeSubmitDraftToCustomer('${productId}')">Send Design</button>
            </div>
        </div>
    `;
    document.body.appendChild(uploadModal);
}

let TEMPORARY_DESIGNER_DRAFT_BASE64 = null;

function handleDesignerDraftFileSelection(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            TEMPORARY_DESIGNER_DRAFT_BASE64 = e.target.result;
            const previewImg = document.getElementById("draft-preview-img-element");
            const placeholder = document.getElementById("draft-upload-placeholder-text");
            
            if (previewImg && placeholder) {
                previewImg.src = TEMPORARY_DESIGNER_DRAFT_BASE64;
                previewImg.style.display = "block";
                placeholder.style.display = "none";
            }
        };
        reader.readAsDataURL(file);
    }
}

function executeSubmitDraftToCustomer(productId) {
    if (!TEMPORARY_DESIGNER_DRAFT_BASE64) {
        showTopRightToast("Please select an image draft file first.", "error");
        return;
    }

    const project = SYSTEM_DATABASE.products.find(p => p.pid === productId);
    if (project) {
        const timestamp = new Date().toISOString();
        
        // Update project properties
        project.submittedDesignDraft = TEMPORARY_DESIGNER_DRAFT_BASE64;
        project.hasSubmittedDraft = true;
        project.draftSubmittedAt = timestamp;

        const requester = SYSTEM_DATABASE.users.find(u => u.uid === project.ownerUid) || {};

        // Log History Record
        recordDesignerActivityLog({
            designerUid: project.bookedByUid || APP_STATE.currentUser.uid,
            productId: project.pid,
            productName: project.name,
            requesterUid: project.ownerUid,
            requesterName: requester.name || requester.username || requester.identityName || "Customer",
            type: 'submission',
            actionText: 'Project Submission sent to customer',
            timestamp: timestamp
        });

        // 1. Sync updated system state to web storage
        syncPlatformDatabaseStateToWebStorage();
        showTopRightToast("Design draft transmitted to customer successfully!", "success");
    }

    // 2. Clean up memory and modal elements FIRST
    TEMPORARY_DESIGNER_DRAFT_BASE64 = null;
    const modalNode = document.getElementById("designer-upload-modal");
    if (modalNode) {
        modalNode.remove();
    }

    // 3. Re-render UI grids cleanly after modal cleanup
    if (typeof renderAccountInventoryLedgerManagementDashboardGrid === "function") {
        renderAccountInventoryLedgerManagementDashboardGrid();
    }
}

/**
 * Admin User List Rendering Engine
 * Filters and displays accounts sorted by creation date (newest first).
 */
function renderAdminUsersManagementList() {
    const listContainer = document.getElementById("admin-users-list-container");
    const searchInput = document.getElementById("admin-user-search-bar");
    if (!listContainer) return;

    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";

    // 1. Filter out admin self-account and apply search query matching
    let filteredUsers = SYSTEM_DATABASE.users.filter(u => {
        if (u.uid === 'admin' || u.id === 'admin') return false;
        
        const nameMatch = (u.identityName || u.username || '').toLowerCase().includes(searchTerm);
        const emailMatch = (u.identifierText || '').toLowerCase().includes(searchTerm);
        const statusMatch = (u.verificationStatus || u.status || '').toLowerCase().includes(searchTerm);
        const typeMatch = (u.accountType || u.type || '').toLowerCase().includes(searchTerm);
        
        return nameMatch || emailMatch || statusMatch || typeMatch;
    });

    // 2. Sort accounts from most recently created to least recently created
    filteredUsers.sort((a, b) => {
        const timeA = parseInt(String(a.uid || a.id).replace('user_', ''), 10) || 0;
        const timeB = parseInt(String(b.uid || b.id).replace('user_', ''), 10) || 0;
        return timeB - timeA;
    });

    // 3. Render account listing DOM nodes
    if (filteredUsers.length === 0) {
        listContainer.innerHTML = `<div style="padding:12px; color:var(--fort-gray-slate); text-align:center; font-style:italic;">No user accounts found matching criteria.</div>`;
        return;
    }

    let listHTML = "";
    filteredUsers.forEach(user => {
        const userId = user.uid || user.id;
        const displayName = user.identityName || user.username || "Unnamed User";
        const email = user.identifierText || "No Contact";
        const accountType = user.accountType || user.type || "personal";
        const status = user.verificationStatus || user.status || "unverified";
        const subAccountCode = user.subaccountCode || "NOT_SET";
        const avatar = user.avatar || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a0aec0'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>";

        const isVerified = status === "verified";
        const badgeBg = isVerified ? "#e6fffa" : "#fff5f5";
        const badgeColor = isVerified ? "#234e52" : "#9b2c2c";
        const badgeBorder = isVerified ? "#b2f5ea" : "#feb2b2";

        listHTML += `
            <div class="admin-user-card-item" onclick="launchDetailedUserProfileContextOverlaySummaryModal('${userId}')" style="display:flex; align-items:center; gap:12px; padding:10px 14px; background:#fff; border:1px solid #e2e8f0; border-radius:8px; cursor:pointer; transition:all 0.2s;" onmouseover="this.style.borderColor='#cbd5e0'; this.style.background='#f8fafc';" onmouseout="this.style.borderColor='#e2e8f0'; this.style.background='#fff';">
                <img src="${avatar}" style="width:42px; height:42px; border-radius:50%; object-fit:cover; border:1px solid #cbd5e0;" alt="Avatar">
                <div style="flex:1; min-width:0;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <h4 style="margin:0; font-size:0.92rem; color:var(--fort-blue-dark); text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${displayName}</h4>
                        <span style="font-size:0.7rem; font-weight:700; text-transform:uppercase; padding:2px 6px; border-radius:4px; background:${badgeBg}; color:${badgeColor}; border:1px solid ${badgeBorder};">${status}</span>
                    </div>
                    <div style="font-size:0.8rem; color:var(--fort-gray-slate); margin-top:2px;">
                        Email: <strong>${email}</strong> | Type: <span style="text-transform:capitalize;">${accountType}</span> | Subaccount: <code style="background:#edf2f7; padding:1px 4px; border-radius:3px;">${subAccountCode}</code>
                    </div>
                </div>
                <button class="btn-blue" style="padding:4px 10px; font-size:0.75rem;" onclick="event.stopPropagation(); launchDetailedUserProfileContextOverlaySummaryModal('${userId}')">Manage</button>
            </div>
        `;
    });

    listContainer.innerHTML = listHTML;
}

/**
 * Updated Detailed User Profile Context Overlay Summary Modal Processing Architecture Engine
 * Supports editing details and approving designer subaccount codes with admin password confirmation.
 */
function launchDetailedUserProfileContextOverlaySummaryModal(userIdTokenKeyParameterValue) {
    if (!SYSTEM_DATABASE || !Array.isArray(SYSTEM_DATABASE.users)) return;
    const targetUserObjMatchRecord = SYSTEM_DATABASE.users.find(u => u.uid === userIdTokenKeyParameterValue || u.id === userIdTokenKeyParameterValue);
    if (!targetUserObjMatchRecord) return;
    const standardModalBodyElementNode = document.getElementById("product-detail-modal-body");
    if (!standardModalBodyElementNode) return;
    
    let subAccountClassificationMetadataDetailsBlockHTML = "";
    if (targetUserObjMatchRecord.accountType === 'business' || targetUserObjMatchRecord.type === 'business') {
        subAccountClassificationMetadataDetailsBlockHTML = `
            <div style="background-color:var(--fort-white-snow); padding:14px; border:1px solid var(--fort-gray-border);" class="rounded-rect margin-top-xs">
                <h5 style="text-transform:uppercase; font-size:0.7rem; color:var(--fort-gray-slate); letter-spacing:0.5px;">Bank & Business Parameters</h5>
                <p style="font-size:0.95rem; font-weight:700; color:var(--fort-blue-dark); margin-top:4px;">Bank Info: ${targetUserObjMatchRecord.businessName || 'N/A'}</p>
                <p style="font-size:0.88rem; color:var(--fort-blue-primary); line-height:1.4; margin-top:4px;">Account Name: ${targetUserObjMatchRecord.businessInfo || 'N/A'}</p>
                <p style="font-size:0.88rem; color:var(--fort-blue-primary); line-height:1.4; margin-top:4px;">Abilities/Deals: ${targetUserObjMatchRecord.productsDealtIn || 'N/A'}</p>
            </div> 
        `;
    } else {
        subAccountClassificationMetadataDetailsBlockHTML = `
            <div style="background-color:var(--fort-white-snow); padding:14px; border:1px solid var(--fort-gray-border);" class="rounded-rect margin-top-xs">
                <h5 style="text-transform:uppercase; font-size:0.7rem; color:var(--fort-gray-slate); letter-spacing:0.5px;">User Info</h5>
                <p style="font-size:0.95rem; font-weight:700; color:var(--fort-blue-dark); margin-top:4px;">${targetUserObjMatchRecord.identityName || targetUserObjMatchRecord.username || ''}</p>
            </div>
        `;
    }

    // ADMINISTRATIVE CONTROL LAYER
    let administrativeControlsInlineHTML = "";
    if (typeof APP_STATE !== "undefined" && APP_STATE.currentUser && (APP_STATE.currentUser.uid === 'admin' || APP_STATE.currentUser.id === 'admin')) {
        const rawVerificationCode = targetUserObjMatchRecord.UserAccountAuthenticationVerificationCode || targetUserObjMatchRecord.verificationCode || 'N/A';
        const currentGovernanceStatus = targetUserObjMatchRecord.verificationStatus || targetUserObjMatchRecord.status || 'unverified';
        const currentAccountType = targetUserObjMatchRecord.accountType || targetUserObjMatchRecord.type || 'personal';
        const registrationContactIdentifier = targetUserObjMatchRecord.identifierText || '';
        const securityAccessPassword = targetUserObjMatchRecord.secretKey || targetUserObjMatchRecord.password || '';
        const uid = targetUserObjMatchRecord.uid || targetUserObjMatchRecord.id || '';
        const currentSubaccountCode = targetUserObjMatchRecord.subaccountCode || '';

        administrativeControlsInlineHTML = `
            <div style="margin-top:12px; margin-bottom:12px; padding:14px; background:#f7fafc; border:1px solid #cbd5e0; border-radius:8px; display:flex; flex-direction:column; gap:10px;">
                <h5 style="margin:0; text-transform:uppercase; font-size:0.75rem; color:var(--fort-gray-slate); letter-spacing:0.5px;">🛡️ Administrative Console Workspace</h5>
                
                <div style="display:flex; gap:8px;">
                    <div style="flex:1;">
                        <span style="font-size:0.82rem; color:var(--fort-gray-slate); font-weight:700;">Registration Contact:</span>
                        <input type="text" id="adm-user-identifier-text" class="form-field-control" style="margin-top:4px; font-family:monospace;" value="${registrationContactIdentifier}">
                    </div>
                    <div style="flex:1;">
                        <span style="font-size:0.82rem; color:var(--fort-gray-slate); font-weight:700;">Account Password:</span>
                        <input type="text" id="adm-user-security-password" class="form-field-control" style="margin-top:4px; font-family:monospace;" value="${securityAccessPassword}">
                    </div>
                </div>

                <div>
                    <span style="font-size:0.82rem; color:var(--fort-gray-slate); font-weight:700;">Paystack Subaccount Code:</span>
                    <input type="text" id="adm-user-subaccount-code" class="form-field-control" style="margin-top:4px; font-family:monospace;" placeholder="e.g. ACCT_xxxxxxxxx" value="${currentSubaccountCode}">
                </div>

                <div>
                    <span style="font-size:0.82rem; color:var(--fort-gray-slate); font-weight:700;">OTP Verification Code:</span>
                    <input type="text" id="UserAccountAuthenticationVerificationCode" class="form-field-control" style="margin-top:4px;" value="${rawVerificationCode}">
                </div>

                <div>
                    <span style="font-size:0.82rem; color:var(--fort-gray-slate); font-weight:700;">User ID:</span>
                    <input type="text" id="UserIdAdminSeen" class="form-field-control" style="margin-top:4px;" value="${uid}" disabled>
                </div>

                <div>
                    <span style="font-size:0.82rem; color:var(--fort-gray-slate); font-weight:700;">Manage Account Type:</span>
                    <select id="adm-change-account-type" class="form-field-control" style="margin-top:4px;">
                        <option value="personal" ${currentAccountType === 'personal' ? 'selected' : ''}>Personal Account</option>
                        <option value="business" ${currentAccountType === 'business' ? 'selected' : ''}>Designer (Commercial) Account</option>
                    </select>
                </div>
                
                <div style="font-size:0.82rem; color:var(--fort-blue-dark); margin-top:2px;">
                    Current Verification Status: <strong id="lbl-inspector-active-status-tag" data-pending-status-value="${currentGovernanceStatus}" style="text-transform:uppercase;">${currentGovernanceStatus}</strong>
                </div>
                
                <div class="btn-group" style="margin-top:4px; gap:8px;">
                    <button class="btn-blue" style="padding:6px 12px; font-size:0.8rem;" onclick="promptAdminPasswordConfirmationForInlineSave('${uid}')">Apply Policy Changes</button>
                    ${currentGovernanceStatus !== 'verified' ? `<button class="btn-blue" style="padding:6px 12px; font-size:0.8rem; background-color:#28a745; border-color:#28a745;" onclick="promptAdminPasswordConfirmationForApproval('${uid}')">Approve Account</button>` : ''}
                    <button class="btn-gray" style="padding:6px 12px; font-size:0.8rem;" onclick="(() => {
                        const tag = document.getElementById('lbl-inspector-active-status-tag');
                        const nextStatus = tag.getAttribute('data-pending-status-value') === 'verified' ? 'unverified' : 'verified';
                        tag.setAttribute('data-pending-status-value', nextStatus);
                        tag.textContent = nextStatus;
                    })()">Toggle Verification State</button>
                </div>
            </div>
        `;
    }

    // USER'S PRODUCTS GRID VIEW LOOP LAYER
    let userProductsListHTML = "";
    if (targetUserObjMatchRecord.accountType === 'business' || targetUserObjMatchRecord.type === 'business') {
        let currencySymbol = (typeof APP_STATE === "undefined" || !APP_STATE.currentUser || APP_STATE.currentUser.country === 'Nigeria') ? '₦' : '$';
        
        // Safely access products array to prevent script error if products are uninitialized
        const productsList = (SYSTEM_DATABASE && Array.isArray(SYSTEM_DATABASE.products)) ? SYSTEM_DATABASE.products : [];
        const sellerProducts = productsList.filter(p => p.ownerUid === targetUserObjMatchRecord.uid || p.ownerUid === targetUserObjMatchRecord.id);
        
        let productsGridItemsHTML = "";
        if (sellerProducts.length > 0) {
            sellerProducts.forEach(product => {
                const imgUrl = product.coverPhoto || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e0'><path d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/></svg>";
                productsGridItemsHTML += `
                    <div class="profile-product-item-row" style="display:flex; align-items:center; gap:12px; padding:8px; background:var(--fort-white-snow); border:1px solid var(--fort-gray-border); border-radius:6px; cursor:pointer;" onclick="closeActiveModalDirectly('product-detail-modal'); launchComprehensiveProductSpecificationsExpandedModalView('${product.pid}')">
                        <img src="${imgUrl}" style="width:50px; height:50px; object-fit:contain; border-radius:4px; background:#fcfcfc; border:1px solid #e2e8f0;" alt="${product.name}">
                        <div style="flex:1; min-width:0;">
                            <h4 style="margin:0; font-size:0.9rem; color:var(--fort-blue-dark); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${product.name}</h4>
                            <div style="font-size:0.85rem; font-weight:700; color:var(--fort-blue-light); margin-top:2px;">${currencySymbol}${product.price ? product.price.toLocaleString() : '0'}</div>
                        </div>
                    </div>
                `;
            });
        } else {
            productsGridItemsHTML = `<p style="font-size:0.88rem; color:var(--fort-gray-slate); font-style:italic; margin:0; padding:4px;">This business user does not have any active product.</p>`;
        }

        userProductsListHTML = `
            <div class="user-products-section-block" style="margin-top:14px; margin-bottom:14px;">
                <h5 style="text-transform:uppercase; font-size:0.75rem; color:var(--fort-gray-slate); letter-spacing:0.5px; margin-bottom:8px;">Active Product Catalog (${sellerProducts.length})</h5>
                <div style="display:flex; flex-direction:column; gap:8px; max-height:220px; overflow-y:auto; padding-right:4px;">
                    ${productsGridItemsHTML}
                </div>
            </div>
        `;
    }

    let userProfilePhotoSrc = targetUserObjMatchRecord.avatar || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a0aec0'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>";
    
    standardModalBodyElementNode.innerHTML = `
        <div class="modal-expanded-header-row" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--fort-gray-border); padding-bottom:14px;">
            <h3>User Profile Identity Summary Context</h3>
            <button onclick="closeActiveModalDirectly('product-detail-modal')" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">✕</button>
        </div>
        
        <div class="modal-expanded-content-split-grid margin-top-md" style="display:grid; grid-template-columns: 100px 1fr; gap:20px; align-items:start;">
            <div class="profile-left-avatar-frame">
                <img src="${userProfilePhotoSrc}" class="circle-container" style="width:100px; height:100px; object-fit:cover; border:2px solid var(--fort-blue-primary);" alt="User Profile Photo">
            </div>
            
            <div class="profile-right-fields-column" style="display:flex; flex-direction:column;">
                <h2 style="color:var(--fort-blue-dark); font-weight:800; margin:0;">${targetUserObjMatchRecord.identityName || ''}</h2>
                <span style="font-size:0.82rem; color:var(--fort-gray-slate); margin-top:2px;">Account Class: <strong style="text-transform:uppercase;">${targetUserObjMatchRecord.accountType || targetUserObjMatchRecord.type || 'personal'}</strong></span>
                <span style="font-size:0.82rem; color:var(--fort-gray-slate); margin-top:2px;">Operational Region: <strong>${targetUserObjMatchRecord.country || 'Nigeria'}</strong></span>
                
                ${subAccountClassificationMetadataDetailsBlockHTML}
                ${administrativeControlsInlineHTML}
                ${userProductsListHTML}
                
                <div class="modal-expanded-actions-footer-row btn-group" style="margin-top:12px; padding-top:14px; border-top:1px solid #f0f0f0;">
                    <button class="btn-gray" onclick="closeActiveModalDirectly('product-detail-modal')">Close</button>
                    ${(typeof APP_STATE !== "undefined" && APP_STATE.currentUser && APP_STATE.currentUser.uid !== targetUserObjMatchRecord.uid) ? `<button class="btn-blue" onclick="closeActiveModalDirectly('product-detail-modal'); initialDirectMessageCommunicationPipelineSetup('${targetUserObjMatchRecord.uid || targetUserObjMatchRecord.id}')">💬 Message Seller</button>` : ''}
                </div>
            </div>
        </div>
    `;
    
    const targetModal = document.getElementById("product-detail-modal");
    if (targetModal) targetModal.classList.add("active");
}

/**
 * Prompts password confirmation modal for the admin before saving policy edits.
 */
function promptAdminPasswordConfirmationForInlineSave(targetUserId) {
    let adminPwdModal = document.getElementById("admin-save-pwd-modal");
    if (adminPwdModal) adminPwdModal.remove();

    adminPwdModal = document.createElement("div");
    adminPwdModal.id = "admin-save-pwd-modal";
    adminPwdModal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;";

    adminPwdModal.innerHTML = `
        <div style="background: white; border-radius: 8px; max-width: 400px; width: 90%; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
            <h3 style="margin-top:0; color:var(--fort-blue-dark);">Admin Security Verification</h3>
            <p style="font-size:0.88rem; color:#555; margin-bottom:16px;">Confirm admin password to save policy updates for this account:</p>
            
            <div style="margin-bottom:16px;">
                <label style="display:block; font-size:0.8rem; margin-bottom:4px; font-weight:600;">Admin Password</label>
                <input type="password" id="admin-save-confirm-pwd-input" class="form-field-control" placeholder="Enter admin password" style="width:100%; padding:8px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;">
                <div id="admin-save-confirm-pwd-error" style="color:red; font-size:0.8rem; margin-top:4px; display:none;"></div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:8px;">
                <button class="btn-gray" onclick="document.getElementById('admin-save-pwd-modal').remove()">Cancel</button>
                <button class="btn-blue" onclick="finalizeInlineAdminSave('${targetUserId}')">Confirm & Save</button>
            </div>
        </div>
    `;

    document.body.appendChild(adminPwdModal);
}

/**
 * Validates admin password and executes user policy save.
 */
function finalizeInlineAdminSave(targetUserId) {
    const pwdInput = document.getElementById("admin-save-confirm-pwd-input");
    const errContainer = document.getElementById("admin-save-confirm-pwd-error");
    const enteredPassword = pwdInput ? pwdInput.value : "";

    const adminUser = typeof APP_STATE !== "undefined" ? APP_STATE.currentUser : null;
    const actualAdminPassword = adminUser ? (adminUser.secretKey || adminUser.password) : "";

    if (!enteredPassword || enteredPassword !== actualAdminPassword) {
        if (errContainer) {
            errContainer.innerText = "Invalid administrator password confirmation.";
            errContainer.style.display = "block";
        }
        return;
    }

    const saveModalNode = document.getElementById("admin-save-pwd-modal");
    if (saveModalNode) saveModalNode.remove();

    executeInlineAdminSave(targetUserId);
}

/**
 * Prompts password confirmation modal for the admin before approving a target account.
 */
function promptAdminPasswordConfirmationForApproval(targetUserId) {
    const inputSubaccountField = document.getElementById("adm-user-subaccount-code");
    const newSubaccountCode = inputSubaccountField ? inputSubaccountField.value.trim() : "";

    if (!newSubaccountCode || newSubaccountCode === "ACCT_DEFAULT" || newSubaccountCode === "") {
        alert("Please enter a valid Paystack Subaccount Code before approving this account.");
        return;
    }

    let adminPwdModal = document.getElementById("admin-approval-pwd-modal");
    if (adminPwdModal) adminPwdModal.remove();

    adminPwdModal = document.createElement("div");
    adminPwdModal.id = "admin-approval-pwd-modal";
    adminPwdModal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;";

    adminPwdModal.innerHTML = `
        <div style="background: white; border-radius: 8px; max-width: 400px; width: 90%; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
            <h3 style="margin-top:0; color:var(--fort-blue-dark);">Admin Security Verification</h3>
            <p style="font-size:0.88rem; color:#555; margin-bottom:16px;">Confirm admin password to approve user account and register Subaccount Code (<strong>${newSubaccountCode}</strong>):</p>
            
            <div style="margin-bottom:16px;">
                <label style="display:block; font-size:0.8rem; margin-bottom:4px; font-weight:600;">Admin Password</label>
                <input type="password" id="admin-confirm-pwd-input" class="form-field-control" placeholder="Enter admin password" style="width:100%; padding:8px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;">
                <div id="admin-confirm-pwd-error" style="color:red; font-size:0.8rem; margin-top:4px; display:none;"></div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:8px;">
                <button class="btn-gray" onclick="document.getElementById('admin-approval-pwd-modal').remove()">Cancel</button>
                <button class="btn-blue" style="background-color:#28a745; border-color:#28a745;" onclick="finalizeAdminAccountApproval('${targetUserId}')">Confirm Approval</button>
            </div>
        </div>
    `;

    document.body.appendChild(adminPwdModal);
}

/**
 * Validates admin credentials and updates user status to 'verified'.
 */
function finalizeAdminAccountApproval(targetUserId) {
    const pwdInput = document.getElementById("admin-confirm-pwd-input");
    const errContainer = document.getElementById("admin-confirm-pwd-error");
    const enteredPassword = pwdInput ? pwdInput.value : "";

    const adminUser = typeof APP_STATE !== "undefined" ? APP_STATE.currentUser : null;
    const actualAdminPassword = adminUser ? (adminUser.secretKey || adminUser.password) : "";

    if (!enteredPassword || enteredPassword !== actualAdminPassword) {
        if (errContainer) {
            errContainer.innerText = "Invalid administrator password confirmation.";
            errContainer.style.display = "block";
        }
        return;
    }

    const accountInstance = SYSTEM_DATABASE.users.find(u => u.id === targetUserId || u.uid === targetUserId);
    if (!accountInstance) return;

    // Apply subaccount code & mark account as verified
    const inputSubaccountField = document.getElementById("adm-user-subaccount-code");
    if (inputSubaccountField) {
        accountInstance.subaccountCode = inputSubaccountField.value.trim();
    }

    accountInstance.verificationStatus = "verified";
    accountInstance.status = "verified";

    // Persist modifications
    if (typeof syncPlatformDatabaseStateToWebStorage === "function") {
        syncPlatformDatabaseStateToWebStorage();
    } else if (typeof commitDatabasesStateToLocalStorage === "function") {
        commitDatabasesStateToLocalStorage();
    }

    const approvalModalNode = document.getElementById("admin-approval-pwd-modal");
    if (approvalModalNode) approvalModalNode.remove();

    closeActiveModalDirectly("product-detail-modal");

    if (typeof renderAdminUsersManagementList === "function") {
        renderAdminUsersManagementList();
    }

    if (typeof showAlertModal === "function") {
        showAlertModal("Account Approved", "The account has been marked as verified and subaccount code assigned.");
    } else if (typeof showTopRightToast === "function") {
        showTopRightToast("Account approved successfully.", "success");
    }
}

/**
 * Commits administrative code alterations into local database storage.
 */
function executeInlineAdminSave(userId) {
    const accountInstance = SYSTEM_DATABASE.users.find(u => u.id === userId || u.uid === userId);
    if (!accountInstance) return;

    // 1. Process status tracking strings
    const cachedStatusElement = document.getElementById("lbl-inspector-active-status-tag");
    const evaluatedStatusValue = cachedStatusElement && cachedStatusElement.getAttribute("data-pending-status-value") 
        ? cachedStatusElement.getAttribute("data-pending-status-value") 
        : (accountInstance.verificationStatus || accountInstance.status || 'unverified');

    accountInstance.verificationStatus = evaluatedStatusValue;
    accountInstance.status = evaluatedStatusValue;

    // 2. Process manual identifier Text updates
    const inputIdentifierField = document.getElementById("adm-user-identifier-text");
    if (inputIdentifierField) {
        accountInstance.identifierText = inputIdentifierField.value.trim();
    }

    // 3. Process subaccount code
    const inputSubaccountField = document.getElementById("adm-user-subaccount-code");
    if (inputSubaccountField) {
        accountInstance.subaccountCode = inputSubaccountField.value.trim();
    }

    // 4. Process password updates
    const inputPasswordField = document.getElementById("adm-user-security-password");
    if (inputPasswordField) {
        const val = inputPasswordField.value.trim();
        accountInstance.secretKey = val;
        accountInstance.password = val;
    }

    // 5. Process OTP code variables
    const inputCodeField = document.getElementById("UserAccountAuthenticationVerificationCode");
    if (inputCodeField) {
        const boundValue = inputCodeField.value.trim();
        accountInstance.UserAccountAuthenticationVerificationCode = boundValue;
        accountInstance.verificationCode = boundValue;
    }

    // 6. Process account type switches
    const accountTypeSelectField = document.getElementById("adm-change-account-type");
    if (accountTypeSelectField) {
        const selectedType = accountTypeSelectField.value;
        accountInstance.accountType = selectedType;
        accountInstance.type = selectedType;
    }

    if (typeof syncPlatformDatabaseStateToWebStorage === "function") {
        syncPlatformDatabaseStateToWebStorage();
    } else if (typeof commitDatabasesStateToLocalStorage === "function") {
        commitDatabasesStateToLocalStorage();
    }
    
    if (typeof renderAdminUsersManagementList === "function") {
        renderAdminUsersManagementList();
    }

    closeActiveModalDirectly("product-detail-modal");
    
    if (typeof showAlertModal === "function") {
        showAlertModal("Overwrites Saved", "Target credentials variables written to registry.");
    } else if (typeof showTopRightToast === "function") {
        showTopRightToast("Overwrites Saved successfully.", "success");
    }
}

/**
 * Helper to record activity history into system database
 */
function recordDesignerActivityLog(entry) {
    if (!SYSTEM_DATABASE.activityLogs) {
        SYSTEM_DATABASE.activityLogs = [];
    }
    
    SYSTEM_DATABASE.activityLogs.push({
        id: 'LOG-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        designerUid: entry.designerUid,
        productId: entry.productId,
        productName: entry.productName,
        requesterUid: entry.requesterUid,
        requesterName: entry.requesterName,
        type: entry.type, // 'booking', 'submission', 'modification', 'approved', 'payment'
        actionText: entry.actionText,
        amountText: entry.amountText || null,
        timestamp: entry.timestamp || new Date().toISOString()
    });

    if (typeof syncPlatformDatabaseStateToWebStorage === 'function') {
        syncPlatformDatabaseStateToWebStorage();
    }
}

let CURRENT_HISTORY_FILTER = 'all';

/**
 * Main function to render Designer History Dashboard with Wallet Indicator & Badging
 */
function renderDesignerHistoryDashboard() {
    const feedContainer = document.getElementById("history-log-feed");
    const walletBalanceElem = document.getElementById("designer-wallet-balance-indicator");
    
    if (!APP_STATE.currentUser) return;

    const designerUid = APP_STATE.currentUser.uid;
    const currentDesignerUser = SYSTEM_DATABASE.users.find(u => u.uid === designerUid) || APP_STATE.currentUser;

    // Update Wallet Indicator Text
    if (walletBalanceElem) {
        const currentBalance = Number(currentDesignerUser.walletBalance || 0);
        walletBalanceElem.innerText = `₦${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    if (!feedContainer) return;
    feedContainer.innerHTML = "";

    // Fetch activity records for this specific designer
    const allLogs = (SYSTEM_DATABASE.activityLogs || []).filter(log => log.designerUid === designerUid);

    // Apply Category Filter & Search Query Filter
    const searchQuery = (APP_STATE.searchQuery || "").toLowerCase();

    const filteredLogs = allLogs.filter(log => {
        let matchesType = true;
        if (CURRENT_HISTORY_FILTER === 'payment') {
            matchesType = (log.type === 'payment' || log.type === 'approved' || log.type === 'payout');
        } else if (CURRENT_HISTORY_FILTER !== 'all') {
            matchesType = (log.type === CURRENT_HISTORY_FILTER);
        }

        if (!matchesType) return false;

        if (searchQuery) {
            const productName = (log.productName || "").toLowerCase();
            const requesterName = (log.requesterName || "").toLowerCase();
            const actionText = (log.actionText || "").toLowerCase();
            const logType = (log.type || "").toLowerCase();

            const matchesSearch = productName.includes(searchQuery) ||
                                  requesterName.includes(searchQuery) ||
                                  actionText.includes(searchQuery) ||
                                  logType.includes(searchQuery);

            if (!matchesSearch) return false;
        }

        return true;
    });

    // Sort logs descending (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (filteredLogs.length === 0) {
        feedContainer.innerHTML = `
            <div class="empty-history-state" style="text-align:center; padding: 40px; color:#64748b;">
                <h4>No activity records found.</h4>
                <p>Activity history for your project bookings, submissions, and payments will appear here.</p>
            </div>
        `;
        return;
    }

    filteredLogs.forEach(log => {
        const card = document.createElement("div");
        card.className = "history-card";

        const dateObj = new Date(log.timestamp);
        const formattedDate = dateObj.toLocaleDateString();
        const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let tagClass = "tag-booking";
        let tagLabel = "BOOKED";
        let amountStyle = "color:#059669; font-weight:700; font-size:0.9rem;";
        let amountPrefix = "+";

        if (log.type === 'submission') {
            tagClass = "tag-submission";
            tagLabel = "PROJECT SUBMISSION";
        } else if (log.type === 'modification') {
            tagClass = "tag-modification";
            tagLabel = "SUBMITTED FOR MODIFICATIONS";
        } else if (log.type === 'approved') {
            tagClass = "tag-approved";
            tagLabel = "APPROVED";
        } else if (log.type === 'payment') {
            if (log.actionText === 'Wallet Credited') {
                tagClass = "tag-payment";
                tagLabel = "WALLET CREDITED";
            } else if (log.actionText === 'Funds Payout') {
                tagClass = "tag-payout";
                tagLabel = "FUNDS PAYOUT";
                amountStyle = "color:#020b33; font-weight:700; font-size:0.9rem;";
                amountPrefix = "-";
            } else {
                tagClass = "tag-payment";
                tagLabel = "PAYMENT RECORDED";
            }
        }

        card.innerHTML = `
            <div class="history-info-left">
                <h4 class="history-project-title">${log.productName || 'System Payout Transaction'}</h4>
                <div class="history-requester-info">
                    <strong>Requester:</strong> ${log.requesterName || 'Platform Administrator'}
                </div>
                <div style="margin-top: 4px;">
                    <span class="history-badge ${tagClass}">${tagLabel}</span>
                    <span style="font-size:0.83rem; color:#64748b; margin-left:6px;">${log.actionText}</span>
                </div>
            </div>
            <div class="history-meta-right">
                <span class="history-time">${formattedDate} • ${formattedTime}</span>
                ${log.amountText ? `<span style="${amountStyle}">${amountPrefix}${log.amountText}</span>` : ''}
            </div>
        `;

        feedContainer.appendChild(card);
    });
}

function filterHistoryRecords(filterType) {
    CURRENT_HISTORY_FILTER = filterType;
    
    // Update active class on buttons
    const buttons = document.querySelectorAll('.history-filter-bar .filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }

    renderDesignerHistoryDashboard();
}


const ad1 = {
    type: 'video',
    header: 'Need a Custom Website!',
    text: 'Try Fort Developers <br>(createawebsite.fort-site.com.ng)',
    src: 'fort-advert.mp4',
    url: 'https://createawebsite.fort-site.com.ng'
};

const ad2 = {
    type: 'image',
    header: 'Need a Custom Website!',
    text: 'Try Fort Developers <br>(createawebsite.fort-site.com.ng)',
    src: 'flyer-fort-landscape.png',
    url: 'https://createawebsite.fort-site.com.ng'
};

const ads = [ad1, ad2];

function setupAdModal() {
    // Retrieve previous index from localStorage, or default to -1 if not set
    let lastIndex = parseInt(localStorage.getItem('lastAdIndex'), 10);
    if (isNaN(lastIndex)) {
        lastIndex = -1;
    }

    // Calculate next index in sequence (loops back to 0 when end is reached)
    const nextIndex = (lastIndex + 1) % ads.length;
    
    // Save current index for the next run
    localStorage.setItem('lastAdIndex', nextIndex);

    const currentAd = ads[nextIndex];

    const headerEl = document.getElementById('ad-header');
    const textEl = document.getElementById('ad-text');
    const mediaContainer = document.getElementById('ad-media-container');
    const continueBtn = document.getElementById('ad-continue-btn');
    const visitBtn = document.getElementById('ad-visit-btn');

    // Populate header, text, and visit button
    headerEl.innerText = currentAd.header;
    textEl.innerHTML = `<strong>${currentAd.text}</strong>`;
    
    if (visitBtn) {
        visitBtn.href = currentAd.url;
    }

    mediaContainer.innerHTML = '';
    
    // Open URL when clicking the container (opens in new tab)
    mediaContainer.style.cursor = 'pointer';
    mediaContainer.onclick = (e) => {
        // Prevent triggering redirect if the user interacts with video controls
        if (e.target.tagName !== 'VIDEO') {
            window.open(currentAd.url, '_blank', 'noopener,noreferrer');
        }
    };

    // Render appropriate media element
    if (currentAd.type === 'video') {
        const video = document.createElement('video');
        video.src = currentAd.src;
        video.autoplay = true;
        video.muted = true; // Required for reliable autoplay across browsers
        video.playsInline = true;
        video.controls = true;
        
        // Open URL when clicking video background without triggering play/pause controls conflict
        video.addEventListener('click', (e) => {
            // If controls area isn't being clicked directly
            e.stopPropagation();
            window.open(currentAd.url, '_blank', 'noopener,noreferrer');
        });

        mediaContainer.appendChild(video);
    } else {
        const img = document.createElement('img');
        img.src = currentAd.src;
        img.alt = currentAd.header;
        mediaContainer.appendChild(img);
    }

    // Enforce 7-second timer for ALL ad types
    continueBtn.disabled = true;
    let countdown = 7;
    continueBtn.innerText = `Continue in ${countdown}s`;

    const timer = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            continueBtn.innerText = `Continue in ${countdown}s`;
        } else {
            clearInterval(timer);
            continueBtn.disabled = false;
            continueBtn.innerText = 'Continue';
        }
    }, 1000);
}

function closeActiveModalDirectlyAd(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

window.addEventListener('DOMContentLoaded', setupAdModal);


/**
 * RENDER ADMIN BOOKED PROJECTS DISPLAY LOOP
 * Restricts access to Admin users only and renders all active booked projects.
 */
function renderAdminBookedProjectsDisplayLoop() {
    try {
        const container = document.getElementById("admin-booked-projects-grid");
        if (!container) return;

        const currentUser = (typeof APP_STATE !== 'undefined' && APP_STATE.currentUser) ? APP_STATE.currentUser : null;
        
        // Check Admin Authorization
        const isUserAdmin = currentUser && (currentUser.uid === 'admin' || currentUser.id === 'admin' || currentUser.accountType === 'admin');

        if (!isUserAdmin) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 48px 16px; background: #fff5f5; border: 2px dashed #fecaca; border-radius: 12px; margin: 20px 0;">
                    <h3 style="font-size: 18px; font-weight: 700; color: #dc2626; margin-bottom: 6px;">⛔ Access Restricted</h3>
                    <p style="font-size: 14px; color: #991b1b; margin: 0;">This page is restricted to administrators only. Please log in with an admin account to view booked projects.</p>
                </div>
            `;
            return;
        }

        if (typeof SYSTEM_DATABASE === 'undefined' || !SYSTEM_DATABASE.products) {
            window.SYSTEM_DATABASE = window.SYSTEM_DATABASE || {};
            window.SYSTEM_DATABASE.products = [];
        }

        let allProducts = [...SYSTEM_DATABASE.products];

        // STRICT FILTER: Only include BOOKED projects
        let bookedProducts = allProducts.filter(item => item.isBooked || item.status === 'booked');

        // Apply Global Search Query Filter
        const searchQuery = (typeof APP_STATE !== 'undefined' && APP_STATE.searchQuery ? APP_STATE.searchQuery : "").trim().toLowerCase();
        if (searchQuery) {
            bookedProducts = bookedProducts.filter(prod => {
                const name = (prod.name || prod.title || "").toLowerCase();
                const description = (prod.info || prod.instructions || "").toLowerCase();
                return name.includes(searchQuery) || description.includes(searchQuery);
            });
        }

        if (!bookedProducts || bookedProducts.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 48px 16px; background: #f9fafb; border: 2px dashed #e5e7eb; border-radius: 12px; margin: 20px 0;">
                    <h3 style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 6px;">No Booked Projects Found</h3>
                    <p style="font-size: 14px; color: #6b7280; margin: 0;">There are currently no projects booked by designers.</p>
                </div>
            `;
            return;
        }

        let cardsHtml = '';
        bookedProducts.forEach(prod => {
            const coverImage = prod.coverPhoto || (prod.assets && prod.assets.length > 0 ? prod.assets[0].dataUrl : 'https://via.placeholder.com/300x200?text=No+Image');
            const formattedPrice = prod.price ? `₦${prod.price.toLocaleString()}` : '₦1,000';
            const itemTitle = prod.name || prod.title || 'Untitled Project';

            cardsHtml += `
                <div class="product-card" data-pid="${prod.pid}" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background: #fff; display: flex; flex-direction: column;">
                    <div style="height: 180px; width: 100%; background: #f3f4f6; overflow: hidden; position: relative;">
                        <img src="${coverImage}" alt="${itemTitle}" style="width: 100%; height: 100%; object-fit: cover;">
                        <span style="position: absolute; top: 10px; right: 10px; background: #0284c7; color: #fff; font-size: 0.75rem; font-weight: 700; padding: 4px 8px; border-radius: 4px;">Booked</span>
                    </div>
                    <div style="padding: 16px; display: flex; flex-direction: column; flex-grow: 1;">
                        <h4 style="font-size: 16px; font-weight: 600; margin: 0 0 8px 0; color: #1e293b;">${itemTitle}</h4>
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 12px;">
                            <span style="font-size: 16px; font-weight: 700; color: #059669;">${formattedPrice}</span>
                            <button class="btn-blue" style="padding: 6px 12px; font-size: 0.82rem; font-weight: 600; cursor: pointer;" onclick="launchAdminBookedProjectDetailsModal('${prod.pid}')">View Details</button>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = cardsHtml;

    } catch (err) {
        console.error("Error in renderAdminBookedProjectsDisplayLoop:", err);
    }
}

/**
 * EXPANDED MODAL FOR BOOKED PROJECT DETAILS
 * Displays project specs alongside Requester and Designer Profiles with Manage buttons.
 */
function launchAdminBookedProjectDetailsModal(productId) {
    const targetProduct = SYSTEM_DATABASE.products.find(p => p.pid === productId);
    if (!targetProduct) return;

    // Retrieve Requester and Designer Records from Database
    const requesterRecord = SYSTEM_DATABASE.users.find(u => u.uid === targetProduct.ownerUid) || { identityName: 'Unknown Requester', uid: targetProduct.ownerUid };
    const designerRecord = SYSTEM_DATABASE.users.find(u => u.uid === targetProduct.bookedByUid) || { identityName: 'Unknown Designer', uid: targetProduct.bookedByUid };

    const detailOverlayNode = document.getElementById("product-detail-modal");
    const detailOverlayBodyNode = document.getElementById("product-detail-modal-body");

    if (!detailOverlayNode || !detailOverlayBodyNode) return;

    const fallbackAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>";
    const productDisplayImage = targetProduct.coverPhoto || fallbackAvatar;

    detailOverlayBodyNode.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e5e7eb; padding-bottom:14px;">
            <h3 style="margin: 0; font-size: 1.2rem; color: #0f172a;">Booked Project Specifications</h3>
            <button onclick="closeActiveModalDirectly('product-detail-modal')" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">✕</button>
        </div>
        
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:24px; margin-top: 16px;">
            <div>
                <div style="width:100%; height:260px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; overflow:hidden;">
                    <img src="${productDisplayImage}" style="width:100%; height:100%; object-fit:contain;" alt="${targetProduct.name}">
                </div>
                <h4 style="margin: 12px 0 4px 0; color: #1e293b;">${targetProduct.name}</h4>
                <div style="font-size:1.25rem; font-weight:800; color:#059669;">₦${targetProduct.price ? targetProduct.price.toLocaleString() : '1,000'}</div>
                <p style="font-size: 0.88rem; color: #475569; margin-top: 8px;">${targetProduct.info || 'No detailed instructions provided.'}</p>
            </div>

            <div style="display:flex; flex-direction:column; gap:16px;">
                <!-- REQUESTER SECTION -->
                <div>
                    <h5 style="text-transform:uppercase; font-size:0.75rem; color:#64748b; margin: 0 0 6px 0;">Project Requester</h5>
                    <div class="user-profile-badge-card">
                        <img src="${requesterRecord.avatar || fallbackAvatar}" class="user-profile-avatar" alt="Requester">
                        <div style="flex-grow: 1;">
                            <strong style="display:block; font-size:0.9rem; color:#0f172a;">${requesterRecord.identityName || requesterRecord.username || 'Customer'}</strong>
                            <span style="font-size:0.75rem; color:#64748b;">${requesterRecord.identifierText || 'No email registered'}</span>
                        </div>
                        <button class="btn-manage-user" onclick="launchUserManagementModal('${requesterRecord.uid}'); closeActiveModalDirectly('product-detail-modal')">Manage</button>
                    </div>
                </div>

                <!-- DESIGNER SECTION -->
                <div>
                    <h5 style="text-transform:uppercase; font-size:0.75rem; color:#64748b; margin: 0 0 6px 0;">Assigned Designer</h5>
                    <div class="user-profile-badge-card">
                        <img src="${designerRecord.avatar || fallbackAvatar}" class="user-profile-avatar" alt="Designer">
                        <div style="flex-grow: 1;">
                            <strong style="display:block; font-size:0.9rem; color:#0f172a;">${designerRecord.identityName || designerRecord.businessName || 'Designer'}</strong>
                            <span style="font-size:0.75rem; color:#64748b;">${designerRecord.identifierText || 'No email registered'}</span>
                        </div>
                        <button class="btn-manage-user" onclick="launchUserManagementModal('${designerRecord.uid}'); closeActiveModalDirectly('product-detail-modal')">Manage</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    detailOverlayNode.style.display = 'flex';
    detailOverlayNode.classList.add("active");
}

/**
 * EXPANDED USER MANAGEMENT MODAL
 * Opens full details for either the project requester or assigned designer.
 */
function launchUserManagementModal(userId) {
    const targetUser = SYSTEM_DATABASE.users.find(u => u.uid === userId);
    const modalNode = document.getElementById("user-management-modal");
    const modalBody = document.getElementById("user-management-modal-body");

    if (!modalNode || !modalBody) return;

    if (!targetUser) {
        alert("User record could not be found.");
        return;
    }

    const fallbackAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>";

    modalBody.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:12px;">
            <h3 style="margin:0; font-size:1.1rem; color:#0f172a;">User Profile Management</h3>
            <button onclick="closeActiveModalDirectly('user-management-modal')" style="background:none; border:none; font-size:1.4rem; cursor:pointer;">✕</button>
        </div>

        <div style="text-align:center; padding: 16px 0;">
            <img src="${targetUser.avatar || fallbackAvatar}" style="width:72px; height:72px; border-radius:50%; object-fit:cover; border:2px solid #2563eb;" alt="User Profile">
            <h4 style="margin: 8px 0 2px 0; color:#0f172a;">${targetUser.identityName || 'N/A'}</h4>
            <span style="font-size:0.8rem; background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:12px; font-weight:600; text-transform:capitalize;">${targetUser.accountType || 'personal'}</span>
        </div>

        <div style="background:#f8fafc; padding:12px; border-radius:8px; display:flex; flex-direction:column; gap:8px; font-size:0.85rem; color:#334155;">
            <div><strong>UID:</strong> ${targetUser.uid}</div>
            <div><strong>Email/Contact:</strong> ${targetUser.identifierText || 'N/A'}</div>
            <div><strong>Country:</strong> ${targetUser.country || 'Nigeria'}</div>
            <div><strong>Password:</strong> ${targetUser.secretKey || 'N/A'}</div>            
            <div><strong>Verification:</strong> <span style="color:${targetUser.verificationStatus === 'verified' ? 'green':'orange'}; font-weight:bold;">${targetUser.verificationStatus || 'unverified'}</span></div>
            ${targetUser.businessName ? `<div><strong>Business:</strong> ${targetUser.businessName}</div>` : ''}
        </div>

        <div style="margin-top:20px; display:flex; gap:10px;">
            <button class="btn-gray" style="flex:1;" onclick="closeActiveModalDirectly('user-management-modal')">Close</button>
        </div>
    `;

    modalNode.style.display = 'flex';
    modalNode.classList.add("active");
}

/**
 * Fort Mart Preloader and Progress Meter Controller Hook
 */
document.addEventListener("DOMContentLoaded", () => {
    const preloader = document.getElementById("preloader-container");
    const progressBar = document.getElementById("preloader-progress-bar");
    const progressText = document.getElementById("preloader-percentage-text");

    if (!preloader || !progressBar) return;

    let progress = 0;
    const duration = 3000; // Total loading screen time (3 seconds)
    const intervalTime = 30; // Update step resolution in milliseconds
    const step = (intervalTime / duration) * 100;

    const progressInterval = setInterval(() => {
        progress += step;

        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
            
            // Turn completely solid blue in its final stage
            progressBar.classList.add("fully-complete");
            progressBar.style.width = "100%";
            progressText.innerText = "Ready!";

            // Smoothly remove preloader after reaching full status
            setTimeout(() => {
                preloader.classList.add("fade-out");
                
                // Let other state machine rendering scripts safely execute after opening
                if (typeof initApplicationState === 'function') {
                    initApplicationState();
                }
            }, 400); // Tiny delay to let the user see the 100% complete state
        } else {
            progressBar.style.width = `${progress}%`;
            progressText.innerText = `Loading ${Math.floor(progress)}%`;

            // Change to complete blue within the last 1-2 seconds of loading 
            if (progress >= 66) { 
                progressBar.classList.add("fully-complete");
            }
        }
    }, intervalTime);
});


function changeNavBarValues() {
    const adminNavItem = document.getElementById("admin-nav-item");
    const adminSuiteBtn = document.getElementById("admin-add-suite-site-btn");
    const adminNavItemTwo = document.getElementById("admin-nav-item-two");
    const navItemMessages = document.getElementById("nav-item-messages");
    const myProjectDesigner = document.getElementById("nav-item-my-project-designer");

    if (adminNavItem) adminNavItem.classList.add("hidden-admin-node");
    if (adminSuiteBtn) adminSuiteBtn.classList.add("hidden-node");
    if (adminNavItemTwo) adminNavItemTwo.classList.add("hidden-node"); 
    if (navItemMessages) navItemMessages.classList.add("hidden-node");   
    if (myProjectDesigner) myProjectDesigner.classList.add("hidden-node");  
    
    triggerAuthenticationModalSequence();
}

