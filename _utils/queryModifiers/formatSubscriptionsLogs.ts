import { UserPlan } from "../../_Types/User";


function formatSubscriptionsLogs(subscribedPlanDetails:UserPlan, planExpiresInDays:string) {
    // const currentSubscription ,currentSubscriptionDetails, pastSubscriptions
    const {paidPrice, subscribeStarts, subscribeEnds, planId} = subscribedPlanDetails;
    const currentSubscription = {planName:planId?.planName, paidPrice, planExpiresInDays};
    const currentSubscriptionDetails = {subscribeStarts, subscribeEnds, originalPrice: planId?.price, quota: planId?.quota};

    return {currentSubscription, currentSubscriptionDetails}
}

export default formatSubscriptionsLogs;

/* THE WANTED OUTPUT:
  currentSubscription: (planName, paid price starts, ends, days left)
  currentSubscriptionDetails: (original price, quota, features)
  pastSubscriptions: (date, planName, paidPrice)
*/
/* THE RAW OUTPUT:
"userPlansLog": {
        "subscribedPlanDetails": {
            "planId": {
                "price": {
                    "riyal": 72,
                    "dollar": 18.99
                },
                "quota": {
                    "ofCommission": 2
                },
                "_id": "67e2e25a9f8768d22091f1a9",
                "planName": "plus",
                "features": [
                    "عدد لا محدود من المنتجات",
                    "عدد لا محدود من فئات المنتجات",
                    "تقارير مبيعات شهرية - سنوية",
                    "وسائل دفع apple pay - paypal - visa - master card",
                    "يمكن إضافة مساعد في المتجر",
                    "اضافة 3 ثيمات للمتجر"
                ],
                "discount": 0,
                "__v": 0
            },
            "originalPrice": 72,
            "subscriptionType": "new",
            "paid": true,
            "subscribeStarts": "2025-05-10T13:57:14.727Z",
            "subscribeEnds": "2025-06-08T13:57:14.727Z",
            "paidPrice": 72
        },
        "_id": "683ae1c006651613e6f042e5",
        "subscriptionsLog": {
            "2025-06-01": {
                "planName": "plus",
                "price": 72
            }
        },
        "planExpiresInDays": "29 يوم",
        "id": "683ae1c006651613e6f042e5"
    }

*/
