## Husky-Consultation

ми передаємо в експорт все що хочемо використовувати в іншищ модулях і в тому модулі в якому ми хочемо це 
використати кладемо в імпорти той модуль з якого передавали, і той модуль дасть усе що лежить у нього в експортах

не можна експортувати щось що не прописано в провайдерах

зміни у коді які ми зробили можна покласти в stash, тобто ідемо в git - uncommitted changes - stash changes там вони 
усі збережуться, а потім переходимо на гілку яка нам потрібна і виконуємо - unstash changes щоб вони застосувались 
для гілки на якій ми знаходимось

fork дає можливість взяти собі склонувати репозиторій, щоб потім отримати зміни які відбулись після клонування 
потрібно зайти в git - github - sync fork

## Husky
```bash
npm i husky
npm pkg set scripts.prepare="husky install"
npm run prepare
npx husky add .husky/pre-commit "npm test"
git add .husky/pre-commit
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