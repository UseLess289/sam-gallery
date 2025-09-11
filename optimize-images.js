const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = 'img/preview';
const outputDir = 'img/optimized';

// Créer le dossier de sortie s'il n'existe pas
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Configuration d'optimisation
const config = {
    quality: 80,
    width: 800,
    format: 'webp'
};

// Lire tous les fichiers du dossier d'entrée
fs.readdir(inputDir, (err, files) => {
    if (err) {
        console.error('Erreur lors de la lecture du dossier:', err);
        return;
    }

    files.forEach(file => {
        if (file.match(/\.(jpg|jpeg|png|JPG)$/i)) {
            const inputPath = path.join(inputDir, file);
            const outputPath = path.join(outputDir, `${path.parse(file).name}.webp`);

            sharp(inputPath)
                .resize(config.width, null, {
                    withoutEnlargement: true,
                    fit: 'inside'
                })
                .webp({ quality: config.quality })
                .toFile(outputPath)
                .then(info => {
                    const inputSize = fs.statSync(inputPath).size;
                    console.log(`${file}: ${(inputSize/1024).toFixed(2)}KB -> ${(info.size/1024).toFixed(2)}KB`);
                })
                .catch(err => {
                    console.error(`Erreur lors de l'optimisation de ${file}:`, err);
                });
        }
    });
}); 
