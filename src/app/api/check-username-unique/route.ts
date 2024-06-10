import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import {z} from "zod"
import { usernameValidation } from "@/schemas/signUpSchema";

const usernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request:Request) {
    //TODO: Use this in all other routes
    if(request.method != 'GET'){ //? Not important for newer versions.
        return Response.json({
            success: false,
            message: "Method not allowed"
        }, {status: 405})
    }
    await dbConnect()

    try {
        const {searchParams} = new URL(request.url)
        const queryParams = {
            username: searchParams.get('username')
        }

        const result = usernameQuerySchema.safeParse(queryParams);
        console.log(result); //TODO: Later Remove
        if(!result.success){
            const usernameError = result.error.format().username?._errors || []

            return Response.json({
                success: false,
                message: usernameError?.length > 0 ? usernameError.join(', ') : 'Invalid Query Parameters'
            }, {status: 400})
        }

        const {username} = result.data
        const existingVerifiedUser = await UserModel.findOne({username, isVerified: true})
        if (existingVerifiedUser) {
            return Response.json({
                success: false,
                message: "Username is Already Taken"
            }, {status: 400})
        }

        return Response.json({
            success: true,
            message: "Username is Available"
        }, {status: 201})
    } catch (error) {
        console.log('Error in Checking the Username', error);
        return Response.json(
            {
                success: false,
                message: "Error in Checking the Username"
            },
            {
                status: 500
            }
        )
    }
}