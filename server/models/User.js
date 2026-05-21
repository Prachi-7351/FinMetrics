import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    companyName: { type: String, trim: true, default: "" },
    companyType: { type: String, default: "" },
    role: { type: String, default: "Member" },
    revenueRange: { type: String, default: "" },
    country: { type: String, default: "" },
    phone: { type: String, default: "" },
    avatar: { type: String, default: "" },
    avatarKey: { type: String, default: "" },
    onboardingComplete: { type: Boolean, default: false },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Hash password before saving
// Use async without next — Mongoose 8+ resolves the returned promise automatically
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare plain password with hashed
userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

// Never return password
userSchema.methods.toPublic = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model("User", userSchema);
