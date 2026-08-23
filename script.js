/**
 * Fort Graphics Core Single-Page Application State Machine Archetype
 * (Firebase Storage for Dynamic User Content + Hardcoded Local Assets for Templates)
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
    fortAiActiveTaggedProductObject: null,
    
    // Firebase Storage Tracking (Exclusively for dynamic uploads: user avatars, project assets, chat files)
    storageState: {
        isUploading: false,
        uploadProgress: 0,
        activeUploadTasks: [],
        urlCache: {} 
    }
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
    networkSuiteEntities: [],
    pinnedLeaderboard: [] // Max 20 slots containing product 'pid' strings
};

// Dynamic Firebase Storage Paths ONLY (Templates are omitted to keep them strictly local/hardcoded)
const DYNAMIC_FIREBASE_STORAGE_PATHS = {
    avatars: "user_avatars",
    projectAssets: "project_brand_assets",
    chatAttachments: "chat_media"
};

/**
 * Uploads user dynamic files (avatars, attachments, custom logos) directly to Firebase Storage.
 * TEMPLATES DO NOT USE THIS FUNCTION — Template previews and downloads remain local/hardcoded.
 */
async function uploadUserFileToFirebaseStorage(file, storageFolder = DYNAMIC_FIREBASE_STORAGE_PATHS.projectAssets) {
    if (!file) return null;
    
    try {
        const { storage, ref, uploadBytes, getDownloadURL } = window.FortMartFirebase;
        const fileExtension = file.name.split('.').pop();
        const storagePath = `${storageFolder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
        const storageRef = ref(storage, storagePath);

        APP_STATE.storageState.isUploading = true;

        const snapshot = await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);

        APP_STATE.storageState.urlCache[storagePath] = downloadUrl;
        APP_STATE.storageState.isUploading = false;

        return downloadUrl;
    } catch (error) {
        APP_STATE.storageState.isUploading = false;
        console.error("Firebase Storage Upload Error:", error);
        throw error;
    }
}

// Global scope initialization bindings
window.APP_STATE = APP_STATE;
window.SYSTEM_DATABASE = SYSTEM_DATABASE;
window.DYNAMIC_FIREBASE_STORAGE_PATHS = DYNAMIC_FIREBASE_STORAGE_PATHS;
window.uploadUserFileToFirebaseStorage = uploadUserFileToFirebaseStorage;

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
 * Persists local state to memory and LocalStorage first.
 * Does NOT call Firebase on every UI update or button click.
 */
function administrativeSaveAndRefreshDisplay(activeProductId = null) {
    // Save to local storage cache immediately (0 Firebase network requests)
    try {
        localStorage.setItem("FORT_GRAPHICS_DB_STATE", JSON.stringify(SYSTEM_DATABASE));
    } catch (error) {
        console.error("Failed to persist local state:", error);
    }
    
    // Refresh display elements instantly from in-memory array
    if (typeof renderMarketplaceProductsDisplayLoop === 'function') {
        renderMarketplaceProductsDisplayLoop();
    }
    
    // Re-render open modal views if targeted
    if (activeProductId && typeof launchComprehensiveProductSpecificationsExpandedModalView === 'function') {
        launchComprehensiveProductSpecificationsExpandedModalView(activeProductId);
    }
}

/**
 * Loads baseline system state from LocalStorage FIRST to save daily Firestore reads.
 * Only fetches from Firebase if local storage is completely empty or explicit forceFetch is true.
 * 
 * @param {boolean} forceFetch - Pass true only when user manually requests a fresh reload.
 */
async function loadPlatformDatabaseStateFromWebStorage(forceFetch = false) {
    let localDataLoaded = false;

    // 1. Try reading from LocalStorage first
    if (!forceFetch) {
        try {
            const cachedStateData = localStorage.getItem("FORT_GRAPHICS_DB_STATE");
            if (cachedStateData) {
                const parsedData = JSON.parse(cachedStateData);
                Object.assign(SYSTEM_DATABASE, parsedData);
                
                SYSTEM_DATABASE.users = SYSTEM_DATABASE.users || [];
                SYSTEM_DATABASE.products = SYSTEM_DATABASE.products || [];
                SYSTEM_DATABASE.pinnedLeaderboard = SYSTEM_DATABASE.pinnedLeaderboard || [];
                localDataLoaded = true;
            }
        } catch (error) {
            console.error("Failed to parse local storage cache:", error);
        }
    }

    // 2. Fetch from Firebase ONLY if LocalStorage is empty or a explicit reload is requested
    if (!localDataLoaded || forceFetch) {
        if (window.FortMartFirebase && window.FortMartFirebase.db) {
            try {
                const { collection, getDocs, doc, getDoc, db } = window.FortMartFirebase;

                // Single query fetch for products collection
                const projectsSnapshot = await getDocs(collection(db, "projects"));
                if (!projectsSnapshot.empty) {
                    SYSTEM_DATABASE.products = [];
                    projectsSnapshot.forEach((docSnap) => {
                        SYSTEM_DATABASE.products.push(docSnap.data());
                    });
                }

                // Single doc fetch for leaderboard configuration
                const leaderboardDoc = await getDoc(doc(db, "systemConfig", "leaderboard"));
                if (leaderboardDoc.exists() && Array.isArray(leaderboardDoc.data().pinned)) {
                    SYSTEM_DATABASE.pinnedLeaderboard = leaderboardDoc.data().pinned;
                }

                // Cache the newly fetched state into LocalStorage
                localStorage.setItem("FORT_GRAPHICS_DB_STATE", JSON.stringify(SYSTEM_DATABASE));
            } catch (firebaseError) {
                console.warn("Could not load from Firebase Firestore, retaining local state:", firebaseError);
            }
        }
    }
}

/**
 * Explicit helper to save ONLY a newly created or modified single project to Firebase
 * (Prevents writing every single database item on every UI click)
 */
async function commitSingleProjectToFirebase(projectPayload) {
    if (!projectPayload || !projectPayload.pid) return;

    // 1. Instantly append/update in local array state & local storage
    const existingIndex = SYSTEM_DATABASE.products.findIndex(p => p.pid === projectPayload.pid);
    if (existingIndex !== -1) {
        SYSTEM_DATABASE.products[existingIndex] = projectPayload;
    } else {
        SYSTEM_DATABASE.products.push(projectPayload);
    }
    administrativeSaveAndRefreshDisplay();

    // 2. Perform a single targeted write operation to Firestore
    if (window.FortMartFirebase && window.FortMartFirebase.db) {
        try {
            const { doc, setDoc, db } = window.FortMartFirebase;
            await setDoc(doc(db, "projects", projectPayload.pid), projectPayload, { merge: true });
        } catch (error) {
            console.error("Targeted Firebase save failed:", error);
        }
    }
}

// Global scope initialization bindings
window.administrativeSaveAndRefreshDisplay = administrativeSaveAndRefreshDisplay;
window.loadPlatformDatabaseStateFromWebStorage = loadPlatformDatabaseStateFromWebStorage;
window.commitSingleProjectToFirebase = commitSingleProjectToFirebase;

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
 * COMPLETE USER ACCOUNTS AUTHENTICATION FLOW SUBSYSTEM (FIREBASE + HYBRID)
 * =========================================================================
 */

/**
 * Authentication Sequence initializing via Cookies/LocalStorage with Firebase Async Lookups
 */
async function triggerAuthenticationModalSequence() {
    try {
        let savedUid = getSecureAuthCookie("fort_graphics_logged_uid");

        if (!savedUid) {
            savedUid = localStorage.getItem("fort_graphics_cookie_fallback_uid");
        }

        if (savedUid) {
            // 1. Check hardcoded local SYSTEM_DATABASE first
            let accountRecordMatch = null;
            if (typeof SYSTEM_DATABASE !== 'undefined' && Array.isArray(SYSTEM_DATABASE.users)) {
                accountRecordMatch = SYSTEM_DATABASE.users.find(u => u.uid === savedUid);
            }

            // 2. Check Firebase Firestore if not in hardcoded local memory
            if (!accountRecordMatch && window.FortMartFirebase && window.FortMartFirebase.db) {
                try {
                    const { doc, getDoc, db } = window.FortMartFirebase;
                    const userDocSnap = await getDoc(doc(db, "users", savedUid));
                    if (userDocSnap.exists()) {
                        accountRecordMatch = userDocSnap.data();
                        
                        // Sync into local SYSTEM_DATABASE memory cache
                        if (typeof SYSTEM_DATABASE !== 'undefined' && Array.isArray(SYSTEM_DATABASE.users)) {
                            SYSTEM_DATABASE.users.push(accountRecordMatch);
                        }
                    }
                } catch (fbErr) {
                    console.warn("Failed to retrieve stored user session from Firebase:", fbErr);
                }
            }

            if (accountRecordMatch) {
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

    renderSignInModalStepContentLayout();
    document.getElementById("auth-modal")?.classList.add("active");
}

/**
 * Renders the default Sign-In interface view inside the authentication modal wrapper
 */
function renderSignInModalStepContentLayout() {
    const wrapperTargetNode = document.getElementById("auth-modal-content");
    if (!wrapperTargetNode) return;

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
            <button id="btn-execute-signin" onclick="executeAccountSignInAuthenticationRequest()" class="btn-blue">Sign In</button>
        </div>
        <div class="text-center margin-top-sm" style="font-size:0.9rem;">
            <span>Don't have an account? </span><strong style="color:var(--fort-blue-light); cursor:pointer;" onclick="renderSignUpModalWizardStepOne()">Sign up</strong>
        </div>
    `;
}

/**
 * Utility helper toggling password field visibility
 */
function toggleFormPasswordFieldVisibility(checkboxElement, targetPasswordFieldId) {
    const passwordField = document.getElementById(targetPasswordFieldId);
    if (passwordField) {
        passwordField.type = checkboxElement.checked ? "text" : "password";
    }
}

/**
 * Hybrid Sign In Request: Checks Hardcoded Local Data & Firebase Firestore Users Collection
 */
async function executeAccountSignInAuthenticationRequest() {
    const countryRawValue = document.getElementById("auth-signin-country").value.split("|");
    const dialingCode = countryRawValue[1];
    const identifierInput = document.getElementById("auth-signin-identifier").value.trim().toLowerCase();
    const passwordInput = document.getElementById("auth-signin-password").value;
    const submitBtn = document.getElementById("btn-execute-signin");
    
    const errIdNode = document.getElementById("err-signin-identifier");
    const errPassNode = document.getElementById("err-signin-password");
    errIdNode.classList.add("hidden-node");
    errPassNode.classList.add("hidden-node");

    if (!identifierInput || !passwordInput) {
        errIdNode.innerText = "Please provide both email address and password.";
        errIdNode.classList.remove("hidden-node");
        return;
    }

    if (submitBtn) submitBtn.disabled = true;

    let accountRecordMatch = null;

    // 1. First check in hardcoded local SYSTEM_DATABASE
    if (typeof SYSTEM_DATABASE !== 'undefined' && Array.isArray(SYSTEM_DATABASE.users)) {
        accountRecordMatch = SYSTEM_DATABASE.users.find(u => 
            (u.dialingCode === dialingCode || !u.dialingCode) && 
            u.identifierText && u.identifierText.toLowerCase() === identifierInput
        );
    }

    // 2. If not found locally, query Firebase Firestore 'users' collection
    if (!accountRecordMatch && window.FortMartFirebase && window.FortMartFirebase.db) {
        try {
            const { collection, query, where, getDocs, db } = window.FortMartFirebase;
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("identifierText", "==", identifierInput));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const docData = querySnapshot.docs[0].data();
                accountRecordMatch = docData;

                // Sync newly authenticated user into local array memory
                if (typeof SYSTEM_DATABASE !== 'undefined' && Array.isArray(SYSTEM_DATABASE.users)) {
                    SYSTEM_DATABASE.users.push(accountRecordMatch);
                }
            }
        } catch (firebaseError) {
            console.error("Firebase Sign-In Error:", firebaseError);
        }
    }

    if (submitBtn) submitBtn.disabled = false;

    // Account missing check
    if (!accountRecordMatch) {
        errIdNode.innerText = "No registered matching account found for specified credentials.";
        errIdNode.classList.remove("hidden-node");
        return;
    }
    
    // Password validation check
    if (accountRecordMatch.secretKey !== passwordInput) {
        errPassNode.innerText = "Incorrect Password.";
        errPassNode.classList.remove("hidden-node");
        return;
    }
    
    const rememberMeChecked = document.getElementById("chk-signin-rememberme")?.checked;
    
    if (rememberMeChecked) {
        setSecureAuthCookie("fort_graphics_logged_uid", accountRecordMatch.uid, 7);
        localStorage.setItem("fort_graphics_cookie_fallback_uid", accountRecordMatch.uid);
    } else {
        setSecureAuthCookie("fort_graphics_logged_uid", accountRecordMatch.uid, null);
        localStorage.removeItem("fort_graphics_cookie_fallback_uid");
    }
    
    finalizeSuccessfulAuthenticationSequence(accountRecordMatch);
}

/**
 * Shared helper utility containing success operations and UI updates
 */
