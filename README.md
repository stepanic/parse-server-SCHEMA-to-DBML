# parse-server-SCHEMA-to-DBML
Convert ParseServer classes as documents from MongoDB collection `_SCHEMA` to DBML (SQL by dbdiagram.io) tables to visualize relations between Parse classes.

## ParseServer

- https://github.com/parse-community/parse-server
- https://parseplatform.org

## DBML

- https://www.dbml.org

### dbdiagram

- https://dbdiagram.io

# Requirements

Install `Node.js`, recommended `>= v12.x` with `NVM`

- https://github.com/nvm-sh/nvm

# Installation

```bash
npm install -g parse-server-schema-to-dbml
```

# Usage

## 1. Export data from Mongo collection to the JSON file as array of documents

```bash
mongoexport --uri="${MONGO_URI}" --collection _SCHEMA --jsonArray --out _SCHEMA.json
```

**NOTE:** do not worry about DB data leak, `_SCHEMA.json` is part of `.gitignore` 😎

## 2. Convert data from `_SCHEMA.json` to the DBML `_SCHEMA.dbml`

```bash
parseServerSchema2dbml -i _SCHEMA.json -o _SCHEMA.dbml
```

**NOTE:** do not worry about DB data leak, `_SCHEMA.dbml` is also part of `.gitignore` 😎

### Short call

```bash
parseServerSchema2dbml
```

#### NOTE

Default values are `./_SCHEMA.json` for the `-i` (`--input`) and `./_SCHEMA.dbml` for the `-o` (`--output`) options.

## 3. Import data to dbdiagram.io

Paste everything from `_SCHEMA.dbml` or other file defined at `--output` option to the empty or some existing diagram at the dbdiagram.io
