let SYSTEM_DATABASE = {
    users: [
        { uid: "admin", identityName: "Fort Graphics Admin", accountType: "business", country: "Nigeria", dialingCode: "+234", identifierText: "fortdevelopers492@gmail.com", secretKey: "Fortmart492#", avatar: "fort-mart-logo.png", businessName: "8028241162 - Opay", businessInfo: "Phillip Imonode Ihidero", verificationStatus: "verified" },
        { uid: "user_sarah", identityName: "Sarah Enterprise Hub", accountType: "business", country: "Nigeria", dialingCode: "+234", identifierText: "sarah@gmail.com", secretKey: "Sarah123!", avatar: "", businessName: "1111111111 - First Bank", businessInfo: "Placeholder", verificationStatus: "verified" },
        { uid: "user_john", identityName: "John Mark", accountType: "personal", country: "Nigeria", dialingCode: "+234", identifierText: "john@gmail.com", secretKey: "John456!", avatar: "", verificationStatus: "verified" },
        { uid: "user_david", identityName: "David Enterprise Hub", accountType: "business", country: "Nigeria", dialingCode: "+234", identifierText: "david@gmail.com", secretKey: "David123!", avatar: "", businessName: "1111111111 - First Bank", businessInfo: "Placeholder", verificationStatus: "verified" },
    ],
    products: [
        {
            pid: "proj-1042",
            ownerUid: "usr-8821",
            name: "E-Commerce Mobile App UI/UX Redesign",
            info: "Looking for a modern, sleek UI/UX overhaul for a fashion marketplace app. Needs 5 primary screens: Home feed, Product detail view, Shopping cart modal, Checkout workflow, and User profile.",
            price: 45000,
            countryScope: "Nigeria",
            coverPhoto: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80",
            isBooked: false,
            status: "available",
            bookedByUid: null,
            assets: [
                { id: "asset-001", fileName: "brand_guidelines.pdf", dataUrl: "#" },
                { id: "asset-002", fileName: "wireframe_concept.png", dataUrl: "#" }
            ]
        },
        {
            pid: "proj-1043",
            ownerUid: "usr-8821",
            name: "Fintech Dashboard Landing Page Design",
            info: "Minimalist landing page design for a corporate payment gateway solution. Must include dark mode toggle previews and interactive feature comparison tables.",
            price: 60000,
            countryScope: "Nigeria",
            coverPhoto: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
            isBooked: true,
            status: "booked",
            bookedByUid: "usr-9903",
            assets: [
                { id: "asset-003", fileName: "project_brief.docx", dataUrl: "#" }
            ]
        }
    ],
    chats: [],
    platformFeedback: [],
    networkSuiteEntities: []
};