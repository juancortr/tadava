#
1. Elasticsearch debe estar corriendo antes de iniciar la inserción. El puerto por defecto es 9200 que será al que logstash se conecte para realizar el bulk insert.
3. Se debe crear en elasticsearch un índice con los mappings descritos en indicemapping
2. Run logstash with the configuration file logstashpred.conf