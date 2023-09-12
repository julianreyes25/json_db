// I'm a begginer on Deno, literally this is my first module so if there's a error, you can contact me and fix that error
// deno-lint-ignore-file no-explicit-any
import { existsSync } from "https://deno.land/std@0.201.0/fs/mod.ts";
import { CreateOptions, SchemaType } from "./types.ts";
import { error, parsers, typeOf } from "./util.ts";

export class Database<schema> {
  /***
   * Creates a new JSON Database\
   * Requires `allow-read` and `allow-write` permission
   */
  constructor(options: CreateOptions<schema>) {
    if (!options) error("The options are required to create a JSON Database");
    if (typeof options.name !== "string") {
      error(`Expected "string" but got "${typeOf(options.name)}"`);
    }
    if (!options.schema) error('The "schema" option is required');

    const path = options.path ?? `${Deno.cwd()}/databases/${options.name}.json`;
    const schema: any = options.schema;

    if (!existsSync(path)) {
      if (!options.path) {
        Deno.mkdirSync(`${Deno.cwd()}/databases`, { recursive: true });
        Deno.writeTextFileSync(path, `{"${options.name}":[]}`);
      } else error(`The file "${path}" does not exists`);
    }

    Object.entries(options.schema).forEach(([key, value]) => {
      const v: any = value;
      schema[key] = {
        type: v.type ?? 4,
        required: v.required ?? false,
      };
    });

    let src_code: string;
    try {
      src_code = Deno.readTextFileSync(path);
    } catch {
      Deno.writeTextFileSync(path, `{"${options.name}":[]}`);
      src_code = Deno.readTextFileSync(path);
    }

    this.#schema = schema;
    this.#updateFile = () => {
      const obj: any = {};
      obj[options.name] = this.#db;
      Deno.writeTextFileSync(path, JSON.stringify(obj));
    };
    this.#db = JSON.parse(src_code)[options.name];
    this.lenght = this.#db.length;

    return this;
  }

  /***
   * Finds, and returns an object if it exits\
   * If the reference is duplicated returns the latest document
   */
  findOne(object: schema): schema | null {
    let result = null;
    let _id: any = 0;

    for (const doc of this.#db) {
      Object.entries(doc).forEach(([k, v], id) => {
        _id = id;
        Object.entries(object as any).forEach(([k_, v_]) => {
          if (k === k_ && v === v_) result = doc;
        });
      });
    }

    return typeOf(result) === "object"
      ? Object.assign({ _id }, result)
      : result;
  }

  /***
   * Create a new document in the database\
   * Alias of `createOne`
   */
  new(object: schema) {
    this.createOne(object);
  }

  /***
   * Creates a new document in the database
   */
  createOne(object: schema) {
    Object.entries(object as any).forEach(([k, v]) => {
      const schema_ = this.#schema[k];
      const parser = (parsers as any)[SchemaType[schema_.type].toLowerCase()];
      parser(v);
    });

    const doc = this.findOne(object);

    doc ? 0 : this.#db.push(object);
    this.#updateFile();
  }

  /***
   * Finds, and update if it exists
   */
  findOneAndUpdate(oldObject: schema, newObject: schema) {
    const doc: any = this.findOne(oldObject);
    if (doc !== null) {
      Object.entries(newObject as any).forEach(([k, v]) => {
        const schema_ = this.#schema[k];
        const parser = (parsers as any)[SchemaType[schema_.type].toLowerCase()];
        parser(v);
      });

      this.#db[doc._id - 1] = newObject;
      this.#updateFile();
    }
  }

  /***
   * Returns a map
   */
  map(callback: (object: schema) => unknown): schema[] {
    const schema: schema[] = [];

    for (const doc of this.#db) {
      schema.push(callback(doc) as any);
    }

    return schema;
  }

  /***
   * Returns the last document
   */
  last(): schema | null {
    const num = this.lenght - 1;
    if (num < 0) {
      error("Cannot of find the last document, the database is blank");
    }
    return this.#db[num] ?? null;
  }

  /***
   * Returns the first document
   */
  first(): schema | null {
    return this.#db[0] ?? null;
  }

  #updateFile: () => void;
  #db: any[];
  #schema: any;
  lenght: number;
}

/***
 * Creates a new JSON Database\
 * Requires `allow-read` and `allow-write` permission
 */
export function createDB<schema>(options: CreateOptions<schema>) {
  if (new.target) error('"createDB" is not a NewableFunction');
  return new Database<schema>(options);
}

export default createDB;
export * from "./types.ts";
