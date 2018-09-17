var elasticsearch=require('elasticsearch');

var client = new elasticsearch.Client( {  
  host: 'http://157.253.236.37:8083/',
  //host: 'localhost:9200',
  auth: 'elastic:changeme',
  httpAuth: 'elastic:changeme',
  protocol: 'https',
  protocol: 'http',
  port:9200,
  log: 'trace',
});
client.cluster.health({},function(err,resp,status) {  
  console.log("-- Client Health --",resp);
});

module.exports = client;