ARG BASE_CONTAINER=jupyter/pyspark-notebook
FROM $BASE_CONTAINER
# add jupyter headless server
RUN pip install jupyter_server
ENV PYTHONPATH "${PYTHONPATH}:/opt/superglue"
COPY ./config/jupyter_server_config.py $HOME/.jupyter/jupyter_server_config.py
CMD ["jupyter","server"]
