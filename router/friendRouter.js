const friendRouter = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const authguard = require("../services/authguard");

const prisma = new PrismaClient()

friendRouter.get('/users-to-follow', authguard, async (req, res) => {
    try {
        const loggedUser = req.session.users.id_user;
        const users = await prisma.users.findUnique({
            where: { id_user: loggedUser }
        });
       
        const followedUsers = await prisma.follows.findMany({
            where: {
                follower_id: loggedUser
            },
            select: {
                followed_id: true
            }
        });

        const followedUserIds = followedUsers.map(follow => follow.followed_id);
        const usersToFollow = await prisma.users.findMany({
            where: {
                id_user: {
                    not: loggedUser,
                    notIn: followedUserIds
                }
            }
        });

        res.render('pages/addFriend.twig', {
            users,
            usersCo: usersToFollow,
            title: "Utilisateurs à suivre"
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Erreur lors de la récupération des utilisateurs.");
    }
});

friendRouter.post('/follow/:id', authguard, async (req, res) => {
    try {
        const loggedUserId = req.session.users.id_user;
        const followedUserId = parseInt(req.params.id);

        await prisma.follows.create({
            data: {
                follower_id: loggedUserId,
                followed_id: followedUserId
            }
        });

        res.redirect('/following'); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Erreur lors de l'ajout du follow.");
    }
});
friendRouter.get('/following', authguard, async (req, res) => {
    try {
        const loggedUserId = req.session.users.id_user;
        const followingUsers = await prisma.follows.findMany({
            where: {
                follower_id: loggedUserId
            },
            include: {
                followed: true 
            }
        });

        if (!followingUsers.length) {
            return res.render('pages/friends.twig', {
                followingUsers: [],
                title: "Utilisateurs suivis"
            });
        }

        res.render('pages/friends.twig', {
            followingUsers: followingUsers.map(f => f.followed),
            title: "Utilisateurs suivis"
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Erreur lors de la récupération des utilisateurs suivis.");
    }
});

friendRouter.post('/unfollow/:id', authguard, async (req, res) => {
    try {
        const loggedUserId = req.session.users.id_user;
        const unfollowedUserId = parseInt(req.params.id);

        await prisma.follows.deleteMany({
            where: {
                follower_id: loggedUserId,
                followed_id: unfollowedUserId
            }
        });

        res.redirect('/following'); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Erreur lors de la suppression du follow.");
    }
});






module.exports = friendRouter