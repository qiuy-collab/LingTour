"use client";

type GoogleCredentialResponse = {
  credential?: string;
  error?: string;
};

type GooglePromptMomentNotification = {
  isNotDisplayed(): boolean;
  isSkippedMoment(): boolean;
};

type GoogleIdentityApi = {
  initialize(config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }): void;
  prompt(
    listener: (notification: GooglePromptMomentNotification) => void,
  ): void;
};

type GoogleWindow = Window & {
  google?: {
    accounts?: {
      id?: GoogleIdentityApi;
    };
  };
};

export function getGoogleIdentityApi(): GoogleIdentityApi | null {
  if (typeof window === "undefined") return null;
  return ((window as GoogleWindow).google?.accounts?.id ?? null) as GoogleIdentityApi | null;
}

export async function requestGoogleCredential(
  clientId: string,
): Promise<string> {
  const googleIdentity = getGoogleIdentityApi();

  if (!googleIdentity) {
    throw new Error("Google Sign-In script not loaded.");
  }

  return new Promise<string>((resolve, reject) => {
    googleIdentity.initialize({
      client_id: clientId,
      callback: (response) => {
        if (response.credential) {
          resolve(response.credential);
          return;
        }

        reject(new Error(response.error || "Google sign-in cancelled"));
      },
    });

    googleIdentity.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        reject(new Error("Google sign-in popup was blocked or dismissed"));
      }
    });
  });
}
