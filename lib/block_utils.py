import os
import pyspark.sql
import decimal

def extract(spark,env,source):
    df = spark.read.option("header",True).csv(os.path.join(env["datafolder"],f"{source}.csv"))
    return df

def load():
    return df

