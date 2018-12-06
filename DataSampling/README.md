# Data Generation and insertion
This folder contains the script used to generate data (data/datasetGenerator.py) and load it into Elasticsearch cluster used by Tadava. You can generate your own fake data or use a csv file with the information to load.

### Data insertion to Elasticsearch using Bulk API through elasticsearch-loader python module.

1. Specify the URL of your cluster installation in the file *mapper_loader.py*

````
esurl = "XXX.XXX.XXX.XXX:port"

````

2. In the file *mapper_loader.py*, specify the path to your local csv data file, the name of the index to be created in Elasticsearch (should be the same name set in Navio at Tadava). Also include in one line the mapping to be used for searching in the index. All string columns must be **not_analyzed**, to avoid tokenization of terms.

````
ruta = "path_to_cs_filev.csv"

indiceV = "index_name"

mappingFuente = "'{\"settings\" : {\"number_of_shards\" : 1 },\"mappings\" : {\"basicdata\" : {\"properties\" : {\"DATA_COLUMN_1\" : { \"type\" : \"string\", \"index\" : \"not_analyzed\" },\"DATA_COLUMN_2\" : {\"type\":\"long\" },\"DATA_COLUMN_3\" : { \"type\" : \"date\"},\"DATA_COLUMN_4\" : { \"type\" : \"boolean\"}}}}}'"

````
Fiel datatypes for Elasticsearch 2.3 include *string, long, integer, short, byte, double, float,date boolean* and *binary*.

3. Run the script, this will start the creation of the index and the insertion of the data from your local csv file into de specified index
````
python mapper_loader.py
````

Check that the file is a comma separated value, not any other separation character such as *;* or *tab*. Null values must be empty fields.
