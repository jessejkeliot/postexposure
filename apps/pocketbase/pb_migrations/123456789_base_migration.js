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

    // 3. Articles Collection
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
    
    // 4. Seasons Collection
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
        ]
    });
    app.save(seasons);

    // 5. Films Collection
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
            { name: "created", type: "autodate", onCreate: true },
            { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
        ]
    });
    app.save(films);

    // 6. Media Collection (Centralized Asset Management)
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
                maxSize: 10485760, // 10MB limit
                mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"] 
            },
            { name: "caption", type: "text" },
            { name: "type", type: "select", maxSelect: 1, values: ["poster", "still", "banner", "thumbnail"] },
            { 
                name: "film", 
                type: "relation", 
                maxSelect: 1, 
                collectionId: films.id, 
                cascadeDelete: true 
            },
            { 
                name: "article", 
                type: "relation", 
                maxSelect: 1, 
                collectionId: articles.id, 
                cascadeDelete: true 
            },
            { name: "created", type: "autodate", onCreate: true },
            { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
        ]
    });
    app.save(media);
    
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
            { name: "showing_date", type: "date", required: true },
            { name: "showing_time", type: "date", required: true },
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
            { name: "created", type: "autodate", onCreate: true },
            { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
        ]
    });
    app.save(tickets);

}, (app) => {
    // Down migration (rollback behavior if needed)
    try {
        app.delete(app.findCollectionByNameOrId("tickets"));
        app.delete(app.findCollectionByNameOrId("articles"));
        app.delete(app.findCollectionByNameOrId("authors"));
        app.delete(app.findCollectionByNameOrId("categories"));
        app.delete(app.findCollectionByNameOrId("screenings"));
        app.delete(app.findCollectionByNameOrId("films"));
        app.delete(app.findCollectionByNameOrId("seasons"));
        app.delete(app.findCollectionByNameOrId("media"));
    } catch {}
});