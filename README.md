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
## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
