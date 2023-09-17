export enum SchemaType {
    String = 0,
    Number,
    Object,
    Array,
    Any
}

export interface CreateDabaseOptions<T> {
    /***
     * The name of the database
     */
    name: string;
    /***
     * The path of the database file (only .json file)
     * @default '{cwd}/db/{name}.json'
     */
    path?: string;
    /***
     * The schema of the database
     */
    schema: DatabaseSchema<T>;
}

type DatabaseSchema<T>={
  [k in keyof T]: {
    /***
     * The type of the parameter
     */
    type: SchemaType;
    /***
     * Indicates if the parameter is required
    */
    required: boolean;
  };
};