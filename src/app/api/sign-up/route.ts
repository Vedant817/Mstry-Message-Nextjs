import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs"
import { sendVerificationEmails } from "@/helpers/sendVerificationEmail";

export async function POST(request:Request) {
    await dbConnect()

    try {
        const {username, email, password} = await request.json();
        const existingUserVerifiedByUsername = await UserModel.findOne({username, isVerified: true});
        if(existingUserVerifiedByUsername){
            return Response.json({
                success: false,
                message: 'Username already used'
            },{
                status: 500
            })
        }

        const existingUserVerifiedByEmail = await UserModel.findOne({email});
        const verifyCode = Math.floor(100000 + Math.random()*900000).toString()
        if(existingUserVerifiedByEmail){
            if(existingUserVerifiedByEmail.isVerified){
                return Response.json({
                    success: false,
                    message: "User Already Existed with the Email"
                },{
                    status: 400
                })
            }else{
                const hashedPassword = await bcrypt.hash(password, 10)
                existingUserVerifiedByEmail.password = hashedPassword;
                existingUserVerifiedByEmail.verifyCode = verifyCode;
                existingUserVerifiedByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
                await existingUserVerifiedByEmail.save()
            }
        }
        else{
            const hashedPassword = await bcrypt.hash(password, 10)
            const expiryDate = new Date() //! Object
            expiryDate.setHours(expiryDate.getHours() + 1)

            const newUser = await new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            })

            await newUser.save()
        }

        //? Sending Email
        const emailResponse = await sendVerificationEmails(
            email, username, verifyCode
        )

        if(!emailResponse.success){
            return Response.json({
                success: false,
                message: emailResponse.message
            }, {
                status: 201
            })
        }

        return Response.json({
            success: true,
            message: "User Registered Successfully. Please Verify your Email."
        })

    } catch (error) {
        console.log('Error Registering User', error);
        return Response.json({
            success: false,
            message: "Error Registering User"
        },{
            status: 500
        })
    }
}