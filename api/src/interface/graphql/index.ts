import { Request } from 'express';
import { Container } from 'typedi';
import { buildSchema, GraphQLResolveInfo } from 'graphql';
import { graphqlHTTP, } from 'express-graphql';
import { auth } from '@config';

export const Int = {};

const args      = new Map();
const fields    = new Map();
const resolvers = new Map();
const schema: {[index:string]:string[]} = {};
const root: {[index:string]:any} = {};

type FieldOptions = {
  nullable? : boolean,
  type?     : ()=>any,
};

type ArgumentDescriptor = {
  index    : number,
  name?    : string,
  context? : boolean,
  parent?  : boolean,
  auth?    : boolean,
  options? : FieldOptions,
};

function resolveType(options: FieldOptions, type?: ()=>any) {
  let input  = type ? type() : options.type();
  let prefix = '';
  let suffix = '';
  options = Object.assign({
    nullable: false,
  }, options);
  if (Array.isArray(input)) {
    prefix += '[';
    suffix += ']';
    input = input.shift();
  }
  if (!options.nullable) {
    suffix += '!';
  }
  if (String === input) return `${prefix}String${suffix}`;
  if (Boolean === input) return `${prefix}Boolean${suffix}`;
  if (Int === input) return `${prefix}Int${suffix}`;
  if (fields.has(input)) return `${prefix}${input.name}${suffix}`;
  throw new Error(`Unknown type`);
}

function buildDefinition(name: string, options: FieldOptions, args: ArgumentDescriptor[], type?: ()=>any): string {
  options = Object.assign({
    nullable: false,
  }, options);
  let nameSuffix = '';

  if (args && args
      .filter(arg => !arg.context)
      .filter(arg => !arg.auth)
      .length
  ) {
    nameSuffix += '(';
    nameSuffix += args
      .filter(arg => !arg.context)
      .filter(arg => !arg.auth)
      .map((arg: ArgumentDescriptor) => {
        return `${arg.name}: ${resolveType(arg.options, undefined)}`;
      })
      .join(', ');
    nameSuffix += ')';
  }

// function resolveType(options: FieldOptions, type?: ()=>any) {
  return `${name}${nameSuffix}: ${resolveType(options, type)}`;
}

function buildArguments(descriptor: ArgumentDescriptor[], context, parent, req: Request) {
  if (!Array.isArray(descriptor)) {
    return [];
  }
  const output = Array(descriptor.length).fill(undefined);
  descriptor.forEach(desc => {
    if (desc.context) {
      output[desc.index] = context;
    } else if (desc.auth) {
      output[desc.index] = req[auth.authProperty];
    } else if (desc.parent) {
      output[desc.index] = parent;
    } else {
      output[desc.index] = context[desc.name];
    }
  });
  return output;
}


export function ObjectType(name: string): ClassDecorator {
  return function(constructor: Function) {
    const map = fields.get(constructor);
    schema[constructor.name] = map;
  }
}

export function Field(type: ()=>any, options?: FieldOptions): PropertyDecorator {
  return function(target: any, propertyKey: string): void {
    const map = fields.get(target.constructor) || [];
    map.push(`${propertyKey}: ${resolveType(options,type)}`);
    fields.set(target.constructor, map);
  }
}

export function AddMethod(parent: string, name: string, constructor: Function, argDescriptors: ArgumentDescriptor[] ) {
  root[parent]       = root[parent] || {};
  root[parent][name] = (context: {[index:string]:any}, parent: {[index:string]:any}, request: Request) => {
    return Container.get(constructor)[name](...buildArguments(argDescriptors, context, parent, request));
  };
}

export function Resolver(objectType: any): ClassDecorator {
  return function(constructor: Function) {
    const name  = objectType.name;
    const extra = resolvers.get(constructor) || [];
    const map   = fields.get(objectType) || [];
    for(const entry of extra) {
      map.push(`${entry.name}: ${resolveType(entry.options, entry.type)}`);
      const argDescriptors = (args.get(constructor)||{})[entry.name];
      AddMethod(objectType.name, entry.name, constructor, argDescriptors);
    }
  }
}

