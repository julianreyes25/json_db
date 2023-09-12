# JSON DB
`json_db` is a simple way to create databases using JSON instead of MongoDB, Sqlite, etc...\
The syntax is like mongoose...

## Example
```ts
import { createDB, SchemaType } from 'https://deno.land/x/json_db@0.0.2/mod.ts';

interface Staff {
    name?: string;
    id: string;
}

const db = createDB<Staff>({
    name: 'staff',
    schema: {
        name: {
            type: SchemaType.String,
            required: false // "required" doesn't work yet
        },
        id: {
            type: SchemaType.String,
            required: true // "required" doesn't work yet
        }
    }
}); // Creates "databases/staff.json" in the workspace

db.new({
    name: 'Marcos',
    id: '001'
}) // Creates a new document

const doc = db.findOne({
    id: '001'
}); // Returns the document

console.log(doc?.name, doc?.id); // 'Marcos', '001'
```