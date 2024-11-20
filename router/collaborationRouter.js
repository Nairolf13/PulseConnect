const collaborationRouter = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const authguard = require("../services/authguard");
const axios = require('axios');


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

collaborationRouter.get("/project/:id_project", authguard, async (req, res) => {
    const { id_project } = req.params;

    try {
        const project = await prisma.projects.findUnique({
            where: { id_project: parseInt(id_project) },
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
            },
        });

        if (!project) {
            return res.status(404).send("Projet non trouvé");
        }

        const projectDetails = {
            name: project.name,
            description: project.description,
            members: project.UsersToProjects.map((utp) => ({
                id_user: utp.Users?.id_user,
                userName: utp.Users?.userName,
                picture: utp.Users?.picture,
                role: utp.role,
            })),
        };

        res.render("pages/collaboration.twig", { project: projectDetails });
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
    const bboxWorld = '-90,-180,90,180';
    const overpassQuery = `
    [out:json];
    node["amenity"="studio"](${bboxWorld});
    out body;
    `;

    try {
        const response = await axios.post(
            'https://overpass.kumi.systems/api/interpreter',
            overpassQuery,
            { headers: { 'Content-Type': 'text/plain' } }
        );

        const studios = response.data.elements.map(studio => ({
            id: studio.id,
            name: studio.tags.name || 'Studio inconnu',
            latitude: studio.lat,
            longitude: studio.lon,
            address: studio.tags['addr:full'] ||
                `${studio.tags['addr:street'] || ''}, ${studio.tags['addr:city'] || ''}, ${studio.tags['addr:postcode'] || ''}`.trim() ||
                'Adresse non spécifiée',
            phone: studio.tags['contact:phone'] || null,  // Passer à null si le numéro de téléphone n'est pas disponible
        }));

        res.json(studios); 
    } catch (error) {
        console.error('Erreur avec Overpass API:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des studios' });
    }
});



module.exports = collaborationRouter;