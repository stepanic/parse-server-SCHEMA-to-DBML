const { program } = require('commander');
const fs = require('fs');

// Material pallete 700 or 800 or 900 for white text
const colors = {
    red: '#d32f2f',
    pink: '#c2185b',
    purple: '#7b1fa2',
    deepPurple: '#512da8',
    indigo: '#303f9f',
    blue: '#1976d2',
    lightBlue: '#0277bd',
    cyan: '#00838f',
    teal: '#00796b',
    green: '#2e7d32',
    lightGreen: '#387002',
    lime: '#6c6f00',
    yellow: '#bc5100',
    amber: '#c43e00',
    orange: '#bb4d00',
    deepOrange: '#ac0800',
    brown: '#5d4037',
    grey: '#616161',
    blueGrey: '#455a64'
}

const colorByIndex = (id) => {
    const colorsArray = Object.values(colors);
    const index = id % colorsArray.length;
    return colorsArray[index];
}

const convert = (schemaJSON, schemaDBML) => {
    console.log(`Converting: ${schemaJSON} to ${schemaDBML}`);

    // read MongoDB _SCHEMA collection from _SCHEMA.json as JSON array of objects
    const _SCHEMA = JSON.parse(fs.readFileSync(schemaJSON, 'utf-8'));

    // console.log(_SCHEMA);

    let classIndex = 0;

    let DBML = [];

    DBML.push(`// Generated by parseServerSchema2dbml`);

    _SCHEMA.forEach(parseClass => {

        const className = parseClass._id;

        console.log(className);

        const keys = Object.keys(parseClass);

        const fields = keys.filter(key => {

            // Remove specific Parse keys (keep only custom fields)
            if (!['_id', 'objectId', 'updatedAt', 'createdAt', '_metadata'].includes(key)) {
                return key;
            }
        });

        const metadata = parseClass['_metadata'];
        // console.log(metadata);
        const fieldsOptions = metadata && metadata['fields_options'] || {};

        const color = colorByIndex(classIndex);

        let TABLE = `Table ${className} [headercolor: ${color}] {
    objectId string
    createdAt date [default: \`now()\`, note: "created time"]
    updatedAt date [default: \`now()\`, note: "updated time"]
`;

        const scalarFields = [];
        const pointerFields = [];
        const relationFields = [];

        const indexes = [];
        indexes.push(`      objectId [pk]`);

        const dbmlOptions = {};

        fields.forEach(fieldName => {
            const fieldType = parseClass[fieldName];
            // console.log(fieldName, fieldType);

            const fieldOptions = fieldsOptions[fieldName] || {};
            // console.log(fieldName, fieldOptions);

            dbmlOptions[fieldName] = [];

            if (fieldOptions.defaultValue !== undefined) {
                dbmlOptions[fieldName].push(`default: \`${JSON.stringify(fieldOptions.defaultValue)}\``)
            }

            const notes = [];
            if (fieldOptions.required) {
                notes.push('required');
            }

            if (fieldType.startsWith('*')) { // Pointer
                pointerFields.push(fieldName);
                const pointerClass = fieldType.substring(1); // Extract `*${pointerClass}`
                dbmlOptions[fieldName].push(`ref: > ${pointerClass}.objectId`)
                notes.push('MANY-to-ONE');
            } else if (fieldType.startsWith('relation<')) { // Relation
                relationFields.push(fieldName);
                const relationClass = fieldType.substring(9, fieldType.length - 1); // Extract `relation<${relationClass}>`
                dbmlOptions[fieldName].push(`ref: - ${relationClass}.objectId`)
                notes.push('MANY-to-MANY');
            } else { // others
                scalarFields.push(fieldName);
            }

            dbmlOptions[fieldName].push(`note: '${notes.join(', ')}'`)

            const dbmlOptionsAsString = dbmlOptions[fieldName].length ? `[${dbmlOptions[fieldName].join(', ')}]` : '';
            dbmlOptions[fieldName] = dbmlOptionsAsString;
        });


        scalarFields.forEach(fieldName => {
            const fieldType = parseClass[fieldName];
            TABLE += `    ${fieldName} ${fieldType} ${dbmlOptions[fieldName]}
`;
        });

        pointerFields.forEach(fieldName => {
            TABLE += `    ${fieldName} "Pointer" ${dbmlOptions[fieldName]}
`;
        });

        relationFields.forEach(fieldName => {
            TABLE += `    ${fieldName} "Relation" ${dbmlOptions[fieldName]}
`;
        });

        TABLE += `
    indexes {
${indexes.join('\n')}
    }
`;

        TABLE += `}`;

        DBML.push(TABLE);

        // console.log(fields);

        classIndex += 1;
    });

    const dbml = DBML.join('\n\n')

    // console.log(dbml);

    fs.writeFileSync(schemaDBML, dbml);

    console.log('DONE');
}

// CLI
program.version('0.2.0');

program
    .option('-i --input <input>', 'path to the _SCHEMA.json')
    .option('-o --output <output>', 'path to the _SCHEMA.dbml')
    .action((env) => {
        const schemaJSON = env.input || './_SCHEMA.json';
        const schemaDBML = env.output || './_SCHEMA.dbml';

        // console.log(input, output);

        convert(schemaJSON, schemaDBML);
    });

program.parse(process.argv);
