const multer = require('multer');
const path = require('path');
const rateLimit = require('express-rate-limit');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
    const allowedAudioTypes = /mp3|wav|ogg|flac/;
    const allowedVideoTypes = /mp4|avi|mkv|mov/;

    const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase()) ||
        allowedAudioTypes.test(path.extname(file.originalname).toLowerCase()) ||
        allowedVideoTypes.test(path.extname(file.originalname).toLowerCase()) ||
        file.mimetype === 'text/plain' || // Pour txt
        file.mimetype === 'application/vnd.oasis.opendocument.text' || // Pour odt
        file.mimetype === 'application/msword' || // Pour doc
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'; // Pour docx

    const mimetype = allowedImageTypes.test(file.mimetype) ||
        allowedAudioTypes.test(file.mimetype) ||
        allowedVideoTypes.test(file.mimetype) ||
        file.mimetype === 'audio/mpeg' || // Pour mp3
        file.mimetype === 'audio/wav' ||
        file.mimetype === 'audio/ogg' ||
        file.mimetype === 'audio/flac' || 
        file.mimetype === 'video/mp4' || 
        file.mimetype === 'video/x-msvideo' || // Pour avi
        file.mimetype === 'video/x-matroska' || // Pour mkv
        file.mimetype === 'video/quicktime' || // Pour mov
        file.mimetype === 'text/plain' || // Pour txt
        file.mimetype === 'application/vnd.oasis.opendocument.text' || // Pour odt
        file.mimetype === 'application/msword' || // Pour doc
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'; // Pour docx

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: Seuls les fichiers images (jpeg, jpg, png, gif), audio (mp3, wav, ogg, flac) et vidéo (mp4, avi, mkv, mov), ainsi que les fichiers texte (txt, odt, doc, docx) sont acceptés !');
    }
};


const upload = multer({
    storage: storage,
    limits: { 
        fileSize: 50 * 1024 * 1024, // Taille maximale de 50 Mo par fichier
        files: 5 // Nombre maximal de fichiers autorisés par requête
    },
    fileFilter: fileFilter
});

const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limite chaque IP à 100 requêtes par fenêtre
    message: "Trop de tentatives de téléchargement, veuillez réessayer plus tard."
});

module.exports = upload;
