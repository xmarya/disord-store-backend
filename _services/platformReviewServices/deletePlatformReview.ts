import PlatformReview from "@models/platformReviewModel";
import { deleteDoc } from "@repositories/global";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";


async function deletePlatformReview(reviewId:string) {
    const safeDeleteReview = safeThrowable(
        () => deleteDoc(PlatformReview, reviewId),
        () => new Error("حدث خطأ أثناء معالجة العملية. حاول مجددًا")
    );

    return await extractSafeThrowableResult(() => safeDeleteReview);
}

export default deletePlatformReview;