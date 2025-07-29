import bullmq from "../../../_config/bullmq";
import { ms } from "../../../_data/constants";


const {queue} = await bullmq("Cart", cartWriteProcessor);

async function cartBullMQ() {
 await queue.add("cartWriteBatch", {}, { repeat: { every: 2 * ms }, jobId: "cart-batch-writer" });
}

async function cartWriteProcessor() {

}

export default cartBullMQ;