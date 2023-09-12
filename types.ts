export enum SchemaType {
  /***
   * You can only set strings
   * @category TypeChecking
   */
  String = 0,
  /***
   * You can only set numbers
   * @category TypeChecking
   */
  Number,
  /***
   * You can only set objects
   * @category TypeChecking
   */
  Object,
  /***
   * You can only set arrays
   * @category TypeChecking
   */
  Array,
  /***
   * You can set whatever you want
   * @category TypeChecking
   */
  Any,
}
export interface CreateOptions<T> {
  /***
   * The name of the database
   */
  name: string;
  /***
   * The path of the database file
   * @default '{cwd}/databases/{name}.json'
   */
  path?: string;
  /***
   * The schema of the database
   */
  schema: Schema<T>;
}
export type Schema<T> = {
  [s in keyof T]: {
    /***
     * Indicates what type of value can set in this parameter
     * @default SchemaType.Any
     */
    type?: SchemaType;
    /***
     * Indicates if this parameter is optional or not
     * @default false
     */
    required?: boolean;
  };
};
