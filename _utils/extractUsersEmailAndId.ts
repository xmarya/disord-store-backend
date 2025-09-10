import { AllUsers } from "@Types/Schema/Users/AllUser";


function extractUsersEmailAndId(usersDocs:Array<AllUsers>) {
  const ids:Array<string> = [];
  const emails:Array<string> = [];

  usersDocs.map(( {id, email} ) => {
    ids.push(id);
    emails.push(email);
  });

  /*
    assistantsEmails [
        {
          _id: new ObjectId('68c00fe346badafc354e2e8e'),
          email: 'shm-new-assistant2@assistant.com',
          id: '68c00fe346badafc354e2e8e'
        },
        {
          _id: new ObjectId('68c00feb46badafc354e2e98'),
          email: 'shm-new-assistant3@assistant.com',
          id: '68c00feb46badafc354e2e98'
        },
        {
          _id: new ObjectId('68c01e9699b763e02ff02c99'),
          email: 'shm-new-assistant4@assistant.com',
          id: '68c01e9699b763e02ff02c99'
        }
    ]

*/

}

export default extractUsersEmailAndId;