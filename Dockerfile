ARG BASE_CONTAINER=jupyter/pyspark-notebook
FROM $BASE_CONTAINER
# add jupyter headless server
RUN pip install jupyter_server
RUN pip install jupyter-console
ENV PYTHONPATH "${PYTHONPATH}:/opt/superglue/lib"
COPY ./config/jupyter_server_config.py $HOME/.jupyter/jupyter_server_config.py
CMD ["jupyter","server"]
