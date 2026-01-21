const userModel = require("../models/user-model");
const otpModel = require("../models/otp-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendOTPEmail } = require("../utils/emailService");

/**
 * User login
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });
        if (!user) return res.status(400).json({ message: "Email or password is incorrect" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Email or password is incorrect" });

        // Include isAdmin flag in token for both admin and normal users
        const token = jwt.sign({ 
            email: user.email, 
            userid: user._id, 
            isAdmin: user.isAdmin === true 
        }, process.env.JWT_SECRET);

        // Cookie settings for production (HTTPS) and development
        // Render sets RENDER environment variable
        const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER;
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction, // true for HTTPS in production
            sameSite: isProduction ? "none" : "lax", // "none" needed for cross-origin in production
            maxAge: 7 * 24 * 60 * 60 * 1000,
        };
        res.cookie("token", token, cookieOptions);

        // Return user info in response to avoid needing checkauth immediately
        res.status(200).json({ 
            message: "Login Successfully",
            user: {
                email: user.email,
                name: user.name,
                isAdmin: user.isAdmin === true
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Send OTP for signup
 */
const sendSignupOTP = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Delete any existing OTP for this email and purpose
        await otpModel.deleteMany({ email, purpose: "signup" });

        // Save OTP to database
        await otpModel.create({
            email,
            otp,
            purpose: "signup",
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        });

        // Send OTP email
        const emailResult = await sendOTPEmail(email, otp, "signup");
        if (!emailResult.success) {
            // Delete the OTP record if email failed
            await otpModel.deleteMany({ email, purpose: "signup" });
            return res.status(500).json({ 
                message: emailResult.error || "Failed to send OTP email. Please check your email configuration." 
            });
        }

        res.status(200).json({ message: "OTP sent to your email" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Verify OTP and complete signup
 */
const verifySignupOTP = async (req, res) => {
    try {
        const { name, email, password, otp } = req.body;

        // Validate input
        if (!name || !email || !password || !otp) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Find OTP record
        const otpRecord = await otpModel.findOne({
            email,
            otp,
            purpose: "signup",
            verified: false,
        });

        if (!otpRecord) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // Check if OTP is expired
        if (new Date() > otpRecord.expiresAt) {
            await otpModel.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ message: "OTP has expired" });
        }

        // Mark OTP as verified
        otpRecord.verified = true;
        await otpRecord.save();

        // Check if user already exists (double check)
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password and create user
        bcrypt.genSalt(12, (err, salt) => {
            if (err) return res.status(500).json({ message: "Something went wrong" });

            bcrypt.hash(password, salt, async (err, hash) => {
                if (err) return res.status(500).json({ message: "Something went wrong" });

                const newUser = await userModel.create({ name, email, password: hash });

                const token = jwt.sign({ email: newUser.email, userid: newUser._id }, process.env.JWT_SECRET);

                // Cookie settings for production (HTTPS) and development
                const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER;
                res.cookie("token", token, {
                    httpOnly: true,
                    secure: isProduction, // true for HTTPS in production
                    sameSite: isProduction ? "none" : "lax", // "none" needed for cross-origin in production
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                });

                // Delete used OTP
                await otpModel.deleteOne({ _id: otpRecord._id });

                res.status(200).json({ message: "User registered successfully" });
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Send OTP for forgot password
 */
const sendForgotPasswordOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // Check if user exists
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Delete any existing OTP for this email and purpose
        await otpModel.deleteMany({ email, purpose: "forgot-password" });

        // Save OTP to database
        await otpModel.create({
            email,
            otp,
            purpose: "forgot-password",
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        });

        // Send OTP email
        const emailResult = await sendOTPEmail(email, otp, "forgot-password");
        if (!emailResult.success) {
            // Delete the OTP record if email failed
            await otpModel.deleteMany({ email, purpose: "forgot-password" });
            return res.status(500).json({ 
                message: emailResult.error || "Failed to send OTP email. Please check your email configuration." 
            });
        }

        res.status(200).json({ message: "OTP sent to your email" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Verify OTP for forgot password
 */
const verifyForgotPasswordOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        // Find OTP record
        const otpRecord = await otpModel.findOne({
            email,
            otp,
            purpose: "forgot-password",
            verified: false,
        });

        if (!otpRecord) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // Check if OTP is expired
        if (new Date() > otpRecord.expiresAt) {
            await otpModel.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ message: "OTP has expired" });
        }

        // Mark OTP as verified
        otpRecord.verified = true;
        await otpRecord.save();

        res.status(200).json({ message: "OTP verified successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Reset password after OTP verification
 */
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Find verified OTP record
        const otpRecord = await otpModel.findOne({
            email,
            otp,
            purpose: "forgot-password",
            verified: true,
        });

        if (!otpRecord) {
            return res.status(400).json({ message: "Invalid or expired OTP. Please request a new one." });
        }

        // Check if OTP is expired
        if (new Date() > otpRecord.expiresAt) {
            await otpModel.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        // Find user
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Hash new password
        bcrypt.genSalt(12, (err, salt) => {
            if (err) return res.status(500).json({ message: "Something went wrong" });

            bcrypt.hash(newPassword, salt, async (err, hash) => {
                if (err) return res.status(500).json({ message: "Something went wrong" });

                // Update user password
                user.password = hash;
                await user.save();

                // Delete used OTP
                await otpModel.deleteOne({ _id: otpRecord._id });

                res.status(200).json({ message: "Password reset successfully" });
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * User logout
 */
const logout = (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER;
    res.cookie('token', '', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        expires: new Date(0)
    });
    res.json({ message: 'Logged out successfully' });
};

/**
 * Check authentication status
 */
const checkAuth = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.userid).select("name email mobile isAdmin");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Check if user is admin from token or database
        const isAdmin = req.user.isAdmin === true || user.isAdmin === true;
        res.status(200).json({ 
            message: 'User authenticated', 
            user: { ...req.user, name: user.name, email: user.email, mobile: user.mobile, isAdmin } 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Admin login
 */
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email, isAdmin: true });
        if (!user) return res.status(400).json({ message: "Email or password is incorrect" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Email or password is incorrect" });

        // Include isAdmin flag in JWT token
        const token = jwt.sign({ email: user.email, userid: user._id, isAdmin: true }, process.env.JWT_SECRET);

        // Cookie settings for production (HTTPS) and development
        const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER;
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction, // true for HTTPS in production
            sameSite: isProduction ? "none" : "lax", // "none" needed for cross-origin in production
            maxAge: 7 * 24 * 60 * 60 * 1000,
            domain: isProduction ? undefined : undefined, // Let browser set domain automatically
        });

        res.status(200).json({ message: "Login Successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Admin dashboard check
 */
const adminDashboard = (req, res) => {
    res.json({ message: "Welcome to Admin Dashboard" });
};

/**
 * Admin check auth
 * Note: This is called after isAdmin middleware, so user is already verified as admin
 */
const adminCheckAuth = (req, res) => {
    res.json({ authenticated: true, isAdmin: true });
};

/**
 * Test email configuration
 */
const testEmail = async (req, res) => {
    try {
        const { testEmail } = req.body;
        
        if (!testEmail) {
            return res.status(400).json({ message: "Test email address is required" });
        }

        // Check if email is configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            return res.status(500).json({ 
                message: "Email not configured. Please set EMAIL_USER and EMAIL_PASSWORD in .env file",
                configured: false
            });
        }

        // Diagnostic info (without exposing password)
        const emailUser = process.env.EMAIL_USER.trim();
        const emailPassword = process.env.EMAIL_PASSWORD.trim();
        const diagnostics = {
            emailUser: emailUser,
            emailPasswordLength: emailPassword.length,
            hasSpaces: emailPassword.includes(" "),
            emailService: process.env.EMAIL_SERVICE || "gmail",
            isValidFormat: emailPassword.length === 16 && !emailPassword.includes(" ")
        };

        // Send test email
        const testOTP = "123456";
        const emailResult = await sendOTPEmail(testEmail, testOTP, "signup");
        
        if (emailResult.success) {
            res.status(200).json({ 
                message: "Test email sent successfully! Check your inbox.",
                configured: true,
                diagnostics: diagnostics
            });
        } else {
            res.status(500).json({ 
                message: emailResult.error || "Failed to send test email",
                configured: true,
                error: emailResult.error,
                diagnostics: diagnostics
            });
        }
    } catch (err) {
        console.error("Test email error:", err);
        res.status(500).json({ 
            message: "Error testing email configuration",
            error: err.message
        });
    }
};

/**
 * Check email configuration (diagnostic endpoint)
 */
const checkEmailConfig = (req, res) => {
    try {
        const emailUser = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : null;
        const emailPassword = process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.trim() : null;
        
        const config = {
            configured: !!(emailUser && emailPassword),
            emailUser: emailUser || "NOT SET",
            emailPasswordLength: emailPassword ? emailPassword.length : 0,
            hasSpaces: emailPassword ? emailPassword.includes(" ") : false,
            emailService: process.env.EMAIL_SERVICE || "gmail",
            isValidFormat: emailPassword ? (emailPassword.length === 16 && !emailPassword.includes(" ")) : false,
            issues: []
        };

        if (!emailUser) {
            config.issues.push("EMAIL_USER is not set in .env file");
        }
        if (!emailPassword) {
            config.issues.push("EMAIL_PASSWORD is not set in .env file");
        }
        if (emailPassword && emailPassword.includes(" ")) {
            config.issues.push("EMAIL_PASSWORD contains spaces. App Passwords should have NO spaces.");
        }
        if (emailPassword && emailPassword.length !== 16) {
            config.issues.push(`EMAIL_PASSWORD should be exactly 16 characters. Current length: ${emailPassword.length}`);
        }

        res.status(200).json(config);
    } catch (err) {
        res.status(500).json({ 
            message: "Error checking email configuration",
            error: err.message
        });
    }
};

/**
 * Get user profile
 */
const getProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.userid).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
    try {
        const { name, mobile, homeAddress, workAddress } = req.body;
        const userId = req.user.userid;

        const updateData = {};
        if (name) updateData.name = name;
        if (mobile !== undefined) updateData.mobile = mobile;
        if (homeAddress) updateData.homeAddress = homeAddress;
        if (workAddress) updateData.workAddress = workAddress;

        const user = await userModel.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Profile updated successfully", user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    login,
    sendSignupOTP,
    verifySignupOTP,
    logout,
    checkAuth,
    sendForgotPasswordOTP,
    verifyForgotPasswordOTP,
    resetPassword,
    adminLogin,
    adminDashboard,
    adminCheckAuth,
    testEmail,
    checkEmailConfig,
    getProfile,
    updateProfile
};

