var catColumns = [
    "NCircunscripcion",
    "NDepto",
    "NMpio",
    "Npuesto",
    "PP",
    "ZZ",
    "candidato",
    "mesa",
    "partido"
  ];
  var seqColumns = [
    "votos"
  ];

/**
  var catColumns = [
    "id",
    "first_name",
    "last_name",
    "married",
    "ip"
  ];
  var seqColumns = [
    "calification",
    "posts",
    "date"
  ];
*/
  var nn = new navio("#navio", 600).id("i");

  catColumns.forEach((c) => nn.addCategoricalAttrib(c));
  seqColumns.forEach((c) => nn.addSequentialAttrib(c));

  nn.totalElemsTadava = numtelems;
  console.log("Elementos iniciales ", nn.totalElemsTadava);
  //var data = dats.split("\n")[];
  var data = dats;
  var i =0;

  data.forEach((d,i) => {  d.i = i; /*console.log(d);*/});
  nn.data(data);

  var level = 0;
  var ldata = {};
  nn.dataFilterSample(ldata);
  nn.tadavaURL = 'http://localhost:8090';
  //nn.tindex = 'sample_10000000_module';
  nn.tindex = 'resultados_senado_2018';

  //26/01/2016 04:21:05 a.m.
  var fmt = d3.timeParse("%d-%m-%Y %H:%M:%S %p");

  function type(row) {
    return row;
  }