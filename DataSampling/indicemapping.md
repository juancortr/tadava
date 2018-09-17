## Instrucciones para creación de índice y mappings en elasticsearch desde kibana
### Creación de índice y mapping de atributos desde kibana

Si el índice a utilizar ('predial') ya existe se puede crear uno nuevo o elimiar el existente y reemplazar la información con el siguiente comando en la consola de desarrollo de kibana:
```
DELETE predial
```

En la consola de ejecución kibana se debe ejecutar el siguiente comando que crea el índice y especifica el mapping para las variables incluidas. Cabe anotar que el formato de los datos en los que viene el archivo se especifica como atributo dentro del json de creación del índice, esto es significativo en caso de las fechas.
```
PUT predial
{
  "settings" : {
        "index" : {
            "number_of_shards" : 3, 
            "number_of_replicas" : 1
        }
    },
  "mappings":{
    "facturapredial":{
   "properties" : {
   			"ID_PREDIO": {"type": "keyword" },
			"LOTE": {"type": "keyword" },
			"ESTADO": {"type": "integer" },
			"MARCA": {"type": "keyword" },
			"PROGRAMA_GESTION": {"type": "keyword" },
			"FECHA_ESTADO": { 
			  "type" : "date",
        "format": "yyyy-MM-dd HH:mm:ss" },
			"ID_SOPORTE_TRIBUTARIO": {"type": "keyword" },
			"FUENTE_DIR": {"type": "text" },
			"FECHA_REG": { "type" : "date",
          "format": "yyyy-MM-dd HH:mm:ss"  },
			"MUNICIPIO_ENVIO": {"type": "text" },
			"ESTRATO": {"type": "keyword" },
			"AREA_TERRENO": { "type" : "double" },
			"AREA_CONSTRUIDA": { "type" : "double" },
			"DESTINO": {"type": "keyword" },
			"TARIFA_PLENA": { "type" : "double" },
			"AJUSTE_TARIFA": { "type" : "double" },
			"PORCENTAJE_EXENCION": {"type": "text" },
			"ID_UNICO_CONTRIBUYENTE": {"type": "keyword" },
			"TIPO_SOPORTE": {"type": "keyword" },
			"NUMERO_SOPORTE_TRIBUTARIO": {"type": "keyword" },
			"AUTOAVALUO": { "type" : "double" },
			"IMPUESTO_CARGO": { "type" : "double" },
			"FECHA_LIMITE_1": { "type" : "date",
          "format": "yyyy-MM-dd HH:mm:ss"  },
			"AJUSTE_EQUIDAD_1": { "type" : "double" },
			"IMPUESTO_AJUSTADO_1": { "type" : "double" },
			"SALDO_CARGO_1": { "type" : "double" },
			"VALOR_SANCION_1": { "type" : "double" },
			"VALOR_PAGAR_1": { "type" : "double" },
			"VALOR_DESCUENTO_1": { "type" : "double" },
			"TOTAL_PAGAR_1": { "type" : "double" },
			"VALOR_PAGO_VOLUNTARIO_1": { "type" : "double" },
			"VALOR_TOTAL_CON_PAGO_VOL_1": { "type" : "double" },
			"FECHA_LIMITE_2": { "type" : "date",
          "format": "yyyy-MM-dd HH:mm:ss"  },
			"AJUSTE_EQUIDAD_2": { "type" : "double" },
			"IMPUESTO_AJUSTADO_2": { "type" : "double" },
			"SALDO_CARGO_2": { "type" : "double" },
			"VALOR_SANCION_2": { "type" : "double" },
			"VALOR_PAGAR_2": { "type" : "double" },
			"VALOR_DESCUENTO_2": { "type" : "double" },
			"TOTAL_PAGAR_2": { "type" : "double" },
			"VALOR_PAGO_VOLUNTARIO_2": { "type" : "double" },
			"VALOR_TOTAL_CON_PAGO_VOL_2": { "type" : "double" },
			"FECHA_LIMITE_3": { "type" : "date",
          "format": "yyyy-MM-dd HH:mm:ss"  },
			"AJUSTE_EQUIDAD_3": { "type" : "double" },
			"IMPUESTO_AJUSTADO_3": { "type" : "double" },
			"SALDO_CARGO_3": { "type" : "double" },
			"VALOR_SANCION_3": { "type" : "double" },
			"VALOR_PAGAR_3": { "type" : "double" },
			"VALOR_DESCUENTO_3": { "type" : "double" },
			"TOTAL_PAGAR_3": { "type" : "double" },
			"VALOR_PAGO_VOLUNTARIO_3": { "type" : "double" },
			"VALOR_TOTAL_CON_PAGO_VOL_3": { "type" : "double" }
   }
  }
 }
}
```

En el cluster CAOBA se encuentra una instalación de elasticsearch para hadoop (elasticsearch 2.3.3) en el siguiente endpoint: 
```
http://caoba-access.virtual.uniandes.edu.co:8083/
```
El estado del cluster se puede consultar en el siguiente link:
```
http://caoba-access.virtual.uniandes.edu.co:8083/_cluster/health
```
Los índices del cluster elasticsearch se pueden consultar en:
```
http://caoba-access.virtual.uniandes.edu.co:8083/_cat/indices
```

Para la creación en el cluster CAOBA, los tipos de datos *keyword* y *text* deben ser manejados como campos de tipo *string* pues la versión 2.3 no maneja esos tipos de datos adicionales.