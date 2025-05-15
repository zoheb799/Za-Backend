import User from "../models/user.models.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandle.js";
import { errorHandler } from "../utils/errorHandle.js";

export const registerUser = asyncHandler(async (req, res) => {
    try {
        const { email, password, role, fullName} = req.body;

        if (!email || !password || !role || !fullName) {
            throw new errorHandler(400, "Required fields are missing");
        }

        const existedUser = await User.findOne({ email }).select("-password");
        if (existedUser) throw new errorHandler(409, "User already exists");


        const user = await User.create({
            email,
            password,
            role,
            fullName
        });

        res.status(201).json(
            new apiResponse(
                201,
                { id: user._id, email, role,fullName },
                "Registered successfully"
            )
        );
    } catch (err) {
        throw new errorHandler(500, err.message);
    }
});


export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) throw new errorHandler(400, "Credential required!");

        const user = await User.findOne({ email });

        if (!user) throw new errorHandler(401, "Invalid Credential");

        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) throw new errorHandler(401, "Invalid Credential");

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // ✅ Assign tokens to the same user object
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
        await user.save(); // This updates the in-memory user object as well

        const { password: pass, ...rest } = user._doc;

        res.cookie("accessToken", accessToken, {
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            httpOnly: true,
            sameSite: "None",            // ✅ Allow cross-origin cookies
            secure: true,                // ✅ Required for SameSite=None
          })
          .cookie("refreshToken", refreshToken, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "None",            // ✅
            secure: true,                // ✅
          })
          .status(200)
          .json(new apiResponse(200, rest, "Login successful"));
    } catch (error) {
        console.log(error.message);
        throw new errorHandler(500, error.message);
    }
});

// User logout (removes tokens)
export const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

    const options = { httpOnly: true, sameSite: "None", secure: true };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new apiResponse(200, {}, "User logged out successfully"));
});

// Update User profile (for both Buyers and Sellers)
export const profileUpdate = asyncHandler(async (req, res) => {
    const { fullName, profilePic } = req.body;
  
    if (!fullName) {
      throw new errorHandler(400, "Full name is required");
    }
  
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        fullName,
        avatar: profilePic,
      },
      { new: true }
    );
  
    res.status(200).json(new apiResponse(200, updatedUser, "Profile updated successfully"));
  });
  
// Fetch User profile (for both Buyers and Sellers)
export const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) throw new errorHandler(404, "User not found");

    res.status(200).json(new apiResponse(200, user, "User profile fetched successfully"));
});
