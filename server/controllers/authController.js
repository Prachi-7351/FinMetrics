import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const {
      fullName, email, password, companyName,
      companyType, role, revenueRange, country,
    } = req.body;

    if (!fullName || !email || !password)
      return res.status(400).json({ error: "Full name, email and password are required." });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: "Email already registered." });

    const user = await User.create({
      fullName, email, password,
      companyName: companyName || "",
      companyType: companyType || "",
      role: role || "Member",
      revenueRange: revenueRange || "",
      country: country || "",
      onboardingComplete: false,
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: user.toPublic(),
    });
  } catch (err) {
    console.error("[register]", err);
    res.status(500).json({ error: "Registration failed." });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required." });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ error: "Invalid email or password." });

    res.json({
      token: generateToken(user._id),
      user: user.toPublic(),
    });
  } catch (err) {
    console.error("[login]", err);
    res.status(500).json({ error: "Login failed." });
  }
};

// GET /api/auth/me  (protected)
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch user." });
  }
};

// PUT /api/auth/me  (protected) — update profile
export const updateMe = async (req, res) => {
  try {
    const allowed = ["fullName", "email", "phone", "role", "companyName",
                     "companyType", "revenueRange", "country", "avatar", "avatarKey", "onboardingComplete"];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ user });
  } catch (err) {
    console.error("[updateMe]", err);
    res.status(500).json({ error: "Profile update failed." });
  }
};

// PUT /api/auth/password  (protected) — change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    const match = await user.matchPassword(currentPassword);
    if (!match) return res.status(401).json({ error: "Current password is incorrect." });

    user.password = newPassword;
    await user.save(); // triggers pre-save hash
    res.json({ message: "Password updated successfully." });
  } catch (err) {
    res.status(500).json({ error: "Password change failed." });
  }
};
