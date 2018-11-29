var express = require('express');
var router = express.Router();
var client = require('../connection.js');
var fs = require('fs');

/* GET home page. */

//List all available indices
router.get('/indices', function(req, res, next){
  client.cat.indices({
    format: "json",
    health: "green"
  }).then(function (resp) {
    indicesL = [];
    resp.forEach(function(elem){
      indicesL.push(elem.index);
    });
    res.send(indicesL);
  }, function (err) {
      console.trace(err.message);
  });
  
});

//Samples defined index
router.get('/index/:index', function(req, res, next) {
 var start = new Date();
	//Random sampling
  var indice = req.params.index;
  client.search({
    index: indice,
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
      res.send(reponse);
    var end = new Date() - start;
    console.log("Execution Time: "+end + " ms.");
    /**
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
      res.render("index.html", {data:content}); */
  }, function (err) {
      console.trace(err.message);
  });
  //res.render('index', { title: 'Express' });
});

router.post('/post/:index', function(req, res, next){
  var start = new Date();
  var indice = req.params.index,
      samplesize = 10000;

      //Extract json of filters
      var iterableFilters = req.body.filters;
      //console.log(iterableFilters);

      var filtersAcum="";

      var funcArray = [];
      var funcString = "";
      for( var el in iterableFilters){
        var fobj = iterableFilters[el];
        //Set each condition and add to 
        //Check if
        //{ type: 'click', params: { attr: 'posts', value: '950' } }
        if(fobj.type == 'click'){

          var attrib = fobj.params.attr;
          var valor = fobj.params.value;

          var func = '{"term":{"'+attrib+'":"'+valor.toLowerCase()+'"}}' ; 
          if(el == 0){
            funcString = func;
          }
          else{
          funcString += ","+func;   
          }
        }
        //TODO para un drag!!! range query

        funcArray.push(func);

      }
      var probabilisticq = '{"script_score":{"script": "if (_score.doubleValue()> 1/'+samplesize+'){return 1;} else {return 0;}"}}';
      //funcArray.push(probabilisticq);

      console.log(funcString);
      //var qbody = '{"size":'+samplesize+', query: { "match_all": {}}, "function_score": {"query": { },"functions":'+funcArray+',"boost_mode":"replace"}}';
      var qbody = '{"size":'+samplesize+',  "query":{ "function_score": {"query": {"bool" : { "filter":['+funcArray+']}},"boost_mode":"replace","functions":['+probabilisticq+']}}}';

      //var qbody = '{"size":'+samplesize+', query: {  "function_score": {"query": {['+funcString+']},"functions":[{"script_score":{"script": "if (_score.doubleValue()> 1/'+samplesize+'){return 1;} else {return 0;}"}}],"boost_mode":"replace"}}}';
      console.log(qbody);

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

      /**
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
  */
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

//Routing seleccion por valor de atributo
//Random Sampling
router.get('/:index/:attr/:value/sample/:samplesize/probabilistic', function(req, res, next) {
 var start = new Date();
  var indice = req.params.index,
      attrib = req.params.attr,
      valor = req.params.value,
      samplesize = parseInt(req.params.samplesize);

  //Random sampling
  var qbody = '{"size":'+samplesize+', query: {  "function_score": {"query": {"term":{"'+attrib+'":'+valor+'}},"functions":[{"script_score":{"script": "if (_score.doubleValue()> 1/'+samplesize+'){return 1;} else {return 0;}"}}],"boost_mode":"replace"}}}';

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

//Rounting de selección en rango númerico de atributo por sampling probabilistico
router.get('/:index/:attr/:from-:to/sample/:samplesize/probabilistic', function(req, res, next) {
 var start = new Date();
  var indice = req.params.index,
      attrib = req.params.attr,
      limInf = parseInt(req.params.from),
      limSup = parseInt(req.params.to),
      samplesize = parseInt(req.params.samplesize);

  //Random sampling
  var qbody = '{"size":'+samplesize+', query: {  "function_score": {"query": {"range":{"'+attrib+'":{"gte":'+limInf+', "lte":'+limSup+'}}},"functions":[{"script_score":{"script": "if (_score.doubleValue()> 1/2481705){return 1;} else {return 0;}"}}],"boost_mode":"replace"}}}';

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
    }
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
router.get('/home', function(req, res, next) {
  //Random sampling
  client.search({
    index: 'sample_10000000_module',
    body: {
      size:10000,
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
      }
    }
  }).then(function (resp) {
      reponse = resp.hits.hits;

      var jsonsource= [];
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
        jsonsource.push(pred);
        /*for (llave in encab){
          if(pred[encab[llave]]){
            acc+=pred[encab[llave]].replace(',','.')+',';
          }
          else{
            acc+='.,';
          }
        }
        acc = acc.slice(0, -1);
        acc+='\n';*/
        //console.log(acc);
      }

      //var encabz = encab.join();
      //encab = encab.slice(0, -1);

      //acc = acc.slice(0, -2);

      //var content = encabz + '\n' + acc;

      // send the data as csv
      //res.set('Content-Type', 'application/octet-stream');
      //res.send(content);
      //fs.writeFileSync('public/data.csv', content);
      //res.locals.datos = content;

      //Convertir respuesta a csv
      //res.render("index", {datos:content});

      //Envio de respuesta en json
      res.render("index", {datos:jsonsource});
      //console.log(res);
      //res.send(content);
      //res.sendFile("index.html", {datos :content,"root":"public"});
  }, function (err) {
      console.trace(err.message);
  });
  //res.render('index', { title: 'Express' });
});

router.get('/', function(req, res, next) {
  res.sendFile("index.html", {"root":"public"});
});


//Routing de sampling sobre índice
router.get('/:index/sample/:samplesize/probabilistic/step/:step', function(req, res, next) {
 var start = new Date();
  var indice = req.params.index,
       samplesize = parseInt(req.params.samplesize),
       step = parseInt(req.params.step);
  var datasetSize = 305;
  //var infdistrlim = 1/datasetSize;
  
  //Variable para calcular el limite inferior de probabilidad para que un doc sea seleccionado
  //var infdistrlim = 1/step;
  var infdistrlim = step/datasetSize
  console.log("Parametro: "+infdistrlim);

  //Random sampling
  client.search({
    index: indice,
    body: {
      //min_score excluye aquellos documentos cuyo _score sea menor al especificado
      min_score: 0.5,
      size: samplesize,

      //track_scores se utiliza cuando hay un sort sobre alguno de los campos del documento
      //de esta forma el _score igual es calculado independientemente del criterio de sort
      track_scores:true,

      //proyeccion de los campos del documento que son entregados en la respuesta
      _source: ["e_id"],
      query: {
       function_score: {
        query: {
          function_score:{
            functions:[{
              random_score: {
                //El uso de la misma semilla permite la aleatoriedad constante
                // si no se especifica, se usa el tiempo actual
                //seed: 3
              }
            }]
          }
        },
        functions: [
          {
            script_score:{
              script: {
                params:{
                  param1: infdistrlim
                },
                inline: "if (_score.doubleValue() < param1){return 1;} else {return 0;}"
              }
            }
          }
        ]
        //Reemplazo del score producido por el query con el score obtenido probabilisticamente
        ,boost_mode:"replace"
      }
    }
    }
    //Criterio de sort
    //,sort:[ {"e_id": "desc"}]
    ,sort: "e_id"
  }).then(function (resp) {
      reponse = resp.hits.hits;
      res.send(reponse);
    var end = new Date() - start;
    console.log("Execution Time: "+end + " ms.");
  }, function (err) {
      console.trace(err.message);
  });
  
});


function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}


module.exports = router;
