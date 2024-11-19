const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
dotenv.config();

const config = {
    host: process.env.HOST,
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DB,
};

app.use(express.json({ limit: '100mb' }));
app.use(cors())


const conn = mysql.createConnection(config)

conn.connect(function (err) {
  if (!err)
      console.log("conncetd");
  else
      console.log(err + "There is problem");
});

// const conn = mysql.createPool(config);

// conn.getConnection((err, connection) => {
//     if (err) {
//         console.error('Error connecting to MySQL:', err);
//         return;
//     }
//     console.log('Connected to MySQL database');

//     connection.release();
// });

app.get('/getBhoot', async (req, res)=>{
    conn.getConnection((err, connection)=>{
        if (err) {
            console.error('Error getting MySQL connection:', err);
            res.status(500).json({ error: 'Database error' });
            return;
        }

        connection.query('Select * from tbl_booth limit 10', (err, results)=>{
            connection.release();

            if(err) {
                console.error('Error querying database:', error);
                res.status(500).json({ error: 'Database query error' });
                return;
            }

            res.json(results);
        })
    })
});


app.post('/bulk-upload', (req, res) => {
    const dataToUpload = req.body;
  
    if (!Array.isArray(dataToUpload)) {
      return res.status(400).json({ error: 'Invalid data format. Expected an array.' });
    }
  
    const sqlQuery = 'INSERT INTO voter_info (AC_NO, PART_NO, SECTION_NO, SLNOINPART, C_HOUSE_NO, C_HOUSE_NO_V1, FM_NAME_EN, LASTNAME_EN, FM_NAME_V1, LASTNAME_V1, RLN_TYPE, RLN_FM_NM_EN, RLN_L_NM_EN, RLN_FM_NM_V1, RLN_L_NM_V1, EPIC_NO, GENDER, AGE, DOB, ORG_LIST_NO) VALUES ?';
  
    const values = dataToUpload.map(item => [
      item.AC_NO,
      item.PART_NO,
      item.SECTION_NO,
      item.SLNOINPART,
      item.C_HOUSE_NO,
      item.C_HOUSE_NO_V1,
      item.FM_NAME_EN,
      item.LASTNAME_EN,
      item.FM_NAME_V1,
      item.LASTNAME_V1,
      item.RLN_TYPE,
      item.RLN_FM_NM_EN,
      item.RLN_L_NM_EN,
      item.RLN_FM_NM_V1,
      item.RLN_L_NM_V1,
      item.EPIC_NO,
      item.GENDER,
      item.AGE,
      item.DOB,
      item.ORG_LIST_NO,
    ]);

    try{
      conn.query(sqlQuery, [values], (err, results) => {
        if (err) {
          console.error('Error uploading data:', err);
          return res.status(500).json({ error: 'Error uploading data to the database.' });
        }
        console.log('Data uploaded successfully:', results);
        res.status(200).json({ message: 'Data uploaded successfully.' });
      });
    }catch(err){
      return res.status(500).json({ error: 'Error uploading data to the database: '+ err });
    }
});

const PORT = process.env.PORT || 5100;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
