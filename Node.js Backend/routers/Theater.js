const express = require("express");
const router = express.Router();
const connection = require("../helpers/config.js");

router.get("/all", (req, res) => {
    const token = req.headers['token'];  // It will be connected later...

    query = `SELECT id, name FROM Theater`
    connection.query(query, (error, result) => {
        if(error){
            console.log(error);
            return res
              .status(500)
              .json({ body: null, key: "INTERNAL_SERVER_ERROR"});
        }
        else{
            return res.status(200).json({
                body: result, // Return the results array as the response body
                key: "SUCCESS"
            });
        }
    })
});

router.get("/seating",(req,res) => { //there are some bugs here.
    const token = req.headers['token'];  // It will be connected later...
    const theaterId = req.query.theaterId
    query = `SELECT s.theaterId, t.name, s.rowLetter, s.ColumnNumber FROM Seat as s INNER JOIN Theater as t ON s.theaterId = t.id WHERE s.theaterId = '${theaterId}'`
    
    connection.query(query,(error, result) => { //if the endpoint does not return any name or id, it should be considered as empty array
        if(error){
            console.log(error);
            return res
              .status(500)
              .json({ body: null, key: "INTERNAL_SERVER_ERROR"}); 
        }
        else{
            const responseBody = {
                theaterId: result[0]?.theaterId,
                name: result[0]?.name,
                defaultSeating: []
            };
           
            result.forEach(result => {
                const seat = {
                    column: result.ColumnNumber,
                    row: result.rowLetter
                };
                responseBody.defaultSeating.push(seat);
            });

            return res.status(200).json({
                body: responseBody, // Return the results array as the response body
                key: "SUCCESS"
            });
        }
    } )
})
module.exports = router;