const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const sizes = {
    small: 400,
    medium: 800,
    large: 1200
};

async function optimizeImages() {
    try {
        // Lire le contenu du fichier photos.json
        const photosJson = await fs.readFile('photos.json', 'utf8');
        const { photos } = JSON.parse(photosJson);

        // Créer le dossier optimized s'il n'existe pas
        await fs.mkdir('img/optimized', { recursive: true });

        // Traiter chaque image
        for (const photo of photos) {
            const filename = path.basename(photo, '.jpg');
            
            // Créer les différentes tailles
            for (const [size, width] of Object.entries(sizes)) {
                const outputPath = `img/optimized/${filename}-${size}.jpg`;
                
                await sharp(photo)
                    .resize(width, null, { 
                        withoutEnlargement: true,
                        fit: 'inside'
                    })
                    .jpeg({ 
                        quality: 80,
                        progressive: true
                    })
                    .toFile(outputPath);
                
                // Créer aussi une version WebP
                await sharp(photo)
                    .resize(width, null, { 
                        withoutEnlargement: true,
                        fit: 'inside'
                    })
                    .webp({ 
                        quality: 80
                    })
                    .toFile(outputPath.replace('.jpg', '.webp'));
            }
        }

        console.log('Images optimisées avec succès !');
    } catch (error) {
        console.error('Erreur lors de l\'optimisation des images:', error);
    }
}

optimizeImages(); 