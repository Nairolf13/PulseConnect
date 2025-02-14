const messagerieRouter = require("express").Router()
const { PrismaClient } = require("@prisma/client")
const authguard = require("../services/authguard")

const prisma = new PrismaClient()

messagerieRouter.get("/messagerie", authguard, async (req, res) => {
    const userId = req.session.users?.id_user;

    if (!userId) {
        console.error("Erreur : l'ID utilisateur est manquant");
        return res.status(400).send("Erreur : l'ID utilisateur est manquant");
    }

    try {
        // Récupérer les conversations, en excluant celles où tous les messages ont été supprimés par l'utilisateur connecté
        const conversations = await prisma.messages.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { recipientId: userId }
                ],
                AND: [
                    {
                        OR: [
                            { deletedByUserId: null },
                            { deletedByUserId: { not: userId } }
                        ]
                    }
                ]
            },
            orderBy: {
                created_at: "asc"
            },
            include: {
                senderUsers: true,
                recipientUsers: true
            }
        });

        // Regrouper les messages par utilisateur et préparer les conversations uniques
        const uniqueConversationsMap = new Map();

        conversations.forEach((message) => {
            const otherUser = message.senderId === userId ? message.recipientUsers : message.senderUsers;
            if (!otherUser) return;

            if (!uniqueConversationsMap.has(otherUser.id_user)) {
                uniqueConversationsMap.set(otherUser.id_user, {
                    userId: otherUser.id_user,
                    username: otherUser.userName,
                    profilePicture: otherUser.picture,
                    lastMessage: message.content,
                    messageDate: message.created_at
                });
            }
        });

        const recentConversations = Array.from(uniqueConversationsMap.values());

        const recipientUser = await prisma.users.findUnique({
            where: { id_user: Number(userId) },
            select: {
                id_user: true,
                userName: true,
                picture: true
            }
        });

        res.render("pages/messagerie.twig", {
            title: "Messagerie",
            users: recentConversations,
            recipientUser
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des conversations :', error);
        res.status(500).send('Erreur interne du serveur');
    }
});



messagerieRouter.delete("/messagerie/delete-conversation/:userId", authguard, async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.session.users.id_user;

    try {
        await prisma.messages.deleteMany({
            where: {
                OR: [
                    { senderId: currentUserId, recipientId: Number(userId) },
                    { senderId: Number(userId), recipientId: currentUserId }
                ]
            }
        });
        res.status(200).send('Conversation supprimée');
    } catch (error) {
        console.error("Erreur lors de la suppression de la conversation :", error);
        res.status(500).send("Erreur interne du serveur");
    }
});


messagerieRouter.get("/searchUsers", authguard, async (req, res) => {
    const userId = req.session.users.id_user;
    const { query } = req.query;

    if (!query) {
        return res.json([]);
    }

    try {
        const lowerCaseQuery = query.toLowerCase();
        const users = await prisma.users.findMany({
            where: {
                id_user: {
                    not: userId
                },
                OR: [
                    {
                        lastName: {
                            contains: lowerCaseQuery
                        }
                    },
                    {
                        firstName: {
                            contains: lowerCaseQuery
                        }
                    },
                    {
                        userName: {
                            contains: lowerCaseQuery
                        }
                    }
                ]
            },
            select: {
                id_user: true,
                userName: true,
                firstName: true,
                lastName: true,
                picture: true
            }
        });

        res.json(users);
    } catch (error) {
        console.error('Erreur lors de la recherche des utilisateurs :', error);
        res.status(500).send('Erreur interne du serveur');
    }
});


