const collaborationRouter = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const authguard = require("../services/authguard");
const upload = require("../services/downloadExtension");
const axios = require('axios');


const prisma = new PrismaClient()

const genresEnum = [
    "Texte",
    "Pop",
    "Rock",
    "HipHop",
    "Rap",
    "Jazz",
    "Classical",
    "Reggae",
    "Country",
    "Electronic",
    "RnB",
    "Metal",
    "Alternative",
    "Blues",
    "Indie",
    "Folk",
    "Latin",
    "Soul",
    "Funk",
    "Punk",
    "Disco",
    "House",
    "Techno",
    "Dubstep",
    "Ambient",
    "Ska",
    "Grunge",
    "Gospel",
    "Bluegrass",
    "Swing",
    "Industrial",
    "PostRock",
    "Emo",
    "KPop",
    "JPop",
    "Cumbia",
    "Salsa",
    "BossaNova",
    "Tango",
    "Afrobeat",
    "Zydeco",
    "Trap",
    "LoFi",
    "Experimental",
    "ArtRock",
    "Shoegaze",
    "NewWave",
    "Britpop",
    "GothicRock",
    "BaroquePop",
    "SynthPop",
    "HardRock",
    "PowerPop",
    "SurfRock",
    "PostPunk",
    "ChristianRock",
    "Celtic",
    "Cajun",
    "NoiseRock",
    "StonerRock",
    "ProgressiveRock",
    "MelodicPunk",
    "SkaPunk",
    "MathRock",
    "TripHop",
    "DreamPop",
    "Grime",
    "NuMetal",
    "SouthernRock",
    "DarkWave",
    "Vaporwave",
    "Chiptune",
    "SeaShanty",
    "MusicalTheatre",
    "Soundtrack",
    "Instrumental"
];

collaborationRouter.get('/collaboration', authguard, async (req, res) => {
    const userId = req.session.userId;

    try {
        const followers = await prisma.follows.findMany({
            where: { followed_id: userId },
            include: {
                follower: {
                    select: {
                        id_user: true,
                        userName: true,
                        picture: true,
                    },
                },
            },
        });

        res.render('pages/addCollaboration.twig', { followers: followers || [] });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur lors de la récupération des followers');
    }
});



collaborationRouter.get('/searchFollowers', authguard, async (req, res) => {
    const userId = req.session.userId;
    const query = req.query.query || '';

    try {
        const lowerCaseQuery = query.toLowerCase();
        const followers = await prisma.follows.findMany({
            where: {
                followed_id: userId,
            },
            include: {
                follower: {
                    select: {
                        id_user: true,
                        userName: true,
                        picture: true,
                    },
                },
            },
        });

        const filteredFollowers = followers
            .map(f => f.follower)
            .filter(follower =>
                follower.userName.toLowerCase().includes(lowerCaseQuery)
            );

        res.json(filteredFollowers);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération des followers');
    }
});



