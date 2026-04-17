FROM postgres:18

LABEL maintainer="your-team"

# add scripts to run at initdb time
COPY ./compose/production/postgres/maintenance /usr/local/bin/maintenance
RUN chmod +x /usr/local/bin/maintenance/*
RUN ln -s /usr/local/bin/maintenance/* /usr/local/bin

COPY ./compose/production/postgres/docker-entrypoint-initdb.d /docker-entrypoint-initdb.d

RUN chmod +x /docker-entrypoint-initdb.d/*
