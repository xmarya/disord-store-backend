import { UserDeletedEvent } from "@Types/events/UserEvents";
import { Success } from "@Types/ResultTypes/Success";


async function updateDeletedUserReviews(event:UserDeletedEvent) {
    const {userType} = event.payload;
    if(userType !== "user") return new Success({serviceName:"reviewsCollection", ack:true});
}

export default updateDeletedUserReviews;