import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { username, code } = await request.json();
        const decodedUsername = decodeURIComponent(username);
        const user = await UserModel.findOne({ username: decodedUsername });

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found.",
                },
                { status: 500 }
            );
        }

        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()
        if(isCodeValid && isCodeNotExpired){
            user.isVerified = true
            await user.save()

            return Response.json({
                success: true,
                message: "User Verified."
            }, {status: 200})
        }
        else if(!isCodeNotExpired){
            return Response.json({
                success: false,
                message: "Verification Code Expired."
            }, {status: 400})
        }else{
            return Response.json({
                success: false,
                message: "Verification Code is not Correct."
            }, {status: 500})
        }
    } catch (error) {
        console.log(error);

        return Response.json(
            {
                success: false,
                message: "Error verifying the user.",
            },
            { status: 500 }
        );
    }
}
