## Docker DB connection

```bash
create file - docker-compose.db.yml
----
version: '3.9'

services:
  nest-help-postgres:
#    postgis can work with geolocation
    image: postgis/postgis
    ports:
      - '${POSTGRES_EXTERNAL_PORT:-5432}:5432'
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: nest-help
    volumes:
      - nest-help-db:/var/lib/postgresql/nest-help

volumes:
  nest-help-db:
----

add script - "start:db": "sudo docker compose -f docker-compose.db.yml up",
```

## Nest CLI
```bash
$ nest --help                       перегляд доступних команд
$ nest generate --help              довідка про певну команду
$ nest generate controller name     створить контролер з назвою name 

завжди створюють controller, module, service, а spec видаляють
```
## Validation

```bash
# install
$ npm i --save class-validator class-transformer

# add to main.ts
app.useGlobalPipes(new ValidationPipe());

# production mode
$ npm run start:prod
```

## Swagger

```bash
# Swagger
# to watch http://localhost:3000/api#/
$ npm install --save @nestjs/swagger
```
## Command for module

```bash
# create all for resource
# don't forget to add async before all methods
# and constructor at service
$ nest g resource users --no-spec
```