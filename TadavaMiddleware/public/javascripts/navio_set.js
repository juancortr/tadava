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

  var nn = new navio("#navio", 600).id("i");

  catColumns.forEach((c) => nn.addCategoricalAttrib(c));
  seqColumns.forEach((c) => nn.addSequentialAttrib(c));

  //var data = dats.split("\n")[];
  var data = dats;
  var i =0;

  /*d3.data(data, type, function (err, data) {
    console.log(data);
  //d3.csv("predialsampler/", type, function (err, data) {
    if (err) throw err;
    console.log(data.length);
    data.forEach((d,i) => d.i = i);

    nn.data(data);
  });*/

  data.forEach((d,i) => {  d.i = i; console.log(d);});
  nn.data(data);

  //26/01/2016 04:21:05 a.m.
  var fmt = d3.timeParse("%d-%m-%Y %H:%M:%S %p");

  function type(row) {
    return row;
  }