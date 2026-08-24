migrate((app) => {
    // 1. Categories Collection
    const categories = new Collection({
        type: "base",
        name: "categories",
        listRule: "", // Public read
        viewRule: "",
        createRule: null, // Admin only
        updateRule: null,
        deleteRule: null,
        fields: [
            { name: "name", type: "text", required: true, unique: true },
            { name: "slug", type: "text", required: true, unique: true }
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
            { name: "avatar", type: "file", maxSelect: 1, maxSize: 5242880, mimeTypes: ["image/jpeg", "image/png", "image/webp"] }
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
            { name: "cover_image", type: "file", maxSelect: 1, maxSize: 5242880 },
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
            { name: "published_at", type: "date" }
        ]
    });
    app.save(articles);
    
    const screenings = new Collection({
        type:"base",
        name:"screenings",
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
            {name: "showing_date", type: "date", required: true},
            {name: "showing_time", type: "date", required: true},
        ]
    });
    app.save(screenings);
    const films = new Collection({
        type:"base",
        name:"films",
        listRule: "",
        viewRule: "",
        fields: [
            {name: "title", type: "text", required: true},
            {name: "director", type: "text", required: true},
            {name: "release_date", type: "date", required: true},
            {name: "description", type: "text", required: false}
        ]
    });
    app.save(films);


    const seasons = new Collection({
        type:"base",
        name:"seasons",
        listRule: "",
        viewRule: "",
        fields: [
            {name: "title", type: "text", required: true},
            {name: "start_date", type: "date", required: true},
            {name: "end_date", type: "date", required: true},
            {name: "description", type: "text", required: false}
        ]
    });
    app.save(seasons);

}, (app) => {
    // Down migration (rollback behavior if needed)
    try {
        app.delete(app.findCollectionByNameOrId("articles"));
        app.delete(app.findCollectionByNameOrId("authors"));
        app.delete(app.findCollectionByNameOrId("categories"));
        app.delete(app.findCollectionByNameOrId("screenings"));
        app.delete(app.findCollectionByNameOrId("films"));
        app.delete(app.findCollectionByNameOrId("seasons"));
    } catch {}
});