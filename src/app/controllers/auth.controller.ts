import { Request, Response } from "express";
import User from "../../models/user.model"; // Adjust the path to your User model
import transporter from "../../config/nodemailer";
import jwt from "jsonwebtoken";
import { generateOTP } from "../../utils/otp";
import { loadEmailTemplate } from "../../utils/templet";
import path from "path";




import mongoose, { Schema, Document } from "mongoose";

import bcrypt from "bcrypt";

export const createProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
console.log(name,email,password)
    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    user = await User.create({
      name,
      email,
      password: hashedPassword,
      active: true, // Assuming the user is active upon creation
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create user" });
  }
};
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email }, // Payload
      "deen shah here", // Secret key
      { expiresIn: "7d" } // Token expiration time
    );

    // Send the token in the response
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to login" });
  }
};
// Send OTP to user's email
export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  const { email } = req?.body;

  try {
    // Find the user by email
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email });
    }
    // Generate OTP
    console.log("rech")
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 2 * 60 * 1000); // OTP expires in 2 minutes
    const emailTemplatePath = path.join(
      process.cwd(),
      "src",
      "templates",
      "otpTemplate.html"
    );
    const time = ` Request at ${new Date().toLocaleString()}`;

    // Replace placeholders with actual values
    const emailHTML = loadEmailTemplate(emailTemplatePath, {
      otp,
    });

    // Save OTP and expiration time in the user model

    if (user) {
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    }

    // Send OTP via email
    let from = `OTP  <${"Vastra Dashboard"}>`;
    const mailOptions = {
      from,
      to: email,
      subject: "Your OTP for Verification",
      html: emailHTML,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ message: "OTP sent successfully. Check your email." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(403).json({ message: "User not found" });
      return;
    }
    if (user) {
      if (
        user.otp === otp &&
        user?.otpExpires &&
        user.otpExpires > new Date()
      ) {
        // Clear OTP and expiration time after successful verification
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
          { userId: user._id, email: user.email }, // Payload
          "deen shah here", // Secret key
          { expiresIn: "7d" } // Token expiration time
        );

        // Send the token in the response
        res.status(200).json({ message: "OTP verified successfully", token });
      } else {
        res.status(400).json({ message: "Invalid or expired OTP" });
      }
    }
    // Check if OTP matches and is not expired
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};


export const verifyOTPCreateUser = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(403).json({ message: "User not found" });
      return;
    }
    if (user) {
      if (
        user.otp === otp &&
        user?.otpExpires &&
        user.otpExpires > new Date()
      ) {
        // Clear OTP and expiration time after successful verification
        user.otp = undefined;
        user.otpExpires = undefined;
        user.active = true;
        await user.save();

        // Send the token in the response
        res.status(200).json({ message: "User Registered  successfully" });
      } else {
        res.status(400).json({ message: "Invalid or expired OTP" });
      }
    }
    // Check if OTP matches and is not expired
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};

export const getAllUser = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).lean();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get user Data." });
  }
};
