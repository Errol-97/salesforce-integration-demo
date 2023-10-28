const { Pool } = require('pg');
const jsforce = require('jsforce');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Axios, default: axios } = require('axios');
require('dotenv').config();

const app = express();

// Use CORS middleware
app.use(cors());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});


const conn = new jsforce.Connection();
conn.login(process.env.SFCONN_USER, process.env.SFCONN_PASSWORD, function(err, res) {
  if (err) { console.error(err); }

  // Subscription to Platform Event

  const exitCallback = () => process.exit(1);
  const channel = '/event/NodeAppProduct__e';
  const replayId = -2;
  const replayExt = new jsforce.StreamingExtension.Replay(channel, replayId);
  const authFailureExt = new jsforce.StreamingExtension.AuthFailure(exitCallback);
  const fayeClient = conn.streaming.createClient([authFailureExt, replayExt]);
  const subscription = fayeClient.subscribe(channel, function(message) {
    console.log('Event Received : ' + JSON.stringify(message));
    // Handle the Platform Event data
    // For instance, you can save this data to your database or perform other actions.
    
  });
  subscription.cancel();
});


app.use(bodyParser.json());

app.post('/add-product', async (req, res) => {
  const { productName, productCode, sku, price, description } = req.body;

  // Check for existing product by productCode
  try{
    const result = await pool.query('SELECT productcode FROM products WHERE productcode = $1', [productCode]);
    if(result.rows.length > 0 ){
      return res.status(400).json({error: 'Product with this product code already exists.'});
    }

    // Insert into Postgres
    await pool.query('INSERT INTO products(productname, productcode, sku, price, description) VALUES ($1, $2, $3, $4, $5)', [productName, productCode, sku, price, description]);
  } catch (pgError) {
      console.error(pgError);
      return res.status(500).json({ error: 'Failed to add product to PostgreSQL.' });
  }
  // Insert into Salesforce
//   conn.sobject('Product2').create({
//     Name: productName,
//     StockKeepingUnit: sku,
//     ProductCode: productCode,
//     Description: description
//     // Add other necessary fields for Product2 object
//   }, function(err, ret) {
//     if (err || !ret.success) {
//       return res.status(500).json({ error: 'Failed to add product to Salesforce.' });
//     }
//     res.json({ message: 'Product added successfully!' });
//   });
// New product details from your app

  const newProduct = {
    Product_Name__c: productName,
    Description__c: description,
    Product_Code__c: productCode,
    Price__c: price,
    Product_SKU__c: sku

  };

  //publish platform event
  conn.sobject('NodeAppProduct__e').create(newProduct, function(err, ret) {
    if (err || !ret.success) { return console.error(err, ret); }
    console.log("Event published successfully. Event ID: " + ret.id);
  });
});



app.listen(8080, () => {
  console.log('Server running on port 8080');
});

