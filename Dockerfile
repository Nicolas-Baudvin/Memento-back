FROM debian:10

RUN apt-get update -yq \
    && apt-get install curl gnupg -yq \
    && curl -sL https://deb.nodesource.com/setup_10.x | bash \
    && apt-get install nodejs -yq \
    && apt-get install nano \
    && apt-get clean -y

ADD . /app/
WORKDIR /app

RUN npm install

EXPOSE 5000
VOLUME /app

CMD node server.js