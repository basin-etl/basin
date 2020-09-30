# this installs the complete server. for development, only the jupyter backend will be used
FROM jupyter/pyspark-notebook
# install node server for app
USER root
RUN mkdir /srv/app
RUN mkdir /srv/app/logs
COPY ./appserver /srv/app
COPY ./app/dist /srv/app/dist
WORKDIR /srv/app

COPY ./appserver/start.sh /srv/app
COPY ./appserver/spark-defaults.conf /usr/local/spark/spark-defaults.conf

RUN chmod +x /srv/app/start.sh
RUN chown -R jovyan:users /srv/app
RUN npm install -g forever

USER jovyan
RUN npm install

# add jupyter headless server
RUN pip install jupyter_server
RUN pip install jupyter-console
ENV PYTHONPATH "${PYTHONPATH}:/opt/basin/lib"
COPY ./app/lib /opt/basin/lib
COPY ./appserver/config/jupyter_server_config.py $HOME/.jupyter/jupyter_server_config.py
CMD ["./start.sh"]
