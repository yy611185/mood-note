import { getAppSetting, setAppSetting } from "@/db/settingsRepository";

const enabledValue = "enabled";
const disabledValue = "disabled";

export async function isAiSummaryEnabled(): Promise<boolean> {
  const value = await getAppSetting("ai_summary_enabled");
  return value !== disabledValue;
}

export async function setAiSummaryEnabled(enabled: boolean): Promise<void> {
  await setAppSetting("ai_summary_enabled", enabled ? enabledValue : disabledValue);
}
