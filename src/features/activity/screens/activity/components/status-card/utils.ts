import { split } from "@/features/activity/utils/state";

export const sendingLine = (ids: string) => {
  const n = split(ids).length;
  return `Sending ${n} change${n === 1 ? "" : "s"}`;
};
