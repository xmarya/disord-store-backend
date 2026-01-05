import User from "@models/userModel";
import { Success } from "@Types/ResultTypes/Success";
import { Failure } from "@Types/ResultTypes/errors/Failure";

type UserStatus = "active" | "blocked";

async function toggleUserStatusByAdmin(userId: string, newStatus: UserStatus) {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { status: newStatus },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return new Failure("User not found");
        }

        return new Success(updatedUser);
    } catch (error) {
        console.error("Error toggling user status:", error);
        return new Failure("Failed to update user status");
    }
}

export default toggleUserStatusByAdmin;
