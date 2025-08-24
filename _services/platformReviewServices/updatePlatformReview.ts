import PlatformReview from "@models/platformReviewModel";
import { updateDoc } from "@repositories/global";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";


async function updatePlatformReview(reviewId:string, reviewBody:string) {
    const safeUpdateReview = safeThrowable(
        () => updateDoc(PlatformReview, reviewId, reviewBody),
        () => new Error("حدث خطأ أثناء معالجة العملية. حاول مجددًا")
    );

    return await extractSafeThrowableResult(() => safeUpdateReview);

}

export default updatePlatformReview;