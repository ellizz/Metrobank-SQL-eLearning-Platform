const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',           // Change if your MySQL username is different
    password: '1225',           // Add your MySQL password if set
    database: 'elearning_db' // Your database name
});

connection.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database.');
});

module.exports = connection;