function finalizeSuccessfulAuthenticationSequence(accountRecordMatch) {
    if (typeof APP_STATE === 'undefined') {
        window.APP_STATE = {};
    }

    APP_STATE.currentUser = accountRecordMatch;
    closeActiveModalDirectly('auth-modal');
    
    const adminNavItem = document.getElementById("admin-nav-item");
    const adminSuiteBtn = document.getElementById("admin-add-suite-site-btn");
    const navItemMessages = document.getElementById("nav-item-messages");
    const myProjectDesigner = document.getElementById("nav-item-my-project-designer");
    const myProjectCustomer = document.getElementById("nav-item-my-project-personal");
    const availableProjects = document.getElementById("nav-item-home");
    const postedProjects = document.getElementById("my-products-settings-button");
    const verificationBadgeContainer = document.getElementById("user-verification-badge");
    const verificationBadge = document.getElementById("badge-status-icon");
    const verificationBadgetwo = document.getElementById("badge-status-text");
    const adminNavItemTwo = document.getElementById("admin-nav-item-two");
    const adminNavItemThree = document.getElementById("admin-nav-item-three");
    
    if (accountRecordMatch.uid === 'admin') {
        if (adminNavItem) adminNavItem.classList.remove("hidden-admin-node");
        if (adminSuiteBtn) adminSuiteBtn.classList.remove("hidden-node");
        if (adminNavItemTwo) {
            adminNavItemTwo.classList.remove("hidden-admin-node"); 
            adminNavItemTwo.classList.remove("hidden-node");
        }  
        if (adminNavItemThree) {
            adminNavItemThree.classList.remove("hidden-admin-node"); 
            adminNavItemThree.classList.remove("hidden-node");
        }                
    } else {
        if (adminNavItem) adminNavItem.classList.add("hidden-admin-node");
        if (adminSuiteBtn) adminSuiteBtn.classList.add("hidden-node");
        if (adminNavItemTwo) adminNavItemTwo.classList.add("hidden-node");       
        if (adminNavItemThree) {
            adminNavItemThree.classList.add("hidden-admin-node"); 
            adminNavItemThree.classList.add("hidden-node");
        }  
    }
    
    if (accountRecordMatch.accountType === 'business' || accountRecordMatch.uid === 'admin') {
        if (navItemMessages) {
            navItemMessages.classList.remove("hidden-admin-node");
            navItemMessages.classList.remove("hidden-node");
        }
        if (myProjectDesigner) {
            myProjectDesigner.classList.remove("hidden-admin-node");
            myProjectDesigner.classList.remove("hidden-node");
        }
        if (availableProjects) {
            availableProjects.classList.remove("hidden-admin-node");
            availableProjects.classList.remove("hidden-node");
        }
    } else {
        if (navItemMessages) navItemMessages.classList.add("hidden-admin-node");
        if (myProjectDesigner) myProjectDesigner.classList.add("hidden-admin-node");
        if (availableProjects) availableProjects.classList.add("hidden-admin-node");
    }

    if (accountRecordMatch.accountType === 'business') {
        if (myProjectCustomer) myProjectCustomer.classList.add("hidden-admin-node");
        if (postedProjects) postedProjects.classList.add("hidden-admin-node");
    } else {
        if (myProjectCustomer) myProjectCustomer.classList.remove("hidden-admin-node");
        if (postedProjects) postedProjects.classList.remove("hidden-admin-node");
    }

    if (accountRecordMatch.accountType === 'personal') {
        if (verificationBadgeContainer) verificationBadgeContainer.classList.add("hidden-admin-node");
        if (verificationBadge) verificationBadge.classList.add("hidden-admin-node");
        if (verificationBadgetwo) verificationBadgetwo.classList.add("hidden-admin-node");
    } else {
        if (verificationBadgeContainer) verificationBadgeContainer.classList.remove("hidden-admin-node");
        if (verificationBadge) verificationBadge.classList.remove("hidden-admin-node");
        if (verificationBadgetwo) verificationBadgetwo.classList.remove("hidden-admin-node");
    }

    const navUserAvatar = document.getElementById("nav-user-avatar");
    if (navUserAvatar) {
        navUserAvatar.src = accountRecordMatch.avatar ||
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>";
    }

    if (typeof syncDrawerGuestTerminalNodeToActiveUser === 'function') syncDrawerGuestTerminalNodeToActiveUser();
    if (typeof changelogoutosignupviceVersa === 'function') changelogoutosignupviceVersa();
    
    const welcomeModal = document.getElementById("welcome-modal");
    if (welcomeModal) welcomeModal.classList.add("active");
    
    if (typeof navigateToPage === 'function') {
        navigateToPage('fort-templates-section');
    }
}

// Global scope initialization
window.triggerAuthenticationModalSequence = triggerAuthenticationModalSequence;
window.executeAccountSignInAuthenticationRequest = executeAccountSignInAuthenticationRequest;
window.finalizeSuccessfulAuthenticationSequence = finalizeSuccessfulAuthenticationSequence;

/**
 * Finalizes account submission and writes user record to Firebase Firestore.
 */
async function executeFinalizeAccountRegistrationPipelineSubmission() {
    const userInputCodeField = document.getElementById("reg-otp-input");
    const feedbackElement = document.getElementById("err-reg-step4-feedback");
    const submitBtn = document.getElementById("btn-signup-finalize-submit");

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

    if (submitBtn) submitBtn.disabled = true;

    // Clean up tracking scopes
    if (SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpInterval) {
        clearInterval(SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpInterval);
        SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpInterval = null;
    }
    SIGNUP_WIZARD_TEMPORARY_OBJECT.signUpOtpSecondsLeft = 0;

    const isDesignerAccount = SIGNUP_WIZARD_TEMPORARY_OBJECT.accountType === 'business';
    
    // Evaluate Admin Email for Custom UID Mapping
    const identifier = (SIGNUP_WIZARD_TEMPORARY_OBJECT.identifierText || "").trim().toLowerCase();
    const generatedUid = (identifier === "fortdevelopers492@gmail.com") ? "admin" : ("user_" + Date.now());

    const finalNewUserRecord = {
        uid: generatedUid,
        identityName: SIGNUP_WIZARD_TEMPORARY_OBJECT.identityName,
        accountType: SIGNUP_WIZARD_TEMPORARY_OBJECT.accountType,
        country: SIGNUP_WIZARD_TEMPORARY_OBJECT.country,
        dialingCode: SIGNUP_WIZARD_TEMPORARY_OBJECT.dialingCode,
        identifierText: SIGNUP_WIZARD_TEMPORARY_OBJECT.identifierText,
        secretKey: SIGNUP_WIZARD_TEMPORARY_OBJECT.secretKey,
        avatar: SIGNUP_WIZARD_TEMPORARY_OBJECT.avatar || "", 
        verificationStatus: isDesignerAccount ? "unverified" : "verified",
        subaccountCode: isDesignerAccount ? "ACCT_DEFAULT" : "",
        UserAccountAuthenticationVerificationCode: systemExpectedValue, 
        businessName: SIGNUP_WIZARD_TEMPORARY_OBJECT.businessName || SIGNUP_WIZARD_TEMPORARY_OBJECT.identityName,
        businessInfo: SIGNUP_WIZARD_TEMPORARY_OBJECT.businessInfo || "No descriptions detailed yet.",
        productsDealtIn: SIGNUP_WIZARD_TEMPORARY_OBJECT.productsDealtIn || "",
        createdAt: new Date().toISOString()
    };
    
    // 1. Save directly to Firebase Firestore
    if (window.FortMartFirebase && window.FortMartFirebase.db) {
        try {
            const { doc, setDoc, db } = window.FortMartFirebase;
            await setDoc(doc(db, "users", generatedUid), finalNewUserRecord, { merge: true });
        } catch (firebaseError) {
            console.error("Failed to commit new user record to Firebase Firestore:", firebaseError);
        }
    }

    // 2. Append to local state array
    if (typeof SYSTEM_DATABASE !== 'undefined' && Array.isArray(SYSTEM_DATABASE.users)) {
        SYSTEM_DATABASE.users.push(finalNewUserRecord);
    }

    // 3. Mirror state to local storage fallback
    if (typeof syncPlatformDatabaseStateToWebStorage === 'function') {
        syncPlatformDatabaseStateToWebStorage();
    }
    
    closeActiveModalDirectly('auth-modal');

    if (isDesignerAccount) {
        alert("Registration submitted! Your designer account is pending administrative approval before full activation.");
    } else {
        if (typeof APP_STATE === 'undefined') window.APP_STATE = {};
        APP_STATE.currentUser = finalNewUserRecord;
        document.getElementById("welcome-modal")?.classList.add("active");
    }
    
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

    if (!rawId) {
        errorNode.innerText = "Please input your email address.";
        errorNode.classList.remove("hidden-node");
        return;
    }

    if (nextBtn) nextBtn.disabled = true;

    let accountMatch = null;

    // 1. Fetch user directly from Firebase Firestore
    if (window.FortMartFirebase && window.FortMartFirebase.db) {
        try {
            const { collection, query, where, getDocs, db } = window.FortMartFirebase;
            const usersRef = collection(db, "users");
            const q = query(
                usersRef, 
                where("identifierText", "==", rawId.toLowerCase()),
                where("dialingCode", "==", code)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                accountMatch = { uid: userDoc.id, ...userDoc.data() };
            }
        } catch (firebaseErr) {
            console.error("Error fetching user from Firestore:", firebaseErr);
        }
    }

    // 2. Fallback to local memory if not found in Firestore query
    if (!accountMatch && typeof SYSTEM_DATABASE !== 'undefined' && Array.isArray(SYSTEM_DATABASE.users)) {
        accountMatch = SYSTEM_DATABASE.users.find(u => 
            u.dialingCode === code && 
            u.identifierText.toLowerCase() === rawId.toLowerCase()
        );
    }

    if (!accountMatch) {
        errorNode.innerText = "No record matching these credentials was found.";
        errorNode.classList.remove("hidden-node");
        if (nextBtn) nextBtn.disabled = false;
        return;
    }
    
    SIGNUP_WIZARD_TEMPORARY_OBJECT.resetTargetUid = accountMatch.uid;
    SIGNUP_WIZARD_TEMPORARY_OBJECT.resetTargetEmail = accountMatch.identifierText;
    SIGNUP_WIZARD_TEMPORARY_OBJECT.resetTargetName = accountMatch.identityName || "User";

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

function initiateOtpResendCooldown() {
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
            clearInterval(SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownInterval);
            SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownInterval = null;
        }
    }, 1000);
}

function handleOtpResendActionClickInterception() {
    if (SIGNUP_WIZARD_TEMPORARY_OBJECT.otpCooldownSecondsLeft > 0) {
        return; 
    }
    sendForgotPasswordEmailJsOtpWorkflow(false);
}

