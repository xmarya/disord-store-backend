import eventBus from "@config/EventBus";
import User from "@models/userModel";
import { createDoc } from "@repositories/global";
import { UserCreatedEvent } from "@Types/events/UserEvents";
import { DiscordSignupData } from "@Types/SignupData";

async function createNewDiscordUser(signupData: DiscordSignupData) {
  const { email, name, id, image } = signupData;
  const newDiscordUser = await createDoc(User, {
    userType: "user",
    signMethod: "discord",
    email,
    image,
    firstName: name,
    discord: {
      discordId: id,
      username: name,
    },
    "credentials.emailConfirmed": true,
  });
;

  return newDiscordUser;
}

export default createNewDiscordUser;
