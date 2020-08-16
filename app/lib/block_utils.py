import os
import pyspark.sql
import common.utils
import os
import pyspark.sql
import common.utils
import os
import pyspark.sql
import common.utils


def extract(spark,env,source):
    catalog = common.utils.get_catalog()
    print(catalog)
    properties = catalog[source]
    options = {
        "quote": "\"",
        "escape": "\"",
        "multiLine": "true",
        "mode":"DROPMALFORMED",
        "ignoreTrailingWhiteSpace": True,
        "ignoreLeadingWhiteSpace": True,
    }
    options["delimiter"] = properties["delimiter"]
    options["header"] = properties["header"]
    file_location = os.path.join(env["datafolder"],properties["location"])
    # read as text then deduce schema for better performance and ability to skip lines
    rdd = spark.read.text(file_location).rdd
    # read the schema based on a sample
    df_schema = spark.read.options(**options).option("inferSchema",True).csv(
        rdd.map(lambda x: (x.value, )).toDF().limit(properties.get("schema_sample",500)).\
        rdd.map(lambda x: x[0])
    ).schema
    # read the csv without inferring schema
    df = spark.read.options(**options).csv(file_location,df_schema)
    return df




def ef_date(spark,env,df,connection,format,location,column_mapping):
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
    if format=='csv':
        df.toPandas().to_csv(os.path.join(env["datafolder"],location),index=False)
    else:
        df.write.parquet(os.path.join(env["datafolder"],location))
        


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
    if format=='csv':
        df.toPandas().to_csv(os.path.join(env["datafolder"],location),index=False)
    else:
        df.write.parquet(os.path.join(env["datafolder"],location))
        

