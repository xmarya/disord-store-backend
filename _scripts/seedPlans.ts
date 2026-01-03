
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Plan from '../models/planModel';

dotenv.config({ path: '../.env' }); // Load env from parent dir

const MONGO_URI = "mongodb://127.0.0.1:27017/discord_store"; // Hardcoded for local script usage

const seedPlans = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing plans
        await Plan.deleteMany({});
        console.log('🗑️ Cleared existing plans');

        const plans = [
            {
                planName: 'basic',
                price: {
                    riyal: 99,
                    dollar: 26
                },
                quota: {
                    ofProducts: 50,
                    ofCategories: 10,
                    ofStoreAssistants: 1,
                    ofColourThemes: 1,
                    ofCommission: 0,
                    ofShipmentCompanies: 1
                },
                features: [
                    "Up to 50 Products",
                    "Email Support",
                    "Basic Reports",
                    "Secure Hosting"
                ]
            },
            {
                planName: 'plus', // Correspond to "Professional" on frontend
                price: {
                    riyal: 199,
                    dollar: 53
                },
                quota: {
                    ofProducts: 500,
                    ofCategories: 50,
                    ofStoreAssistants: 5,
                    ofColourThemes: 5,
                    ofCommission: 0,
                    ofShipmentCompanies: 3
                },
                features: [
                    "Up to 500 Products",
                    "24/7 Support",
                    "Advanced Reports",
                    "Full Customization"
                ]
            }
        ];

        const createdPlans = await Plan.create(plans);
        console.log('🎉 Seeded plans successfully:');
        createdPlans.forEach(p => {
            console.log(`- ${p.planName}: ${p._id}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding plans:', error);
        process.exit(1);
    }
};

seedPlans();