collaborationRouter.post('/createProject', authguard, async (req, res) => {
    const { projectName, description, selectedFollowers } = req.body;
    const userId = req.session.users.id_user;

    try {
        const followersArray = Array.isArray(selectedFollowers)
            ? selectedFollowers
            : JSON.parse(selectedFollowers || "[]");


        const project = await prisma.projects.create({
            data: {
                name: projectName,
                description: description,
                UsersToProjects: {
                    create: [
                        { id_user: userId, role: 'owner' },
                        ...followersArray.map(followerId => ({
                            id_user: parseInt(followerId),
                            role: 'user',
                        })),
                    ],
                },
            },
        });

        res.redirect(`/project/${project.id_project}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur lors de la création du projet');
    }
});

collaborationRouter.post("/project/:id_project/upload", authguard, upload.single('file'), async (req, res) => {
    try {
        const { id_project } = req.params;  // Récupère l'ID du projet à partir de l'URL
        const userId = req.session.users.id_user;  // Récupère l'ID de l'utilisateur connecté
        const { genre, description, price } = req.body;  // Récupère les données envoyées avec la requête
        const file_url = req.file ? req.file.path : null;  // Récupère le chemin du fichier
    
        
        // Vérifie si l'ID du projet et le fichier sont présents
        if (!id_project) {
            return res.status(400).send('ID du projet manquant');
        }

        if (!file_url) {
            return res.status(400).send('Aucun fichier uploadé.');
        }

        // Crée l'asset dans la base de données
        await prisma.assets.create({
            data: {
                id_user: userId,
                name: req.body.name, 
                isPublic: false,
                url: req.file.filename,
                genre: req.body.genre || null,
                description: req.body.description || null,
                id_project: parseInt(id_project),  // ID du projet associé
            },
        });

        // Redirige vers la page du projet
        res.redirect(`/project/${id_project}`);
    } catch (error) {
        console.error("Erreur lors du téléversement du fichier :", error);
        res.status(500).send("Erreur lors du téléversement du fichier.");
    }
});




// Route : Supprimer un fichier
collaborationRouter.post("/project/:id_project/file/:id_file/delete", authguard, async (req, res) => {
    const { id_file } = req.params;

    try {
        await prisma.files.delete({
            where: { id_file: parseInt(id_file) },
        });

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lors de la suppression du fichier." });
    }
});

// Route pour ajouter un commentaire à un fichier (asset)
collaborationRouter.post("/project/:id_project/:id_asset/comment", authguard, async (req, res) => {
    try {
        const { id_project, id_asset } = req.params; // Récupérer l'id du projet et du fichier
        const { commentContent } = req.body; // Contenu du commentaire
        const userId = req.session.users.id_user; // ID de l'utilisateur connecté

        const newComment = await prisma.commentaires.create({
            data: {
                id_user: userId,
                id_project: parseInt(id_project), 
                id_asset: parseInt(id_asset), // Associer le commentaire au fichier
                content: commentContent,  // Le contenu du commentaire
            },
        });

        // Rediriger vers la page du projet avec les commentaires
        res.redirect(`/project/${id_project}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur lors de l'ajout du commentaire");
    }
});

// Route : Supprimer un commentaire
collaborationRouter.post("/project/:id_project/comment/:id_comment/delete", authguard, async (req, res) => {
    const { id_comment } = req.params;

    try {
        await prisma.comments.delete({
            where: { id_comment: parseInt(id_comment) },
        });

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lors de la suppression du commentaire." });
    }
});

// Route : Récupérer les fichiers et commentaires
collaborationRouter.get("/project/:id_project", authguard, async (req, res) => {
    const { id_project } = req.params; // Récupère l'ID du projet à partir de l'URL

    try {
        // Utilise l'ID dynamique pour récupérer les données du projet
        const project = await prisma.projects.findUnique({
            where: { id_project: parseInt(id_project) },
            include: {
                Assets: {
                    include: {
                        Commentaires: {
                            include: {
                                Users: {
                                    select: {
                                        userName: true, // Affichage du nom de l'utilisateur
                                    },
                                },
                            },
                        },
                    },
                },
            },
            include: {
                UsersToProjects: {
                    include: {
                        Users: {
                            select: {
                                id_user: true,
                                userName: true,
                                picture: true,
                                role: true,
                            },
                        },
                    },
                },
                Assets: true,
                Commentaires: {
                    include: {
                        Users: {
                            select: {
                                id_user: true,
                                userName: true,
                            },
                        },
                    },
                },
                Likes: {
                    include: {
                        Users: {
                            select: {
                                id_user: true,
                                userName: true,
                            },
                        },
                    },
                },
            },
        })

        if (!project) {
            return res.status(404).send("Projet non trouvé");
        }

        const projectDetails = {
            id_project: project.id_project, 
            name: project?.name || "Nom non défini",
            description: project?.description || "Description non définie",
            members: Array.isArray(project?.UsersToProjects)
                ? project.UsersToProjects.map((utp) => ({
                      id_user: utp.Users?.id_user || null,
                      userName: utp.Users?.userName || "Nom inconnu",
                      picture: utp.Users?.picture || "Image non définie",
                      role: utp.role || "Rôle inconnu",
                  }))
                : [], 
                files: Array.isArray(project?.Assets)
                ? project.Assets.map((file) => ({
                      id: file.id || null,
                      name: file.name || "Fichier sans nom",
                      url: file.url || "URL non définie",
                      comments: Array.isArray(file.Commentaires)  
                          ? file.Commentaires.map((comment) => ({
                                id: comment.id || null,
                                content: comment.content || "Commentaire vide",
                                userName: comment.Users?.userName || "Utilisateur inconnu",
                                created_at: comment.created_at || null,
                            }))
                          : [], 
                  }))
                : [],
        };

        res.render("pages/collaboration.twig", { project: projectDetails, genres: genresEnum  });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur lors de la récupération du projet");
    }
});


collaborationRouter.get('/myProjects', authguard, async (req, res) => {
    const userId = req.session.users.id_user;

    try {
        const projects = await prisma.projects.findMany({
            where: {
                UsersToProjects: {
                    some: {
                        id_user: userId,
                    },
                },
            },
            include: {
                UsersToProjects: {
                    select: {
                        id_user: true,
                        role: true,
                        Users: {
                            select: {
                                userName: true,
                                picture: true,
                            },
                        },
                    },
                },
            },
        });

        const projectDetails = projects.map(project => ({
            id_project: project.id_project,
            name: project.name,
            description: project.description,
            role: project.UsersToProjects.find(userProject => userProject.id_user === userId)?.role,
            users: project.UsersToProjects.map(userProject => userProject.Users),
        }));


        res.render('pages/projects.twig', {
            title: 'My Projects',
            projects: projectDetails,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération des projets');
    }
});


collaborationRouter.post('/project/delete/:id', authguard, async (req, res) => {
    const userId = req.session.userId;
    const projectId = parseInt(req.params.id);

    try {
        const project = await prisma.projects.findUnique({
            where: {
                id_project: projectId,
            },
            include: {
                UsersToProjects: {
                    where: {
                        id_user: userId,
                    },
                    select: {
                        role: true,
                    },
                },
            },
        });

        if (!project || project.UsersToProjects[0]?.role !== 'owner') {
            return res.status(403).send('Vous n\'êtes pas autorisé à supprimer ce projet.');
        }

        await prisma.usersToProjects.deleteMany({
            where: {
                id_project: projectId,
            },
        });

        await prisma.projects.delete({
            where: {
                id_project: projectId,
            },
        });

        res.redirect('/myProjects');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la suppression du projet.');
    }
});

collaborationRouter.get('/studio', authguard, (req, res) => {
    res.render('pages/studio.twig', {
        title: 'Studios d\'enregistrement',
    });
});

collaborationRouter.get('/studio-data', authguard, async (req, res) => {
    const { lat, lon, radius } = req.query;
    let bboxQuery;

    if (lat && lon && radius) {
        const bbox = getBoundingBox(parseFloat(lat), parseFloat(lon), parseFloat(radius));
        bboxQuery = `${bbox.south},${bbox.west},${bbox.north},${bbox.east}`;
    } else {
        bboxQuery = '-90,-180,90,180';
    }

    const overpassQuery = `
        [out:json];
        node["amenity"="studio"](${bboxQuery});
        out body;
    `;

    try {
        const response = await fetchOverpassData(overpassQuery);
        const studios = response.elements.map(studio => ({
            name: studio.tags.name || 'Nom non spécifié',
            address: studio.tags['addr:street'] || studio.tags.address || 'Adresse non spécifiée',
            phone: studio.tags.phone || studio.tags['contact:phone'] || 'Téléphone non spécifié',
            image: studio.tags.image || studio.tags['wikimedia_commons'] || null,
            latitude: studio.lat,
            longitude: studio.lon
        }));
        res.json(studios);
    } catch (error) {
        console.error("Erreur lors de la récupération des données Overpass", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des studios" });
    }
});

function getBoundingBox(lat, lon, radiusKm) {
    const earthRadiusKm = 6371;
    const latDelta = (radiusKm / earthRadiusKm) * (180 / Math.PI);
    const lonDelta = (radiusKm / earthRadiusKm) * (180 / Math.PI) / Math.cos(lat * Math.PI / 180);

    return {
        south: lat - latDelta,
        west: lon - lonDelta,
        north: lat + latDelta,
        east: lon + lonDelta
    };
}

async function fetchOverpassData(query) {
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    return await response.json();
}

module.exports = collaborationRouter;