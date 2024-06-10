import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import { User } from "next-auth";

export async function POST(request: Request) {
    dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !session.user) {
        return Response.json(
            {
                success: false,
                message: "Not Authenticated.",
            },
            { status: 401 }
        );
    }
    const userId = user._id;
    const { acceptMessages } = await request.json();
    try {
        const updatedUser = await UserModel.findByIdAndUpdate(userId, { isAcceptingMessage: acceptMessages }, { new: true });
        if (!updatedUser) {
            return Response.json({
                success: false,
                message: "Failed to Update User Status of Accepting Messages."
            }, { status: 401 })
        }

        return Response.json({
            success: true,
            message: "Accepting Messages status updated successfully.",
            updatedUser
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        return Response.json({
            success: false,
            message: "Failed to Update User Status of Accepting Messages."
        }, { status: 500 })
    }
}

export async function GET(request: Request) {
    dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !session.user) {
        return Response.json(
            {
                success: false,
                message: "Not Authenticated.",
            },
            { status: 401 }
        );
    }
    const userId = user._id;

    try {
        const foundUser = await UserModel.findById(userId);
        if (!foundUser) {
            return Response.json({
                success: false,
                message: "Failed to Find the User."
            }, { status: 404 })
        }

        return Response.json({
            success: true,
            isAcceptingMessages: foundUser.isAcceptingMessage
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        return Response.json({
            success: false,
            message: "Error in getting message accepting status."
        }, { status: 500 })
    }
}