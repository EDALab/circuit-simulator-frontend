
const filter = (jsonString) => {
  const object = JSON.parse(jsonString)
  let output = {}

  // output is a hashmap
  // they first create what appears to be an absolute ground node
  output["-1"] = { id: 'GND_Abs', type: 'REF', value: 0, connect: [""] }

  // for each key value pair of the hashmap:
  for (const [key, value] of Object.entries(object)) {
    let temp = { id: '', type: '', value: [], connect: [], name: value.name }

    const id = value.id
    temp.id = id
    if (id.includes('GND_')) {
      temp.type = 'REF'
      temp.value.push(value.input[0])
    } else if (id.includes('line_')) {
      temp.type = 'W'
    } else if (id.includes('V_')) {
      temp.type = 'V'
      temp.value.push(value.input[0])
    } else if (id.includes('SPVM_')) { // special case; perhaps inquire further
      temp.type = 'VM';
      temp.value.push(value.input[0]);
      temp.connect = [];
      temp.connect[0] = value.connect[0];
      temp.connect[1] = "GND_Abs-0";
      output[`${key}`] = temp;
      continue;
    } else if (id.includes('VM_')) {
      temp.type = 'VM';
      temp.value.push(value.input[0]);
    } else if (id.includes('C_')) {
      temp.type = 'C';
      temp.value.push(value.input[0]);
    } else if (id.includes('R_')) {
      temp.type = 'R';
      temp.value.push(value.input[0]);
    } else if (id.includes('L_')) {
      temp.type = 'L';
      temp.value.push(value.input[0]);
    } else if (id.includes('I_')) {
      temp.type = 'I';
      temp.value.push(value.input[0]);
    } else if (id.includes('IM_')) {
      temp.type = 'AM';
      temp.value.push(value.input[0]);
    }

    temp.connect = value.connect;

    output[`${key}`] = temp;
  }

  return output
}

// filteredCircuit is our filtered data, if we want strings, use JSON.stringify(filter(n_copy))
//const filteredCircuit = filter(n_copy)

//console.log(filteredCircuit)
export default filter;
