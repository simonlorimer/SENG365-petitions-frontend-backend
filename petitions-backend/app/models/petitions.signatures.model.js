const db = require('../../config/db');

exports.checkAlreadySigned = async function(petitionId, userId) {
    console.log('Check if Petition is already signed...');
    try {
        const conn = await db.getPool().getConnection();
        const query = 'SELECT * from Signature WHERE signatory_id=? AND petition_id=?';
        const [rows] = await conn.query(query, [userId, petitionId]);
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

exports.getSignatures = async function(id) {
    console.log('Get signatures from Petition...');
    try {
        const conn = await db.getPool().getConnection();
        const query = 'SELECT signatory_id AS signatoryId, u.name, u.city, u.country, signed_date AS signedDate From Signature as s LEFT JOIN Petition as p on s.petition_id=p.petition_id LEFT JOIN User as u on s.signatory_id=u.user_id WHERE p.petition_id=? ORDER BY signedDate ASC';
        const [rows] = await conn.query(query, [id]);
        conn.release();

        return rows;

    } catch (err) {
        console.error('An error occured when attempting to query database..');
        console.log(err.sql);
        throw err;
    }
};

exports.signPetition = async function(petitionId, userId) {
    console.log('Request to update Petition with new Signature...');
    try {
        const conn = await db.getPool().getConnection();
        const query = 'INSERT INTO Signature VALUES (?, ?, ?)';
        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate() + ' ' + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        const [rows] = await conn.query(query, [userId, petitionId, date]);
        conn.release();

        return;

    } catch (err) {
        console.error('An error occured when attempting to query database..');
        console.log(err.sql);
        throw err;
    }
};

exports.removeSignature = async function(petitionId, userId) {
    console.log('Remove Signature from Petition...');
    try {
        const conn = await db.getPool().getConnection();
        const query = 'DELETE FROM Signature WHERE signatory_id=? AND petition_id=?';
        const [rows] = await conn.query(query, [userId, petitionId]);
        conn.release();

        return;

    } catch (err) {
        console.error('An error occured when attempting to query database..');
        console.log(err.sql);
        throw err;
    }
};
