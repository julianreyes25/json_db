# JSON DB

`json_db` is a simple way to create databases using JSON\

## Example

```ts
import { createDB, SchemaType } from "https://deno.land/x/json_db@0.0.3/mod.ts";

interface Staff {
  name?: string;
  id: string;
}

const db = createDB<Staff>({
  name: "staff",
  schema: {
    name: {
      type: SchemaType.String,
      required: false,
    },
    id: {
      type: SchemaType.String,
      required: true,
    },
  },
}); // Creates "databases/staff.json" in the workspace

// You can also use db.createOne
db.new({
  name: "Marcos",
  id: "001",
}); // Creates a new document

const doc = db.findOne({
  id: "001",
}); // Returns the document

console.log(doc?.name, doc?.id); // 'Marcos' '001'
```
