import mongoose from "mongoose";

const systemSettingSchema = new mongoose.Schema({
  key: { type: String, default: "global_config", unique: true },
  maintenanceMode: { type: Boolean, default: false },
  taxRate: { type: Number, default: 5.0 },
  starterCredits: { type: Number, default: 500 }
}, { timestamps: true });

const SystemSetting = mongoose.models.SystemSetting || mongoose.model("SystemSetting", systemSettingSchema);
export default SystemSetting;
