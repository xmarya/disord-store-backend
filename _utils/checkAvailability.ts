import { Model } from "../_Types/Model";
import getField from "./getField";

export async function isDuplicated(Model:Model, field: string, value: string, id?:string) {

  const valuesList = await getField(Model, field);
  const isTaken = valuesList.some(obj => obj[field] === value && (id && obj._id !== id));

  return isTaken;
}

type PossiblyDuplicatedData = Array<{
  Model: "User" | "Store";
  field: string;
  values: Array<Record<string,any>>;
}>;


/*
  arguments:
    get passed:
    [
        {Model: "", field1: "", value1: [""]},
        {Model: "", field2: "", value2: [""]},
    ]
  example:
   const data:PossiblyDuplicatedData = [
        {Model:"User", field:"email username", values: [{email: (inputs.email) as string}, {username: (inputs.username) as string}]},
    ]
*/
async function advancedIsDuplicated(data: PossiblyDuplicatedData) {
  const errors:Array<string> = [];
  for (const {Model, field, values} of data) {
    // console.log(values); //[ { email: 'user@user.com' }, { username: 'user12' } ]
    const valuesList = await getField(Model, field);
    //console.log(":IST", valuesList);
    /* :IST [
        {
          _id: '67dea416406d70062346c232',
          email: 'user@user.com',
          username: 'user1',
          planExpiresInDays: 0,
          id: '67dea416406d70062346c232'
        }
      ]
    */
    field.split(" ").forEach((field, index) => {
        const isTaken = valuesList.some(obj => obj[field] === values[index][field]);
        isTaken && errors.push(field);
    });

    return errors;
  }

  /*
        data: [
            {
                Model: 'User',
                field: 'email username',
                value: [ 'user@user.com', 'user12' ]
            }
        ]
    */
   // ...data {
   //     Model: 'User',
   //     field: 'email username',
   //     value: [ 'user@user.com', 'user12' ]
   //   }
}