function renderForgotPasswordOtpVerificationLayout() {
    const wrapperTargetNode = document.getElementById("auth-modal-content");
    const maskedTargetEmail = SIGNUP_WIZARD_TEMPORARY_OBJECT.resetTargetEmail;

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
            <button id="btn-save-new-password" onclick="executeCommitNewPasswordToSystemDatabase()" class="btn-blue">Save & Login</button>
        </div>
    `;
}

async function executeCommitNewPasswordToSystemDatabase() {
    const p1 = document.getElementById("forgot-newpass-1").value;
    const p2 = document.getElementById("forgot-newpass-2").value;
    const errorNode = document.getElementById("err-forgot-newpass-feedback");
    const saveBtn = document.getElementById("btn-save-new-password");
    
    errorNode.classList.add("hidden-node");
    
    if (p1 !== p2) {
        errorNode.innerText = "Password structural mismatch discovered checking confirmation fields string parameters.";
        errorNode.classList.remove("hidden-node");
        return;
    }
    
    if (p1.length < 6 || !/[A-Z]/.test(p1) || !/[a-z]/.test(p1) || !/[0-9]/.test(p1) || !/[^A-Za-z0-9]/.test(p1)) {
        errorNode.innerText = "Any password created should have at least one uppercase letter, one lowercase letter, one symbol, one number and should be at least six characters.";
        errorNode.classList.remove("hidden-node");
        return;
    }

    if (saveBtn) saveBtn.disabled = true;
    
    const targetUid = SIGNUP_WIZARD_TEMPORARY_OBJECT.resetTargetUid;

    // 1. Commit new password to Firebase Firestore
    if (window.FortMartFirebase && window.FortMartFirebase.db) {
        try {
            const { doc, updateDoc, db } = window.FortMartFirebase;
            await updateDoc(doc(db, "users", targetUid), {
                secretKey: p1,
                password: p1
            });
        } catch (firebaseErr) {
            console.error("Failed to commit updated password to Firebase Firestore:", firebaseErr);
        }
    }

    // 2. Update local state database array
    let updatedUser = null;
    if (typeof SYSTEM_DATABASE !== 'undefined' && Array.isArray(SYSTEM_DATABASE.users)) {
        const accountIndexId = SYSTEM_DATABASE.users.findIndex(u => u.uid === targetUid);
        if (accountIndexId !== -1) {
            SYSTEM_DATABASE.users[accountIndexId].secretKey = p1;
            SYSTEM_DATABASE.users[accountIndexId].password = p1;
            updatedUser = SYSTEM_DATABASE.users[accountIndexId];
        }
    }

    if (!updatedUser) {
        updatedUser = {
            uid: targetUid,
            identifierText: SIGNUP_WIZARD_TEMPORARY_OBJECT.resetTargetEmail,
            identityName: SIGNUP_WIZARD_TEMPORARY_OBJECT.resetTargetName,
            secretKey: p1,
            password: p1
        };
    }

    // 3. Set session state & UI navigation
    if (typeof APP_STATE === 'undefined') window.APP_STATE = {};
    APP_STATE.currentUser = updatedUser;

    if (typeof syncPlatformDatabaseStateToWebStorage === 'function') {
        syncPlatformDatabaseStateToWebStorage();
    }

    closeActiveModalDirectly('auth-modal');
    
    const welcomeModalNode = document.getElementById("welcome-modal");
    if (welcomeModalNode) welcomeModalNode.classList.add("active");

    if (typeof navigateToPage === "function") {
        navigateToPage('fort-templates-section');
    }

    SIGNUP_WIZARD_TEMPORARY_OBJECT = {};
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
 * Fetches products and leaderboard state from Firebase Firestore,
 * then excludes completed/downloaded projects AND currently booked projects
 * so only unbooked, active projects appear in the public marketplace.
 */
async function renderMarketplaceProductsDisplayLoop() {
    try {
        const container = document.getElementById("products-display-grid") || 
                          (typeof DOM_ELEMENT_REFERENCES !== 'undefined' ? DOM_ELEMENT_REFERENCES.productsContainer : null);

        if (!container) return;

        if (typeof SYSTEM_DATABASE === 'undefined') {
            window.SYSTEM_DATABASE = {};
        }

        // --- 1. FETCH PRODUCTS/PROJECTS FROM FIREBASE FIRESTORE ---
        if (window.FortMartFirebase && window.FortMartFirebase.db) {
            try {
                const { collection, getDocs, db } = window.FortMartFirebase;
                const productsRef = collection(db, "products");
                const snapshot = await getDocs(productsRef);
                
                const fetchedProducts = [];
                snapshot.forEach(docSnap => {
                    fetchedProducts.push({ pid: docSnap.id, ...docSnap.data() });
                });
                
                SYSTEM_DATABASE.products = fetchedProducts;
            } catch (fbProdErr) {
                console.error("Failed to fetch products from Firebase Firestore:", fbProdErr);
            }
        }

        if (!SYSTEM_DATABASE.products) {
            SYSTEM_DATABASE.products = [];
        }

        // --- 2. FETCH LEADERBOARD DATA FROM FIREBASE FIRESTORE ---
        if (window.FortMartFirebase && window.FortMartFirebase.db) {
            try {
                const { collection, getDocs, db } = window.FortMartFirebase;
                const leaderboardRef = collection(db, "leaderboard");
                const snapshot = await getDocs(leaderboardRef);

                let updatedPinnedLeaderboard = Array(20).fill(null);
                
                snapshot.forEach(docSnap => {
                    const data = docSnap.data();
                    const slotIndex = parseInt(docSnap.id, 10);
                    
                    if (docSnap.id === "adminSlot" || data.isAdminOverride) {
                        SYSTEM_DATABASE.adminSlot = { slotId: docSnap.id, ...data };
                    } else if (!isNaN(slotIndex) && slotIndex >= 0 && slotIndex < 20) {
                        updatedPinnedLeaderboard[slotIndex] = { slotId: docSnap.id, ...data };
                    }
                });

                SYSTEM_DATABASE.pinnedLeaderboard = updatedPinnedLeaderboard;
            } catch (fbBoardErr) {
                console.error("Failed to fetch leaderboard data from Firebase Firestore:", fbBoardErr);
            }
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
 * Asynchronously fetches target product, owner profile, and leaderboard from Firebase.
 */
async function launchComprehensiveProductSpecificationsExpandedModalView(evt, productIdTokenKey) {
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

    if (typeof SYSTEM_DATABASE === 'undefined') {
        window.SYSTEM_DATABASE = {};
    }
    if (!SYSTEM_DATABASE.products) SYSTEM_DATABASE.products = [];
    if (!SYSTEM_DATABASE.users) SYSTEM_DATABASE.users = [];

    let targetedProductItemMatch = SYSTEM_DATABASE.products.find(p => p.pid === productIdTokenKey);
    
    // --- 1. FETCH TARGET PRODUCT FROM FIREBASE FIRESTORE ---
    if (window.FortMartFirebase && window.FortMartFirebase.db) {
        try {
            const { doc, getDoc, db } = window.FortMartFirebase;
            const productDocRef = doc(db, "products", productIdTokenKey);
            const productSnap = await getDoc(productDocRef);

            if (productSnap.exists()) {
                const fetchedData = { pid: productSnap.id, ...productSnap.data() };
                const existingIdx = SYSTEM_DATABASE.products.findIndex(p => p.pid === productIdTokenKey);
                if (existingIdx !== -1) {
                    SYSTEM_DATABASE.products[existingIdx] = fetchedData;
                } else {
                    SYSTEM_DATABASE.products.push(fetchedData);
                }
                targetedProductItemMatch = fetchedData;
            }
        } catch (fbProdErr) {
            console.error("Error fetching product from Firebase Firestore:", fbProdErr);
        }
    }

    if (!targetedProductItemMatch) return;

    // --- 2. FETCH PROJECT OWNER PROFILE FROM FIREBASE FIRESTORE ---
    let operationalTargetProfileOwnerRecord = SYSTEM_DATABASE.users.find(u => u.uid === targetedProductItemMatch.ownerUid);

    if (!operationalTargetProfileOwnerRecord && targetedProductItemMatch.ownerUid && window.FortMartFirebase && window.FortMartFirebase.db) {
        try {
            const { doc, getDoc, db } = window.FortMartFirebase;
            const userDocRef = doc(db, "users", targetedProductItemMatch.ownerUid);
            const userSnap = await getDoc(userDocRef);

            if (userSnap.exists()) {
                operationalTargetProfileOwnerRecord = { uid: userSnap.id, ...userSnap.data() };
                SYSTEM_DATABASE.users.push(operationalTargetProfileOwnerRecord);
            }
        } catch (fbUserErr) {
            console.error("Error fetching product owner profile from Firebase Firestore:", fbUserErr);
        }
    }

    // --- 3. FETCH LEADERBOARD INFO FROM FIREBASE FIRESTORE ---
    if (window.FortMartFirebase && window.FortMartFirebase.db) {
        try {
            const { collection, getDocs, db } = window.FortMartFirebase;
            const leaderboardRef = collection(db, "leaderboard");
            const lbSnapshot = await getDocs(leaderboardRef);

            let updatedPinnedLeaderboard = Array(20).fill(null);
            SYSTEM_DATABASE.adminSlot = null;

            lbSnapshot.forEach(docSnap => {
                const data = docSnap.data();
                const slotIndex = parseInt(docSnap.id, 10);
                
                if (docSnap.id === "adminSlot" || data.isAdminOverride) {
                    SYSTEM_DATABASE.adminSlot = data.pid || docSnap.id;
                } else if (!isNaN(slotIndex) && slotIndex >= 0 && slotIndex < 20) {
                    updatedPinnedLeaderboard[slotIndex] = data.pid || docSnap.id;
                }
            });

            SYSTEM_DATABASE.pinnedLeaderboard = updatedPinnedLeaderboard;
        } catch (fbBoardErr) {
            console.error("Error fetching leaderboard data from Firebase Firestore:", fbBoardErr);
        }
    }
    
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
                
                <h2 style="color:var(--fort-blue-dark, #1e3a8a); font-weight:800; margin-top:8px; margin-bottom:0;">${targetedProductItemMatch.name || targetedProductItemMatch.title || 'Untitled Project'}</h2>
                <div style="font-size:1.6rem; font-weight:900; color:var(--fort-blue-light, #3b82f6);">${baselineCurrencySymbolSign}${targetedProductItemMatch.price ? targetedProductItemMatch.price.toLocaleString() : '1,000'}</div>
                
                <div class="spec-note-paragraph-block">
                    <h5 style="text-transform:uppercase; font-size:0.75rem; letter-spacing:1px; color:var(--fort-gray-slate, #64748b);">Customer Design Prompts & Instructions</h5>
                    <p style="font-size:0.95rem; line-height:1.4; color:var(--fort-blue-dark, #1e3a8a); margin-top:4px;">${targetedProductItemMatch.info || targetedProductItemMatch.instructions || 'No details specified.'}</p>
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
/**
 * 2. BOOK PROJECT WORKFLOW & PASSWORD VERIFICATION
 */
async function executeBookProjectWorkflow(productId) {
    const currentUser = APP_STATE.currentUser;
    if (!currentUser) {
        showTopRightToast("Please log in to book projects.", "info");
        return;
    }

    // Account Role & Status Checks
    const userRole = currentUser.accountType || currentUser.type;
    if (userRole !== 'designer' && userRole !== 'business') {
        showTopRightToast("Only registered designer accounts can book projects.", "error");
        return;
    }

    const currentStatus = currentUser.verificationStatus || currentUser.status;
    if (currentStatus === 'unverified' || currentUser.approvalStatus === 'unapproved') {
        showTopRightToast("Your designer account is pending approval by the admin.", "error");
        return;
    }

    try {
        const { collection, query, where, getDocs, db } = window.FortMartFirebase;

        // Fetch active booked projects from Firebase to enforce maximum limit
        const activeProjectsQuery = query(
            collection(db, "projects"),
            where("bookedByUid", "==", currentUser.uid),
            where("status", "==", "booked")
        );
        const activeSnap = await getDocs(activeProjectsQuery);

        if (activeSnap.size >= 2) {
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
                    <button class="btn-blue" id="confirm-booking-btn" onclick="processVerifyPasswordAndConfirmBooking('${productId}')">Confirm Booking</button>
                </div>
            </div>
        `;

        document.body.appendChild(pwdModal);

    } catch (error) {
        console.error("Error verifying active bookings in Firebase:", error);
        showTopRightToast("Failed to verify active bookings. Please try again.", "error");
    }
}

async function processVerifyPasswordAndConfirmBooking(productId) {
    const pwdInput = document.getElementById("book-pwd-input");
    const errFeedback = document.getElementById("book-pwd-error");
    const confirmBtn = document.getElementById("confirm-booking-btn");
    const enteredPassword = pwdInput ? pwdInput.value.trim() : "";

    const currentUser = APP_STATE.currentUser || {};
    const actualSecret = currentUser.secretKey || currentUser.password || "";

    if (!enteredPassword || enteredPassword !== actualSecret) {
        if (errFeedback) {
            errFeedback.innerText = "Invalid password. Access denied.";
            errFeedback.style.display = "block";
        }
        return;
    }

    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerText = "Processing...";
    }

    try {
        const { doc, getDoc, updateDoc, setDoc, db } = window.FortMartFirebase;

        // 1. Resolve Document Reference (Check 'projects' then 'products')
        let targetCollection = "projects";
        let projectDocRef = doc(db, targetCollection, productId);
        let projectSnap = await getDoc(projectDocRef);

        if (!projectSnap.exists()) {
            targetCollection = "products";
            projectDocRef = doc(db, targetCollection, productId);
            projectSnap = await getDoc(projectDocRef);
        }

        if (!projectSnap.exists()) {
            if (errFeedback) {
                errFeedback.innerText = "Project/Product not found in database.";
                errFeedback.style.display = "block";
            }
            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.innerText = "Confirm Booking";
            }
            return;
        }

        const projectData = projectSnap.data();

        if (projectData.isBooked || projectData.status === 'booked') {
            alert("This project has already been booked by another designer.");
            document.getElementById("book-project-pwd-modal")?.remove();
            return;
        }

        const timestamp = new Date().toISOString();
        const logId = "LOG_" + Date.now();

        // 2. Update status in Firestore
        const updatePayload = {
            isBooked: true,
            status: 'booked',
            bookedByUid: currentUser.uid,
            bookedByEmail: currentUser.email || '',
            bookedByName: currentUser.displayName || currentUser.username || 'Designer',
            bookedAt: timestamp,
            updatedAt: timestamp
        };

        await updateDoc(projectDocRef, updatePayload);

        // 3. Update local APP_STATE cache if present
        if (Array.isArray(APP_STATE.projects)) {
            const cachedIdx = APP_STATE.projects.findIndex(p => p.id === productId);
            if (cachedIdx !== -1) {
                APP_STATE.projects[cachedIdx] = { ...APP_STATE.projects[cachedIdx], ...updatePayload };
            }
        }

        // 4. Fetch owner profile details for logging
        let requesterName = "Customer";
        const ownerUid = projectData.ownerUid || projectData.userId || projectData.uid;
        if (ownerUid) {
            const ownerSnap = await getDoc(doc(db, "users", ownerUid));
            if (ownerSnap.exists()) {
                const ownerData = ownerSnap.data();
                requesterName = ownerData.identityName || ownerData.businessName || ownerData.username || "Customer";
            }
        }

        // 5. Create Activity Log in 'activityLogs' collection
        const logPayload = {
            logId: logId,
            designerUid: currentUser.uid,
            productId: productId,
            productName: projectData.name || projectData.title || "Design Project",
            requesterUid: ownerUid || "unknown_owner",
            requesterName: requesterName,
            type: 'booking',
            actionText: 'Project booked by designer',
            timestamp: timestamp
        };

        await setDoc(doc(db, "activityLogs", logId), logPayload);

        // 6. UI Clean up & Navigation
        document.getElementById("book-project-pwd-modal")?.remove();

        if (typeof closeActiveModalDirectly === 'function') {
            closeActiveModalDirectly('product-detail-modal');
        }

        if (typeof showTopRightToast === 'function') {
            showTopRightToast("Project booked successfully! Moved to My Projects.", "success");
        } else {
            alert("Project booked successfully! Moved to My Projects.");
        }

        if (typeof renderDesignerProjects === 'function') {
            renderDesignerProjects();
        }

        if (typeof navigateToPage === 'function') {
            navigateToPage('designer-projects');
        }

    } catch (error) {
        console.error("Failed to commit project booking to Firebase:", error);
        if (errFeedback) {
            errFeedback.innerText = "Database update failed. Please try again.";
            errFeedback.style.display = "block";
        }
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerText = "Confirm Booking";
        }
    }
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
        } else if (typeof showTopRightToast === 'function') {
            showTopRightToast("Please log in to continue.", "error");
        } else {
            alert("Please log in to continue.");
        }
        return;
    }
    
    if (APP_STATE.currentUser.accountType !== 'personal' && APP_STATE.currentUser.uid !== 'admin') {
        if (typeof launchadvertismentofBusinessUpgrade === 'function') {
            launchadvertismentofBusinessUpgrade();
        } else {
            if (typeof showTopRightToast === 'function') {
                showTopRightToast("Designers can't place project requests", "info");
            }
        }
        return;
    }
    
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
    
    window.UPLOADED_ASSET_IMAGES = [];
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
            <input type="number" id="newprod-price" class="form-field-control" placeholder="Enter numeric base rate configuration" value="1500" disabled>
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

    renderAssetsPreviewGrid();
}

