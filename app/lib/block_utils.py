import os
import pyspark.sql
import common.utils
import pyspark.sql.functions as F
import pyspark.sql.types as T

def extract(spark,env,source):
    catalog = common.utils.get_catalog()
    print(catalog)
    properties = catalog[source]
    file_location = os.path.join(env["datafolder"],properties["location"])
    if properties["type"]=="delimited":
        options = {
            "quote": "\"",
            "escape": "\"",
            "mode":"DROPMALFORMED",
            "ignoreTrailingWhiteSpace": True,
            "ignoreLeadingWhiteSpace": True,
        }
        options["delimiter"] = properties["delimiter"]
        options["header"] = properties["header"]
        options["multiLine"] = properties.get("multi_line",False)
        # read as text then deduce schema for better performance and ability to skip lines
        rdd = spark.read.text(file_location).rdd
        # read the schema based on a sample
        df_schema = spark.read.options(**options).option("inferSchema",True).csv(
            spark.sparkContext.parallelize(rdd.take(properties.get("schema_sample",500))).map(lambda x: (x.value, )).toDF().\
            rdd.map(lambda x: x[0])
        ).schema
        # read the csv without inferring schema
        df = spark.read.options(**options).csv(file_location,df_schema)
    elif properties["type"]=="parquet":
        df = spark.read.parquet(file_location)
    return df



def load(spark,env,df,connection,format,location,column_mapping):
    # catalog = common.utils.get_catalog()
    # print(catalog)
    # properties = catalog[source]
    options = {
        "quote": "\"",
        "escape": "\"",
        "multiLine": "true",
    }
    # options["delimiter"] = properties["delimiter"]
    # options["header"] = properties["header"]

    df_out  = df.select([F.col(mapping["source"]).alias(mapping.get("target")) for mapping in column_mapping])
    if format=='csv':
        df_out.toPandas().to_csv(os.path.join(env["datafolder"],location),index=False)
    else:
        df_out.write.parquet(os.path.join(env["datafolder"],location))
        

