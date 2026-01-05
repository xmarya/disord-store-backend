import { catchAsync } from "@utils/catchAsync";
import Store from "@models/storeModel";
import StoreOwner from "@models/storeOwnerModel";
import Plan from "@models/planModel";
import mongoose from "mongoose";

/**
 * GET /reports/subscriptions
 * Returns subscription/package reports data
 */
export const getSubscriptionReports = catchAsync(async (request, response, next) => {
    const { dateFrom, dateTo } = request.query;

    // Build date filter
    const dateFilter: any = {};
    if (dateFrom) dateFilter.$gte = new Date(dateFrom as string);
    if (dateTo) dateFilter.$lte = new Date(dateTo as string);

    // Get subscription stats
    const storeOwners = await StoreOwner.find(
        dateFilter.$gte || dateFilter.$lte
            ? { 'subscribedPlanDetails.subscribeStarts': dateFilter }
            : {}
    ).lean();

    // Calculate stats
    const now = new Date();
    const activeSubscriptions = storeOwners.filter(owner => {
        const endDate = owner.subscribedPlanDetails?.subscribeEnds;
        return endDate && new Date(endDate) > now;
    }).length;

    const expiredSubscriptions = storeOwners.filter(owner => {
        const endDate = owner.subscribedPlanDetails?.subscribeEnds;
        return endDate && new Date(endDate) <= now;
    }).length;

    // Get plan prices for revenue calculation
    const plans = await Plan.find().lean();
    const planPrices: Record<string, number> = {};
    plans.forEach(p => {
        planPrices[p.planName] = p.price?.riyal || 0;
    });

    // Calculate total revenue
    let totalRevenue = 0;
    storeOwners.forEach(owner => {
        const planName = owner.subscribedPlanDetails?.planName;
        if (planName && planPrices[planName]) {
            totalRevenue += planPrices[planName];
        }
    });

    // Generate chart data (weekly breakdown)
    const chartData = generateWeeklyData(storeOwners);

    // Get subscriptions table data
    const subscriptionsTable = storeOwners.slice(0, 20).map(owner => ({
        _id: owner._id,
        merchantName: `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || 'غير معروف',
        email: owner.email,
        planName: owner.subscribedPlanDetails?.planName || 'غير محدد',
        subscribeDate: owner.subscribedPlanDetails?.subscribeStarts,
        expiryDate: owner.subscribedPlanDetails?.subscribeEnds,
        amount: planPrices[owner.subscribedPlanDetails?.planName || ''] || 0,
        status: owner.subscribedPlanDetails?.subscribeEnds &&
            new Date(owner.subscribedPlanDetails.subscribeEnds) > now ? 'نشط' : 'منتهي',
        paymentMethod: 'Apple Pay' // Placeholder - would come from payment records
    }));

    response.status(200).json({
        success: true,
        data: {
            stats: {
                activeSubscriptions,
                expiredSubscriptions,
                totalRevenue,
                monthlyGrowthRate: calculateGrowthRate(storeOwners)
            },
            chartData,
            subscriptionsTable
        }
    });
});

/**
 * GET /reports/stores
 * Returns store reports data
 */
export const getStoreReports = catchAsync(async (request, response, next) => {
    const { dateFrom, dateTo } = request.query;

    // Build date filter
    const dateFilter: any = {};
    if (dateFrom) dateFilter.$gte = new Date(dateFrom as string);
    if (dateTo) dateFilter.$lte = new Date(dateTo as string);

    // Get stores with optional date filter
    const stores = await Store.find(
        dateFilter.$gte || dateFilter.$lte ? { createdAt: dateFilter } : {}
    )
        .populate('owner', 'firstName lastName email')
        .lean();

    // Calculate stats
    const totalStores = stores.length;
    const activeStores = stores.filter(s => s.status === 'active').length;
    const suspendedStores = stores.filter(s => s.status === 'suspended').length;

    // Total profits would come from StoreStats - placeholder for now
    const totalProfits = 0;

    // Generate chart data
    const chartData = generateStoreChartData(stores);

    // Get stores table data
    const storesTable = stores.slice(0, 20).map(store => ({
        _id: store._id,
        storeName: store.storeName,
        ownerName: store.owner
            ? `${(store.owner as any).firstName || ''} ${(store.owner as any).lastName || ''}`.trim()
            : 'غير معروف',
        productsType: store.productsType || 'غير محدد',
        ordersCount: 0, // Would come from Order collection
        totalProfits: 0, // Would come from StoreStats
        status: store.status,
        createdAt: (store as any).createdAt
    }));

    response.status(200).json({
        success: true,
        data: {
            stats: {
                totalStores,
                activeStores,
                suspendedStores,
                totalProfits
            },
            chartData,
            storesTable
        }
    });
});

/**
 * GET /reports/general
 * Returns general platform reports
 */
export const getGeneralReports = catchAsync(async (request, response, next) => {
    const { dateFrom, dateTo } = request.query;

    // Get counts
    const [storeCount, storeOwnerCount] = await Promise.all([
        Store.countDocuments({ status: 'active' }),
        StoreOwner.countDocuments()
    ]);

    // Placeholder values - these would come from Order and Payment collections
    const stats = {
        totalOrders: 0,
        totalSales: 0,
        averageOrderValue: 0,
        totalProfits: 0,
        activeStores: storeCount,
        platformCommissions: 0
    };

    // Generate chart data
    const chartData = [
        { name: "س", orders: 0, sales: 0, profit: 0 },
        { name: "ج", orders: 0, sales: 0, profit: 0 },
        { name: "خ", orders: 0, sales: 0, profit: 0 },
        { name: "ر", orders: 0, sales: 0, profit: 0 },
        { name: "ث", orders: 0, sales: 0, profit: 0 },
        { name: "ن", orders: 0, sales: 0, profit: 0 },
        { name: "ح", orders: 0, sales: 0, profit: 0 },
    ];

    // Placeholder orders table - would come from Order collection
    const ordersTable: any[] = [];

    response.status(200).json({
        success: true,
        data: {
            stats,
            chartData,
            ordersTable
        }
    });
});

// Helper functions
function generateWeeklyData(storeOwners: any[]) {
    const days = ["س", "ج", "خ", "ر", "ث", "ن", "ح"];
    const now = new Date();

    return days.map((name, i) => {
        // Count subscriptions that started on each day of the week
        const daySubscriptions = storeOwners.filter(owner => {
            const startDate = owner.subscribedPlanDetails?.subscribeStarts;
            if (!startDate) return false;
            const date = new Date(startDate);
            return date.getDay() === i;
        });

        // Calculate actual values based on real data
        const orders = daySubscriptions.length;
        const sales = daySubscriptions.reduce((sum, owner) => {
            const planName = owner.subscribedPlanDetails?.planName;
            // Approximate values based on plan
            if (planName?.includes('premium') || planName?.includes('متقدمة')) return sum + 500;
            if (planName?.includes('pro') || planName?.includes('احترافية')) return sum + 300;
            return sum + 150;
        }, 0);
        const profit = Math.round(sales * 0.3); // 30% profit margin approximation

        return { name, orders, sales, profit };
    });
}

function generateStoreChartData(stores: any[]) {
    if (stores.length === 0) {
        return [{ name: "لا توجد متاجر", orders: 0 }];
    }

    // Group stores by creation month and count
    const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const storesByMonth: Record<number, number> = {};

    stores.forEach(store => {
        const createdAt = (store as any).createdAt;
        if (createdAt) {
            const month = new Date(createdAt).getMonth();
            storesByMonth[month] = (storesByMonth[month] || 0) + 1;
        }
    });

    // Return data for months that have stores
    return Object.entries(storesByMonth).slice(0, 7).map(([month, count]) => ({
        name: monthNames[parseInt(month)]?.substring(0, 3) || 'شهر',
        orders: count
    }));
}

function calculateGrowthRate(storeOwners: any[]) {
    // Simple calculation - would be more sophisticated in production
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const lastMonthSubs = storeOwners.filter(o => {
        const date = o.subscribedPlanDetails?.subscribeStarts;
        return date && new Date(date) >= lastMonth && new Date(date) < thisMonth;
    }).length;

    const thisMonthSubs = storeOwners.filter(o => {
        const date = o.subscribedPlanDetails?.subscribeStarts;
        return date && new Date(date) >= thisMonth;
    }).length;

    if (lastMonthSubs === 0) return thisMonthSubs > 0 ? 100 : 0;
    return Math.round(((thisMonthSubs - lastMonthSubs) / lastMonthSubs) * 100);
}

