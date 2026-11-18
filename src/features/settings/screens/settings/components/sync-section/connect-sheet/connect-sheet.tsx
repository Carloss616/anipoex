import { useValue } from "@legendapp/state/react";
import { Typography } from "panelui-native/components/typography";
import { Button } from "panelui-web/button";
import { Field } from "panelui-web/field";
import { Input } from "panelui-web/input";
import { Sheet } from "panelui-web/sheet";
import { useState } from "react";
import { View } from "react-native";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import {
  closeConnect,
  connect$,
  connectWithToken,
  copyCodeAndOpenGitHub,
} from "@/features/sync/state/connect-sheet";
import { canUseDeviceFlow } from "@/features/sync/state/connection";
import { openExternal } from "@/utils/open-external";

const NEW_TOKEN_URL =
  "https://github.com/settings/tokens/new?scopes=gist&description=Anipoex%20sync";

/** Desktop: the code to type on GitHub, which connects by itself. */
function CodeStep() {
  const code = useValue(connect$.code);
  const error = useValue(connect$.error);

  return (
    <View className="gap-4">
      <Typography type="body-sm" muted>
        Enter this code on GitHub. It connects here by itself.
      </Typography>
      <View className="bg-primary/10 items-center rounded-2xl p-4">
        <Typography type="h3" className="font-mono tracking-widest">
          {code?.userCode ?? "····-····"}
        </Typography>
      </View>
      <Button disabled={!code} onClick={copyCodeAndOpenGitHub}>
        Copy code and open GitHub
      </Button>
      <Typography
        type="body-sm"
        className={error ? "text-destructive text-center" : "text-center"}
        muted={!error}
      >
        {error ?? "Waiting for GitHub…"}
      </Typography>
    </View>
  );
}

/** A browser: GitHub's code sign-in can't be reached, so a pasted token. */
function TokenStep() {
  const [token, setToken] = useState("");
  const busy = useValue(connect$.busy);
  const error = useValue(connect$.error);

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (token.trim()) void connectWithToken(token);
      }}
    >
      <Typography type="body-sm" muted>
        Paste a GitHub token with the gist scope. It stays in this browser.
      </Typography>
      <Field invalid={!!error}>
        <Input
          type="password"
          placeholder="ghp_…"
          aria-label="GitHub token"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        <Field.Error match={!!error}>{error}</Field.Error>
      </Field>
      <Button
        type="button"
        variant="link"
        className="self-start px-0"
        onClick={() => openExternal(NEW_TOKEN_URL)}
      >
        Create a token on GitHub
      </Button>
      <Button type="submit" disabled={busy || !token.trim()}>
        {busy ? "Connecting…" : "Connect"}
      </Button>
    </form>
  );
}

/** Connecting GitHub: the code in the desktop app, a token in a browser. */
export function ConnectSheet() {
  const open = useValue(connect$.open);

  return (
    <BottomSheet isPresented={open} onDismiss={closeConnect}>
      <Sheet.Header title="Connect GitHub" className="p-4" />
      <Sheet.Body className="px-4 pb-4">
        {canUseDeviceFlow ? <CodeStep /> : <TokenStep />}
      </Sheet.Body>
    </BottomSheet>
  );
}
