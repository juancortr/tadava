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
      size: 5000,
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
      //fs.writeFileSync('public/data.csv', content);
      //res.sendFile("index.html", {"root":"public"});
      //res.send(acc);

      // send the data as csv
      //res.set('Content-Type', 'application/octet-stream');
      //res.send(content);
      res.render("index.html", {data:content}); 
  }, function (err) {
      console.trace(err.message);
  });
  //res.render('index', { title: 'Express' });
});

//Rounting de selección en rango númerico de atributo por sampling
// TODO definir e implementar estrategia de sampling
router.get('/:index/:attr/:from-:to/sample/:samplesize', function(req, res, next) {
 var start = new Date();
  var indice = req.params.index,
      attrib = req.params.attr,
      limInf = parseInt(req.params.from),
      limSup = parseInt(req.params.to),
      samplesize = parseInt(req.params.samplesize);

  //Random sampling
  var qbody = '{"size":'+samplesize+', "query":{"range":{"'+attrib+'":{"gte":'+limInf+', "lte":'+limSup+'}}}}';

  client.search({
    index: indice,
    body: qbody
  }).then(function (resp) {
    var end = new Date() - start;
    console.log("Execution Time: "+end + " ms.");
      reponse = resp.hits.hits;
      res.send(resp);
  }, function (err) {
      console.trace(err.message);
  });
  //res.render('index', { title: 'Express' });
});

router.get('/:index/:attr/:from-:to/sample/:samplesize/scored', function(req, res, next) {
 var start = new Date();
  var indice = req.params.index,
      attrib = req.params.attr,
      limInf = parseInt(req.params.from),
      limSup = parseInt(req.params.to),
      samplesize = parseInt(req.params.samplesize);

  //Random sampling
  var qbody = '{"size":'+samplesize+', "query":{"function_score":{"filter":{"range":{"'+attrib+'":{"gte":'+limInf+', "lte":'+limSup+'}}}}, "score_mode":"multiply"}}';

  client.search({
    index: indice,
    body: qbody
  }).then(function (resp) {
    var end = new Date() - start;
    console.log("Execution Time: "+end + " ms.");
      reponse = resp.hits.hits;
      res.send(resp);
  }, function (err) {
      console.trace(err.message);
  });
  //res.render('index', { title: 'Express' });
});


//Routing de sampling sobre índice
router.get('/:index/sample/:samplesize/scored', function(req, res, next) {
 var start = new Date();

  var indice = req.params.index,
       samplesize = parseInt(req.params.samplesize);
  //Random sampling
  client.search({
    index: indice,
    body: {
      size: samplesize,
      query: {
       function_score: {
        query: {
          match: { ID_UNICO_CONTRIBUYENTE:"1312012"}
          //range:{ 
            //AJUSTE_TARIFA:{
            //  gte: 140000, 
            //  lte:160000
            //}
          //}

        },
        functions: [
          {
            filter: {
          range:{ 
            SALDO_CARGO_2:{
              lte: 12000
            }
          }

        },
            weight: 2
          },
          {
            filter: {
          range:{ 
            SALDO_CARGO_2:{
              gt: 12000
            }
          }

        },
            weight: 1
          }
        ],
        score_mode: "multiply"
      }
    }
  }
  //,
    //Criterio de sort
    //sort: [{_score: "desc"}]
  }).then(function (resp) {
    var end = new Date() - start;
    console.log("Execution Time: "+end + " ms.");
      reponse = resp.hits.hits;
      res.send(reponse);
  }, function (err) {
      console.trace(err.message);
  });
  //res.render('index', { title: 'Express' });
});

router.get('/:index/sample/:samplesize', function(req, res, next) {
 var start = new Date();

  var indice = req.params.index,
       samplesize = parseInt(req.params.samplesize);
  //Random sampling
  client.search({
    index: indice,
    body: {
      size: samplesize,
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
    var end = new Date() - start;
    console.log("Execution Time: "+end + " ms.");
      reponse = resp.hits.hits;
      res.send(reponse);
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
      size:5000,
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

      // send the data as csv
      //res.set('Content-Type', 'application/octet-stream');
      //res.send(content);
      //fs.writeFileSync('public/data.csv', content);
      
      //res.render("index", {data:content, "root":"public"});
      res.sendFile("index.html", {"datos":content,"root":"public"});
  }, function (err) {
      console.trace(err.message);
  });
  //res.render('index', { title: 'Express' });
});

router.get('/', function(req, res, next) {
  res.sendFile("index.html", {"root":"public"});
});

//Routing de sampling sobre índice
router.get('/:index/sample/:samplesize/step/:stepsize', function(req, res, next) {
  var indice = req.params.index,
       samplesize = parseInt(req.params.samplesize),
       stepsize = parseInt(req.params.stepsize);
  //Random sampling
  client.search({
    index: indice,
    body: {
      size: samplesize,
      query: {  //Deprecated after ES 5.0
        bool: {
        must: {
        //filtered: {
          //filter: {
            script: {
              script:{ 
                source: "doc['PANDAS_ID'].value % params.n == 0",
                lang:"painless",
                params : {
                  "n" : stepsize
                }
              }
            }
          //}
        }
      }
    },
    //Criterio de sort
    sort:[ {"PANDAS_ID": "desc"}]
    }
  }).then(function (resp) {
      reponse = resp.hits.hits;
      res.send(reponse);
  }, function (err) {
      console.trace(err.message);
  });
  
});

module.exports = router;
