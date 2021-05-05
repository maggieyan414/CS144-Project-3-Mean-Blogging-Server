const MongoClient = require('mongodb').MongoClient;
const options = { useUnifiedTopology: true, writeConcern: { j: true} };
let client = null;

// create a connection
function connect(url, next) {
    if(client == null) {
        client = new MongoClient(url, options);
        client.connect((err) => {
            if(err) {
                client = null;
                next(err);
            } else {
                next();
            }
        });
    } else {
        next();
    }
}

// get database
// @precondition: connection is established
function db(dbName) {
    return client.db(dbName);
}

// close open connection
function close() {
    if(client) {
        client.close();
        client = null;
    }
}

module.exports = {
    connect,
    db,
    close
};