export function ResolveField(type: ()=>any, options?: FieldOptions): MethodDecorator {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor): void {
    const map = resolvers.get(target.constructor) || [];
    map.push({ type, options, name: propertyKey });
    resolvers.set(target.constructor, map);
  };
}


export function Query(returnType: ()=>any, options?: FieldOptions): MethodDecorator {
  schema.Query = schema.Query || [];
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor): void {
    const argDescriptors = (args.get(target.constructor)||{})[propertyKey];
    schema.Query.push(buildDefinition(propertyKey, options, argDescriptors, returnType));
    AddMethod('Query', propertyKey, target.constructor, argDescriptors);
    // root.Query = root.Query || {};
    // root.Query[propertyKey] = (context: {[index:string]:any}, request: Request) => {
      // const resolver = Container.get(target.constructor);
      // return resolver[propertyKey](...buildArguments(argDescriptors, context, request));
    // };
  }
}

export function Mutation(returnType: ()=>any, options?: FieldOptions): MethodDecorator {
  schema.Mutation = schema.Mutation || [];
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor): void {
    const argDescriptors = (args.get(target.constructor)||{})[propertyKey];
    schema.Mutation.push(buildDefinition(propertyKey, options, argDescriptors, returnType));
    AddMethod('Mutation', propertyKey, target.constructor, argDescriptors);
    // root.Mutation = root.Mutation || {};
    // root.Mutation[propertyKey] = (context: {[index:string]:any}, request: Request) => {
      // const resolver = Container.get(target.constructor);
      // return resolver[propertyKey](...buildArguments(argDescriptors, context, request));
    // };
  }
}

export function Context(): ParameterDecorator {
  return function(target: any, propertyKey: string, index: number) {
    const t: {[index:string]:ArgumentDescriptor[]} = args.get(target.constructor) || {};
    const a = t[propertyKey] = t[propertyKey] || [];
    a.push({
      index,
      context: true,
    });
    args.set(target.constructor, t);
  }
}

export function Arg(name: string, options?: FieldOptions) {
  return function(target: any, propertyKey: string, index: number) {
    const t: {[index:string]:ArgumentDescriptor[]} = args.get(target.constructor) || {};
    const a = t[propertyKey] = t[propertyKey] || [];
    a.push({
      index,
      name,
      options,
    });
    args.set(target.constructor, t);
  }
}

export function Auth() {
  return function(target: any, propertyKey: string, index: number) {
    const t: {[index:string]:ArgumentDescriptor[]} = args.get(target.constructor) || {};
    const a = t[propertyKey] = t[propertyKey] || [];
    a.push({
      index,
      auth: true,
    });
    args.set(target.constructor, t);
  };
}

export function Parent() {
  return function(target: any, propertyKey: string, index: number) {
    const t: {[index:string]:ArgumentDescriptor[]} = args.get(target.constructor) || {};
    const a = t[propertyKey] = t[propertyKey] || [];
    a.push({
      index,
      parent: true,
    });
    args.set(target.constructor, t);
  };
}

export async function init({ app }) {
  let schemaOutput = '';

  Object
    .keys(schema)
    .forEach(typename => {
      schemaOutput += `type ${typename} {\n  `;
      schemaOutput += schema[typename].join('\n  ');
      schemaOutput += `\n}\n`;
    });

  process.stdout.write(schemaOutput);

  app.use('/graphql', graphqlHTTP({
    schema        : buildSchema(schemaOutput),
    graphiql      : true,
    pretty        : true,
    fieldResolver : (parent: any, args, req: Request, info: GraphQLResolveInfo) => {

      // Known methods
      if (root[info.parentType.name] && root[info.parentType.name][info.fieldName]) {
        return root[info.parentType.name][info.fieldName](args, parent, req);
      }

      // Already defined data
      if (parent && info.fieldName in parent) {
        return parent[info.fieldName];
      }

      // Not defined
      return undefined;
    },
  }));
}

