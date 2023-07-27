## Installation

```bash
$ npm i -g @nestjs/cli          при створені першого проекту
$ nest new project-name         створення нового проекту на nest project-name це назва проекту
$ npm install

додати в package.json в dependencies 
для сортування імпортів
"eslint-plugin-import": "^2.27.5",
"eslint-plugin-simple-import-sort": "^10.0.0",

Альтернатива

$ git clone https://github.com/nestjs/typescript-starter.git project
$ cd project
$ npm install
$ npm run start

клонувати репозиторій без історії git, використовувати degit
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