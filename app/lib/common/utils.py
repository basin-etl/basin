import sys
import json
from ipykernel.comm import Comm
import pyarrow as pa
import logging
from pyspark.sql.pandas.types import to_arrow_schema # this keeps moving around in pyspark versions

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
    total_size = 0
    last_total_chunk = 0
    MAX_SIZE_MB = 40
    row_buff = []
    CHUNK_SIZE_MB = 5

    schema = to_arrow_schema(renamed_df.schema)

    for row in row_iterator:
        if (total_size/1024/1024>MAX_SIZE_MB):
            break
        total_size += sys.getsizeof(row)
        row_buff.append(row)

        if total_size>last_total_chunk+CHUNK_SIZE_MB*1024*1024:
            # flush an arrow batch to client
            buffer = _rdd_list_to_arrowbuffer(row_buff,schema)
            # the buffer size is likely smaller since it is compressed, so we can read more rows with same client memory limit
            total_size = last_total_chunk + buffer.size
            last_total_chunk = total_size
            comm.send(data="test",buffers=[buffer])
            row_buff = []

    # send the last batch
    if len(row_buff)>0:
        comm.send(data="test",buffers=[_rdd_list_to_arrowbuffer(row_buff,schema)])
    del row_iterator


def _rdd_list_to_arrowbuffer(rdd_list,schema):
    # transpose the rdd list
    columnar = list(map(list,zip(*rdd_list)))
    record_batch = pa.RecordBatch.from_arrays(columnar,schema=schema)
    sink = pa.BufferOutputStream()
    writer = pa.RecordBatchStreamWriter(sink, schema)
    writer.write_batch(record_batch)
    return sink.getvalue()

def repartition_by_size(df,max_partition_size_mb=20):
    """Utility method to repartition based on a maximum size of partition (in MB)
    """
    
    total_rows = df.count()
    total_size = 0 
    sample_size = 20
    for row in df.take(sample_size):
        total_size += sys.getsizeof(row)
    
    avg_row_size = total_size//sample_size
    total_df_size = avg_row_size*total_rows
    num_partitions = total_df_size//(max_partition_size_mb*1024*1024)
    print(num_partitions)
    return df.repartition(num_partitions)
