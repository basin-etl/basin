import json
import pyarrow as pa
from ipykernel.comm import Comm
import pyarrow as pa

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
        return json.dumps({"fields":output_fields})
    else:
        return output_fields

def stream_df_as_arrow(df):
    sink = pa.BufferOutputStream()
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
    # see if we have any results
    batches = df.toDF(*renamed_schema_fields)._collectAsArrow()
    if len(batches)>0:
        writer = pa.RecordBatchStreamWriter(sink, batches[0].schema)
        for batch in batches:
            writer.write_batch(batch)
    comm = Comm(target_name="inspect_df")
    comm.send(data="test",buffers=[sink.getvalue()])
    comm.close(data="closing comm")
