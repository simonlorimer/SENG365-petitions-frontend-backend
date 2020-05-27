const Petitions = require('../models/petitions.model');
const PetitionPhotos = require('../models/photos.model');

exports.checkDataValid = async function(data) {
    console.log('Checking data is valid...');
    //title
    if ('title' in data) {
        if (data.title.length < 1) {
            return [false, 'Title is not valid'];
        }
    } else {
        return [false, 'Title is missing'];
    }
    //description
    if ('description' in data) {
        if (data.description.length < 1) {
            return [false, 'Description is not valid'];
        }
    } else {
        return [false, 'Description is missing'];
    }
    //category_id
    if ('categoryId' in data) {
        if (data.categoryId.length < 1) {
            return [false, 'categoryId is not valid'];
        } else if ((await Petitions.checkCategoryId(data.categoryId)) == false) {
            return [false, 'categoryId is not valid'];
        }
    } else {
        return [false, 'categoryId is missing'];
    }
    //closingDate
    if ('closingDate' in data) {
        let closeDate = new Date(data.closingDate);
        if (closeDate < Date(Date.now())) {
            return [false, 'Invalid time'];
        }
    }

    return [true, 'Data is valid'];
};

exports.checkModifyValid = async function(body, beforePetition) {
    console.log('Checking data is not the same...');

    var dataSame = true;
    var count = 0;

    if ('title' in body) {
        if (body.title.length < 1) {
            return false;
        }
        count += 1;
    }

    if ('description' in body) {
        count += 1;
        if (body.description.length < 1) {
            return false;
        }
    }

    if ('closingDate' in body) {
        let closeDate = new Date(body.closingDate);
        if (closeDate <= Date.now()) {
            return false;
        }
        count += 1;
    }

    if ('categoryId' in body) {
        const checkId = await Petitions.checkCategory(body.categoryId);
        if (checkId == false) {
            return false;
        }
        count += 1;
    }

    if (count > 0) {
        return true;
    } else {
        return false;
    }
};

exports.viewPetitions = async function(req, res) {
    console.log('View petitions with/without params given...');
    try {
        result = await Petitions.viewPetitions(req.query);
        res.statusMessage = "OK";
        res.status(200).send(result);
    } catch (err) {
        console.log(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
};

exports.addPetition = async function(req, res) {
    console.log('Request to add a Petition...');
    try {
        //check data is valid, error return 400
        const dataValid = await exports.checkDataValid(req.body);
        if (dataValid[0]) {
            //check the header against User in db get ID, error return 401
            const header = req.header('X-Authorization');
            const checkToken = await Petitions.getTokenUser(header);
            if (checkToken[0]) {
                const id = checkToken[1];
                const result = await Petitions.addPetition(id, req.body);
                console.log('Successfully added petition...')
                res.statusMessage = "OK";
                res.status(201).send(result);
            } else {
                res.statusMessage = "Token does not match user";
                res.status(401).send();
            }
        } else {
            console.log('Data is not valid. Reason: ' + dataValid[1] + '...');
            res.statusMessage = dataValid[1];
            res.status(400).send();
        }
    } catch (err) {
        console.log(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
};

exports.viewPetition = async function(req, res) {
    console.log('Request to view one specific Petition...');
    try {
        const id = req.params.id;
        const result = await Petitions.viewPetition(id);
        if (result == false) {
            console.log('Cannot find petition...')
            res.statusMessage = "Not Found";
            res.status(404).send();
        } else {
            console.log('Successfully found petition...')
            res.statusMessage = "OK";
            res.status(200).send(result);
        }
    } catch (err) {
        console.log(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
};

exports.modifyPetition = async function(req, res) {
    console.log('Request to modify an existing Petition...');
    try {
        const petitionId = req.params.id;
        const beforePetition = await Petitions.viewPetition(petitionId);

        if (beforePetition == false) {
            res.statusMessage = "Not found";
            res.status(404).send();
        } else {
            if (Date(beforePetition.closingDate) < Date.now()) {
                res.statusMessage = "Forbidden";
                res.status(403).send();
            } else {
                //get user data, if id is same as petition author id then continue, otherwise return 403 is match diff user or 401 for non author
                const header = req.header('X-Authorization');
                const userData = await Petitions.getTokenUser(header);

                if ((userData[0] == false) && (userData[1] == null)) {
                    res.statusMessage = "Unauthorized";
                    res.status(401).send();
                } else {
                    if (userData[1] != beforePetition.authorId) {
                        res.statusMessage = "Forbidden";
                        res.status(403).send();
                    } else {
                        //check data is valid and that there is a change that will take place
                        const validData = await exports.checkModifyValid(req.body, beforePetition);
                        if (validData == false) {
                            res.statusMessage = "Bad Request";
                            res.status(400).send();
                        } else {
                            await Petitions.modifyPetition(petitionId, req.body);
                            console.log(`Successfully updated Petition ID: ${petitionId}...`);
                            res.statusMessage = "OK";
                            res.status(200).send();
                        }
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

exports.deletePetition = async function(req, res) {
    console.log('Request to delete Petition...');
    try {
        const petitionId = req.params.id;
        const beforePetition = await Petitions.viewPetition(petitionId);
        if (beforePetition == false) {
            res.statusMessage = "Not found";
            res.status(404).send();
        } else {
            const id = req.params.id;
            const header = req.header('X-Authorization');
            const checkAuth = await Petitions.getTokenUser(header);
            if ((checkAuth[0] == false) && (checkAuth[1] == null)) {
                res.statusMessage = "Unauthorized";
                res.status(401).send();
            } else {
                if (checkAuth[1] != beforePetition.authorId) {
                    res.statusMessage = "Forbidden";
                    res.status(403).send();
                } else {
                    const checkPhoto = await Petitions.getFileName(petitionId);
                    if (checkPhoto != null) {
                        console.log('Trying to delete photo...');
                        await PetitionPhotos.deletePhoto(checkPhoto);
                    }
                    await Petitions.deletePetition(petitionId);
                    res.statusMessage = "OK";
                    res.status(200).send();
                }
            }
        }
    } catch (err) {
        console.log(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
};

exports.getCategories = async function(req, res) {
  console.log('Request to get Petition Catergories...');
    try {
        const result = await Petitions.getCategories();
        res.statusMessage = "OK";
        res.status(200).send(result);
    } catch (err) {
        console.log(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
};
