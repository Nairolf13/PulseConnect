const userRouter = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const hashPasswordExtension = require("../services/extensions/hashPasswordExtension");
const { transporter, sendEmail } = require('../services/extensions/nodemailer');
const crypto = require('crypto');
const bcrypt = require("bcrypt");
const upload = require("../services/downloadExtension")
const authguard = require("../services/authguard");

const prisma = new PrismaClient().$extends(hashPasswordExtension);

const sendWelcomeEmail = async (to, firstName) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenue chez PulseConnect</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .container {
                max-width: 600px;
                margin: auto;
                background: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                padding: 20px;
            }
            h1 {
                color: #333;
                font-size: 24px;
            }
            p {
                color: #555;
                font-size: 16px;
            }
            .footer {
                margin-top: 20px;
                font-size: 14px;
                color: #888;
            }
            .logo {
                width: 150px; /* Ajustez la taille du logo selon vos besoins */ 
                margin-bottom: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <img src="http://51.91.208.111:4000/assets/imgs/PulseConnect.png" alt="Logo PulseConnect" class="logo">
            <h1>Bienvenue chez PulseConnect, ${firstName} !</h1>
            <p>Merci de vous être inscrit sur notre plateforme. Nous sommes ravis de vous compter parmi nous !</p>
            <p>Pour commencer, explorez nos fonctionnalités et n'hésitez pas à nous contacter si vous avez des questions.</p>
            <p>Nous vous souhaitons une excellente expérience avec PulseConnect !</p>
            <div class="footer">
                <p>Bienvenue et à bientôt,</p>
                <p>L'équipe PulseConnect</p>
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        await transporter.sendMail({
            from: `"PulseConnect" <${process.env.EMAIL_USER}>`,
            to,
            subject: "Bienvenue chez PulseConnect",
            html: htmlContent 
        });
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email :", error);
    }
};

const sendPasswordResetEmail = async (to, firstName, resetLink) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Réinitialisation de mot de passe</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .container {
                max-width: 600px;
                margin: auto;
                background: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                padding: 20px;
            }
            h1 {
                color: #333;
                font-size: 24px;
            }
            p {
                color: #555;
                font-size: 16px;
            }
            .footer {
                margin-top: 20px;
                font-size: 14px;
                color: #888;
            }
            .logo {
                width: 150px; 
                margin-bottom: 20px;
            }
            .reset-button {
                display: inline-block;
                background-color: #66FFD4;
                color: black;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <img src="process.env.URLVPS/assets/imgs/PulseConnect.png" alt="Logo PulseConnect" class="logo">
            <h1>Réinitialisation de mot de passe</h1>
            <p>Bonjour ${firstName},</p>
            <p>Vous avez demandé une réinitialisation de mot de passe pour votre compte PulseConnect.</p>
            <p>Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe :</p>
            <div style="text-align: center;">
                <a href="${resetLink}" class="reset-button">Réinitialiser mon mot de passe</a>
            </div>
            <p>Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email.</p>
            <p>Ce lien est valide pendant 1 heure.</p>
            <div class="footer">
                <p>Cordialement,</p>
                <p>L'équipe PulseConnect</p>
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        await transporter.sendMail({
            from: `"PulseConnect" <${process.env.EMAIL_USER}>`,
            to,
            subject: "Réinitialisation de mot de passe",
            html: htmlContent 
        });
        console.log("Email de réinitialisation de mot de passe envoyé");
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email de réinitialisation : ", error);
    }
};
 
userRouter.get('/', async (req, res) => {  
    try {

        const topUsers = await prisma.users.findMany({
            include: {
                Follows_Follows_followed_idToUsers: true,
            },
            orderBy: {
                Follows_Follows_followed_idToUsers: {
                    _count: 'desc',
                },
            },
            take: 5, 
        });

        const topLikedPosts = await prisma.assets.findMany({
            include: {
                likes: true,  
                Users: true  
            },
            orderBy: {
                likes: {
                    _count: 'desc',
                },
            },
            take: 6, 
        });
        
        res.render('pages/welcome.twig', { topUsers, topLikedPosts });
    } catch (error) {
        console.error("Erreur lors de la récupération des top artistes et contenus likés : ", error);
        res.status(500).send("Erreur interne du serveur");
    }
});
  
userRouter.get('/register', (req, res) => {  
    res.render('pages/register.twig')    
}) 
 
