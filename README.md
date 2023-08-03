## Pagination custom Decorator

якщо декоратор починається зі слова Api це для свагера

## lib
```bash
npm i nestjs-typeorm-paginate
```
## Decorator

```bash
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export function Match(property: string, validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: MatchConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'Match' })
export class MatchConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return value === relatedValue;
  }
}
```

## for custom response

```bash
import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, ApiProperty, getSchemaPath } from '@nestjs/swagger';

export class PaginatedDto<TModel> {
  @ApiProperty()
  page: number;

  @ApiProperty()
  pages: number;

  @ApiProperty()
  countItem: number;

  @ApiProperty()
  entities: TModel[];
}

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  property: string,
  model: TModel,
) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        properties: {
          data: {
            allOf: [
              { $ref: getSchemaPath(PaginatedDto) },
              {
                properties: {
                  [`${property}`]: {
                    type: 'array',
                    items: { $ref: getSchemaPath(model) },
                  },
                },
              },
            ],
          },
        },
      },
    }),
  );
};

```
## Command for module

```bash
# create all for resource
# don't forget to add async before all methods
# and constructor at service
$ nest g resource users --no-spec
```