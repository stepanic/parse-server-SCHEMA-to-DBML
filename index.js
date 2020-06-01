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

    _SCHEMA.forEach(parseClass => {

        const className = parseClass._id;

        // console.log(className);

        const keys = Object.keys(parseClass);

        const fields = keys.filter(key => {

            // Remove specific Parse keys (keep only custom fields)
            if (!['_id', 'objectId', 'updatedAt', 'createdAt', '_metadata'].includes(key)) {
                return key;
            }
        });

        const color = colorByIndex(classIndex);

        let TABLE = `Table ${className} [headercolor: ${color}] {
    objectId string
`;

        const scalarFields = [];
        const pointerFields = [];
        const relationFields = [];

        const indexes = [];
        indexes.push(`      objectId [pk]`);

        fields.forEach(fieldName => {
            const fieldType = parseClass[fieldName];
            // console.log(fieldName, fieldType);

            if (fieldType.startsWith('*')) {
                pointerFields.push(fieldName);
            } else if (fieldType.startsWith('relation<')) {
                relationFields.push(fieldName);
            } else {
                scalarFields.push(fieldName);
            }
        });

        scalarFields.forEach(fieldName => {
            const fieldType = parseClass[fieldName];
            TABLE += `    ${fieldName} ${fieldType}
`;
        });

        pointerFields.forEach(fieldName => {
            const fieldType = parseClass[fieldName];
            const pointerClass = fieldType.substring(1); // Extract `*${pointerClass}`
            TABLE += `    ${fieldName} "Pointer (MANY-to-ONE)" [ref: > ${pointerClass}.objectId]
`;
            indexes.push(`      ${fieldName} [pk] // NOT pk, just for bold 😎`)
            indexes.push(`      ${fieldName} [note: '${fieldType}'] // MANY-to-ONE`)
        });

        relationFields.forEach(fieldName => {
            const fieldType = parseClass[fieldName];
            const relationClass = fieldType.substring(9, fieldType.length - 1); // Extract `relation<${relationClass}>`
            TABLE += `    ${fieldName} "Relation (MANY-to-MANY)" [ref: < ${relationClass}.objectId]
`;
            indexes.push(`      ${fieldName} [pk] // NOT pk, just for bold 😎`)
            indexes.push(`      ${fieldName} [note: '${fieldType}'] // MANY-to-MANY`)
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

    const dbml = DBML.join('\n')

    // console.log(dbml);

    fs.writeFileSync(schemaDBML, dbml);
}

// CLI
program.version('0.1.0');

program
    .requiredOption('-i --input <input>', 'path to the _SCHEMA.json')
    .requiredOption('-o --output <output>', 'path to the _SCHEMA.dbml')
    .action((env) => {
        const schemaJSON = env.input;
        const schemaDBML = env.output;

        // console.log(input, output);

        convert(schemaJSON, schemaDBML);
    });

program.parse(process.argv);