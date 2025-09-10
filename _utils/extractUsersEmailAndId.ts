import { AllUsers } from "@Types/Schema/Users/AllUser";


async function extractUsersEmailAndId(usersDocs:Array<AllUsers>) {
  const ids:Array<string> = [];
  const emails:Array<string> = [];

  usersDocs.map(( {id, email} ) => {
    ids.push(id);
    emails.push(email);
  });

  return {ids, emails};

}

export default extractUsersEmailAndId;