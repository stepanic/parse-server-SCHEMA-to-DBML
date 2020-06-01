# parse-server-SCHEMA-to-DBML
Convert ParseServer _SCHEMA Mongo collection data to DBML (SQL by dbdiagram.io) to visualise relations between Parse classes

## ParseServer

- https://github.com/parse-community/parse-server
- https://parseplatform.org

## DBML

- https://www.dbml.org

### dbdiagram

- https://dbdiagram.io

# Steps

## 1. Export data from Mongo collection to the JSON

```bash
mongoexport --uri="${MONGO_URI}" --collection _SCHEMA --jsonArray --out _SCHEMA.json
```
