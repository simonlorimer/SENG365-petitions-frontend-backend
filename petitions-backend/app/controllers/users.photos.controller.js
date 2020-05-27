const Users = require('../models/users.model');
const UsersPhotos = require('../models/photos.model');

exports.getUsersPhoto = async function(req, res) {
    console.log('Request to get Users photo...');
    try {
        filename = await Users.getUsersPhoto(req.params.id);
        if (filename == null) {
            res.statusMessage = "No Photo for User";
            res.status(404).send();
        } else {
            const photo = await UsersPhotos.getPhoto(filename);

            res.statusMessage = "OK";
            res.status(200).sendfile(photo);
        }

    } catch (err) {
        console.log(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
};

exports.setUsersPhoto = async function(req, res) {
    console.log('Request to set Users photo...');
    try {
        const id = req.params.id;
        const imageType = req.header('Content-Type');
        const image = req.body;
        console.log(image);

        const header = req.header('X-Authorization');
        if ((imageType != 'image/jpeg') && (imageType != 'image/gif') && (imageType != 'image/png')) {
            res.statusMessage = "Not a Valid type";
            res.status(400).send();
        } else {
            const checkAuth = await Users.checkPhotoAuth(id, header);

            if (checkAuth == false) {
                res.statusMessage = "Auth matches different User";
                res.status(403).send();
            } else if (checkAuth == null) {
                res.statusMessage = "Not Authorised";
                res.status(404).send();
            } else {
                //update sql query with file name and place
                const filename = Users.deleteUsersPhoto(id);
                if (filename == -1) {
                    //delete filename from db
                    await UsersPhotos.deletePhoto(filename);

                    const file = await UsersPhotos.setPhoto(image, imageType);

                    await Users.setUsersPhoto(id, file);

                    res.statusMessage = "OK";
                    res.status(201).send();
                } else {
                    const file = await UsersPhotos.setPhoto(image, imageType);

                    await Users.setUsersPhoto(id, file);

                    res.statusMessage = "OK";
                    res.status(201).send();
                }
            }
        }
    } catch (err) {
        console.log(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
};

exports.deleteUsersPhoto = async function(req, res) {
    console.log('Request to delete Users photo...');
    try {
        const header = req.header('X-Authorization');
        if (header == null) {
            console.log('No token provided...')
            res.statusMessage = "no X-Auth token";
            res.status(401).send();
        } else {
            const id = req.params.id;
            console.log('checking checkauth');
            const checkId = await Users.checkAuth(id, header);
            if (checkId[0] == null) {
                res.statusMessage = "User doesn't exist";
                res.status(404).send();
            } else {
                const checkAuth = await Users.checkPhotoAuth(id, header);
                if (checkAuth != true) {
                    res.statusMessage = "Not Authorised";
                    res.status(401).send();
                } else {
                    filename = await Users.deleteUsersPhoto(req.params.id);
                    if (filename == -1) {
                        res.statusMessage = "Filename not found";
                        res.status(404).send();
                    } else {
                        await UsersPhotos.deletePhoto(filename);
                        console.log('File successfully deleted...');
                        res.statusMessage = "File Deleted";
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
