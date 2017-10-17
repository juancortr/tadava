var express = require('express');
var router = express.Router();
var client = require('../connection.js'); 
var fs = require('fs');

/* GET home page. */
router.get('/predial', function(req, res, next) {
	//Random sampling
  client.search({
    index: 'predial',
    body: {
      size: 500,
      query: {
       function_score: {
        query: {
          match_all: {}
        },
        functions: [
          {
            random_score: {}
          }
        ]
      }
    },
    //Criterio de sort
    sort:[ {"_score": "desc"}]
    }
  }).then(function (resp) {
      reponse = resp.hits.hits;
      var encab = [];
      if(reponse[0]){
        for(key in reponse[0]['_source']){
          if(key != 'message' && key != 'host' && key != 'path' && key != '@timestamp' && key != '@version' ){
            encab.push(key);
          }
        }
      }
      var acc='';      
      for (var rep in reponse){
        var pred = reponse[rep]['_source'];
        for (llave in encab){
          console.log(encab[llave]);
          if(pred[encab[llave]]){
            acc+=pred[encab[llave]].replace(',','.')+',';
          }
          else{
            acc+='.,';
          }
        }
        acc = acc.slice(0, -1);
        acc+='\n';
        //console.log(acc);
      }
      
      var encabz = encab.join();
      //encab = encab.slice(0, -1);
      
      acc = acc.slice(0, -2);

      var content = encabz + '\n' + acc;
      fs.writeFileSync('public/data.csv', content);
      //res.send(acc);
            
      res.sendFile("index.html", {"root":"public"});
  }, function (err) {
      console.trace(err.message);
  });
  //res.render('index', { title: 'Express' });
});

//Sampling
router.get('/predialsampler', function(req, res, next) {
  //Random sampling
  client.search({
    index: 'predial',
    body: {
      size:500,
      query: {
      },
      aggs:{
        sample:{
          sampler:{
            shard_size:1000
          },
          aggs:{
            keywords:{
              significant_terms:{
                field: 'DESTINO.keyword',
                exclude: ['RESIDENCIAL']
              }
            }
          }
        }
      }
    }
  }).then(function (resp) {
      reponse = resp.hits.hits;
      console.log(reponse);
      var encab = [];
      if(reponse[0]){
        for(key in reponse[0]['_source']){
          if(key != 'message' && key != 'host' && key != 'path' && key != '@timestamp' && key != '@version' ){
            encab.push(key);
          }
        }
      }
      var acc='';      
      for (var rep in reponse){
        var pred = reponse[rep]['_source'];
        for (llave in encab){
          if(pred[encab[llave]]){
            acc+=pred[encab[llave]].replace(',','.')+',';
          }
          else{
            acc+='.,';
          }
        }
        acc = acc.slice(0, -1);
        acc+='\n';
        //console.log(acc);
      }
      
      var encabz = encab.join();
      //encab = encab.slice(0, -1);
      
      acc = acc.slice(0, -2);

      var content = encabz + '\n' + acc;
      fs.writeFileSync('public/data.csv', content);
      //res.send(acc);
            
      res.sendFile("index.html", {"root":"public"});
  }, function (err) {
      console.trace(err.message);
  });
  //res.render('index', { title: 'Express' });
});



module.exports = router;
