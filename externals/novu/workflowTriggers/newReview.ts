import novu from "@config/novu";

async function novuNewReview() {
  await novu.trigger({
    to: { type: "Topic", topicKey: "new-review" },
    workflowId: "new-reviews",
  });
}

export default novuNewReview;

/* SOLILOQUY:
    1- a review is created
    2- trigger a topic to notify the store owner and the assistants that have replayToCustomer permission

    problems:
    1- how to specifying the subscribers to be only the "assistants with  replayToCustomer set to true?", 
        since the assistant's permission can be changed any time.
        should I delete all the subscribers and reassign them each time a new review is created?
    2- where to inject the logic to search about these subscribers?
        inside a bullmq job?
        I don't want to place the logic inside the createNewReviewController since I want to 
        return the response as fast as possible, chaining multiple async function would make the controller takes longer and I want to keep the logic specific to only CREATING A NEW REVIEW

*/
