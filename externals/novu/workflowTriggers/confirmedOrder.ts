import novu from "@config/novu";

async function novuConfirmedOrder() {
  await novu.trigger({
    to: [{ type: "Topic", topicKey: "new-order" }],
    workflowId: "",
  });
}

export default novuConfirmedOrder;
