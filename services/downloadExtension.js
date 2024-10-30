const multer = require('multer');
const path = require('path');

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
        allowedVideoTypes.test(file.mimetype) ||
        file.mimetype === 'audio/mpeg' || // Pour mp3
        file.mimetype === 'audio/wav' || // Pour wav
        file.mimetype === 'audio/ogg' || // Pour ogg
        file.mimetype === 'audio/flac' || // Pour flac
        file.mimetype === 'video/mp4' || // Pour mp4
        file.mimetype === 'video/x-msvideo' || // Pour avi
        file.mimetype === 'video/x-matroska' || // Pour mkv
        file.mimetype === 'video/quicktime'; // Pour mov


    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: Seuls les fichiers images (jpeg, jpg, png, gif), audio (mp3, wav, ogg, flac) et vidéo (mp4, avi, mkv, mov) sont acceptés !');
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: fileFilter
});

module.exports = upload;