userRouter.post('/register', async (req, res) => {
    try {
        const {
            lastName,
            firstName,
            userName,
            age,
            genre,
            mail,
            localisation,
            password,
            confirmPassword
        } = req.body;

        const errors = {};

        if (!lastName || !firstName || !userName || !age || !genre || !mail || !localisation || !password || !confirmPassword) {
            errors.message = "Tous les champs sont requis !";
        }

        if (password !== confirmPassword) {
            errors.confirmPassword = "Les mots de passe ne correspondent pas.";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(mail)) {
            errors.mail = "L'adresse email est invalide !";
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{12,}$/;
        if (!passwordRegex.test(password)) {
            errors.password = "Le mot de passe doit contenir au moins 12 caractères, une majuscule, un chiffre, et un caractère spécial !";
        }

        if (Object.keys(errors).length > 0) {
            return res.render('pages/register.twig', {
                title: "Inscription - PulseConnect",
                requestBody: req.body,
                error: errors
            });
        }

        const user = await prisma.users.create({
            data: {
                lastName,
                firstName,
                userName,
                age: parseInt(age),
                mail,
                genre,
                localisation,
                password,
                role: "users",
                description: req.body.description || null
            }
        });


        sendWelcomeEmail(user.mail, user.firstName).catch(err => {
            console.error("Erreur lors de l'envoi de l'email :", err);
        });

      
        res.redirect('/login');
    } catch (error) {
        console.error("Erreur lors de l'inscription :", error);

        if (error.code === 'P2002') {
            error = { mail: "Cet email existe déjà !" };
        }

        res.render('pages/register.twig', {
            title: "Inscription - PulseConnect",
            requestBody: req.body,
            error
        });
    }
});




userRouter.get('/forgot-password', (req, res) => {
    res.render('pages/forgot-password.twig', { title: "Réinitialisation du mot de passe" })
})


userRouter.post('/forgot-password', async (req, res) => {
    const { mail } = req.body;
    try {
        const user = await prisma.users.findUnique({
            where: { mail }
        });
        if (!user) throw new Error("Cet utilisateur n'existe pas.")
        const resetToken = crypto.randomBytes(32).toString('hex')
        const expiresAt = new Date(Date.now() + 3600000)

        await prisma.passwordResetTokens.deleteMany({
            where: { email: user.mail }
        });

        await prisma.passwordResetTokens.create({
            data: {
                email: user.mail,
                token: resetToken,
                expiresAt
            }
        });

        const resetLink = `${process.env.URLVPS}/reset-password`;

        await sendPasswordResetEmail(mail, user.firstName, resetLink);

        res.json({ message: "Nous avons envoyé un email de réinitialisation !" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

userRouter.get('/reset-password', async (req, res) => {
    const { token } = req.query;
    
    if (!token) {
        return res.render('pages/forgot-password.twig', { 
            title: 'Erreur',
            error: 'Aucun token de réinitialisation fourni.' 
        });
    }

    try {
        const passwordResetToken = await prisma.passwordResetTokens.findFirst({
            where: { 
                token: token,
                expiresAt: { gt: new Date() } 
            }
        });

        if (!passwordResetToken) {
            return res.render('pages/forgot-password.twig', { 
                title: 'Lien expiré',
                error: 'Le lien de réinitialisation est invalide ou a expiré.' 
            });
        }

        res.render('pages/reset-password.twig', { 
            title: 'Réinitialisation de mot de passe',
            token 
        });
    } catch (error) {
        console.error('Erreur lors de la validation du token :', error);
        res.render('pages/forgot-password.twig', { 
            title: 'Erreur',
            error: 'Une erreur est survenue. Veuillez réessayer.' 
        });
    }
});

userRouter.post('/reset-password', async (req, res) => { 
  

    try {
        const { email, token, newPassword, confirmPassword } = req.body;

        if (email) {
            const user = await prisma.users.findUnique({
                where: { mail: email }
            });

            if (!user) {
                return res.status(404).json({ error: "Aucun utilisateur trouvé avec cet email." });
            }

            const resetToken = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 3600000); 

            await prisma.passwordResetTokens.deleteMany({
                where: { email: user.mail }
            });

            await prisma.passwordResetTokens.create({
                data: {
                    email: user.mail,
                    token: resetToken,
                    expiresAt
                }
            });

            const resetLink = `${process.env.URLVPS}/reset-password?token=${resetToken}`;

            await sendPasswordResetEmail(email, user.firstName, resetLink);

            return res.json({ message: "Un lien de réinitialisation a été envoyé à votre email." });
        }

        if (!token) {
            return res.status(400).json({ error: "Token manquant." });
        }

        const passwordResetToken = await prisma.passwordResetTokens.findFirst({
            where: { 
                token,
                expiresAt: { gt: new Date() } 
            }
        });

        if (!passwordResetToken) {
            return res.status(400).json({ error: "Token invalide ou expiré." });
        }

        const user = await prisma.users.findUnique({
            where: { mail: passwordResetToken.email }
        });

        if (!user) {
            return res.status(404).json({ error: "Aucun utilisateur trouvé avec cet email." });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: "Les mots de passe ne correspondent pas." });
        }

        await prisma.users.update({
            where: { id_user: user.id_user },
            data: { password: newPassword }
        });

        await prisma.passwordResetTokens.deleteMany({
            where: { email: user.mail }
        });

        res.json({ message: "Mot de passe réinitialisé avec succès !" });
    } catch (error) {
        console.error("Erreur lors de la réinitialisation du mot de passe :", error);
        res.status(500).json({ error: "Une erreur est survenue. Veuillez réessayer plus tard." });
    }
});



userRouter.get("/login", (req, res) => {
    res.render("pages/login.twig", {
        title: "Connexion - PulseConnect"
    });
});

userRouter.post("/login", async (req, res) => {
    try {
        const users = await prisma.users.findUnique({
            where: { mail: req.body.mail }
        });
        if (!users) {
            throw { mail: "Cet utilisateur n'est pas inscrit !" };
        }

       
        if (!(await bcrypt.compare(req.body.password, users.password))) { 
            throw { password: "Erreur mauvais mot de passe !" };
        }


        req.session.users =  {
            id_user: users.id_user,
            userName:users.userName
        }
        res.redirect("/home");
    } catch (error) {
        res.render("pages/login.twig", {
            title: "Connexion - PulseConnect",
            error
        });
    }
});

userRouter.get("/logout", (req, res) => { 
    req.session.destroy()
    res.redirect("/")

})

userRouter.get("/home", authguard, async (req, res) => {
    try {
        const users = await prisma.users.findUnique({
            where: { id_user: req.session.users.id_user } 
        });
        
        const contents = await prisma.assets.findMany({
            where: {
                isPublic: true
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
                    in: contents.map(content => content.id)
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
                    in: contents.map(content => content.id)
                }
            }
        });
        
        const contentsWithCommentsAndCounts = contents.map(content => ({
            ...content,
            Commentaires: commentaires.filter(comment => comment.id_asset === content.id),
            commentCount: commentCounts.find(count => count.id_asset === content.id)?._count?.id_asset || 0
        }));
        
        res.render("pages/home.twig", { 
            users, 
            contents: contentsWithCommentsAndCounts 
        });
        
    } catch (error) {
        console.error("Erreur lors du rendu de la page d'accueil :", error);
        res.render("pages/home.twig", { error });
    }
});

userRouter.get("/update", authguard, async (req, res) => {
    try {
        const users = await prisma.users.findUnique({
            where: {
                id_user: parseInt(req.session.users.id_user)
            }
        });
        if (!users) {
            throw new Error("Utilisateur non trouvé");
        }
        res.render("pages/account.twig", {
            users: req.session.users,
            users 
        });
    } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur :", error);
        res.redirect("/login"); 
    }
});

userRouter.post("/update", authguard, upload.single('picture'), async (req, res) => {
    try {
        const users = await prisma.users.findUnique({
            where: {
                id_user: parseInt(req.session.users.id_user)
            }
        });

        if (!users) {
            throw new Error("Utilisateur non trouvé !");
        }

        if (req.body.password) {
            if (req.body.password !== req.body.confirmPassword) {
                throw new Error("Les mots de passe ne correspondent pas !");
            }
        }

        let picturePath = users.picture;
        if (req.file) {
            picturePath = `/uploads/${req.file.filename}`;
        }

        const updateData = {
            lastName: req.body.lastName,
            firstName: req.body.firstName,
            userName: req.body.userName,
            age: parseInt(req.body.age),
            mail: req.body.mail,
            genre: req.body.genre,
            localisation: req.body.localisation,
            role: "users",
            description: req.body.description || null,
            picture: picturePath,
        };

        if (req.body.password && req.body.password.trim() !== "") {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            updateData.password = hashedPassword;
        }

        await prisma.users.update({
            where: { id_user: users.id_user },
            data: updateData,
        });

        res.redirect("/home");
    } catch (error) {
        console.log(error);
        res.redirect("/home");
    }
});


userRouter.get("/delete", authguard, async (req, res) => {
    if (!req.session || !req.session.users || !req.session.users.id_user) {
        return res.redirect("/home");
    }

    try {
        await prisma.users.delete({
            where: {
                id_user: parseInt(req.session.users.id_user)
            }
        });

        req.session.destroy((err) => {
            if (err) {
                console.error("Erreur lors de la destruction de la session :", err);
                return res.redirect("/home");
            }
            res.redirect("/register");
        });
    } catch (error) {
        console.error("Erreur lors de la suppression :", error);
        res.redirect("/home");
    }
});



module.exports = userRouter;
