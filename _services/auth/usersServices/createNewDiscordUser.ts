import User from "@models/userModel";
import { createDoc } from "@repositories/global";
import { DiscordSignupData } from "@Types/Schema/Users/SignupData";

async function createNewDiscordUser(signupData: DiscordSignupData) {
  const { email, name, id, avatar } = signupData;
  const newDiscordUser = await createDoc(User, {
    userType: "user",
    signMethod: "discord",
    email,
    avatar,
    firstName: name,
    discord: {
      discordId: id,
      username: name,
    },
    // "credentials.emailConfirmed": true, no longer exist
  });
  return newDiscordUser;
}

export default createNewDiscordUser;
