const {PrismaClient} = require("@prisma/client")
const prisma = new PrismaClient()

const checkCookiesAccepted = (req, res, next) => {
    if (req.cookies.cookiesAccepted !== "true") {
        return res.status(403).json({ message: "Veuillez accepter les cookies pour vous connecter." });
    }
    next();
};

module.exports = checkCookiesAccepted;
