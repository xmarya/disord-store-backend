import mongoose from 'mongoose';
import Store from '../models/storeModel';
import StoreOwner from '../models/storeOwnerModel';
import Credentials from '../models/credentialsModel';

const MONGO_URI = "mongodb://127.0.0.1:27017/discord_store";

const seedStores = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Sample store data
        const storesData = [
            {
                storeName: "متجر الأزياء",
                description: "متجر متخصص في بيع أحدث صيحات الموضة والأزياء العصرية",
                productsType: "ملابس وأزياء",
                status: "active",
                inPlan: "plus",
                ownerEmail: "fashion_owner@test.com",
                ownerFirstName: "أحمد",
                ownerLastName: "الفاشن"
            },
            {
                storeName: "تقنية بلس",
                description: "أجهزة إلكترونية وملحقات تقنية بأفضل الأسعار",
                productsType: "إلكترونيات",
                status: "active",
                inPlan: "basic",
                ownerEmail: "tech_owner@test.com",
                ownerFirstName: "محمد",
                ownerLastName: "التقني"
            },
            {
                storeName: "بيت الحلويات",
                description: "حلويات شرقية وغربية طازجة يومياً",
                productsType: "طعام وحلويات",
                status: "active",
                inPlan: "unlimited",
                ownerEmail: "sweets_owner@test.com",
                ownerFirstName: "فاطمة",
                ownerLastName: "الحلواني"
            },
            {
                storeName: "عالم الرياضة",
                description: "معدات رياضية وملابس للتمارين",
                productsType: "رياضة ولياقة",
                status: "maintenance",
                inPlan: "plus",
                ownerEmail: "sports_owner@test.com",
                ownerFirstName: "خالد",
                ownerLastName: "الرياضي"
            },
            {
                storeName: "مكتبة النور",
                description: "كتب ومستلزمات مكتبية ودفاتر",
                productsType: "كتب ومكتبات",
                status: "suspended",
                inPlan: "basic",
                ownerEmail: "books_owner@test.com",
                ownerFirstName: "نورة",
                ownerLastName: "القارئة"
            }
        ];

        console.log('🏪 Creating stores and owners...');

        for (const storeData of storesData) {
            // Check if store already exists
            const existingStore = await Store.findOne({ storeName: storeData.storeName });
            if (existingStore) {
                console.log(`⏭️ Store "${storeData.storeName}" already exists, skipping...`);
                continue;
            }

            // Create credentials for owner
            let creds = await Credentials.findOne({ email: storeData.ownerEmail });
            if (!creds) {
                creds = await Credentials.create({
                    email: storeData.ownerEmail,
                    password: "Test123456",
                    userType: "storeOwner",
                    emailConfirmed: true
                });
            }

            // Create store owner
            let owner = await StoreOwner.findOne({ email: storeData.ownerEmail });
            if (!owner) {
                owner = await StoreOwner.create({
                    _id: creds._id,
                    email: storeData.ownerEmail,
                    firstName: storeData.ownerFirstName,
                    lastName: storeData.ownerLastName,
                    userType: "storeOwner",
                    subscribedPlanDetails: {
                        planName: storeData.inPlan,
                        subscribeStarts: new Date(),
                        subscribeEnds: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
                    }
                });
            }

            // Create store
            const store = await Store.create({
                storeName: storeData.storeName,
                owner: owner._id,
                description: storeData.description,
                productsType: storeData.productsType,
                status: storeData.status,
                inPlan: storeData.inPlan,
                verified: storeData.status === "active"
            });

            // Link store to owner
            await StoreOwner.findByIdAndUpdate(owner._id, { myStore: store._id });

            console.log(`✅ Created store: ${storeData.storeName} (${storeData.status})`);
        }

        console.log('🎉 Seeding completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding stores:', error);
        process.exit(1);
    }
};

seedStores();
