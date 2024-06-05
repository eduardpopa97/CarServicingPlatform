const sqlite3 = require('sqlite3').verbose();

const connectDB = () => {

    const db = new sqlite3.Database('service.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if(err) {
            console.log(err.message);
        }
        else {
            console.log("Connected to the database");
            db.run("CREATE TABLE IF NOT EXISTS USERS ( \
                USER_ID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, \
                USER_FIRST_NAME NVARCHAR(50), \
                USER_LAST_NAME NVARCHAR(50), \
                USER_PHONE_NUMBERS NVARCHAR(15), \
                USER_MAIL NVARCHAR(50), \
                USER_DISABLED NVARCHAR(1))");
    
            db.run("CREATE TABLE IF NOT EXISTS CARS ( \
                CAR_ID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, \
                USER_ID INTEGER, \
                CAR_REGISTRATION_NUMBER NVARCHAR(50), \
                CAR_CHASSIS_NUMBER NVARCHAR(50), \
                CAR_BRAND NVARCHAR(20), \
                CAR_MODEL NVARCHAR(30), \
                CAR_MANUFACTURING_YEAR NVARCHAR(4), \
                CAR_ENGINE_TYPE NVARCHAR(15), \
                CAR_ENGINE_CAPACITY NVARCHAR(10), \
                CAR_HORSEPOWER NVARCHAR(5), \
                CAR_KW_POWER NVARCHAR(5), \
                CAR_DISABLED NVARCHAR(1), \
                FOREIGN KEY (USER_ID) REFERENCES USERS (USER_ID))");
    
            db.run("CREATE TABLE IF NOT EXISTS RESERVATIONS ( \
                RESERVATION_ID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, \
                USER_ID INTEGER, \
                CAR_ID INTEGER, \
                RESERVATION_METHOD NVARCHAR(15), \
                REQUIRED_ACTION NVARCHAR(100), \
                RESERVATION_START_TIME DATE, \
                RESERVATION_END_TIME DATE, \
                MARKED_FOR_DISCOUNT NVARCHAR(1), \
                DISCOVERED_PROBLEMS NVARCHAR(100), \
                ACTION_TAKEN NVARCHAR(100), \
                PROCESSING_TIME INTEGER, \
                FOREIGN KEY (USER_ID) REFERENCES USERS (USER_ID), \
                FOREIGN KEY (CAR_ID) REFERENCES CARS (CAR_ID))");
        }
   
    });
}

module.exports = connectDB;

