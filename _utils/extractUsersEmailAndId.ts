import { AllUsers } from "@Types/Schema/Users/AllUser";


async function extractUsersEmailAndId(usersDocs:Array<AllUsers>) {
  const ids:Array<string> = [];
  const emails:Array<string> = [];

  usersDocs.map(( {_id, email} ) => {
    ids.push(_id as string);
    emails.push(email);
  });

  return {ids, emails};

}

export default extractUsersEmailAndId;