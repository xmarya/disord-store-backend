import PlatformReview from "@models/platformReviewModel";
import { getAllDocs } from "@repositories/global";
import { QueryParams } from "@Types/Request";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";


async function getAllPlatformReviews(query:QueryParams) {
    const safeGetAllReviews = safeThrowable(
        () => getAllDocs(PlatformReview, query),
        () => new Error("حدث خطأ أثناء معالجة العملية. حاول مجددًا")
    );

    return await extractSafeThrowableResult(() => safeGetAllReviews);
}

export default getAllPlatformReviews;