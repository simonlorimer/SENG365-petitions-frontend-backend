const PetitionPhotos = require('../models/photos.model');
const Petitions = require('../models/petitions.model');

exports.getPetitionPhoto = async function(req, res) {
    console.log('Request to get Petition photo...');
    try {
        const id = req.params.id;
        const petitionData = await Petitions.viewPetition(id);
        const filename = await Petitions.getFileName(id);
        if ((petitionData) == false || (filename == null)) {
            res.statusMessage = "Not Found";
            res.status(404).send();
        } else {
            const file = await PetitionPhotos.getPhoto(filename);
            if (file != null) {
                res.statusMessage = "OK";
                res.status(200).sendfile(file);
            } else {
                res.statusMessage = "Not Found";
                res.status(404).send()
            }
        }
    } catch (err) {
        console.log(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
};

exports.setPetitionPhoto = async function(req, res) {
    console.log('Request to set Petition photo...');
    try {
        const id = req.params.id;
        const header = req.header('X-Authorization');
        const imageType = req.header('Content-Type');
        const image = req.body;
        const petitionData = await Petitions.viewPetition(id);

        if (petitionData == false) {
            res.statusMessage = "Not Found";
            res.status(404).send();
        } else {
            if ((header == null) || (header == '')) {
                res.statusMessage = "Unauthorized";
                res.status(401).send();
            } else {
                if ((imageType != 'image/jpeg') && (imageType != 'image/gif') && (imageType != 'image/png')) {
                    res.statusMessage = "Bad Request";
                    res.status(400).send();
                } else {
                    const userData = await Petitions.getTokenUser(header);

                    if ((userData[0]) == false && (userData[1] == null)) {
                        res.statusMessage = "Unauthorized";
                        res.status(401).send();


                    } else if (userData[1] != petitionData.authorId) {
                        res.statusMessage = "Forbidden";
                        res.status(403).send();
                    } else {
                        const fileName = await Petitions.getFileName(id);
                        if (fileName != null) {
                            await PetitionPhotos.deletePhoto(fileName);
                        }

                        const filename = await PetitionPhotos.setPhoto(image, imageType);
                        await Petitions.setPhotoDB(id, filename);

                        res.statusMessage = "OK";
                        res.status(200).send();
                    }
                }
            }
        }
    } catch (err) {
        console.log(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
};
