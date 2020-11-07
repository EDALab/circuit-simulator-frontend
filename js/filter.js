
const filter = (jsonString) => {
  const object = JSON.parse(jsonString)
  let output = {}

  for (const [key, value] of Object.entries(object)) {
    let temp = { id: '', type: '', value: [], connect: [] }

    const id = value.id
    temp.id = id
    if (id.includes('GND_')) {
      temp.type = 'REF'
      temp.value.push(value.input[0])
    } else if (id.includes('line_')) {
      temp.type = 'W'
    } else if (id.includes('V_')) {
      temp.type = 'V'
      // const voltageValue = parseFloat(value.input[0]); // convert to number
      temp.value.push(value.input[0])
    } else if (id.includes('VM_')) {
      temp.type = 'VM'
      temp.value.push(value.input[0])
    } else if (id.includes('C_')) {
      temp.type = 'C'
      temp.value.push(value.input[0])
    } else if (id.includes('L_')) {
      temp.type = 'L'
      temp.value.push(value.input[0])
    } else if (id.includes('I_')) {
      temp.type = 'I'
      temp.value.push(value.input[0])
    } else if (id.includes('AM_')) {
      temp.type = 'AM'
      temp.value.push(value.input[0])
    }

    temp.connect = value.connect

    output[`${key}`] = temp
  }

  return output
}

// filteredCircuit is our filtered data, if we want strings, use JSON.stringify(filter(n_copy))
//const filteredCircuit = filter(n_copy)

//console.log(filteredCircuit)
export default filter;
