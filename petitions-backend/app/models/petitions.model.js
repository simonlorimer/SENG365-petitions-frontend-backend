const db = require('../../config/db');

exports.getFileName = async function(id) {
    console.log('Request to get filename from Petition...');
    try {
        console.log('Request to get filename associated with ID...');
        const conn = await db.getPool().getConnection();
        const query = 'SELECT photo_filename FROM Petition WHERE petition_id = ?';
        const [rows] = await conn.query(query, [id]);
        conn.release();

        if (rows.length) {
            return rows[0].photo_filename;
        } else {
            return null;
        }
    } catch (err) {
        console.error('An error occured when attempting to query database..');
        console.log(err.sql);
        throw err;
    }
};

exports.setPhotoDB = async function(id, filename) {
    console.log('Request to set filename for Petition...');
    try {
        console.log('Request to update database with file...');
        const conn = await db.getPool().getConnection();
        const query = 'Update Petition SET photo_filename = ? WHERE petition_id = ?';
        const [rows] = await conn.query(query, [filename, id]);
        conn.release();

        return;

    } catch (err) {
        console.error('An error occured when attempting to query database..');
        console.log(err.sql);
        throw err;
    }
};

exports.checkPetitionClosed = async function(id) {
    console.log('Request to check if petition is closed...');
    try {
        const conn = await db.getPool().getConnection();
        const query = 'SELECT closing_date FROM Petition WHERE petition_id = ?';
        const [rows] = await conn.query(query, [id]);
        conn.release();

        if (rows.length == 0) {
            return null;
        } else {
            if (Date(rows[0].closing_date) < Date.now()) {
                return false;
            } else {
                return true;
            }
        }
    } catch (err) {
        console.error('An error occured when attempting to query database..');
        console.log(err.sql);
        throw err;
    }
};

exports.getTokenUser = async function(token) {
    console.log(`Request to check token ${token} is associated with User...`);
    try {
        const conn = await db.getPool().getConnection();
        const query = 'SELECT user_id FROM User WHERE auth_token = ?';
        const [rows] = await conn.query(query, [token]);
        conn.release();

        if (rows.length) {
            return [true, rows[0].user_id];
        } else {
            return [false, null];
        }
    } catch (err) {
        console.error('An error occured when attempting to query database..');
        console.log(err.sql);
        throw err;
    }
};

exports.checkCategoryId = async function(categoryId) {
    console.log(`Request to check Category ID ${categoryId} is in database...`);
    try {
        const conn = await db.getPool().getConnection();
        const query = 'select * from Category where category_id = ?';
        const [rows] = await conn.query(query, [categoryId]);
        conn.release();

        if (rows.length) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.error('An error occured when attempting to query database..');
        console.log(err.sql);
        throw err;
    }
};

exports.checkCategory = async function(id) {
    console.log('Request to get all categories...');
    try {
        const conn = await db.getPool().getConnection();
        const query = 'select * from Category WHERE category_id=?';
        const [rows] = await conn.query(query, [id]);
        conn.release();
        if (rows.length) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.error('An error occured when attempting to query database..');
        console.log(err.sql);
        throw err;
    }
};

exports.viewPetitionsAll = async function() {
    console.log('Request to get all petitions from the database...');
    try {
        const conn = await db.getPool().getConnection();
        defaultPetitionsQuery = 'SELECT p.petition_id AS petitionId, title, c.name AS category, u.name AS authorName, count(s.signatory_id) as signatureCount FROM Petition as p LEFT JOIN Signature as s on p.petition_id=s.petition_id RIGHT JOIN Category as c on p.category_id=c.category_id INNER JOIN User as u on p.author_id=u.user_id GROUP BY p.petition_id ORDER BY ROW_NUMBER() OVER(ORDER BY count(s.signatory_id) DESC)';
        const [result] = await conn.query(defaultPetitionsQuery);
        conn.release();

        return result;

    } catch (err) {
        console.error('An error occured when attempting to query database..');
        console.log(err.sql);
        throw err;
    }
};

