import PlatformReview from "@models/platformReviewModel";
import { getOneDocById } from "@repositories/global";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function getOnePlatformReview(reviewId:string) {
    const safeGetOneReview = safeThrowable(
        () => getOneDocById(PlatformReview, reviewId),
        () => new Error("حدث خطأ أثناء معالجة العملية. حاول مجددًا")
    );

    return await extractSafeThrowableResult(() => safeGetOneReview);
}

export default getOnePlatformReview;