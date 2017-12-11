var express = require('express');
var router = express.Router();
var client = require('../connection.js');
var fs = require('fs');

/* GET home page. */
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
    //sort:[ {"_score": "desc"}]
    sort:[ {"ESTRATO": "desc"}]
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
// Test: Step vs dataset size vs execution time
router.get('/test/test1', function(req, res, next) {

  //var iterations = [1, 5, 10, 20, 50 ,100];
  var iterations = [1, 5, 10];

  //var indices = ['sample_100','sample_10000','sample_100000','sample_500000','sample_1000000','sample_5000000','sample_10000000']; //Indices name -> datasetSize
  
  //var datasetSizes = [100, 1000, 10000, 100000, 500000,1000000, 5000000, 10000000];
  var datasetSizes = [100, 1000, 10000];

  samplesize = 10000; //max results window given by elastic search

  var steps = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 10000, 20000, 50000, 100000, 200000, 500000]
  //var steps = [1, 2, 5, 10, 20]

  for ( var it = 0; it<iterations.length; it++){
    var perFaire = iterations[it];
    console.log("Iteration#: "+perFaire);

    for( var executor = 0 ; executor < perFaire; executor++){
      console.log("Execution#: "+executor);

      for( var ind = 0; ind < datasetSizes.length ; ind++){
        var datasetSize = datasetSizes[ind];
        var indice = "sample_"+datasetSize;
        console.log("Index: "+indice)
        for( var st = 0; st< steps.length ; st++){
          var setp = steps[st];

          var infdistrlim = setp/datasetSize;
          var start = new Date();
          console.log("Step: "+setp);
          /**client.search({
            index: indice,
            body: {
              //min_score excluye aquellos documentos cuyo _score sea menor al especificado
              min_score: 0.5,
              size: samplesize,

              //track_scores se utiliza cuando hay un sort sobre alguno de los campos del documento
              //de esta forma el _score igual es calculado independientemente del criterio de sort
              track_scores:true,

              //proyeccion de los campos del documento que son entregados en la respuesta
              _source: ["id"],
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
          ,sort: "id"
        }).then(function (resp) {
            reponse = resp.hits.hits;
            console.log("Resp");
            console.log(reponse);
            //Write to file
            var linea = it+","+resp.hits.hits[0]._index+","+ setp + ","+resp.took;
            fs.appendFile('data_from_test_'+it+".csv", linea+'\n', function (err) {
              if (err) {
                // append failed
              } else {
                // done
              }
            });
            console.log(linea);
            //Siguiente consulta
        }, function (err) {
            console.trace(err.message);
        });*/
          executeTest(perFaire, indice, setp, datasetSize);
          //sleep(6000);
          
        }
      }
    }
  }
  
});

var executeTest = function (it, index, step, datasetSize){
  var infdistrlim = step/datasetSize;
  console.log('Ejecutando consulta...');
  client.search({
            index: index,
            body: {
              //min_score excluye aquellos documentos cuyo _score sea menor al especificado
              min_score: 0.5,
              size: samplesize,

              //track_scores se utiliza cuando hay un sort sobre alguno de los campos del documento
              //de esta forma el _score igual es calculado independientemente del criterio de sort
              track_scores:true,

              //proyeccion de los campos del documento que son entregados en la respuesta
              _source: ["id"],
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
          ,sort: "id"
        }).then(function (resp) {
            //Write to file
            //var linea = it+","+resp.hits.hits[0]._index+","+ step + ","+resp.took;
            //var linea = it+","+indice+","+ step + ","+resp.took;
            var linea = it+","+resp.hits.hits[0]._index+","+ step + ","+resp.took+ ","+resp.hits.hits.length+","+resp._shards.successful+","+resp._shards.failed;
            fs.appendFile('data_from_test_'+it+".csv", linea+'\n', function (err) {
              if (err) {
                // append failed

              } else {
                // done
              }
            });
            console.log(linea);
            //Siguiente consulta
        }, function (err) {
            console.trace(err.message);
            fs.appendFile('data_from_test_'+it+".csv", "error"+err.message+'\n', function (err) {
              if (err) {
                // append failed

              } else {
                // done
              }
            });
        });
        console.log('Ejecutada');
  }


module.exports = router;
