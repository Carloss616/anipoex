/** The warning before a sign-out that drops `count` changes not yet sent. */
export const signOutDialog = (count: number) => ({
  title: `Sign out with ${count} unsent change${count === 1 ? "" : "s"}?`,
  description:
    "They're kept on this device for this account and are lost when you sign out.",
  confirmLabel: "Sign out",
  role: "destructive" as const,
});
