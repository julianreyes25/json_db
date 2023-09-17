// deno-lint-ignore-file no-explicit-any
import { existsSync } from 'https://deno.land/std@0.201.0/fs/exists.ts';
import { CreateDabaseOptions, SchemaType } from './types.ts';
import { error, parsers as _ } from './util.ts';

/***
 * Creates a new Database
 */
export class Database<T> {
    constructor (options: CreateDabaseOptions<T>) {
        if (!options.name || !options.schema) error('Invalid Database options', 'DatabaseError');
        const path = options?.path ?? `${Deno.cwd()}/db/${options.name}.json`;
        const schema: any = options.schema;
        Object.entries(schema).forEach(([k, v]) => {
            schema[k] = {
                required: v ?? !1,
                type: v ?? SchemaType.Any
            }
        });
        this.#schema = schema;
        if (!options.path && !existsSync(path)) {
            Deno.mkdirSync(`${Deno.cwd()}/db`);
            Deno.writeTextFileSync(path, `{"${options.name}": []}`)
        }
        this.toJSON = () => {
            const obj: any = {};
            obj[options.name] = this.#db;
            return obj;
        }
        this.#save = () => {
            const obj = this.toJSON()
            Deno.writeTextFileSync(path, JSON.stringify(obj));
        };
        this.#db = JSON.parse(Deno.readTextFileSync(path))[options.name];
        this.length = this.#db.length;
    }
    /***
     * Finds, and returns a document\
     * If not exists returns null
     */
    findOne (object: T): null | T {
        let document = null;
        if (this.length > 0) {
            for (const doc of this.#db) {
                Object.entries(doc).forEach(([k, v]) => {
                    Object.entries(object as any).forEach(([k_, v_]) => {
                        if (k_ === k && v === v_) document = doc;
                    })
                })
            }
        }
        return document;
    }
    /***
     * Finds, and update a document
     */
    findOneAndUpdate (oldObject: T, newObject: T) {
        const doc = this.findOne(oldObject);
        if (doc !== null) {
            const index = this.#db.indexOf(doc);
            if (index >= 0) {
                this.#db[index] = newObject;
                this.#save();
            }
        }
    }
    /***
     * Clear all the documents
     */
    clear () {
        this.#db = [];
        this.#save();
    }
    /***
     * Returns if the document exists
     */
    has (object: T) {
        return this.findOne(object) !== null;
    }
    /***
     * Returns a map
     */
    map (callbackfn: (value: T, index: number, array: T[]) => unknown, thisArg?: any): T[] {
        return this.#db.map(callbackfn, thisArg)
    }
    /***
     * Returns the last document
     */
    last (): T | null {
        return this.#db[this.length - 1] ?? null;
    }
    /***
     * Returns the first document
     */
    first (): T | null {
        return this.#db[0] ?? null;
    }
    /***
     * Creates a new document\
     * Alias of `createOne`
    */
    new (object: T) {
        this.createOne(object)
    }
    /***
     * Creates a new document
    */
    createOne (object: T) {
        const doc = this.findOne(object);
        if (doc === null) {
            this.#db.push(object)
            this.#save()
        }
    }
    /***
     * Creates more than one document
    */
    create (...objects: T[]) {
        for (const obj of objects) {
            this.createOne(obj);
        }
    }
    /***
     * Returns the database but in JSON
     */
    toJSON: () => any;
    #save: () => void;
    #db: any;
    length: number;
    #schema: any;
}
export function createDB<T> (options: CreateDabaseOptions<T>) {
    if (new.target) error('"createDB" is not a NewableFunction');
    return new Database(options)
}
export default createDB;