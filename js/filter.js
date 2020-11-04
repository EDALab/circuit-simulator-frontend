const fs = require('fs');

let output = {};

const filter = (jsonString) => {
  const object = JSON.parse(jsonString);

  for (const [key, value] of Object.entries(object)) {
    let temp = { id: '', type: '', value: [], connect: [] };

    const id = value.id;
    temp.id = id;
    if (id.includes('GND_')) {
      temp.type = 'REF';
      temp.value.push(value.input[0]);
    } else if (id.includes('line_')) {
      temp.type = 'W';
    } else if (id.includes('V_')) {
      temp.type = 'V';
      // const voltageValue = parseFloat(value.input[0]); // convert to number
      temp.value.push(value.input[0]);
    }


    else if (id.includes('VM_')) {
      temp.type = 'VM';
      temp.value.push(value.input[0]);
    } else if (id.includes('C_')) {
      temp.type = 'C';
      temp.value.push(value.input[0]);
    } else if (id.includes('L_')) {
      temp.type = 'L';
      temp.value.push(value.input[0]);
    } else if (id.includes('I_')) {
      temp.type = 'I';
      temp.value.push(value.input[0]);
    } else if (id.includes('AM_')) {
      temp.type = 'AM';
      temp.value.push(value.input[0]);
    }

    temp.connect = value.connect;

    output[`${key}`] = temp;
  }
};

const readAndWrite = () => {
// change “PATH” to the name of your input file (ex. Example_Input.json)
fs.readFile('./Example_Input.json', 'utf8', (err, jsonString) => {
  if (err) {
    console.log('File read failed:', err);
  }
  filter(jsonString);

  // the variable "result" is the parsing result
  const result = JSON.stringify(output);

  fs.writeFile('./filterResult.json', result, (error) => {
    if (error) {
      console.log('Error writing file', error);
    }
  });
});
}


export { readAndWrite };
