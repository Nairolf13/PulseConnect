const {PrismaClient} = require("@prisma/client")
const prisma = new PrismaClient()

const authguard = async (req, res, next) => {
    if (!req.session.users) {
        return res.redirect("/login")
    }
    try {
        
        if (req.session.users) {
            let users = await prisma.users.findUnique({
                where: {
                    id_user: req.session.users.id_user
                }
            })
            if (users) {
                return next()
            }
            throw { authguard: "L'utilisateur n'est pas connecté" }
        }
        throw { authguard: "L'utilisateur n'est pas connecté" }
    } catch (error) {
        res.redirect("/")
    } 

} 

  

module.exports = authguard 