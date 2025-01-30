const contentRouter = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const upload = require("../services/downloadExtension");
const authguard = require("../services/authguard");

const prisma = new PrismaClient();

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

contentRouter.get('/addContent', authguard, async (req, res) => {
    const users = await prisma.users.findUnique({
        where: { id_user: req.session.users.id_user }
    });
    res.render('pages/addContent.twig', { genres: genresEnum });
    users
});

contentRouter.post('/addContent', authguard, upload.single('mediaFile'), async (req, res) => {
    try {
        const userId = req.session.users.id_user;
        const file_url = req.file ? req.file.path : null;

        if (!file_url) {
            return res.status(400).send('Aucun fichier uploadé.');
        }

        await prisma.assets.create({
            data: {
                id_user: userId,
                isPublic: true,
                url: req.file.filename,
                name: req.body.name,
                genre: req.body.genre,
                description: req.body.description
            },
        });

        res.redirect('/home');
    } catch (error) {
        console.error("Erreur lors de l'ajout du contenu :", error);
        res.status(500).send('Erreur lors de l\'ajout du fichier.');
    }
});

contentRouter.get("/personalContent", authguard, async (req, res) => {
    try {
        const users = await prisma.users.findUnique({
            where: { id_user: req.session.users.id_user }
        });

        const content = await prisma.assets.findMany({
            where: {
                id_user: req.session.users.id_user
            },
            include: {
                Users: true,
                likes: true
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        const commentaires = await prisma.commentaires.findMany({
            where: {
                id_asset: {
                    in: content.map(item => item.id)
                }
            },
            include: {
                Users: {
                    select: {
                        userName: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        const commentCounts = await prisma.commentaires.groupBy({
            by: ['id_asset'],
            _count: {
                id_asset: true
            },
            where: {
                id_asset: {
                    in: content.map(item => item.id)
                }
            }
        });

        const contentWithCommentsAndCounts = content.map(item => ({
            ...item,
            Commentaires: commentaires.filter(comment => comment.id_asset === item.id),
            commentCount: commentCounts.find(count => count.id_asset === item.id)?._count?.id_asset || 0
        }));

        res.render("pages/profil.twig", {
            users,
            content: contentWithCommentsAndCounts
        });

    } catch (error) {
        console.error("Erreur lors du rendu de la page de profil :", error);
        res.render("pages/profil.twig", { error });
    }
});

contentRouter.post("/deleteContent/:id", authguard, async (req, res) => {
    try {
        const contentId = parseInt(req.params.id, 10);
        const userId = req.session.users.id_user;
        const asset = await prisma.assets.findUnique({
            where: { id: contentId },
        });

        if (!asset) {
            return res.status(404).send("Contenu non trouvé.");
        }

        if (asset.id_user !== userId) {
            return res.status(403).send("Vous n'avez pas l'autorisation de supprimer ce contenu.");
        }

        await prisma.assets.delete({
            where: { id: contentId },
        });

        res.redirect("/personalContent");
    } catch (error) {
        console.error("Erreur lors de la suppression du contenu :", error);
        res.status(500).send("Erreur lors de la suppression du contenu.");
    }
});

contentRouter.post('/like/:assetId', authguard, async (req, res) => {
    try {
        const assetId = parseInt(req.params.assetId, 10);
        const userId = req.session.users.id_user;

        const existingLike = await prisma.likes.findFirst({
            where: { id_user: userId, id_asset: assetId },
        });

        let likeCount = 0;

        if (existingLike) {
            await prisma.likes.delete({ where: { id: existingLike.id } });
            likeCount = -1; 
        } else {
            await prisma.likes.create({
                data: {
                    id_user: userId,
                    id_asset: assetId,
                },
            });
            likeCount = 1;
        }

        const updatedLikeCount = await prisma.likes.count({
            where: { id_asset: assetId },
        });

        res.json({ success: true, likeCount: updatedLikeCount });
    } catch (error) {
        console.error("Erreur lors du like/délike :", error);

        res.status(500).json({ success: false, message: "Erreur lors du like/délike." });
    }
});

contentRouter.get('/likes/users/:assetId', async (req, res) => {
    try {
        const assetId = parseInt(req.params.assetId, 10);

        const likes = await prisma.likes.findMany({
            where: { id_asset: assetId },
            include: { Users: { select: { userName: true, firstName: true, lastName: true } } },
        });

        const users = likes.map(like => like.Users); 

        if (users.length > 0) {
            return res.json({ users: users });
        } else {
            return res.json({ users: [] });
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs ayant liké:", error);
        return res.status(500).json({ success: false, message: "Erreur lors de la récupération des utilisateurs." });
    }
});

contentRouter.get('/likes/count/:assetId', async (req, res) => {
    try {
        const assetId = parseInt(req.params.assetId);

        const likeCount = await prisma.likes.count({
            where: { id_asset: assetId },
        });

        res.json({ count: likeCount });
    } catch (error) {
        console.error("Erreur lors de la récupération des likes :", error);
        res.status(500).send("Erreur lors de la récupération des likes.");
    }
});

contentRouter.post('/comment/:assetId', authguard, async (req, res) => {
    try {
        const assetId = parseInt(req.params.assetId, 10);
        const userId = req.session.users.id_user;
        const { commentContent } = req.body;
        const asset = await prisma.assets.findUnique({
            where: { id: assetId }
        });

        if (!asset) {
            return res.status(404).send("Asset non trouvé.");
        }

        const newComment = await prisma.commentaires.create({
            data: {
                id_user: userId,
                id_asset: assetId,
                content: commentContent,
            },
        });

        res.redirect('/home');

    } catch (error) {
        console.error("Erreur lors de l'ajout du commentaire :", error);
        res.status(500).send("Erreur lors de l'ajout du commentaire.");
    }
});

contentRouter.get('/comments/:assetId', async (req, res) => {
    try {
        const assetId = parseInt(req.params.assetId);

        const comments = await prisma.commentaires.findMany({
            where: { id_asset: assetId },
            include: {
                Users: {
                    select: {
                        userName: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        res.json(comments);
    } catch (error) {
        console.error("Erreur lors de la récupération des commentaires :", error);
        res.status(500).send("Erreur lors de la récupération des commentaires.");
    }
});

contentRouter.get('/comments/count/:assetId', async (req, res) => {
    try {
        const assetId = parseInt(req.params.assetId);

        const commentCount = await prisma.commentaires.count({
            where: { id_asset: assetId },
        });

        res.json({ count: commentCount });
    } catch (error) {
        console.error("Erreur lors de la récupération du nombre de commentaires :", error);
        res.status(500).send("Erreur lors de la récupération du nombre de commentaires.");
    }
});

contentRouter.put('/comment/:commentId', authguard, async (req, res) => {
    try {
        const commentId = parseInt(req.params.commentId, 10);
        const userId = req.session.users.id_user; 
        const { content } = req.body;

        const comment = await prisma.commentaires.findUnique({
            where: { id: commentId },
        });

        if (!comment) {
            return res.status(404).send("Commentaire non trouvé.");
        }

        if (comment.id_user !== userId) {
            return res.status(403).send("Vous n'avez pas la permission de modifier ce commentaire.");
        }

        const updatedComment = await prisma.commentaires.update({
            where: { id: commentId },
            data: { content },
        });

        res.json(updatedComment);
    } catch (error) {
        console.error("Erreur lors de la modification du commentaire :", error);
        res.status(500).send("Erreur lors de la modification du commentaire.");
    }
});

contentRouter.delete('/comment/:commentId', authguard, async (req, res) => {
    try {
        const commentId = parseInt(req.params.commentId, 10);
        const userId = req.session.users.id_user;

        const comment = await prisma.commentaires.findUnique({
            where: { id: commentId },
        });

        if (!comment) {
            return res.status(404).send("Commentaire non trouvé.");
        }

        if (comment.id_user !== userId) {
            return res.status(403).send("Vous n'avez pas la permission de supprimer ce commentaire.");
        }

        await prisma.commentaires.delete({
            where: { id: commentId },
        });

        const remainingComments = await prisma.commentaires.count({
            where: { id_asset: comment.id_asset },
        });

        res.json({ remainingComments });
    } catch (error) {
        console.error("Erreur lors de la suppression du commentaire :", error);
        res.status(500).send("Erreur lors de la suppression du commentaire.");
    }
});


module.exports = contentRouter;
