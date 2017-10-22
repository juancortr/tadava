Creación de índice y mapping de atributos

```
curl -XPUT 'localhost:9200/predial?pretty' -H 'Content-Type: application/json' -d'
{
"settings" : {
        "index" : {
            "number_of_shards" : 3, 
            "number_of_replicas" : 1
        }
    },
 "mappings" : {
  "_default_" : {
   "properties" : {
   			"ID_PREDIO": {"type": "keyword" },
			"LOTE": {"type": "keyword" },
			"ESTADO": {"type": "integer" },
			"MARCA": {"type": "keyword" },
			"PROGRAMA_GESTION": {"type": "keyword" },
			"FECHA_ESTADO": { "type" : "date" },
			"ID_SOPORTE_TRIBUTARIO": {"type": "keyword" },
			"FUENTE_DIR": {"type": "text" },
			"FECHA_REG": { "type" : "date" },
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
			"FECHA_LIMITE_1": { "type" : "date" },
			"AJUSTE_EQUIDAD_1": { "type" : "double" },
			"IMPUESTO_AJUSTADO_1": { "type" : "double" },
			"SALDO_CARGO_1": { "type" : "double" },
			"VALOR_SANCION_1": { "type" : "double" },
			"VALOR_PAGAR_1": { "type" : "double" },
			"VALOR_DESCUENTO_1": { "type" : "double" },
			"TOTAL_PAGAR_1": { "type" : "double" },
			"VALOR_PAGO_VOLUNTARIO_1": { "type" : "double" },
			"VALOR_TOTAL_CON_PAGO_VOL_1": { "type" : "double" },
			"FECHA_LIMITE_2": { "type" : "date" },
			"AJUSTE_EQUIDAD_2": { "type" : "double" },
			"IMPUESTO_AJUSTADO_2": { "type" : "double" },
			"SALDO_CARGO_2": { "type" : "double" },
			"VALOR_SANCION_2": { "type" : "double" },
			"VALOR_PAGAR_2": { "type" : "double" },
			"VALOR_DESCUENTO_2": { "type" : "double" },
			"TOTAL_PAGAR_2": { "type" : "double" },
			"VALOR_PAGO_VOLUNTARIO_2": { "type" : "double" },
			"VALOR_TOTAL_CON_PAGO_VOL_2": { "type" : "double" },
			"FECHA_LIMITE_3": { "type" : "date" },
			"AJUSTE_EQUIDAD_3": { "type" : "double" },
			"IMPUESTO_AJUSTADO_3",: { "type" : "double" },
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
}'
```
Remover el índice
```
curl -XDELETE 'localhost:9200/predial?pretty'
```