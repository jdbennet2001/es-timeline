const express           = require('express');
const app               = express();
const bodyParser        = require('body-parser');
const methodOverride    = require('method-override');
      
app.use(express.static('public'))
app.use(bodyParser());
app.use(methodOverride());

const nconf     = require('nconf');
const path      = require('path');
const util      = require('util');
const _         = require('lodash');
const S         = require('string');

const elastic 	= require('./elastic-search');
      
//Load compose.io config instructions
const config 		= path.join(__dirname, './config/app.json');

nconf.argv()
   	 .env()
     .file({ file: config });
     
const credentials 	= nconf.get('compose-es');
const es            = new elastic(credentials);


app.get('/indices', function(req, res){
  return es.indices().then(list =>{
    let indices = _.filter(list, item =>{return S(item).startsWith('ace-request-tracking')});
    res.json(indices);
  })
})

app.post('/query', function(req, res){
    debugger;
    es.client().search(req.body).then(data => {
      res.json(data)
    }, err =>{
      res.status(500).json({err: err.message});
    })
})

app.listen(3900, () => console.log('Example app listening on port 3900!'))