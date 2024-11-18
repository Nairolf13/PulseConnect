const collaborationRouter = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const authguard = require("../services/authguard");

const prisma = new PrismaClient()

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

        res.render('pages/collaboration.twig', { followers: followers || [] });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur lors de la récupération des followers');
    }
});



collaborationRouter.get('/searchFollowers', async (req, res) => {
    const userId = req.session.userId;  // ID de l'utilisateur connecté
    const query = req.query.query || '';  // Terme de recherche de l'utilisateur

    try {
        const lowerCaseQuery = query.toLowerCase();
        const followers = await prisma.follows.findMany({
            where: {
                followed_id: userId, // L'utilisateur auquel les followers appartiennent
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
        
        // Filtrer les followers dans le code JavaScript
        const filteredFollowers = followers
            .map(f => f.follower)  // Extraire seulement l'objet `follower`
            .filter(follower =>
                follower.userName.toLowerCase().includes(lowerCaseQuery)  // Recherche par nom d'utilisateur
            );
        
        res.json(filteredFollowers);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération des followers');
    }
});



collaborationRouter.post('/createProject', async (req, res) => {
    const { projectName, description, selectedFollowers } = req.body;
    const userId = req.session.userId;

    try {
        // Vérifier si selectedFollowers est un tableau valide, sinon le définir comme un tableau vide
        const followersArray = Array.isArray(selectedFollowers) ? selectedFollowers : [];

        // Créer le projet
        const project = await prisma.projects.create({
            data: {
                name: projectName,
                description: description,
                UsersToProjects: {
                    create: [
                        { id_user: userId, role: 'owner' },
                        ...followersArray.map(followerId => ({
                            id_user: Number(followerId),
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


module.exports = collaborationRouter;