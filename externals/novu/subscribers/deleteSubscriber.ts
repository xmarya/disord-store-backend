import novu from "@config/novu";

async function novuDeleteSubscriber(subscribersIds: Array<string>) {
  const result = await Promise.all(
    subscribersIds.map(async (id) => {
      await novu.subscribers.delete(id);
    })
  );
}

export default novuDeleteSubscriber;
