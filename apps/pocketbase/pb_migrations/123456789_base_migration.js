migrate((app) => {
    // 1. Categories Collection
    const categories = new Collection({
        type: "base",
        name: "categories",
        listRule: "",
        viewRule: "",
        createRule: null,
        updateRule: null,
        deleteRule: null,
        fields: [
            { name: "name", type: "text", required: true, unique: true },
            { name: "slug", type: "text", required: true, unique: true },
            { name: "created", type: "autodate", onCreate: true },
            { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
        ]
    });
    app.save(categories);

    // 2. Authors Collection
    const authors = new Collection({
        type: "base",
        name: "authors",
        listRule: "",
        viewRule: "",
        fields: [
            { name: "name", type: "text", required: true },
            { name: "bio", type: "text" },
            { name: "avatar", type: "file", maxSelect: 1, maxSize: 5242880, mimeTypes: ["image/jpeg", "image/png", "image/webp"] },
            { name: "created", type: "autodate", onCreate: true },
            { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
        ]
    });
    app.save(authors);

    // 3. Media Collection (Centralized Asset Management)
    const media = new Collection({
        type: "base",
        name: "media",
        listRule: "",
        viewRule: "",
        fields: [
            { 
                name: "file", 
                type: "file", 
                required: true, 
                maxSelect: 1, 
                maxSize: 52428800, // 50MB limit
                mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"] 
            },
            { name: "caption", type: "text" },
            { name: "type", type: "select", maxSelect: 1, values: ["poster", "still", "banner", "thumbnail", "pdf", "cover"] },
            { name: "created", type: "autodate", onCreate: true },
            { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
        ]
    });
    app.save(media);

    // 4. Articles Collection
    const articles = new Collection({
        type: "base",
        name: "articles",
        listRule: "",
        viewRule: "",
        fields: [
            { name: "title", type: "text", required: true },
            { name: "slug", type: "text", required: true, unique: true },
            { name: "excerpt", type: "text" },
            { name: "content", type: "editor" },
            { 
                name: "cover_image", 
                type: "relation", 
                maxSelect: 1, 
                collectionId: media.id, // Direct reference to the primary media record
                cascadeDelete: false 
            },
            { 
                name: "category", 
                type: "relation", 
                required: true,
                maxSelect: 1, 
                collectionId: categories.id,
                cascadeDelete: false 
            },
            { 
                name: "author", 
                type: "relation",
                required: true,
                maxSelect: 1, 
                collectionId: authors.id,
                cascadeDelete: false 
            },
            { name: "is_paywalled", type: "bool" },
            { name: "published_at", type: "date" },
            { name: "created", type: "autodate", onCreate: true },
            { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
        ]
    });
    app.save(articles);
    
    // 5. Seasons Collection
    const seasons = new Collection({
        type: "base",
        name: "seasons",
        listRule: "",
        viewRule: "",
        fields: [
            { name: "title", type: "text", required: true },
            { name: "start_date", type: "date", required: true },
            { name: "end_date", type: "date", required: true },
            { name: "description", type: "text", required: false },
            { name: "created", type: "autodate", onCreate: true },
            { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
            // add an image to go with the season
        ]
    });
    app.save(seasons);

    // 6. Films Collection
    const films = new Collection({
        type: "base",
        name: "films",
        listRule: "",
        viewRule: "",
        fields: [
            { name: "title", type: "text", required: true },
            { name: "director", type: "text", required: true },
            { name: "release_date", type: "date", required: true },
            { name: "description", type: "text", required: false },
            { 
                name: "cover_image", 
                type: "relation", 
                maxSelect: 1, 
                collectionId: media.id, // Direct reference to the primary media record
                cascadeDelete: false 
            },
            { name: "created", type: "autodate", onCreate: true },
            { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
        ]
    });
    app.save(films);
    
    // 7. Screenings Collection
    const screenings = new Collection({
        type: "base",
        name: "screenings",
        listRule: "",
        viewRule: "",
        fields: [
            { 
                name: "film", 
                type: "relation",
                required: true,
                maxSelect: 1, 
                collectionId: films.id,
                cascadeDelete: false 
            },
            { 
                name: "season", 
                type: "relation",
                required: true,
                maxSelect: 1, 
                collectionId: seasons.id,
                cascadeDelete: false 
            },
            { name: "showing_date", type: "date", required: true },
            { name: "price", type: "number", min: 0 },
            { name: "total_tickets", type: "number", min: 0 },
            { name: "tickets_sold", type: "number", min: 0 },
            { name: "tickets_available", type: "number", min: 0 },
            { name: "created", type: "autodate", onCreate: true },
            { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
        ]
    });
    app.save(screenings);

    // 8. Tickets Collection
    const users = app.findCollectionByNameOrId("users");
    users.fields.add(new TextField({ name: "role" }));
    users.fields.add(new BoolField({ name: "isSubscribed" }));
    users.fields.add(new TextField({ name: "subscriptionTier" }));
    users.fields.add(new TextField({ name: "subscriptionExpiresAt" }));
    users.fields.add(new BoolField({ name: "emailVerified" }));
    users.fields.add(new DateField({ name: "createdAt" }));
    users.fields.add(new DateField({ name: "updatedAt" }));
    users.fields.add(new URLField({ name: "image" }));
    app.save(users);

    const tickets = new Collection({
        type: "base",
        name: "tickets",
        listRule: "",
        viewRule: "",
        createRule: "",
        updateRule: "",
        deleteRule: "",
        fields: [
            {
                name: "screening",
                type: "relation",
                required: true,
                maxSelect: 1,
                collectionId: screenings.id,
                cascadeDelete: true
            },
            {
                name: "user",
                type: "relation",
                required: true,
                maxSelect: 1,
                collectionId: users.id,
                cascadeDelete: true
            },
            { name: "status", type: "text" },
            { name: "scanned_at", type: "date" },
            { name: "created", type: "autodate", onCreate: true },
            { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
        ]
    });
    app.save(tickets);

    const about = new Collection({
        type: "base",
        name: "about",
        listRule: "",
        viewRule: "",
        createRule: "",
        updateRule: "",
        deleteRule: "",
        fields: [
            { name: "content", type: "editor", required:true },
            { name: "published_at", type: "date" },
            { name: "created", type: "autodate", onCreate: true },
            { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
        ]
    });
    app.save(about);

    // 10. Issues Collection (Magazine Issues)
    const issues = new Collection({
        type: "base",
        name: "issues",
        listRule: "",
        viewRule: "",
        createRule: null,
        updateRule: null,
        deleteRule: null,
        fields: [
            { name: "title", type: "text", required: true },
            { name: "price", type: "number", required: true, min: 0 },
            { 
                name: "front_cover", 
                type: "relation", 
                maxSelect: 1, 
                collectionId: media.id, 
                cascadeDelete: false 
            },
            { 
                name: "back_cover", 
                type: "relation", 
                maxSelect: 1, 
                collectionId: media.id, 
                cascadeDelete: false 
            },
            { 
                name: "pdf", 
                type: "relation", 
                maxSelect: 1, 
                collectionId: media.id, 
                cascadeDelete: false 
            },
            { name: "pdf_url", type: "text" },
            { name: "publish_date", type: "date", required: true },
            { name: "description", type: "text" },
            { name: "created", type: "autodate", onCreate: true },
            { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
        ]
    });
    app.save(issues);

    // 11. Better-Auth Sessions Collection
    const sessions = new Collection({
        type: "base",
        name: "sessions",
        listRule: null,
        viewRule: null,
        createRule: null,
        updateRule: null,
        deleteRule: null,
        fields: [
            { name: "userId", type: "text", required: true },
            { name: "token", type: "text", required: true, unique: true },
            { name: "expiresAt", type: "date", required: true },
            { name: "ipAddress", type: "text" },
            { name: "userAgent", type: "text" },
            { name: "createdAt", type: "date", required: true },
            { name: "updatedAt", type: "date", required: true }
        ]
    });
    app.save(sessions);

    // 12. Better-Auth Accounts Collection
    const accounts = new Collection({
        type: "base",
        name: "accounts",
        listRule: null,
        viewRule: null,
        createRule: null,
        updateRule: null,
        deleteRule: null,
        fields: [
            { name: "userId", type: "text", required: true },
            { name: "accountId", type: "text", required: true },
            { name: "providerId", type: "text", required: true },
            { name: "accessToken", type: "text" },
            { name: "refreshToken", type: "text" },
            { name: "idToken", type: "text" },
            { name: "accessTokenExpiresAt", type: "date" },
            { name: "refreshTokenExpiresAt", type: "date" },
            { name: "scope", type: "text" },
            { name: "password", type: "text" },
            { name: "createdAt", type: "date", required: true },
            { name: "updatedAt", type: "date", required: true }
        ]
    });
    app.save(accounts);

    // 13. Better-Auth Verifications Collection
    const verifications = new Collection({
        type: "base",
        name: "verifications",
        listRule: null,
        viewRule: null,
        createRule: null,
        updateRule: null,
        deleteRule: null,
        fields: [
            { name: "identifier", type: "text", required: true },
            { name: "value", type: "text", required: true },
            { name: "expiresAt", type: "date", required: true },
            { name: "createdAt", type: "date" },
            { name: "updatedAt", type: "date" }
        ]
    });
    app.save(verifications);

    // 14. Purchases Collection
    const purchases = new Collection({
        type: "base",
        name: "purchases",
        listRule: "",
        viewRule: "",
        createRule: "",
        updateRule: "",
        deleteRule: "",
        fields: [
            {
                name: "user",
                type: "relation",
                collectionId: users.id,
                maxSelect: 1,
                cascadeDelete: false
            },
            { name: "type", type: "text", required: true },
            { name: "item_id", type: "text" },
            { name: "item_name", type: "text", required: true },
            { name: "amount", type: "number", required: true, min: 0 },
            { name: "currency", type: "text" },
            { name: "status", type: "text", required: true },
            { name: "stripe_payment_id", type: "text" },
            { name: "created", type: "autodate", onCreate: true },
            { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
        ]
    });
    app.save(purchases);

}, (app) => {
    // Down migration (rollback behavior if needed)
    try {
        app.delete(app.findCollectionByNameOrId("purchases"));
        app.delete(app.findCollectionByNameOrId("verifications"));
        app.delete(app.findCollectionByNameOrId("accounts"));
        app.delete(app.findCollectionByNameOrId("sessions"));
        app.delete(app.findCollectionByNameOrId("issues"));
        app.delete(app.findCollectionByNameOrId("tickets"));
        app.delete(app.findCollectionByNameOrId("articles"));
        app.delete(app.findCollectionByNameOrId("authors"));
        app.delete(app.findCollectionByNameOrId("categories"));
        app.delete(app.findCollectionByNameOrId("screenings"));
        app.delete(app.findCollectionByNameOrId("films"));
        app.delete(app.findCollectionByNameOrId("seasons"));
        app.delete(app.findCollectionByNameOrId("media"));
        app.delete(app.findCollectionByNameOrId("about"));
    } catch {}
});