exports.viewPetitions = async function(params) {
    console.log('Request to get all petitions from the database (with params given)...');
    try {
        const allPetitions = exports.viewPetitionsAll();
        var noParams = true;

        var q = authorId = categoryId = sortBy = count = startIndex = false;

        if ('q' in params) {
            console.log('authorID is in params...');
            noParams = false;
            q = true;
        }

        if ('categoryId' in params) {
            console.log('category is in params...');
            noParams = false;
            categoryId = true;
        }

        if ('authorId' in params) {
            console.log('authorID is in params...');
            noParams = false;
            authorId = true;
        }

        if ('sortBy' in params) {
            console.log('sortBy is in params...');
            noParams = false;
            sortBy = true;
        }

        if ('count' in params) {
            console.log('count is in params...');
            noParams = false;
            count = true;
        }

        if ('startIndex' in params) {
            console.log('startIndex is in params...');
            noParams = false;
            startIndex = true;
        }

        if (noParams == true) {
            console.log('No params given, returning all petitions..');
            return allPetitions;
        } else {

            var sorting = 'count(s.signatory_id) DESC';

            if (sortBy) {
                if (params.sortBy == 'ALPHABETICAL_ASC') {
                    sorting = 'title ASC';
                } else if (params.sortBy == 'ALPHABETICAL_DESC') {
                    sorting = 'title DESC';
                } else if (params.sortBy == 'SIGNATURES_ASC') {
                    sorting = 'count(s.signatory_id) ASC';
                } else if (params.sortBy == 'SIGNATURES_DESC') {
                    sorting = 'count(s.signatory_id) DESC';
                }
            }
            var whereClause = '';

            //check for a where clause
            if ((categoryId) || (authorId) || (q)) {
                whereClause += ' WHERE '
            }

            //categoryid
            if (categoryId) {
                whereClause += `p.category_id =${params.categoryId} `;
            }

            //check author id
            if (authorId) {
                if (categoryId) {
                    whereClause += `AND p.author_id =${params.authorId} `;
                } else {
                    whereClause += `p.author_id =${params.authorId} `;
                }
            }

            if (q) {
                if ((categoryId) || (authorId)) {
                    whereClause += `AND title LIKE '%${params.q}%' `;
                } else {
                    whereClause += ` title LIKE '%${params.q}%' `;
                }
            }

            var buildSQL = `SELECT p.petition_id AS petitionId, title, c.name AS category, u.name AS authorName, count(s.signatory_id) as signatureCount FROM Petition as p LEFT JOIN Signature as s on p.petition_id=s.petition_id RIGHT JOIN Category as c on p.category_id=c.category_id INNER JOIN User as u on p.author_id=u.user_id ${whereClause} GROUP BY p.petition_id ORDER BY ROW_NUMBER() OVER(ORDER BY ${sorting})`;

            if (count && startIndex) {
                buildSQL += ` LIMIT ${params.count} OFFSET ${params.startIndex}`
            } else if (count) {
                buildSQL += ` LIMIT ${params.count}`
            }

            const conn = await db.getPool().getConnection();
            const [rows] = await conn.query(buildSQL);
            conn.release();


            if (!count && startIndex) {
                return rows.slice(params.startIndex)
            } else {
                return rows;
            }
        }
    } catch (err) {
        console.error('An error occured when attempting to query database..');
        console.log(err.sql);
        throw err;
    }
};

exports.addPetition = async function(id, body) {
    console.log(`Request to add Petition in the database...`);
    try {
        const conn = await db.getPool().getConnection();
        const query = 'INSERT INTO Petition (title, description, author_id, category_id, created_date, closing_date) VALUES (?, ?, ?, ?, ?, ?)';

        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate() + ' ' + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

        var petitionValues = [body.title, body.description, id, body.categoryId, date, null];

        if ('closingDate' in body) {
            petitionValues[5] = body.closingDate;
        }

        const [rows] = await conn.query(query, petitionValues);
        conn.release();

        return {
            "petitionId": rows.insertId
        };

    } catch (err) {
        console.error('An error occured when attempting to query database..');
        console.log(err.sql);
        throw err;
    }
};

exports.viewPetition = async function(id) {
    console.log(`Request to get Petition ID: ${id} from the database...`);
    try {
        const conn = await db.getPool().getConnection();
        const query = 'SELECT p.petition_id as petitionId, title, c.name AS category, u.name AS authorName, COUNT(s.signatory_id) AS signatureCount, description, p.author_id AS authorId, u.city AS authorCity, u.country AS authorCountry, created_date AS createdDate, closing_date AS closingDate FROM (Petition AS p LEFT JOIN Signature AS s ON p.petition_id=s.petition_id RIGHT JOIN Category AS c ON p.category_id=c.category_id RIGHT JOIN User AS u ON p.author_id=u.user_id) WHERE p.petition_id=? GROUP BY p.petition_id';
        const [rows] = await conn.query(query, [id]);
        conn.release();

        if (rows.length) {
            return rows[0];
        } else {
            return false;
        }
    } catch (err) {
        console.error('An error occured when attempting to query database..');
        console.log(err.sql);
        throw err;
    }
};

exports.modifyPetition = async function(id, body) {
    console.log(`Request to modify Petition in the database...`);

    var setClause = '';

    if ('title' in body) {
        setClause += `title='${body.title}', `
    }

    if ('description' in body) {
        setClause += `description='${body.description}', `
    }

    if ('categoryId' in body) {
        setClause += `category_id='${body.categoryId}', `
    }

    if ('closingDate' in body) {
        setClause += `closing_date='${body.closingDate}', `
    }

    setClause = setClause.substring(0, setClause.length - 2);

    try {
        console.log('Request to update Petition...');

        const conn = await db.getPool().getConnection();
        const query = `UPDATE Petition SET ${setClause} WHERE petition_id=${id}`;
        const [rows] = await conn.query(query);
        conn.release();

        return rows;
    } catch (err) {
        console.error('An error occured when attempting to query database..');
        console.log(err.sql);
        throw err;
    }
};

exports.deletePetition = async function(id) {
    console.log('Request to delete Petition...');
    try {
        const conn = await db.getPool().getConnection();
        var query = 'DELETE FROM Petition WHERE petition_id=?';
        await conn.query(query, [id]);

        query = 'DELETE FROM Signature WHERE petition_id=?';
        await conn.query(query, [id]);
        conn.release();

        return;

    } catch (err) {
        console.error('An error occured when attempting to query database..');
        console.log(err.sql);
        throw err;
    }
};

exports.getCategories = async function() {
    console.log('Request to get all categories...');
    try {
        const conn = await db.getPool().getConnection();
        const query = 'select category_id AS categoryId, name from Category';
        const [rows] = await conn.query(query);
        conn.release();

        return rows;

    } catch (err) {
        console.error('An error occured when attempting to query database..');
        console.log(err.sql);
        throw err;
    }
};
