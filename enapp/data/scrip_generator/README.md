### Mock data generation

The data used in these experiments have been generated using the python library [Faker](https://github.com/joke2k/faker), and uploaded to a running instance of ElasticSearch 2.3 cluster with [elasticsearch-loader](https://github.com/Moshe/elasticsearch_loader). A sample dataset can be found in the folder /data of 1000 rows with the following attributes:

* id - Consecutive numeric id for each row
* first_name - textual attribute
* last_name - textual attribute 
* married - boolean attribute
* ip - random ipv4 attribute
* calification - random decimal number from 0 to 9.99 using two decimal places
* posts - random 4-digits number
* date - random date from the last decade


### Indexes creation with mappings for Elastic 2.3

Our ElasticSearch index is located in the URL caoba-access.virtual.uniandes.edu.co:8083. In that cluster installation we defined one index for samples of 100, 1000, 10000, 100000, 500000, 1000000, 5000000, and 10000000 rows. 

The command used to create the index and the mappings for the dataset attributes is:
´´´
curl -XPOST caoba-access.virtual.uniandes.edu.co:8083/sample_XXXX -d '{
    "settings" : {
        "number_of_shards" : 1
    },
    "mappings" : {
        "basicdata" : {
            "properties" : {
                "id" : { "type" : "string", "index" : "not_analyzed" },
                "first_name" : { "type" : "string", "index" : "not_analyzed" },
                "last_name" : { "type" : "string", "index" : "not_analyzed" },
                "married" : { "type" : "boolean"},
                "ip" : { "type" : "string", "index" : "not_analyzed" },
                "calification" : { "type" : "double"},
                "posts" : { "type" : "long" },
                "date" : {"type":"date", "format": "yyyy-MM-dd HH:mm:ss"}
            }
        }
    }
}'
´´´

### Data load

The command used to upload the data to its corresponding elasticsearch index is:

´´´
elasticsearch_loader --es-host http://caoba-access.virtual.uniandes.edu.co:8083 --index sample_XXXXX --type basicdata csv /Users/JCAMILORT/Developer/esexploration/elasticSearchExperiments/enapp/data/scrip_generator/sample_XXXXX.txt
´´´