messagerieRouter.get("/conversation/:userId", authguard, async (req, res) => {
    const { userId } = req.params;
    const senderId = req.session.users?.id_user;

    if (!userId || !senderId || isNaN(parseInt(userId)) || isNaN(parseInt(senderId))) {
        console.error("Erreur : Les IDs utilisateur sont manquants ou invalides");
        return res.status(400).json({ error: "Les IDs utilisateur sont manquants ou invalides" });
    }

    try {
        const messages = await prisma.messages.findMany({
            where: {
                OR: [
                    { senderId: senderId, recipientId: parseInt(userId) },
                    { senderId: parseInt(userId), recipientId: senderId }
                ]
            },
            include: {
                senderUsers: {
                    select: {
                        id_user: true,
                        userName: true,
                        picture: true,
                    }
                },
                recipientUsers: {
                    select: {
                        id_user: true,
                        userName: true,
                        picture: true,
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        const recipientId = parseInt(userId);
        const recipientUser = await prisma.users.findUnique({
            where: { id_user: recipientId },
            select: {
                id_user: true,
                userName: true,
                picture: true
            }
        });

        res.render("pages/conversations.twig", { messages, userId: recipientId, senderId, recipientUser });

    } catch (error) {
        console.error("Erreur lors de la récupération des messages:", error);
        res.status(500).json({ error: "Erreur lors de la récupération des messages" });
    }
});

messagerieRouter.post("/sendMessage", authguard, async (req, res) => {
    const { content, recipientId } = req.body;
    const senderId = req.session.users.id_user;

    if (!recipientId || isNaN(parseInt(recipientId)) || isNaN(parseInt(senderId))) {
        console.error("Erreur : IDs d'utilisateur invalides");
        return res.status(400).json({ error: "IDs d'utilisateur invalides" });
    }

    try {
        const message = await prisma.messages.create({
            data: {
                content: content,
                senderId: parseInt(senderId),
                recipientId: parseInt(recipientId),
            }
        });
        res.redirect(`/conversation/${recipientId}`);
    } catch (error) {
        console.error("Erreur lors de l'envoi du message:", error);
        res.status(500).json({ error: "Erreur lors de l'envoi du message" });
    }
});

messagerieRouter.patch("/updateMessage/:messageId", authguard, async (req, res) => {
    const { messageId } = req.params;
    const { content } = req.body;
    const senderId = req.session.users.id_user;

    try {
        const message = await prisma.messages.findUnique({
            where: { id: Number(messageId) },
        });

        if (!message) {
            return res.status(404).json({ error: "Message non trouvé" });
        }
        if (message.senderId !== senderId) {
            return res.status(403).json({ error: "Vous ne pouvez pas modifier ce message" });
        }

        const updatedMessage = await prisma.messages.update({
            where: { id: Number(messageId) },
            data: { content },
        });

        res.status(200).json({ message: "Message mis à jour avec succès", updatedMessage });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du message:", error);
        res.status(500).json({ error: "Erreur lors de la mise à jour du message" });
    }
});



messagerieRouter.delete('/deleteMessage/:messageId', authguard, async (req, res) => {
    const { messageId } = req.params;
    const senderId = req.session.users.id_user;

    try {
        const message = await prisma.messages.findUnique({
            where: {
                id: Number(messageId),
            },
        });

        if (!message) {
            return res.status(404).json({ error: "Message non trouvé" });
        }

        if (message.senderId !== senderId) {
            return res.status(403).json({ error: "Vous ne pouvez pas supprimer ce message" });
        }

        await prisma.messages.delete({
            where: {
                id: Number(messageId),
            },
        });

        res.status(200).json({ message: "Message supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression du message:", error);
        res.status(500).json({ error: "Erreur lors de la suppression du message" });
    }
});

messagerieRouter.delete('/deleteConversation/:otherUserId', authguard, async (req, res) => {
    try {
        const currentUserId = req.session.users.id_user;
        const otherUserId = parseInt(req.params.otherUserId);

        if (isNaN(otherUserId)) {
            return res.status(400).json({ message: 'Invalid user ID provided.' });
        }

        const updateResult = await prisma.messages.updateMany({
            where: {
                OR: [
                    { senderId: currentUserId, recipientId: otherUserId },
                    { senderId: otherUserId, recipientId: currentUserId }
                ]
            },
            data: {
                deletedByUserId: currentUserId
            }
        });

        if (updateResult.count === 0) {
            return res.status(404).json({ message: 'No conversation found to delete.' });
        }

        return res.status(200).json({ message: 'Conversation deleted successfully.' });
    } catch (error) {
        console.error('Error deleting conversation:', error.message);
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
});


// notification






module.exports = messagerieRouter;
