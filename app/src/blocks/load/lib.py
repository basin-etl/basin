import os
import pyspark.sql
import pyspark.sql.functions as F
import pyspark.sql.types as T
import common.utils

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
        