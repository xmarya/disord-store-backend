
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Credentials from '../models/credentialsModel';
import Admin from '../models/adminModel';

dotenv.config({ path: '../.env' });

const MONGO_URI = "mongodb://127.0.0.1:27017/discord_store";

const createAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const email = "zain_new2@gmail.com";
        const password = "123456789Zain";

        // Cleanup first
        await Credentials.deleteMany({ email });
        await Admin.deleteMany({ email });
        console.log('🗑️ Cleaned up existing admin/credentials');

        // 1. Create Credentials
        // The model's pre-save hook will hash the password
        const creds = new Credentials({
            email,
            password,
            userType: 'admin',
            emailConfirmed: true,
            phoneNumber: undefined // Admin doesn't require phone usually, or sparse check
        });

        // Explicitly validate phone if needed, but schema says sparse.
        // However, if we don't set it, it's undefined.

        await creds.save();
        console.log('✅ Created Credentials');

        // 2. Create Admin Profile
        // We can use the same _id for convenience, or let Mongo generate one.
        // Usually they are linked by email in this system layout.
        const admin = await Admin.create({
            _id: creds._id, // Linking IDs is a good practice if not enforced
            firstName: "Zain",
            lastName: "Admin",
            email: email,
            userType: "admin"
        });
        console.log('✅ Created Admin Profile');

        console.log(`🎉 Admin created successfully: ${email}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
