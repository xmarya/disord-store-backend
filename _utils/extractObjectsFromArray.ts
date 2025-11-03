
const extractObjectsFromArray = (arrayOfObjects:Array<Record<string, any>>) => {
  let object = {};
  arrayOfObjects.forEach(obj => object = {...object, ...obj} )
  return object;
}

export default extractObjectsFromArray;