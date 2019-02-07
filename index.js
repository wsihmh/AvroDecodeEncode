#!/usr/bin/env node

const fs = require('fs');
const program = require('commander');

const pjson = require('./package.json');

const getAvroType = require('./app/getAvroType');
const kafka2json = require('./app/kafka2json');
const json2kafka = require('./app/json2kafka');

program
  .version(pjson.version)
  .arguments('<file>')
  .option('-j, --j2k', 'json2kafka mode (default)')
  .option('-k, --k2j', 'kafka2json mode')
  .option('-i, --input <input-file>', 'Input file')
  .option('-o, --output <output-file>', 'Output file, if not provided, will output to stdout')
  .option('-s, --schema <schema-file>', 'ARVO schema file to use, by default it uses calculated.behavior schema.')
  .parse(process.argv);

const mode = program.j2k && 'j2k' || program.k2j && 'k2j' || 'j2k';
const schemaPath = program.schema || 'schemas/calculated.behavior.json';
const inputFile = program.input;
const output = program.output;

const schemaFile = fs.readFileSync(schemaPath, 'utf8');
const avroType = getAvroType(JSON.parse(schemaFile));

if (mode === 'j2k') {
  const inputJson = fs.readFileSync(inputFile, 'utf8');
  const inputObject = JSON.parse(inputJson);
  const resKafka = json2kafka(avroType, inputObject);
  console.log(resKafka);
} else {
  const inputKafka = fs.readFileSync(inputFile, 'utf8');
  const resJson = kafka2json(avroType, inputKafka);
  const parsedResJson = JSON.parse(JSON.stringify(resJson));
  console.log(parsedResJson);
}