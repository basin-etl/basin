from typing import Dict, List, Any, Tuple, Pattern, Match, Optional, Set
def get_catalog() -> Dict[str,Any]:
    return {"happy":"birthday"}

import json
# get schema along with table aliases
def get_schema_with_aliases(df,format=None):
    plan = df._jdf.queryExecution().analyzed()

    # check top node
    if (plan.getClass().getSimpleName()=="SubqueryAlias"):
        all_fields = _schema_from_plan(plan,tablealias=plan.alias())
    else:
        all_fields = _schema_from_plan(plan)
    iterator = plan.output().iterator()
    output_fields = {}
    while iterator.hasNext():
        field = iterator.next()
        queryfield = all_fields.get(field.exprId().id(),{})
        if not queryfield=={}:
            tablealias = queryfield["tablealias"]
        else:
            tablealias = ""
        output_fields[field.exprId().id()] = {
            "tablealias": tablealias,
            "dataType": field.dataType().typeName(),
            "name": field.name()
        }

    aliased_fields = list(output_fields.values())
    if format=="json":
        return json.dumps({"fields":aliased_fields})
    else:
        return aliased_fields

def _schema_from_plan(root,tablealias=None,fields={}):
    iterator = root.children().iterator()
    while iterator.hasNext():
        node = iterator.next()
        nodeClass = node.getClass().getSimpleName()
        if (nodeClass=="SubqueryAlias"):
            # get the alias and process the subnodes with this alias
            _schema_from_plan(node,node.alias(),fields)
        else:
            if tablealias:
                # add all the fields, along with the unique IDs, and a new tablealias field            
                iterator = node.output().iterator()
                while iterator.hasNext():
                    field = iterator.next()
                    fields[field.exprId().id()] = {
                        "tablealias": tablealias,
                        "dataType": field.dataType().typeName(),
                        "name": field.name()
                    }
            _schema_from_plan(node,tablealias,fields)
    return fields
