import os
import pyspark.sql
import common.utils
import decimal


def extract(spark,env,source):
    catalog = common.utils.get_catalog()
    print(catalog)
    properties = catalog[source]
    options = {}
    options["delimiter"] = properties["delimiter"]
    options["header"] = properties["header"]
    df = spark.read.options(**options).csv(os.path.join(env["datafolder"],properties["location"]))
    return df

def load():
    return df
