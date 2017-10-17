#
1. Elasticsearch debe estar corriendo antes de iniciar la inserción. El puerto por defecto es 9200 que será al que logstash se conecte para realizar el bulk insert.
3. Se debe crear en elasticsearch un índice con los mappings descritos en indicemapping.
2. Ejecutar desde la carpeta de logstash el comando './bin/logstash -f ruta_del_archivo_conf]'. Esto comienza el bulk insert de los datos.