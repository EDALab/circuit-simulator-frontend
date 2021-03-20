
const filter = (jsonString, quickMeasure) => {
  console.log("input to filter");
  console.log(jsonString);
  const object = JSON.parse(jsonString)
  console.log("filter input after json parsing input");
  console.log(object);
  let output = {}

  output["-1"] = { id: 'GND_Abs', type: 'REF', value: 0, connect: [""] }
  let qmVoltmeter = { id: 'VM_QM', type: 'VM', value: [], connect: [], name: 'VM_QM' };
  var qmPin = 0;

  for (const [key, value] of Object.entries(object)) {
    let temp = { id: '', type: '', value: [], connect: [], name: value.name };

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
    } else if (id.includes('SPVM_') && !quickMeasure) {
      temp.type = 'VM';
      temp.value.push(value.input[0]);
      temp.connect = [];
      temp.connect[0] = value.connect[0];
      temp.connect[1] = "GND_Abs-0";
      output[`${key}`] = temp;
      continue;
    } else if (id.includes('VM_') && !quickMeasure) {
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
    } else if (id.includes('IM_') && !quickMeasure) {
      temp.type = 'AM';
      temp.value.push(value.input[0]);
    } else if (id.includes('D_')) {
      temp.type = 'D'; //diode
      temp.value.push(value.input[0]);
    } else if (id.includes('Label_') && !!quickMeasure) {
      qmVoltmeter.connect[qmPin] = value.connect[0];
      qmPin++;
    } else if (id.includes('P_')) {
      temp.type = 'P';
    } else if (id.includes('nBJT_')) {
      temp.type = 'nBJT';//n-type BJT
      temp.value.push(value.input[0]);
    } 

    // sketch of subcircuit feature idea: 
    // else if id.includes(X_)
    // then we have a subcircuit component in our circuit
    // this subcircuit has a list of its components as an attribute
    // we can send then say temp.type = 'X' (for subcircuit)
    // subcircuit has lets say 3 ports, each of which have 1 node connected to sth in the subcircuit, and another node open and free to connect, and it has been connected
    // to a device outside the subcircuit; this device is part of the larger circuit
    // we need to store the information that: the 3 points of entry to the subcircuit which are connected to the external world, are connected to which devices?
    // we can also recursively apply filter function on the subcircuit
    
    temp.connect = value.connect;

    output[`${key}`] = temp;
  }
  if (!!quickMeasure) {
    output["-2"] = qmVoltmeter;
  }

  console.log("output of filter");
  console.log(output);
  return output
}

// filteredCircuit is our filtered data, if we want strings, use JSON.stringify(filter(n_copy))
//const filteredCircuit = filter(n_copy)

//console.log(filteredCircuit)
export default filter;
