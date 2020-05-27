const fs = require('mz/fs');
const randToken = require('rand-token');

const photoDirectory = './storage/photos/';

exports.getPhoto = async function(filename) {
    console.log('Request to get photo from directory...');
    try {
        const photoPath = photoDirectory + filename;
        const photoExists = await fs.exists(photoPath);
        if (photoExists) {
            const photoImage = await fs.readFile(photoPath);
            var type;
            if (photoPath.endsWith('jpg') || photoPath.endsWith('jpeg')) {
                type = 'image/jpeg';
            } else if (photoPath.endsWith('png')) {
                type = 'image/png';
            } else if (photoPath.endsWith('jpeg')) {
                type = 'image/gif';
            }
            return photoPath;
        } else {
            return null;
        }
    } catch (err) {
        console.error('An error occured when attempting to store file..');
        console.log(err.sql);
        throw err;
    }
};

exports.getFileType = async function(imageType) {
    console.log('Request to get file type extension...');
    if (imageType == 'image/png') {
        return '.png';
    } else if (imageType == 'image/jpeg') {
        return '.jpeg';

    } else if (imageType == 'image/gif') {
        return '.gif';
    }
};

exports.setPhoto = async function(image, imageType) {
    console.log('Request to add photo to directory...');
    const fileType = await exports.getFileType(imageType);
    const filename = randToken.generate(16) + fileType;
    try {
        await fs.writeFile(photoDirectory + filename, image);
        return filename;
    } catch (err) {
        console.error('An error occured when attempting to store file..');
        console.log(err.sql);
        throw err;
    }
};

exports.deletePhoto = async function(filename) {
    console.log('Request to delete photo from directory...');
    try {
        const photoPath = photoDirectory + filename;
        const photoExists = await fs.exists(photoPath);

        if (photoExists) {
            await fs.unlink(photoPath);
            console.log('Photo has been successfully deleted!')
        }
    } catch (err) {
        console.error('An error occured when attempting to remove file..');
        console.log(err.sql);
        throw err;
    }
};
