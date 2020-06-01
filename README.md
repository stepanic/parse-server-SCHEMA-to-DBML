# parse-server-SCHEMA-to-DBML
Convert ParseServer _SCHEMA Mongo collection data to DBML (SQL by dbdiagram.io) to visualise relations between Parse classes

## ParseServer

- https://github.com/parse-community/parse-server
- https://parseplatform.org

## DBML

- https://www.dbml.org

### dbdiagram

- https://dbdiagram.io

# Requirements

Install `Node.js`, recommened `>= v12.x` with `NVM`

- https://github.com/nvm-sh/nvm

# Steps

## 0. Clone this repo

```bash
git clone git@github.com:stepanic/parse-server-SCHEMA-to-DBML.git
```

## 1. Export data from Mongo collection to the JSON

```bash
mongoexport --uri="${MONGO_URI}" --collection _SCHEMA --jsonArray --out _SCHEMA.json
```

**NOTE:** do not worry about DB data leak, `_SCHEMA.json` is part of `.gitignore` 😎