/**
 * Render uploaded image thumbnails with no max limit and an 'Add' (+) button
 */
function renderAssetsPreviewGrid() {
    const grid = document.getElementById("assets-preview-grid");
    if (!grid) return;

    let html = "";
    if (!window.UPLOADED_ASSET_IMAGES) window.UPLOADED_ASSET_IMAGES = [];

    window.UPLOADED_ASSET_IMAGES.forEach((asset, index) => {
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

    html += `
        <button type="button" class="asset-add-square-btn" onclick="openFileUploadModal()" style="width: 70px; height: 70px; border-radius: 6px; border: 2px dashed #09a5db; background: #f4faff; color: #09a5db; font-size: 26px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s;" title="Add Image Asset">
            +
        </button>
    `;

    grid.innerHTML = html;
}

function removeAssetImageFromGrid(index) {
    if (window.UPLOADED_ASSET_IMAGES) {
        window.UPLOADED_ASSET_IMAGES.splice(index, 1);
    }
    renderAssetsPreviewGrid();
}

function openFileUploadModal() {
    window.TEMP_SELECTED_ASSET_FILE = null;

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

function closeFileUploadModal() {
    document.getElementById("file-upload-modal")?.remove();
    window.TEMP_SELECTED_ASSET_FILE = null;
}

function handleAssetFileSelection(event) {
    const file = event.target.files[0];
    const errDiv = document.getElementById("asset-upload-error");
    if (errDiv) errDiv.style.display = "none";

    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const dataUrl = e.target.result;
        window.TEMP_SELECTED_ASSET_FILE = {
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

function confirmAddAssetImage() {
    const errDiv = document.getElementById("asset-upload-error");
    const nameInput = document.getElementById("asset-custom-name");
    const customName = nameInput ? nameInput.value.trim() : "";

    if (!window.TEMP_SELECTED_ASSET_FILE) {
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

    if (!window.UPLOADED_ASSET_IMAGES) window.UPLOADED_ASSET_IMAGES = [];

    window.UPLOADED_ASSET_IMAGES.push({
        id: "asset_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        name: customName,
        fileName: window.TEMP_SELECTED_ASSET_FILE.file.name,
        dataUrl: window.TEMP_SELECTED_ASSET_FILE.dataUrl
    });

    renderAssetsPreviewGrid();
    closeFileUploadModal();
}

/**
 * Commits the new inventory product post record directly to Firebase Firestore ('products' collection)
 */
function executePipelineCommitNewInventoryPostRecord() {
    try {
        const publishBtn = document.getElementById("btn-publish-post");
        const titleInput = document.getElementById("proj-new-title");
        const infoInput = document.getElementById("newprod-info");
        const priceInput = document.getElementById("newprod-price");

        const title = titleInput ? titleInput.value.trim() : "";
        const info = infoInput ? infoInput.value.trim() : "";
        const price = priceInput ? parseFloat(priceInput.value) || 1500 : 1500;

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

        const currentUser = APP_STATE.currentUser;
        const userEmail = currentUser.identifierText || currentUser.email || "customer@fortmart.com";

        if (typeof PaystackPop === 'undefined') {
            alert("Paystack SDK failed to load. Please check your internet connection.");
            return;
        }

        if (publishBtn) {
            publishBtn.disabled = true;
            publishBtn.innerText = "Processing Payment...";
        }

        const handler = PaystackPop.setup({
            key: 'pk_test_8e350f62114983f1cd23b0944668d435a6e74214',
            email: userEmail,
            amount: price * 100,
            currency: "NGN",
            callback: async function(response) {
                try {
                    const userUid = currentUser.uid || currentUser.id || "guest_user";
                    const userCountry = currentUser.country || 'Nigeria';
                    const assets = window.UPLOADED_ASSET_IMAGES || [];
                    const firstAssetCover = assets.length > 0 ? assets[0].dataUrl : '';
                    const timestamp = new Date().toISOString();
                    const projectId = "prod_" + Date.now();

                    const newProductPostPayload = {
                        pid: projectId,
                        ownerUid: userUid,
                        name: title,
                        title: title,
                        info: info,
                        instructions: info,
                        price: price,
                        countryScope: userCountry,
                        coverPhoto: firstAssetCover,
                        assets: [...assets],
                        paystackRef: response.reference,
                        createdAt: timestamp,
                        updatedAt: timestamp
                    };

                    // Save directly to Firebase Firestore 'products' collection
                    const { doc, setDoc, db } = window.FortMartFirebase;
                    await setDoc(doc(db, "products", projectId), newProductPostPayload);

                    if (typeof showTopRightToast === 'function') {
                        showTopRightToast("Payment complete! Active post published successfully.", "success");
                    } else {
                        alert("Payment complete! Active post published successfully.");
                    }
                } catch (dataErr) {
                    console.error("Error committing product post record to Firebase:", dataErr);
                    alert("Payment succeeded, but error saving project to database: " + dataErr.message);
                } finally {
                    window.UPLOADED_ASSET_IMAGES = [];
                    if (typeof closeActiveModalDirectly === 'function') {
                        closeActiveModalDirectly('auth-modal');
                    }

                    if (publishBtn) {
                        publishBtn.disabled = false;
                        publishBtn.innerText = "Publish Active Post";
                    }

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

    if (!window.DESIGN_REQUEST_WIZARD) window.DESIGN_REQUEST_WIZARD = {};

    window.DESIGN_REQUEST_WIZARD.requestPayload = {
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

    document.getElementById("request-password-modal")?.remove();
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
    const remainingBalance = 1000;

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
                        Note: There is a remaining balance of ₦${remainingBalance.toLocaleString()} naira.
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
            target_designer: window.DESIGN_REQUEST_WIZARD?.targetDesignerUid || "general"
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
 * Step 5: Post-Payment Operations — Saves directly to Firestore 'products' collection
 */
async function processDesignRequestPostPaymentSuccess(paymentResponse) {
    try {
        const currentUser = APP_STATE.currentUser || {};
        const userUid = currentUser.uid || currentUser.id || "guest_user";
        const userCountry = currentUser.country || "Nigeria";
        const requestPayload = window.DESIGN_REQUEST_WIZARD?.requestPayload || {};
        const detailsText = requestPayload.details || "Custom Design Project Request";
        const timestamp = new Date().toISOString();
        const projectId = "prod_" + Date.now();

        const amountPaid = 500;
        const remainingBalance = 1000;
        const totalPrice = amountPaid + remainingBalance; // 1500

        const newProductPostPayload = {
            pid: projectId,
            ownerUid: userUid,
            name: detailsText,
            title: detailsText,
            info: detailsText,
            instructions: detailsText,
            price: totalPrice,
            amountPaid: amountPaid,
            remainingBalance: remainingBalance,
            countryScope: userCountry,
            coverPhoto: "",
            assets: [],
            paystackRef: paymentResponse.reference,
            targetDesignerUid: window.DESIGN_REQUEST_WIZARD?.targetDesignerUid || null,
            status: "submitted",
            createdAt: timestamp,
            updatedAt: timestamp
        };

        // Write directly to Firebase Firestore 'products' collection
        if (window.FortMartFirebase && window.FortMartFirebase.db) {
            const { doc, setDoc, db } = window.FortMartFirebase;
            await setDoc(doc(db, "products", projectId), newProductPostPayload);
        }

        if (typeof showTopRightToast === 'function') {
            showTopRightToast("Payment successful! Your design request has been created.", "success");
        } else {
            alert("Payment successful! Your design request has been created.");
        }
    } catch (err) {
        console.error("Error committing project request to Firestore:", err);
        alert("Payment succeeded, but an error occurred while creating project: " + err.message);
    } finally {
        if (window.DESIGN_REQUEST_WIZARD) {
            window.DESIGN_REQUEST_WIZARD.requestPayload = null;
            window.DESIGN_REQUEST_WIZARD.targetDesignerUid = null;
        }

        setTimeout(() => {
            if (typeof renderMarketplaceProductsDisplayLoop === 'function') {
                renderMarketplaceProductsDisplayLoop();
            }
        }, 100);
    }
}

// Global Scope Exports
window.handleFloatingActionButtonTrigger = handleFloatingActionButtonTrigger;
window.launchUploadProductPasswordVerificationStep = launchUploadProductPasswordVerificationStep;
window.verifyPasswordAndProceed = verifyPasswordAndProceed;
window.launchUploadProductInventoryModalFormLayoutShell = launchUploadProductInventoryModalFormLayoutShell;
window.renderAssetsPreviewGrid = renderAssetsPreviewGrid;
window.removeAssetImageFromGrid = removeAssetImageFromGrid;
window.openFileUploadModal = openFileUploadModal;
window.closeFileUploadModal = closeFileUploadModal;
window.handleAssetFileSelection = handleAssetFileSelection;
window.confirmAddAssetImage = confirmAddAssetImage;
window.executePipelineCommitNewInventoryPostRecord = executePipelineCommitNewInventoryPostRecord;

window.handleRequestSubmissionPrecheck = handleRequestSubmissionPrecheck;
window.initiateRequestPasswordModal = initiateRequestPasswordModal;
window.validateRequestPasswordAndProceed = validateRequestPasswordAndProceed;
window.launchDesignRequestPaystackConfirmationModal = launchDesignRequestPaystackConfirmationModal;
window.executeRequestPaystackIframePopRuntime = executeRequestPaystackIframePopRuntime;
window.processDesignRequestPostPaymentSuccess = processDesignRequestPostPaymentSuccess;

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

/**
 * Fetches latest user details from Firestore 'users' collection and populates profile UI fields.
 */
async function initializeProfileDetailsAccountManagementFieldsValues() {
    if (!APP_STATE.currentUser || !APP_STATE.currentUser.uid) return;

    let userData = APP_STATE.currentUser;

    // 1. Fetch fresh user data directly from Firebase Firestore 'users' collection
    if (window.FortMartFirebase && window.FortMartFirebase.db) {
        try {
            const { doc, getDoc, db } = window.FortMartFirebase;
            const userDocRef = doc(db, "users", APP_STATE.currentUser.uid);
            const userSnap = await getDoc(userDocRef);

            if (userSnap.exists()) {
                userData = { id: userSnap.id, ...userSnap.data() };
                
                // Sync updated Firestore record back to client runtime state
                APP_STATE.currentUser = { ...APP_STATE.currentUser, ...userData };
            }
        } catch (error) {
            console.error("Failed to fetch fresh user details from Firestore:", error);
            // Fallback continues using existing APP_STATE.currentUser cached state
        }
    }

    const globalDefaultVectorAvatarURI = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230288d1'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>";
    const operationalActiveAvatarImageSrc = userData.avatar || globalDefaultVectorAvatarURI;

    // 2. Update Profile Image
    const profilePaneAvatarNodeFrame = document.getElementById("profile-pane-avatar-display");
    if (profilePaneAvatarNodeFrame) {
        profilePaneAvatarNodeFrame.src = operationalActiveAvatarImageSrc;
    }

    // 3. Update Navbar Avatar
    const navUserAvatarNodeFrame = document.getElementById("nav-user-avatar");
    if (navUserAvatarNodeFrame) {
        navUserAvatarNodeFrame.src = operationalActiveAvatarImageSrc;
    }

    // 4. Update Drawer Avatar
    const drawerUserAvatarNodeFrame = document.getElementById("drawer-user-avatar");
    if (drawerUserAvatarNodeFrame) {
        drawerUserAvatarNodeFrame.src = operationalActiveAvatarImageSrc;
    }

    // 5. Update Verification Badge
    const badgeContainer = document.getElementById("user-verification-badge");
    const badgeText = document.getElementById("badge-status-text");
    const badgeIcon = document.getElementById("badge-status-icon");

    const status = userData.verificationStatus || userData.status || "unverified";
    if (badgeContainer && badgeText && badgeIcon) {
        if (status === "verified") {
            badgeContainer.className = "verification-badge-pill status-verified";
            badgeIcon.textContent = "✓";
            badgeText.textContent = "Verified";
        } else {
            badgeContainer.className = "verification-badge-pill status-unverified";
            badgeIcon.textContent = "⏳";
            badgeText.textContent = "Pending Approval";
        }
    }

    // 6. Update Profile Labels
    const usernameElem = document.getElementById("txt-profile-username-val");
    if (usernameElem) {
        usernameElem.innerText = userData.identityName || "N/A";
    }

    const bizFieldsNodeWrapper = document.getElementById("business-profile-only-fields"); 
    if (bizFieldsNodeWrapper) {
        if (userData.accountType === 'business' || userData.uid === 'admin') { 
            bizFieldsNodeWrapper.classList.remove("hidden-node");

            const busNameElem = document.getElementById("txt-profile-busname-val");
            if (busNameElem) {
                busNameElem.innerText = userData.businessName || userData.identityName || "N/A";
            }

            const busInfoElem = document.getElementById("txt-profile-businfo-val");
            if (busInfoElem) {
                busInfoElem.innerText = userData.businessInfo || "No descriptions detailed yet.";
            }
        } else {
            bizFieldsNodeWrapper.classList.add("hidden-node");
        }
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
    
    document.getElementById("auth-modal").classList.add("active");
}

function executeVerifyProfileReauthCredentialPasswordMatch(targetFieldNameStringTokenKey) {
    const enteredPasswordValue = document.getElementById("profile-reauth-key").value;
    const errorDisplayNode = document.getElementById("err-profile-reauth-msg");
    
    errorDisplayNode.classList.add("hidden-node");
    if (enteredPasswordValue !== APP_STATE.currentUser.secretKey && enteredPasswordValue !== APP_STATE.currentUser.password) {
        errorDisplayNode.innerText = "Incorrect Password";
        errorDisplayNode.classList.remove("hidden-node");
        return;
    }
    
    sendProfileEditWizardEmailJsOtpWorkflow(targetFieldNameStringTokenKey, true);
}

async function sendProfileEditWizardEmailJsOtpWorkflow(targetFieldNameStringTokenKey, isInitialLaunch = false) {
    const targetEmail = APP_STATE.currentUser.identifierText || APP_STATE.currentUser.email;
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
    const targetEmail = APP_STATE.currentUser.identifierText || APP_STATE.currentUser.email;
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

    if (targetFieldNameStringTokenKey === 'secretKey' || targetFieldNameStringTokenKey === 'password') {
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
    } else if (targetFieldNameStringTokenKey === 'avatar') {
        inputFieldTypeLayoutPlaceholderHTML = `
            <div class="form-input-container margin-top-sm">
                <label>Upload New Profile Picture (Image File):</label>
                <input type="file" id="profile-avatar-file-input" accept="image/*" class="form-field-control" onchange="handleProfileAvatarFileSelect(this)">
                <input type="hidden" id="profile-new-value-1" value="${APP_STATE.currentUser.avatar || ''}">
                <div style="margin-top: 10px; text-align: center;">
                    <img id="avatar-preview-img-target" src="${APP_STATE.currentUser.avatar || ''}" style="max-width: 100px; max-height: 100px; border-radius: 50%; object-fit: cover; border: 2px solid var(--fort-blue-light, #0288d1);" alt="Preview">
                </div>
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
            <button id="btn-save-profile-mod" onclick="executeSaveProfileWizardModificationsToDatabase('${targetFieldNameStringTokenKey}')" class="btn-blue">Save Changes</button>
        </div>
    `;
}

function handleProfileAvatarFileSelect(fileInput) {
    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const base64Image = e.target.result;
            document.getElementById("profile-new-value-1").value = base64Image;
            const previewImg = document.getElementById("avatar-preview-img-target");
            if (previewImg) previewImg.src = base64Image;
        };
        reader.readAsDataURL(fileInput.files[0]);
    }
}

/**
 * Commits modifications to Firestore, updates local storage, shows confirmation, and forces a page reload.
 */
async function executeSaveProfileWizardModificationsToDatabase(targetFieldNameStringTokenKey) {
    const val1 = document.getElementById("profile-new-value-1").value.trim();
    const errorNode = document.getElementById("err-profile-step3-feedback");
    const saveBtn = document.getElementById("btn-save-profile-mod");

    errorNode.classList.add("hidden-node");

    if (!val1) {
        errorNode.innerText = "Structural modifications field expression cannot post blank spaces updates tokens.";
        errorNode.classList.remove("hidden-node");
        return;
    }

    if (targetFieldNameStringTokenKey === 'secretKey' || targetFieldNameStringTokenKey === 'password') {
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

    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerText = "Saving...";
    }

    try {
        const updatePayload = {};

        if (targetFieldNameStringTokenKey === 'secretKey' || targetFieldNameStringTokenKey === 'password') {
            updatePayload.secretKey = val1;
            updatePayload.password = val1;
        } else {
            updatePayload[targetFieldNameStringTokenKey] = val1;
        }

        // 1. Overwrite user document directly in Firebase Firestore
        if (window.FortMartFirebase && window.FortMartFirebase.db && APP_STATE.currentUser && APP_STATE.currentUser.uid) {
            const { doc, updateDoc, setDoc, db } = window.FortMartFirebase;
            const userDocRef = doc(db, "users", APP_STATE.currentUser.uid);

            if (typeof updateDoc === "function") {
                await updateDoc(userDocRef, updatePayload);
            } else if (typeof setDoc === "function") {
                await setDoc(userDocRef, updatePayload, { merge: true });
            }
        }

        // 2. Synchronize local in-memory database
        const targetedUserIndexId = SYSTEM_DATABASE.users.findIndex(u => u.uid === APP_STATE.currentUser.uid);
        if (targetedUserIndexId !== -1) {
            Object.assign(SYSTEM_DATABASE.users[targetedUserIndexId], updatePayload);
        }

        // 3. Update active currentUser runtime state
        Object.assign(APP_STATE.currentUser, updatePayload);

        // 4. Log telemetry notification message
        const automatedTelemetryLogEntryNotificationNodeValue = {
            mid: "telemetry_" + Date.now(),
            senderUid: "admin",
            text: `[Profile Edit Notification]: Security credential variables field pointer parameter "${targetFieldNameStringTokenKey}" value updated successfully.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        
        let existingSystemAdminThreadNodePointerIndex = SYSTEM_DATABASE.chats.find(c => 
            c.dynamicParticipants && c.dynamicParticipants.includes(APP_STATE.currentUser.uid) && c.dynamicParticipants.includes("admin")
        );
        if (existingSystemAdminThreadNodePointerIndex) {
            existingSystemAdminThreadNodePointerIndex.messageLog.push(automatedTelemetryLogEntryNotificationNodeValue);
        }

        // 5. Persist state to WebStorage (localStorage/sessionStorage)
        if (typeof syncPlatformDatabaseStateToWebStorage === "function") {
            syncPlatformDatabaseStateToWebStorage();
        }

        closeActiveModalDirectly('auth-modal');

        if (typeof showTopRightToast === "function") {
            showTopRightToast("Changes saved successfully. Reloading...", "success");
        }

        // 6. Force page reload after a brief delay so the user sees the confirmation toast
        setTimeout(() => {
            window.location.reload();
        }, 800);

    } catch (dbError) {
        console.error("Failed to commit profile updates to Firestore:", dbError);
        errorNode.innerText = "Failed to update profile details in Firestore database. Please try again.";
        errorNode.classList.remove("hidden-node");
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerText = "Save Changes";
        }
    }
}

/**
 * RENDER CUSTOMER MY PROJECTS DASHBOARD & CONTROLS (Firestore Integrated)
 */
async function renderAccountInventoryLedgerManagementDashboardGrid() {
    const listContainerNodeElement = document.getElementById("my-products-list-container");
    if (!listContainerNodeElement) return;
    
    listContainerNodeElement.innerHTML = `<div style="padding:24px; text-align:center; color:#718096;">Loading your projects...</div>`;
    if (!APP_STATE || !APP_STATE.currentUser) return;

    // Check if the current user is a designer; render designer panel if true
    const userRole = APP_STATE.currentUser.accountType || APP_STATE.currentUser.type;
    if (userRole === 'designer' || userRole === 'business') {
        if (typeof renderDesignerProjectsWorkspaceDashboard === 'function') {
            renderDesignerProjectsWorkspaceDashboard(listContainerNodeElement);
        }
        return;
    }

    const currentUserId = APP_STATE.currentUser.uid || APP_STATE.currentUser.id;
    let userOwnedProjects = [];

    // Fetch projects specifically belonging to current user from Firestore
    try {
        const { collection, query, where, getDocs, db } = window.FortMartFirebase;
        const q = query(collection(db, "products"), where("ownerUid", "==", currentUserId));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((docSnap) => {
            userOwnedProjects.push({ ...docSnap.data(), id: docSnap.id });
        });

        // Sync local SYSTEM_DATABASE reference cache
        if (typeof SYSTEM_DATABASE !== 'undefined') {
            SYSTEM_DATABASE.products = userOwnedProjects;
        }
    } catch (error) {
        console.error("Error fetching user projects from Firestore:", error);
        listContainerNodeElement.innerHTML = `<div style="padding:24px; text-align:center; color:#e53e3e;">Failed to load projects. Please try again.</div>`;
        return;
    }

    listContainerNodeElement.innerHTML = "";

    if (userOwnedProjects.length === 0) {
        listContainerNodeElement.innerHTML = `
            <div style="padding:24px; text-align:center; color:var(--fort-gray-slate, #718096);">
                <h4>You have no requested projects.</h4>
                <p style="font-size:0.85rem; margin-bottom:16px;">Post a design request to hire professional designers on Fort Graphics.</p>
                <button class="btn-blue" onclick="handleFloatingActionButtonTrigger()">+ Request New Project</button>
            </div>`;
        return;
    }

    for (const item of userOwnedProjects) {
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
                // Execute automatic purge on Firestore after 24 hours
                await executePurgeExpiredProjectFilesData(item.pid);
                continue;
            }
        }

        itemCardNode.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <h3 style="margin:0; color:var(--fort-blue-dark, #1a365d);">${item.name || item.title}</h3>
                ${badgeHTML}
            </div>
            
            <p style="font-size:0.85rem; color:#4a5568; margin-bottom:12px;">${item.info || item.instructions}</p>
            
            ${imagePreviewContent}
            ${deletionNoticeHTML}
            ${actionButtonsHTML}
        `;

        listContainerNodeElement.appendChild(itemCardNode);
    }

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

async function executeSubmitRevisionInstructions(productId) {
    const instructions = document.getElementById("revision-instructions-input").value.trim();
    if (!instructions) {
        if (typeof showTopRightToast === 'function') showTopRightToast("Please enter modification instructions.", "error");
        return;
    }

    try {
        const { doc, updateDoc, arrayUnion, db } = window.FortMartFirebase;
        const timestamp = new Date().toISOString();
        const modificationItem = {
            text: instructions,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
        };

        // Save modification to Firestore
        const productRef = doc(db, "products", productId);
        await updateDoc(productRef, {
            modifications: arrayUnion(modificationItem),
            updatedAt: timestamp
        });

        if (typeof showTopRightToast === 'function') showTopRightToast("Modifications sent to designer successfully.", "success");
    } catch (err) {
        console.error("Error committing modification to Firestore:", err);
        if (typeof showTopRightToast === 'function') showTopRightToast("Error sending modifications.", "error");
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
            <p style="font-size:0.88rem; color:#555; margin-bottom:16px;">Confirm password to proceed to payment confirmation (₦1,000 balance payment):</p>
            
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
                <button class="btn-blue" style="background-color:#3bb75e; color:white; font-weight:700;" onclick="executeCustomerPaystackSplitRuntime('${productId}')">Proceed to Pay ₦1,000</button>
            </div>
        </div>
    `;

    document.body.appendChild(checkoutModal);
}

/**
 * PAYSTACK DIRECT EXECUTION
 */
function executeCustomerPaystackSplitRuntime(productId) {
    if (typeof PaystackPop === 'undefined') {
        if (typeof showTopRightToast === 'function') showTopRightToast("Paystack SDK not loaded! Check internet connection.", "info");
        return;
    }

    const userEmail = APP_STATE.currentUser.identifierText || APP_STATE.currentUser.email || 'customer@fortmart.com';
    const amountInKobo = 1000 * 100;

    const modal = document.getElementById('download-paystack-modal');
    if (modal) modal.remove();

    let paymentConfig = {
        key: 'pk_test_8e350f62114983f1cd23b0944668d435a6e74214',
        email: userEmail,
        amount: amountInKobo,
        currency: "NGN",
        ref: 'FT-BAL-' + productId + '-' + Math.floor((Math.random() * 1000000000) + 1),
        callback: function(response) {
            processPostPaymentDownloadUnlock(productId);
        },
        onClose: function() {
            if (typeof showTopRightToast === 'function') showTopRightToast('Payment window closed by user.', "info");
        }
    };

    try {
        let handler = PaystackPop.setup(paymentConfig);
        handler.openIframe();
    } catch (error) {
        console.error("Paystack Execution Error:", error);
        processPostPaymentDownloadUnlock(productId);
    }
}

/**
 * UNLOCK FILE & AUTOMATICALLY SAVE STATUS TO FIREBASE
 */
async function processPostPaymentDownloadUnlock(productId) {
    try {
        const { doc, getDoc, updateDoc, increment, collection, addDoc, db } = window.FortMartFirebase;
        const productRef = doc(db, "products", productId);
        const productSnap = await getDoc(productRef);

        if (!productSnap.exists()) return;
        const project = productSnap.data();

        const timestamp = new Date().toISOString();
        const unlockTime = Date.now();
        const creditAmount = 1000;

        // 1. Update project status on Firebase Firestore
        await updateDoc(productRef, {
            isDownloadedUnlocked: true,
            downloadUnlockedTimestamp: unlockTime,
            status: 'completed',
            isCompleted: true,
            isBooked: false,
            updatedAt: timestamp
        });

        // 2. Credit Designer Wallet in Firebase Users collection
        if (project.bookedByUid) {
            const designerRef = doc(db, "users", project.bookedByUid);
            await updateDoc(designerRef, {
                walletBalance: increment(creditAmount),
                lastWalletCreditTimestamp: unlockTime
            });

            // 3. Log Activity to Firestore Logs Collection
            const logsRef = collection(db, "activity_logs");
            await addDoc(logsRef, {
                designerUid: project.bookedByUid,
                productId: productId,
                productName: project.name || project.title || "Design Project",
                requesterUid: project.ownerUid,
                type: 'approved',
                actionText: 'Project approved & downloaded by customer',
                timestamp: timestamp
            });

            await addDoc(logsRef, {
                designerUid: project.bookedByUid,
                productId: productId,
                productName: project.name || project.title || "Design Project",
                requesterUid: project.ownerUid,
                type: 'payment',
                actionText: 'Wallet Credited',
                amountText: '₦' + creditAmount.toLocaleString(),
                rawAmount: creditAmount,
                timestamp: timestamp
            });
        }

        if (typeof showTopRightToast === 'function') {
            showTopRightToast("Payment Successful! Generating clean design download...", "success");
        }

        renderAccountInventoryLedgerManagementDashboardGrid();
        executeCleanAssetDownloadDirectly(productId, project.submittedDesignDraft, project.name || project.title);

    } catch (err) {
        console.error("Error processing post-payment status unlock on Firebase:", err);
        if (typeof showTopRightToast === 'function') {
            showTopRightToast("Error updating project status.", "error");
        }
    }
}

function executeCleanAssetDownloadDirectly(productId, draftUrl, projectName) {
    if (!draftUrl) {
        const project = SYSTEM_DATABASE.products.find(p => p.pid === productId);
        if (project) {
            draftUrl = project.submittedDesignDraft;
            projectName = project.name || project.title;
        }
    }
    if (!draftUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = draftUrl;

    img.onload = function() {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const brandingHeight = 36;
        canvas.width = img.width;
        canvas.height = img.height + brandingHeight;

        ctx.drawImage(img, 0, 0);

        ctx.fillStyle = "#000000";
        ctx.fillRect(0, img.height, canvas.width, brandingHeight);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 14px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Design By Fort Graphics: graphics.fort-site.com.ng", canvas.width / 2, img.height + 22);

        const cleanedDataUrl = canvas.toDataURL("image/png");
        const downloadAnchor = document.createElement("a");
        downloadAnchor.href = cleanedDataUrl;
        downloadAnchor.download = `${(projectName || 'Project').replace(/\s+/g, '_')}_Final_Design.png`;
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        document.body.removeChild(downloadAnchor);
    };
}

/**
 * PURGE FILE & ASSETS AFTER 24 HOURS EXPIRATION FROM FIREBASE FIRESTORE
 */
async function executePurgeExpiredProjectFilesData(productId) {
    try {
        const { doc, deleteDoc, db } = window.FortMartFirebase;
        
        // Delete expired document record directly from Firestore
        await deleteDoc(doc(db, "products", productId));

        if (typeof showTopRightToast === 'function') {
            showTopRightToast("Expired project files have been securely purged.", "info");
        }
        
        renderAccountInventoryLedgerManagementDashboardGrid();
    } catch (error) {
        console.error("Error purging expired project from Firestore:", error);
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
 * AUTO-CLEAR CACHE ON PAGE REFRESH OR TAB CLOSE
 * Ensures clean state reload on every page refresh.
 */
window.addEventListener("beforeunload", () => {
    sessionStorage.removeItem("FORT_DESIGNER_PROJECTS_CACHE");
    sessionStorage.removeItem("FORT_DESIGNER_USERS_CACHE");
});

/**
 * HELPER: MANUAL CACHE INVALIDATION
 * Call this function anytime a designer uploads a draft, updates status, or modifies a project.
 */
function invalidateDesignerWorkspaceCache() {
    sessionStorage.removeItem("FORT_DESIGNER_PROJECTS_CACHE");
    sessionStorage.removeItem("FORT_DESIGNER_USERS_CACHE");
}

/**
 * RENDER DESIGNER'S MY PROJECTS DASHBOARD (EXCLUDES COMPLETED PROJECTS)
 * Features Firebase Firestore Integration & Active Session Web Storage Caching
 */
async function renderDesignerProjectsWorkspaceDashboard(containerNode) {
    // 1. Target node fallback if string ID or element is passed
    if (typeof containerNode === "string") {
        containerNode = document.getElementById(containerNode);
    }
    if (!containerNode) {
        containerNode = document.getElementById("my-products-list-container-designer");
    }
    if (!containerNode) return;

    containerNode.innerHTML = `
        <div style="padding:24px; text-align:center; color:var(--fort-gray-slate, #718096);">
            <p style="font-size:0.9rem;">Loading designer workspace data...</p>
        </div>`;

    if (!APP_STATE?.currentUser) return;

    const currentUserId = APP_STATE.currentUser.uid || APP_STATE.currentUser.id;

    // 2. CACHE STRATEGY: Check active session cache before making network calls
    let productsList = [];
    let usersList = [];

    const cachedProducts = sessionStorage.getItem("FORT_DESIGNER_PROJECTS_CACHE");
    const cachedUsers = sessionStorage.getItem("FORT_DESIGNER_USERS_CACHE");

    if (cachedProducts && cachedUsers) {
        // Serve instantly from browser cache during current tab interactions
        productsList = JSON.parse(cachedProducts);
        usersList = JSON.parse(cachedUsers);
    } else {
        // Fetch fresh state from Firestore on page refresh or initial view
        try {
            const { collection, query, where, getDocs, db } = window.FortMartFirebase;

            // Fetch projects booked by current designer
            const projectsQuery = query(
                collection(db, "products"),
                where("bookedByUid", "==", currentUserId)
            );
            const projectsSnap = await getDocs(projectsQuery);
            projectsSnap.forEach(docSnap => {
                productsList.push({ ...docSnap.data(), id: docSnap.id });
            });

            // Fetch users list to map client metadata
            const usersSnap = await getDocs(collection(db, "users"));
            usersSnap.forEach(docSnap => {
                usersList.push({ ...docSnap.data(), id: docSnap.id });
            });

            // Populate session cache
            sessionStorage.setItem("FORT_DESIGNER_PROJECTS_CACHE", JSON.stringify(productsList));
            sessionStorage.setItem("FORT_DESIGNER_USERS_CACHE", JSON.stringify(usersList));

            // Sync with global runtime object
            if (typeof SYSTEM_DATABASE !== "undefined") {
                SYSTEM_DATABASE.products = productsList;
                SYSTEM_DATABASE.users = usersList;
            }
        } catch (error) {
            console.error("Error fetching designer workspace from Firestore:", error);
            containerNode.innerHTML = `
                <div style="padding:24px; text-align:center; color:#e53e3e;">
                    <p style="font-size:0.9rem;">Failed to synchronize workspace. Please reload the page.</p>
                </div>`;
            return;
        }
    }

    containerNode.innerHTML = "";

    // 3. FILTER: Fetch booked projects BUT EXCLUDE completed/downloaded ones
    const designerBookedProjects = productsList.filter(p => 
        p.bookedByUid === currentUserId && 
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
        const customerRecord = usersList.find(u => (u.uid || u.id) === project.ownerUid) || {};
        const projectCard = document.createElement("div");
        projectCard.className = "project-expanded-card";

        // Generate asset chips
        let assetsMarkup = '<span style="font-size:0.85rem; color:#a0aec0;">No assets attached.</span>';
        if (project.assets && project.assets.length > 0) {
            assetsMarkup = project.assets.map(asset => `
                <button class="asset-chip-button" onclick="launchAssetManagementModal('${project.pid || project.id}', '${asset.id}')">
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
                    <h3 style="margin:0; color:var(--fort-blue-dark, #0d233a);">${project.name || project.title || 'Untitled Project'}</h3>
                    <span style="font-size:0.8rem; color:var(--fort-gray-slate, #718096);">Client: <strong>${customerRecord.identityName || customerRecord.username || customerRecord.name || 'Customer'}</strong></span>
                </div>
                <span class="badge-status badge-pending">
                    ⚙️ In Progress
                </span>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                <div>
                    <h5 style="margin:4px 0; color:#4a5568;">Original Prompt / Instructions:</h5>
                    <p style="font-size:0.88rem; color:#2d3748; background:#f7fafc; padding:10px; border-radius:6px; border:1px solid #e2e8f0;">${project.info || project.instructions || 'No detailed instructions provided.'}</p>
                    
                    <h5 style="margin:12px 0 4px 0; color:#4a5568;">Attached Client Assets (Click to rename/download):</h5>
                    <div style="display:flex; flex-wrap:wrap; gap:6px;">${assetsMarkup}</div>
                </div>

                <div>
                    <h5 style="margin:4px 0; color:#4a5568;">Modifications Log:</h5>
                    <div style="max-height:140px; overflow-y:auto;">${modificationsHTML}</div>

                    <div style="margin-top:16px;">
                        <button class="btn-blue" style="width:100%; font-weight:700;" onclick="launchDesignerUploadWorkModal('${project.pid || project.id}')">
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
    const cachedProducts = sessionStorage.getItem("FORT_DESIGNER_PROJECTS_CACHE");
    const productsList = cachedProducts ? JSON.parse(cachedProducts) : (SYSTEM_DATABASE?.products || []);

    const project = productsList.find(p => (p.pid || p.id) === productId);
    if (!project || !project.assets) return;
    
    const asset = project.assets.find(a => a.id === assetId);
    if (!asset) return;

    let assetModal = document.getElementById("asset-manage-modal");
    if (assetModal) assetModal.remove();

    const fileSource = asset.fileData || asset.dataUrl || asset.url || "";
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

async function executeRenameAsset(productId, assetId) {
    const newName = document.getElementById("rename-asset-input").value.trim();
    if (!newName) return;

    const cachedProducts = sessionStorage.getItem("FORT_DESIGNER_PROJECTS_CACHE");
    let productsList = cachedProducts ? JSON.parse(cachedProducts) : (SYSTEM_DATABASE?.products || []);

    const project = productsList.find(p => (p.pid || p.id) === productId);
    if (project && project.assets) {
        const asset = project.assets.find(a => a.id === assetId);
        if (asset) {
            asset.fileName = newName;

            // 1. Update local cache for active tab session
            sessionStorage.setItem("FORT_DESIGNER_PROJECTS_CACHE", JSON.stringify(productsList));

            // 2. Persist to Firebase Firestore
            try {
                const { doc, updateDoc, db } = window.FortMartFirebase;
                const productRef = doc(db, "products", productId);
                await updateDoc(productRef, {
                    assets: project.assets,
                    updatedAt: new Date().toISOString()
                });
            } catch (err) {
                console.error("Error persisting asset rename to Firestore:", err);
            }

            if (typeof showTopRightToast === "function") {
                showTopRightToast("Asset file renamed successfully.", "success");
            }
        }
    }
    document.getElementById("asset-manage-modal")?.remove();
    
    // Re-render view from updated cache
    renderDesignerProjectsWorkspaceDashboard();
}

function executeDownloadAsset(productId, assetId) {
    const cachedProducts = sessionStorage.getItem("FORT_DESIGNER_PROJECTS_CACHE");
    const productsList = cachedProducts ? JSON.parse(cachedProducts) : (SYSTEM_DATABASE?.products || []);

    const project = productsList.find(p => (p.pid || p.id) === productId);
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
                <button class="btn-gray" id="draft-cancel-btn" onclick="document.getElementById('designer-upload-modal').remove()">Cancel</button>
                <button class="btn-blue" id="draft-submit-btn" onclick="executeSubmitDraftToCustomer('${productId}')">Send Design</button>
            </div>
        </div>
    `;
    document.body.appendChild(uploadModal);
}

let TEMPORARY_DESIGNER_DRAFT_FILE = null;
let TEMPORARY_DESIGNER_DRAFT_BASE64 = null;

function handleDesignerDraftFileSelection(event) {
    const file = event.target.files[0];
    if (file) {
        TEMPORARY_DESIGNER_DRAFT_FILE = file; // Store actual file object for Firebase Storage
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

async function executeSubmitDraftToCustomer(productId) {
    if (!TEMPORARY_DESIGNER_DRAFT_FILE && !TEMPORARY_DESIGNER_DRAFT_BASE64) {
        if (typeof showTopRightToast === "function") showTopRightToast("Please select an image draft file first.", "error");
        return;
    }

    const submitBtn = document.getElementById("draft-submit-btn");
    const cancelBtn = document.getElementById("draft-cancel-btn");
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Uploading to Cloud...";
    }
    if (cancelBtn) cancelBtn.disabled = true;

    try {
        const { doc, updateDoc, collection, addDoc, storage, ref, uploadBytes, getDownloadURL, db } = window.FortMartFirebase;
        let downloadURL = TEMPORARY_DESIGNER_DRAFT_BASE64;

        // 1. Upload draft file directly to Firebase Storage if file reference exists
        if (TEMPORARY_DESIGNER_DRAFT_FILE && storage) {
            const fileName = `drafts/${productId}_${Date.now()}_${TEMPORARY_DESIGNER_DRAFT_FILE.name.replace(/\s+/g, '_')}`;
            const storageRef = ref(storage, fileName);
            const snapshot = await uploadBytes(storageRef, TEMPORARY_DESIGNER_DRAFT_FILE);
            downloadURL = await getDownloadURL(snapshot.ref);
        }

        const timestamp = new Date().toISOString();

        // 2. Persist updated draft state and download URL directly to Firestore
        const productRef = doc(db, "products", productId);
        await updateDoc(productRef, {
            submittedDesignDraft: downloadURL,
            hasSubmittedDraft: true,
            draftSubmittedAt: timestamp,
            updatedAt: timestamp
        });

        // 3. Log Activity to Firestore Logs Collection
        if (collection && addDoc) {
            const designerUid = APP_STATE?.currentUser?.uid || "designer";
            await addDoc(collection(db, "activity_logs"), {
                designerUid: designerUid,
                productId: productId,
                type: 'submission',
                actionText: 'Project draft submitted to customer',
                timestamp: timestamp
            });
        }

        // 4. Invalidate browser session cache so customer view gets fresh data immediately
        if (typeof invalidateDesignerWorkspaceCache === "function") {
            invalidateDesignerWorkspaceCache();
        } else {
            sessionStorage.removeItem("FORT_DESIGNER_PROJECTS_CACHE");
            sessionStorage.removeItem("FORT_DESIGNER_USERS_CACHE");
        }

        if (typeof showTopRightToast === "function") {
            showTopRightToast("Design draft transmitted to customer successfully!", "success");
        }

    } catch (error) {
        console.error("Error uploading design draft to Firebase Storage/Firestore:", error);
        if (typeof showTopRightToast === "function") {
            showTopRightToast("Upload failed. Please try again.", "error");
        }
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = "Send Design";
        }
        if (cancelBtn) cancelBtn.disabled = false;
        return;
    }

    // 5. Clean up memory and modal elements
    TEMPORARY_DESIGNER_DRAFT_FILE = null;
    TEMPORARY_DESIGNER_DRAFT_BASE64 = null;
    const modalNode = document.getElementById("designer-upload-modal");
    if (modalNode) modalNode.remove();

    // 6. Refresh Customer or Designer UI Grid
    if (typeof renderAccountInventoryLedgerManagementDashboardGrid === "function") {
        renderAccountInventoryLedgerManagementDashboardGrid();
    }
}

// Ensure Firestore reference is accessible (e.g. import { db } from './firebase-config.js' or window.db)
const db = firebase.firestore();

/**
 * Admin User List Rendering Engine
 * Fetches user records directly from Firestore, syncs local state, and renders the UI.
 */
async function renderAdminUsersManagementList() {
    const listContainer = document.getElementById("admin-users-list-container");
    const searchInput = document.getElementById("admin-user-search-bar");
    if (!listContainer) return;

    listContainer.innerHTML = `<div style="padding:16px; text-align:center; color:var(--fort-gray-slate);">Fetching users from database...</div>`;

    try {
        // Fetch all documents from 'users' collection
        const snapshot = await db.collection("users").get();
        const fetchedUsers = [];

        snapshot.forEach(doc => {
            fetchedUsers.push({ id: doc.id, uid: doc.id, ...doc.data() });
        });

        // Sync local memory state
        if (typeof SYSTEM_DATABASE !== "undefined") {
            SYSTEM_DATABASE.users = fetchedUsers;
        }

        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";

        // 1. Filter out admin self-account and apply search query matching
        let filteredUsers = fetchedUsers.filter(u => {
            if (u.uid === 'admin' || u.id === 'admin') return false;

            const nameMatch = (u.identityName || u.username || '').toLowerCase().includes(searchTerm);
            const emailMatch = (u.identifierText || '').toLowerCase().includes(searchTerm);
            const statusMatch = (u.verificationStatus || u.status || '').toLowerCase().includes(searchTerm);
            const typeMatch = (u.accountType || u.type || '').toLowerCase().includes(searchTerm);

            return nameMatch || emailMatch || statusMatch || typeMatch;
        });

        // 2. Sort accounts from most recently created to least recently created
        filteredUsers.sort((a, b) => {
            const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (parseInt(String(a.uid || a.id).replace('user_', ''), 10) || 0);
            const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (parseInt(String(b.uid || b.id).replace('user_', ''), 10) || 0);
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

    } catch (error) {
        console.error("Firestore user fetch error:", error);
        listContainer.innerHTML = `<div style="padding:12px; color:red; text-align:center;">Failed to load user list from Firebase.</div>`;
    }
}

/**
 * Detailed User Profile Modal Loader
 */
async function launchDetailedUserProfileContextOverlaySummaryModal(userIdTokenKeyParameterValue) {
    let targetUserObjMatchRecord = SYSTEM_DATABASE?.users?.find(u => u.uid === userIdTokenKeyParameterValue || u.id === userIdTokenKeyParameterValue);

    // Fallback: Fetch directly from Firestore if not present in memory
    if (!targetUserObjMatchRecord) {
        try {
            const userDoc = await db.collection("users").doc(userIdTokenKeyParameterValue).get();
            if (userDoc.exists) {
                targetUserObjMatchRecord = { id: userDoc.id, uid: userDoc.id, ...userDoc.data() };
            }
        } catch (err) {
            console.error("Failed to fetch specific user document from Firebase:", err);
        }
    }

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
 * Validates admin credentials and updates user status to 'verified' in Firebase.
 */
async function finalizeAdminAccountApproval(targetUserId) {
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

    const inputSubaccountField = document.getElementById("adm-user-subaccount-code");
    const subaccountCode = inputSubaccountField ? inputSubaccountField.value.trim() : "";

    const updatePayload = {
        subaccountCode: subaccountCode,
        verificationStatus: "verified",
        status: "verified",
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        // Save updates to Firestore
        await db.collection("users").doc(targetUserId).update(updatePayload);

        // Update local state if present
        const accountInstance = SYSTEM_DATABASE?.users?.find(u => u.id === targetUserId || u.uid === targetUserId);
        if (accountInstance) {
            accountInstance.subaccountCode = subaccountCode;
            accountInstance.verificationStatus = "verified";
            accountInstance.status = "verified";
        }

        const approvalModalNode = document.getElementById("admin-approval-pwd-modal");
        if (approvalModalNode) approvalModalNode.remove();

        closeActiveModalDirectly("product-detail-modal");

        if (typeof renderAdminUsersManagementList === "function") {
            await renderAdminUsersManagementList();
        }

        if (typeof showAlertModal === "function") {
            showAlertModal("Account Approved", "The account has been marked as verified and subaccount code assigned.");
        } else if (typeof showTopRightToast === "function") {
            showTopRightToast("Account approved successfully.", "success");
        }
    } catch (error) {
        console.error("Firebase update error:", error);
        alert("Failed to approve account in Firebase: " + error.message);
    }
}

/**
 * Commits administrative code alterations directly into Firebase Firestore.
 */
async function executeInlineAdminSave(userId) {
    const cachedStatusElement = document.getElementById("lbl-inspector-active-status-tag");
    const evaluatedStatusValue = cachedStatusElement && cachedStatusElement.getAttribute("data-pending-status-value") 
        ? cachedStatusElement.getAttribute("data-pending-status-value") 
        : 'unverified';

    const inputIdentifierField = document.getElementById("adm-user-identifier-text");
    const inputSubaccountField = document.getElementById("adm-user-subaccount-code");
    const inputPasswordField = document.getElementById("adm-user-security-password");
    const inputCodeField = document.getElementById("UserAccountAuthenticationVerificationCode");
    const accountTypeSelectField = document.getElementById("adm-change-account-type");

    // Construct the payload for Firestore
    const updatePayload = {
        verificationStatus: evaluatedStatusValue,
        status: evaluatedStatusValue,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (inputIdentifierField) {
        updatePayload.identifierText = inputIdentifierField.value.trim();
    }
    if (inputSubaccountField) {
        updatePayload.subaccountCode = inputSubaccountField.value.trim();
    }
    if (inputPasswordField) {
        const val = inputPasswordField.value.trim();
        updatePayload.secretKey = val;
        updatePayload.password = val;
    }
    if (inputCodeField) {
        const boundValue = inputCodeField.value.trim();
        updatePayload.UserAccountAuthenticationVerificationCode = boundValue;
        updatePayload.verificationCode = boundValue;
    }
    if (accountTypeSelectField) {
        const selectedType = accountTypeSelectField.value;
        updatePayload.accountType = selectedType;
        updatePayload.type = selectedType;
    }

    try {
        // Persist directly to Firebase Firestore document
        await db.collection("users").doc(userId).update(updatePayload);

        // Synchronize in-memory record
        const accountInstance = SYSTEM_DATABASE?.users?.find(u => u.id === userId || u.uid === userId);
        if (accountInstance) {
            Object.assign(accountInstance, updatePayload);
        }

        if (typeof renderAdminUsersManagementList === "function") {
            await renderAdminUsersManagementList();
        }

        closeActiveModalDirectly("product-detail-modal");
        
        if (typeof showAlertModal === "function") {
            showAlertModal("Overwrites Saved", "Target credentials variables written to Firebase.");
        } else if (typeof showTopRightToast === "function") {
            showTopRightToast("Overwrites Saved successfully.", "success");
        }
    } catch (error) {
        console.error("Error saving document to Firebase:", error);
        alert("Failed to update user in Firebase: " + error.message);
    }
}

// Ensure Firestore reference is initialized (e.g., const db = firebase.firestore();)
if (typeof db === "undefined" && typeof firebase !== "undefined") {
    var db = firebase.firestore();
}

/**
 * Helper to record activity history into Firebase Cloud Firestore & local system database
 */
async function recordDesignerActivityLog(entry) {
    const logId = 'LOG-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const timestampISO = entry.timestamp || new Date().toISOString();

    const logData = {
        id: logId,
        designerUid: entry.designerUid || '',
        productId: entry.productId || '',
        productName: entry.productName || '',
        requesterUid: entry.requesterUid || '',
        requesterName: entry.requesterName || '',
        type: entry.type || 'booking', // 'booking', 'submission', 'modification', 'approved', 'payment', 'payout'
        actionText: entry.actionText || '',
        amountText: entry.amountText || null,
        timestamp: timestampISO,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    // 1. Update In-Memory Cache Immediate Feedback
    if (typeof SYSTEM_DATABASE !== "undefined") {
        if (!SYSTEM_DATABASE.activityLogs) {
            SYSTEM_DATABASE.activityLogs = [];
        }
        SYSTEM_DATABASE.activityLogs.push(logData);

        if (typeof syncPlatformDatabaseStateToWebStorage === 'function') {
            syncPlatformDatabaseStateToWebStorage();
        }
    }

    // 2. Persist directly to Firebase Cloud Firestore
    try {
        await db.collection("activityLogs").doc(logId).set(logData);
    } catch (error) {
        console.error("Error committing activity log to Firestore:", error);
    }
}

let CURRENT_HISTORY_FILTER = 'all';

/**
 * Main function to render Designer History Dashboard with Wallet Indicator & Badging
 * Fetches log history asynchronously from Firebase Firestore based on the active designer's UID.
 */
async function renderDesignerHistoryDashboard() {
    const feedContainer = document.getElementById("history-log-feed");
    const walletBalanceElem = document.getElementById("designer-wallet-balance-indicator");
    
    if (typeof APP_STATE === "undefined" || !APP_STATE.currentUser) return;

    const designerUid = APP_STATE.currentUser.uid || APP_STATE.currentUser.id;
    const currentDesignerUser = (typeof SYSTEM_DATABASE !== "undefined" && SYSTEM_DATABASE.users) 
        ? (SYSTEM_DATABASE.users.find(u => u.uid === designerUid || u.id === designerUid) || APP_STATE.currentUser)
        : APP_STATE.currentUser;

    // Update Wallet Indicator Text
    if (walletBalanceElem) {
        const currentBalance = Number(currentDesignerUser.walletBalance || 0);
        walletBalanceElem.innerText = `₦${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    if (!feedContainer) return;
    
    // Show Loading state while fetching records from Firestore
    feedContainer.innerHTML = `
        <div style="padding: 30px; text-align: center; color: var(--fort-gray-slate, #64748b);">
            <span>Fetching activity history...</span>
        </div>
    `;

    let allLogs = [];

    try {
        // Fetch activity logs specific to this designer from Firestore
        const snapshot = await db.collection("activityLogs")
            .where("designerUid", "==", designerUid)
            .get();

        snapshot.forEach(doc => {
            allLogs.push({ id: doc.id, ...doc.data() });
        });

        // Sync local in-memory activity logs array
        if (typeof SYSTEM_DATABASE !== "undefined") {
            const externalLogs = (SYSTEM_DATABASE.activityLogs || []).filter(l => l.designerUid !== designerUid);
            SYSTEM_DATABASE.activityLogs = [...externalLogs, ...allLogs];
        }
    } catch (error) {
        console.warn("Firestore history fetch failed, falling back to local memory cache:", error);
        allLogs = (SYSTEM_DATABASE?.activityLogs || []).filter(log => log.designerUid === designerUid);
    }

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
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    feedContainer.innerHTML = "";

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
        } else if (log.type === 'payment' || log.type === 'payout') {
            if (log.actionText === 'Wallet Credited') {
                tagClass = "tag-payment";
                tagLabel = "WALLET CREDITED";
            } else if (log.actionText === 'Funds Payout' || log.type === 'payout') {
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

/**
 * Filter trigger callback
 */
function filterHistoryRecords(filterType) {
    CURRENT_HISTORY_FILTER = filterType;
    
    // Update active class on buttons
    const buttons = document.querySelectorAll('.history-filter-bar .filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    if (typeof event !== 'undefined' && event && event.target) {
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


// Ensure Firestore instance is initialized
if (typeof db === "undefined" && typeof firebase !== "undefined") {
    var db = firebase.firestore();
}

/**
 * RENDER ADMIN BOOKED PROJECTS DISPLAY LOOP
 * Restricts access to Admin users only and renders all active booked projects asynchronously from Firestore.
 */
async function renderAdminBookedProjectsDisplayLoop() {
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

        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 48px 16px; color: #64748b;">
                <span>Loading booked projects from database...</span>
            </div>
        `;

        // Initialize fallback database structure if absent
        if (typeof SYSTEM_DATABASE === 'undefined') {
            window.SYSTEM_DATABASE = { products: [], users: [] };
        }
        window.SYSTEM_DATABASE.products = window.SYSTEM_DATABASE.products || [];
        window.SYSTEM_DATABASE.users = window.SYSTEM_DATABASE.users || [];

        let fetchedProducts = [];

        // 1. Fetch Products/Projects from Firestore
        try {
            const productsSnapshot = await db.collection("products").get();
            productsSnapshot.forEach(doc => {
                fetchedProducts.push({ pid: doc.id, id: doc.id, ...doc.data() });
            });

            // Sync with local memory database
            SYSTEM_DATABASE.products = fetchedProducts;
        } catch (dbError) {
            console.warn("Firestore products fetch failed, falling back to local database:", dbError);
            fetchedProducts = [...SYSTEM_DATABASE.products];
        }

        // STRICT FILTER: Only include BOOKED projects
        let bookedProducts = fetchedProducts.filter(item => item.isBooked || item.status === 'booked');

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
                <div class="product-card" data-pid="${prod.pid || prod.id}" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background: #fff; display: flex; flex-direction: column;">
                    <div style="height: 180px; width: 100%; background: #f3f4f6; overflow: hidden; position: relative;">
                        <img src="${coverImage}" alt="${itemTitle}" style="width: 100%; height: 100%; object-fit: cover;">
                        <span style="position: absolute; top: 10px; right: 10px; background: #0284c7; color: #fff; font-size: 0.75rem; font-weight: 700; padding: 4px 8px; border-radius: 4px;">Booked</span>
                    </div>
                    <div style="padding: 16px; display: flex; flex-direction: column; flex-grow: 1;">
                        <h4 style="font-size: 16px; font-weight: 600; margin: 0 0 8px 0; color: #1e293b;">${itemTitle}</h4>
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 12px;">
                            <span style="font-size: 16px; font-weight: 700; color: #059669;">${formattedPrice}</span>
                            <button class="btn-blue" style="padding: 6px 12px; font-size: 0.82rem; font-weight: 600; cursor: pointer;" onclick="launchAdminBookedProjectDetailsModal('${prod.pid || prod.id}')">View Details</button>
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
 * Fetches target project and related user profiles directly from Firebase Firestore.
 */
async function launchAdminBookedProjectDetailsModal(productId) {
    const detailOverlayNode = document.getElementById("product-detail-modal");
    const detailOverlayBodyNode = document.getElementById("product-detail-modal-body");

    if (!detailOverlayNode || !detailOverlayBodyNode) return;

    // Show Loading Modal State
    detailOverlayBodyNode.innerHTML = `
        <div style="padding: 40px; text-align: center; color: #64748b;">
            <span>Loading project & user details from Firebase...</span>
        </div>
    `;
    detailOverlayNode.style.display = 'flex';
    detailOverlayNode.classList.add("active");

    let targetProduct = null;

    // 1. Fetch Target Product from Firestore
    try {
        const prodDoc = await db.collection("products").doc(productId).get();
        if (prodDoc.exists) {
            targetProduct = { pid: prodDoc.id, id: prodDoc.id, ...prodDoc.data() };
        }
    } catch (err) {
        console.warn("Firestore product document fetch error, using local memory fallback:", err);
    }

    if (!targetProduct && typeof SYSTEM_DATABASE !== 'undefined' && SYSTEM_DATABASE.products) {
        targetProduct = SYSTEM_DATABASE.products.find(p => p.pid === productId || p.id === productId);
    }

    if (!targetProduct) {
        detailOverlayBodyNode.innerHTML = `
            <div style="padding: 30px; text-align: center; color: #ef4444;">
                <p>Project details could not be found.</p>
                <button onclick="closeActiveModalDirectly('product-detail-modal')" class="btn-gray">Close</button>
            </div>
        `;
        return;
    }

    const requesterUid = targetProduct.ownerUid || targetProduct.userId || targetProduct.requesterUid;
    const designerUid = targetProduct.bookedByUid || targetProduct.designerUid;

    // 2. Fetch Requester & Designer User Profiles asynchronously from Firestore
    let requesterRecord = null;
    let designerRecord = null;

    try {
        const userPromises = [];

        if (requesterUid) {
            userPromises.push(
                db.collection("users").doc(requesterUid).get().then(doc => doc.exists ? { uid: doc.id, ...doc.data() } : null)
            );
        } else {
            userPromises.push(Promise.resolve(null));
        }

        if (designerUid) {
            userPromises.push(
                db.collection("users").doc(designerUid).get().then(doc => doc.exists ? { uid: doc.id, ...doc.data() } : null)
            );
        } else {
            userPromises.push(Promise.resolve(null));
        }

        const [reqResult, desResult] = await Promise.all(userPromises);
        requesterRecord = reqResult;
        designerRecord = desResult;

        // Sync local users store with retrieved documents
        if (typeof SYSTEM_DATABASE !== 'undefined') {
            SYSTEM_DATABASE.users = SYSTEM_DATABASE.users || [];
            if (requesterRecord) SYSTEM_DATABASE.users.push(requesterRecord);
            if (designerRecord) SYSTEM_DATABASE.users.push(designerRecord);
        }
    } catch (err) {
        console.warn("Error fetching user profiles from Firestore, utilizing local database fallback:", err);
    }

    // Local Fallbacks if Firestore lookup returned empty
    if (!requesterRecord && typeof SYSTEM_DATABASE !== 'undefined' && SYSTEM_DATABASE.users) {
        requesterRecord = SYSTEM_DATABASE.users.find(u => u.uid === requesterUid || u.id === requesterUid);
    }
    if (!designerRecord && typeof SYSTEM_DATABASE !== 'undefined' && SYSTEM_DATABASE.users) {
        designerRecord = SYSTEM_DATABASE.users.find(u => u.uid === designerUid || u.id === designerUid);
    }

    requesterRecord = requesterRecord || { identityName: 'Unknown Requester', uid: requesterUid || 'N/A' };
    designerRecord = designerRecord || { identityName: 'Unknown Designer', uid: designerUid || 'N/A' };

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
                    <img src="${productDisplayImage}" style="width:100%; height:100%; object-fit:contain;" alt="${targetProduct.name || targetProduct.title}">
                </div>
                <h4 style="margin: 12px 0 4px 0; color: #1e293b;">${targetProduct.name || targetProduct.title || 'Untitled Project'}</h4>
                <div style="font-size:1.25rem; font-weight:800; color:#059669;">₦${targetProduct.price ? targetProduct.price.toLocaleString() : '1,000'}</div>
                <p style="font-size: 0.88rem; color: #475569; margin-top: 8px;">${targetProduct.info || targetProduct.instructions || 'No detailed instructions provided.'}</p>
            </div>

            <div style="display:flex; flex-direction:column; gap:16px;">
                <!-- REQUESTER SECTION -->
                <div>
                    <h5 style="text-transform:uppercase; font-size:0.75rem; color:#64748b; margin: 0 0 6px 0;">Project Requester</h5>
                    <div class="user-profile-badge-card">
                        <img src="${requesterRecord.avatar || fallbackAvatar}" class="user-profile-avatar" alt="Requester">
                        <div style="flex-grow: 1;">
                            <strong style="display:block; font-size:0.9rem; color:#0f172a;">${requesterRecord.identityName || requesterRecord.username || requesterRecord.name || 'Customer'}</strong>
                            <span style="font-size:0.75rem; color:#64748b;">${requesterRecord.identifierText || requesterRecord.email || 'No email registered'}</span>
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
                            <strong style="display:block; font-size:0.9rem; color:#0f172a;">${designerRecord.identityName || designerRecord.businessName || designerRecord.name || 'Designer'}</strong>
                            <span style="font-size:0.75rem; color:#64748b;">${designerRecord.identifierText || designerRecord.email || 'No email registered'}</span>
                        </div>
                        <button class="btn-manage-user" onclick="launchUserManagementModal('${designerRecord.uid}'); closeActiveModalDirectly('product-detail-modal')">Manage</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * EXPANDED USER MANAGEMENT MODAL
 * Fetches user profile data directly from Firebase Firestore by userId and displays account settings.
 */
async function launchUserManagementModal(userId) {
    const modalNode = document.getElementById("user-management-modal");
    const modalBody = document.getElementById("user-management-modal-body");

    if (!modalNode || !modalBody) return;

    modalBody.innerHTML = `
        <div style="padding: 30px; text-align: center; color: #64748b;">
            <span>Fetching user details from Firebase...</span>
        </div>
    `;
    modalNode.style.display = 'flex';
    modalNode.classList.add("active");

    let targetUser = null;

    // 1. Fetch user record directly from Firebase Firestore
    try {
        const userDoc = await db.collection("users").doc(userId).get();
        if (userDoc.exists) {
            targetUser = { uid: userDoc.id, id: userDoc.id, ...userDoc.data() };
        }
    } catch (err) {
        console.warn("Firestore user fetch failed, trying local memory database:", err);
    }

    if (!targetUser && typeof SYSTEM_DATABASE !== 'undefined' && SYSTEM_DATABASE.users) {
        targetUser = SYSTEM_DATABASE.users.find(u => u.uid === userId || u.id === userId);
    }

    if (!targetUser) {
        modalBody.innerHTML = `
            <div style="padding: 24px; text-align: center;">
                <p style="color:#dc2626;">User record could not be found in the database.</p>
                <button class="btn-gray" onclick="closeActiveModalDirectly('user-management-modal')">Close</button>
            </div>
        `;
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
            <h4 style="margin: 8px 0 2px 0; color:#0f172a;">${targetUser.identityName || targetUser.name || targetUser.username || 'N/A'}</h4>
            <span style="font-size:0.8rem; background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:12px; font-weight:600; text-transform:capitalize;">${targetUser.accountType || 'personal'}</span>
        </div>

        <div style="background:#f8fafc; padding:12px; border-radius:8px; display:flex; flex-direction:column; gap:8px; font-size:0.85rem; color:#334155;">
            <div><strong>UID:</strong> ${targetUser.uid || targetUser.id}</div>
            <div><strong>Email/Contact:</strong> ${targetUser.identifierText || targetUser.email || 'N/A'}</div>
            <div><strong>Country:</strong> ${targetUser.country || 'Nigeria'}</div>
            <div><strong>Password/Key:</strong> ${targetUser.secretKey || 'N/A'}</div>            
            <div><strong>Verification:</strong> <span style="color:${targetUser.verificationStatus === 'verified' ? 'green':'orange'}; font-weight:bold;">${targetUser.verificationStatus || 'unverified'}</span></div>
            ${targetUser.businessName ? `<div><strong>Business:</strong> ${targetUser.businessName}</div>` : ''}
        </div>

        <div style="margin-top:20px; display:flex; gap:10px;">
            <button class="btn-gray" style="flex:1;" onclick="closeActiveModalDirectly('user-management-modal')">Close</button>
        </div>
    `;
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

