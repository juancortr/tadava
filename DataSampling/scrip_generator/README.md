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

### Test execution

The first test group was done to identify the execution time it takes for an ElasticSearch cluster to retrieve significant documents and create a sample representation of the whole dataset. Mock datasets with consecutive IDs was created and loaded into an ElasticSearch 2.3 cluster. The datasets consisted on groups of 100, 1000, 10000, 100000, 500000, 1'000000, 5'000000 and 10'000000 documents. For the thousands and millions datasets we considered a cluster architecture of 1, 3 and 5 data nodes. The strategy used to retrieve a sample of the datasets was based on a probabilistic approximation to document selection. Changing the step we expect to use we define a threshold by dividing the step into the size of the dataset. Later, we compare the threshold with the random_score function that assigns a random decimal number between 0 and 1 to all the documents in the dataset. If the random score is below the threshold the document gets selected. It is expected that the threshold and the probabilistic distribution of the score will allow us to have a representation of the dataset.

#### Test 1: Response time
The first test was designed in order to retrieve the time it takes for ElasticSearch to assign random score to all documents and retrieve the relevant ones according to the strategy tested.
There were used six iteration modes and 21 steps for all datasets
´´´
steps = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 10000, 20000, 50000, 100000, 200000, 500000]

iterations = [1, 5, 10, 20, 50 ,100]
´´´
At first the javascript library elasticsearch-js was used but this was not suitable for the test because of the callback nature of web technologies and as the requests done via NodeJS were timing out and some even rejected. A pause cycle was added to the automatic test generations but some responses were lost and the response writing was mixed between the different cals due to the asynchronous protocol.

Therefore elasticsearch-py module for python was used, as it allows to execute sequential calls to the cluster and register each response before sending the next request. This probed to be a better approach to the tasks and the results were consigned and visualized in the following link: [Link]

