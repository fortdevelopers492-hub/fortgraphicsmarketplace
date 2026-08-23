let CURRENT_PAYOUT_TAB = 'outstanding'; // Options: 'outstanding' | 'zero'
let SELECTED_PAYOUT_DESIGNER_UID = null;

/**
 * Fetches user payout details directly from Firebase Firestore and renders the Admin Payouts View
 */
async function renderAdminPayoutsDashboardView() {
    const listContainer = document.getElementById("admin-payouts-list-container");
    if (!listContainer) return;

    // Display temporary loading feedback
    listContainer.innerHTML = `
        <div style="text-align:center; padding: 40px; color:#64748b;">
            <p style="font-size:0.9rem;">Fetching designer payout records from Firebase...</p>
        </div>
    `;

    let usersList = [];

    try {
        const { collection, getDocs, db } = window.FortMartFirebase;
        
        // Query the 'users' collection in Firestore
        const querySnapshot = await getDocs(collection(db, "users"));
        
        querySnapshot.forEach((doc) => {
            usersList.push({ uid: doc.id, ...doc.data() });
        });
    } catch (error) {
        console.error("Failed to fetch users from Firebase:", error);
        listContainer.innerHTML = `
            <div style="text-align:center; padding: 40px; background:#fef2f2; border-radius:8px; border:1px solid #fecaca; color:#dc2626;">
                <h4>Error loading user payouts from database.</h4>
            </div>
        `;
        return;
    }

    // Filter to retain only business and designer role users
    let designers = usersList.filter(u => u.accountType === 'business' || u.accountType === 'designer');

    // Categorize and sort designers based on active tab balance criteria
    if (CURRENT_PAYOUT_TAB === 'outstanding') {
        designers = designers.filter(u => Number(u.walletBalance || 0) > 0);

        // Sort: Longest waiting recent credit timestamp up to most recent
        designers.sort((a, b) => {
            const timeA = a.lastWalletCreditTimestamp || 0;
            const timeB = b.lastWalletCreditTimestamp || 0;
            return timeA - timeB; 
        });
    } else {
        // Zero or negative balance section
        designers = designers.filter(u => Number(u.walletBalance || 0) <= 0);
    }

    listContainer.innerHTML = "";

    // Render empty layout message if no users match active filter
    if (designers.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align:center; padding: 40px; background:#f8fafc; border-radius:8px; border:1px dashed #cbd5e1; color:#64748b;">
                <h4>No users found in this filter section.</h4>
            </div>
        `;
        return;
    }

    // Build and append individual user cards
    designers.forEach(designer => {
        const balance = Number(designer.walletBalance || 0);
        const card = document.createElement("div");
        card.className = "payout-user-card";
        card.onclick = () => openAdminUserPayoutModal(designer.uid);

        const lastCreditDate = designer.lastWalletCreditTimestamp 
            ? new Date(designer.lastWalletCreditTimestamp).toLocaleString() 
            : "No recent credits";

        card.innerHTML = `
            <div>
                <h4 style="margin:0 0 4px 0; color:#0f172a;">${designer.identityName || designer.businessName || 'Designer'}</h4>
                <span style="font-size:0.8rem; color:#64748b;">Identifier: ${designer.identifierText || designer.uid}</span>
                <div style="font-size:0.75rem; color:#94a3b8; margin-top:2px;">Last Credited: ${lastCreditDate}</div>
            </div>
            <div style="text-align:right;">
                <span style="font-size:1.2rem; font-weight:800; color:${balance > 0 ? '#059669' : '#64748b'};">
                    ₦${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <div style="font-size:0.75rem; color:#2563eb; margin-top:4px; font-weight:600;">Click to inspect →</div>
            </div>
        `;

        listContainer.appendChild(card);
    });
}

function switchAdminPayoutTab(tabName) {
    CURRENT_PAYOUT_TAB = tabName;
    document.getElementById("tab-payouts-outstanding").classList.toggle("active", tabName === 'outstanding');
    document.getElementById("tab-payouts-zero").classList.toggle("active", tabName === 'zero');
    renderAdminPayoutsDashboardView();
}

/**
 * 1. OPEN USER WALLET INSPECTION MODAL (7-day logs view directly from Firebase)
 */
async function openAdminUserPayoutModal(designerUid) {
    SELECTED_PAYOUT_DESIGNER_UID = designerUid;

    const modal = document.getElementById("admin-user-payout-modal");
    const summaryContainer = document.getElementById("payout-modal-user-summary");
    const logsContainer = document.getElementById("payout-modal-7day-logs");

    if (!modal) return;

    // Open modal immediately and show loading feedback
    modal.classList.remove("hidden-node");
    document.getElementById("payout-modal-user-name").innerText = "Loading User Details...";
    summaryContainer.innerHTML = `<div style="color:#64748b; padding:10px 0;">Fetching user details from Firebase...</div>`;
    logsContainer.innerHTML = `<div style="text-align:center; color:#94a3b8; font-size:0.8rem; padding:10px;">Loading 7-day activity logs...</div>`;

    try {
        const { doc, getDoc, collection, query, where, getDocs, db } = window.FortMartFirebase;

        // 1. Fetch user data directly from Firestore 'users' collection
        const userDocRef = doc(db, "users", designerUid);
        const userSnap = await getDoc(userDocRef);

        if (!userSnap.exists()) {
            summaryContainer.innerHTML = `<div style="color:#dc2626;">User document not found in Firebase.</div>`;
            logsContainer.innerHTML = "";
            return;
        }

        const designer = userSnap.data();

        // Populate header and profile details
        document.getElementById("payout-modal-user-name").innerText = designer.identityName || designer.businessName || "Designer Wallet";
        summaryContainer.innerHTML = `
            <div><strong>Email:</strong> ${designer.identifierText || designer.email || 'N/A'}</div>
            <div><strong>Bank Details:</strong> ${designer.businessName || designer.bankAccountNumber || 'Not configured'}</div>
            <div><strong>Bank Name:</strong> ${designer.businessInfo || designer.bankName || 'Null'}</div>
            <div><strong>Current Balance:</strong> <span style="color:#059669; font-weight:700;">₦${Number(designer.walletBalance || 0).toLocaleString()}</span></div>
        `;

        // 2. Fetch 7-day credit activity logs from Firestore 'activityLogs' collection
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        // Query activityLogs matching this designer
        const logsQuery = query(
            collection(db, "activityLogs"),
            where("designerUid", "==", designerUid)
        );

        const logsSnap = await getDocs(logsQuery);
        logsContainer.innerHTML = "";

        const creditLogs = [];
        logsSnap.forEach(doc => {
            const log = doc.data();
            const logTime = log.timestamp ? new Date(log.timestamp).getTime() : 0;
            const isWalletCredit = log.actionText === 'Wallet Credited';

            if (isWalletCredit && logTime >= sevenDaysAgo) {
                creditLogs.push(log);
            }
        });

        // Render credit activity logs
        if (creditLogs.length === 0) {
            logsContainer.innerHTML = `<div style="text-align:center; color:#94a3b8; font-size:0.8rem; padding:10px;">No wallet credits recorded in the last 7 days.</div>`;
        } else {
            creditLogs.forEach(log => {
                const dateStr = log.timestamp ? new Date(log.timestamp).toLocaleDateString() : 'N/A';
                logsContainer.innerHTML += `
                    <div class="payout-mini-log-item">
                        <span>${log.productName || 'Wallet Credit'} (${dateStr})</span>
                        <strong style="color:#059669;">+${log.amountText || '₦' + Number(log.amount || 0).toLocaleString()}</strong>
                    </div>
                `;
            });
        }

    } catch (error) {
        console.error("Error fetching user payout modal data from Firebase:", error);
        summaryContainer.innerHTML = `<div style="color:#dc2626;">Error loading details from database.</div>`;
        logsContainer.innerHTML = `<div style="text-align:center; color:#dc2626; font-size:0.8rem; padding:10px;">Failed to load transaction history.</div>`;
    }
}

function closeAdminPayoutModal() {
    document.getElementById("admin-user-payout-modal").classList.add("hidden-node");
}

/**
 * 1. OPEN USER WALLET INSPECTION MODAL
 * Fetches user profile data and 7-day activity logs directly from Firebase
 */
async function openAdminUserPayoutModal(designerUid) {
    SELECTED_PAYOUT_DESIGNER_UID = designerUid;

    const modal = document.getElementById("admin-user-payout-modal");
    const summaryContainer = document.getElementById("payout-modal-user-summary");
    const logsContainer = document.getElementById("payout-modal-7day-logs");

    if (!modal) return;

    modal.classList.remove("hidden-node");
    document.getElementById("payout-modal-user-name").innerText = "Loading User Details...";
    summaryContainer.innerHTML = `<div style="color:#64748b; padding:10px 0;">Fetching user details from Firebase...</div>`;
    logsContainer.innerHTML = `<div style="text-align:center; color:#94a3b8; font-size:0.8rem; padding:10px;">Loading 7-day activity logs...</div>`;

    try {
        const { doc, getDoc, collection, query, where, getDocs, db } = window.FortMartFirebase;

        // Fetch user data from Firestore
        const userDocRef = doc(db, "users", designerUid);
        const userSnap = await getDoc(userDocRef);

        if (!userSnap.exists()) {
            summaryContainer.innerHTML = `<div style="color:#dc2626;">User document not found in Firebase.</div>`;
            logsContainer.innerHTML = "";
            return;
        }

        const designer = userSnap.data();

        document.getElementById("payout-modal-user-name").innerText = designer.identityName || designer.businessName || "Designer Wallet";
        summaryContainer.innerHTML = `
            <div><strong>Email:</strong> ${designer.identifierText || designer.email || 'N/A'}</div>
            <div><strong>Bank Details:</strong> ${designer.businessName || designer.bankAccountNumber || 'Not configured'}</div>
            <div><strong>Bank Name:</strong> ${designer.businessInfo || designer.bankName || 'Null'}</div>
            <div><strong>Current Balance:</strong> <span style="color:#059669; font-weight:700;">₦${Number(designer.walletBalance || 0).toLocaleString()}</span></div>
        `;

        // Fetch 7-day credit activity logs from Firestore
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const logsQuery = query(
            collection(db, "activityLogs"),
            where("designerUid", "==", designerUid)
        );

        const logsSnap = await getDocs(logsQuery);
        logsContainer.innerHTML = "";

        const creditLogs = [];
        logsSnap.forEach(docSnap => {
            const log = docSnap.data();
            const logTime = log.timestamp ? new Date(log.timestamp).getTime() : 0;
            const isWalletCredit = log.actionText === 'Wallet Credited';

            if (isWalletCredit && logTime >= sevenDaysAgo) {
                creditLogs.push(log);
            }
        });

        if (creditLogs.length === 0) {
            logsContainer.innerHTML = `<div style="text-align:center; color:#94a3b8; font-size:0.8rem; padding:10px;">No wallet credits recorded in the last 7 days.</div>`;
        } else {
            creditLogs.forEach(log => {
                const dateStr = log.timestamp ? new Date(log.timestamp).toLocaleDateString() : 'N/A';
                logsContainer.innerHTML += `
                    <div class="payout-mini-log-item">
                        <span>${log.productName || 'Wallet Credit'} (${dateStr})</span>
                        <strong style="color:#059669;">+${log.amountText || '₦' + Number(log.amount || 0).toLocaleString()}</strong>
                    </div>
                `;
            });
        }

    } catch (error) {
        console.error("Error fetching user payout modal data from Firebase:", error);
        summaryContainer.innerHTML = `<div style="color:#dc2626;">Error loading details from database.</div>`;
        logsContainer.innerHTML = `<div style="text-align:center; color:#dc2626; font-size:0.8rem; padding:10px;">Failed to load transaction history.</div>`;
    }
}

/**
 * 2. PROMPT PASSWORD VERIFICATION BEFORE PAYOUT EXECUTION
 */
function promptAdminPasswordVerification() {
    const inputAmountEl = document.getElementById("payout-new-balance-input");
    const newBalance = inputAmountEl ? parseFloat(inputAmountEl.value) : NaN;

    if (isNaN(newBalance) || newBalance < 0) {
        alert("Please enter a valid numeric wallet balance.");
        return;
    }

    // Hide input modal and show security verification modal
    document.getElementById("admin-modify-balance-modal")?.classList.add("hidden-node");
    
    const verifyModal = document.getElementById("admin-verify-password-modal");
    if (verifyModal) {
        const passInput = document.getElementById("admin-payout-passkey-input");
        if (passInput) passInput.value = "";
        verifyModal.classList.remove("hidden-node");
    }
}

/**
 * 3. EXECUTE FINAL BALANCE MODIFICATION & PAYOUT
 * Saves updated wallet balances and logs payout transactions to Firebase
 */
async function executeFinalBalanceModificationAndPayout() {
    const passInput = document.getElementById("admin-payout-passkey-input");
    const enteredPass = passInput ? passInput.value.trim() : "";

    // Optional admin security check (matches system admin key or default '1234')
    const requiredPass = window.APP_STATE?.adminPasskey || "1234";
    if (enteredPass !== requiredPass) {
        alert("Invalid Admin Passkey. Operation aborted.");
        return;
    }

    const inputAmountEl = document.getElementById("payout-new-balance-input");
    const newBalance = parseFloat(inputAmountEl.value);

    if (isNaN(newBalance) || newBalance < 0 || !SELECTED_PAYOUT_DESIGNER_UID) {
        alert("Invalid target user or balance value.");
        return;
    }

    try {
        const { doc, getDoc, updateDoc, setDoc, db } = window.FortMartFirebase;

        const userDocRef = doc(db, "users", SELECTED_PAYOUT_DESIGNER_UID);
        const userSnap = await getDoc(userDocRef);

        if (!userSnap.exists()) {
            alert("User document not found in database.");
            return;
        }

        const userData = userSnap.data();
        const oldBalance = Number(userData.walletBalance || 0);
        const timestamp = new Date().toISOString();
        const logId = "LOG_" + Date.now();

        // 1. Update user wallet balance in Firestore
        await updateDoc(userDocRef, {
            walletBalance: newBalance,
            lastWalletPayoutTimestamp: Date.now(),
            updatedAt: timestamp
        });

        // 2. Save activity log entry for the payout event in Firestore
        const logPayload = {
            logId: logId,
            designerUid: SELECTED_PAYOUT_DESIGNER_UID,
            designerName: userData.identityName || userData.businessName || 'Designer',
            actionText: 'Payout Processed',
            oldBalance: oldBalance,
            newBalance: newBalance,
            amountDeducted: oldBalance - newBalance,
            amountText: `₦${(oldBalance - newBalance).toLocaleString()}`,
            timestamp: timestamp
        };

        await setDoc(doc(db, "activityLogs", logId), logPayload);

        // Close all modals
        document.getElementById("admin-verify-password-modal")?.classList.add("hidden-node");
        document.getElementById("admin-user-payout-modal")?.classList.add("hidden-node");

        // Success notification and view refresh
        if (typeof showTopRightToast === "function") {
            showTopRightToast("Payout processed and updated in Firebase successfully!", "success");
        } else {
            alert("Payout processed and updated in Firebase successfully!");
        }

        // Refresh dashboard list to reflect updated balances
        if (typeof renderAdminPayoutsDashboardView === "function") {
            renderAdminPayoutsDashboardView();
        }

    } catch (error) {
        console.error("Failed to commit payout updates to Firebase:", error);
        alert("Failed to update payout details in Firebase. Please try again.");
    }
}