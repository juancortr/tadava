### Instrucciones para la inserción de datos a elastic desde logstash utilizando el Bulk API

La ruta de acceso al endpoint el cluster CAOBA es: http://caoba-access.virtual.uniandes.edu.co:8083/

1. Elasticsearch debe estar corriendo antes de iniciar la inserción. También se debe iniciar la ejecución de Kibana. 
2. Se debe crear en elasticsearch un índice con las instrucciones descritas en indicemapping.md
3. Ejecutar logstash con el archivo de configuración logstashsamplepred.conf. Para esto, ejecutar desde la carpeta de instalación de logstash el comando './bin/logstash -f logstashsamplepred.conf'

Consideraciones importantes:
- El puerto por defecto es 9200 que será al que logstash se conecte para realizar el bulk insert y al que kibana se conecta para monitorear el cluster.
- El dataset se carga desde un archivo csv. La carga de datos con logstash se realiza desde un archivo csv. El formato del archivo debe estar separado por comas. Los nulos deben ser campos vacíos y no se debe utilizar ningn carácter para especificar inválidos (en el proceso de mapping al tipo de campo en elasticsearch). Así mismo el archivo de configuración utilizado en la carga por logstash debe incluir todas las columnas del archivo csv para evitar corrimientos en los datos. 
