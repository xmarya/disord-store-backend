import novu from "@config/novu";

async function novuDeleteSubscriber(subscriberId: string) {
  const result = await novu.subscribers.delete(subscriberId);

  console.log("novuDeleteSubscriber", result);
}

export default novuDeleteSubscriber;
