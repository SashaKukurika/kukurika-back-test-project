## DB configuration

```bash
create entity
----
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  // nullable mean that it can't be empty when it's false
  @Column({ type: 'varchar', nullable: false })
  userName: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  email: string;

  @Column({ type: 'int', nullable: true })
  age: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Column({ type: 'varchar', nullable: false })
  password: boolean;
}
----

$ Passport
----
$ npm install --save @nestjs/passport passport passport-local
$ npm install --save-dev @types/passport-local
$ npm install --save @nestjs/jwt
$ npm install passport-jwt
$ npm install passport-http-bearer
----

$ nest g module auth & nest g service auth
create file - bearer.strategy.ts
----

----


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