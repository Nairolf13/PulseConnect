const multer = require('multer');
const path = require('path');
const rateLimit = require('express-rate-limit');
const ffmpeg = require('fluent-ffmpeg'); // Ajout de FFmpeg
const fs = require('fs');

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
        allowedVideoTypes.test(path.extname(file.originalname).toLowerCase());

    const mimetype = allowedImageTypes.test(file.mimetype) ||
        allowedAudioTypes.test(file.mimetype) ||
        allowedVideoTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: Seuls les fichiers images, audio et vidéo sont acceptés !');
    }
};

const upload = multer({
    storage: storage,
    limits: { 
        fileSize: 50 * 1024 * 1024, // 50 Mo max
        files: 5
    },
    fileFilter: fileFilter
});

// Fonction pour générer le thumbnail
const generateThumbnail = (videoPath, thumbnailPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .screenshots({
                timestamps: ['00:00:05'], // Capture à 5 sec
                filename: path.basename(thumbnailPath), // Nom du fichier
                folder: path.dirname(thumbnailPath),
                size: '320x180' // Taille du thumbnail
            })
            .on('end', () => resolve(thumbnailPath))
            .on('error', (err) => reject(err));
    });
};

// Middleware pour traiter l'upload et générer un thumbnail si c'est une vidéo
const uploadAndGenerateThumbnail = (req, res, next) => {
    upload.single('file')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: "Aucun fichier uploadé." });
        }

        const filePath = req.file.path;
        const fileExt = path.extname(req.file.originalname).toLowerCase();
        const isVideo = ['.mp4', '.avi', '.mkv', '.mov'].includes(fileExt);

        if (isVideo) {
            const thumbnailPath = filePath.replace(fileExt, '.jpg');
            try {
                await generateThumbnail(filePath, thumbnailPath);
                req.file.thumbnail = thumbnailPath; // Ajouter le thumbnail à req.file
            } catch (error) {
                console.error("Erreur de génération du thumbnail :", error);
            }
        }

        next();
    });
};

const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Trop de tentatives de téléchargement, veuillez réessayer plus tard."
});

module.exports = { upload, uploadAndGenerateThumbnail, uploadLimiter };
