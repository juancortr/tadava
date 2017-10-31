var elasticsearch=require('elasticsearch');

var client = new elasticsearch.Client( {  
  //host: 'http://caoba-access.virtual.uniandes.edu.co:8083/',
  host: 'localhost:9200',
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