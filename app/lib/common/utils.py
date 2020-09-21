import json
from ipykernel.comm import Comm
import pyarrow as pa
import logging

from typing import Dict, List, Any, Tuple, Pattern, Match, Optional, Set
def get_catalog() -> Dict[str,Any]:
    return {"happy":"birthday"}

# get schema along with table aliases
# this hides in the output of the LogicalPlan under a qualifier
def get_schema_with_aliases(df,format=None):
    plan = df._jdf.queryExecution().analyzed()
    iterator = plan.output().iterator()
    output_fields:List[Any] = []
    while iterator.hasNext():
        # loop over the output fields, scala-style
        field = iterator.next()
        fieldname = field.name()
        alias = ""
        # alias hides in the qualifier
        if field.qualifier().length()>0:
            alias = field.qualifier().apply(0)

        output_fields.append({
            "tablealias": alias,
            "dataType": field.dataType().typeName(),
            "name": field.name()
        })

    if format=="json":
        return json.dumps({"fields":sorted(output_fields,key=lambda k: k['name'])})
    else:
        return output_fields

def stream_df_as_arrow(df,spark,limit=5000):
    # df = df.repartition(2000)#.cache()
    # cos = pa.output_stream(sink,compression='gzip')
    # get the aliases and change the names of the columns to show the aliases
    # this avoids duplicate columns
    aliased_schema = get_schema_with_aliases(df)
    renamed_schema_fields = []
    for i in range(len(aliased_schema)):
        aliased_field = aliased_schema[i]
        fieldname:str = ""
        if aliased_field["tablealias"]!="":
            fieldname = aliased_field["tablealias"]+"."+aliased_field["name"]
        else:
            fieldname = aliased_field["name"]
        renamed_schema_fields.append(fieldname)

    comm = Comm(target_name="inspect_df")

    # see if we have any results
    renamed_df = df.toDF(*renamed_schema_fields)
    row_iterator = renamed_df.toLocalIterator()
    row_num = 0
    row_buff = []
    chunk_size = 500
    for row in row_iterator:
        if (row_num>2000):
            break
        row_num += 1
        logging.debug(row_num)
        row_buff.append(row)
        if row_num%chunk_size==0:
            batches = spark.createDataFrame(row_buff,renamed_df.schema)._collectAsArrow()
            if len(batches)>0:
                sink = pa.BufferOutputStream()
                writer = pa.RecordBatchStreamWriter(sink, batches[0].schema)
                for batch in batches:
                    writer.write_batch(batch)
                comm.send(data="test",buffers=[sink.getvalue()])
            row_buff = []
    # send the last batch
    batches = spark.createDataFrame(row_buff,renamed_df.schema)._collectAsArrow()
    if len(batches)>0:
        sink = pa.BufferOutputStream()
        writer = pa.RecordBatchStreamWriter(sink, batches[0].schema)
        for batch in batches:
            writer.write_batch(batch)
        comm.send(data="test",buffers=[sink.getvalue()])

    comm.close(data="closing comm")

