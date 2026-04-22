export function extractErrorMessage(error: unknown) {
  if (!error) {
    return "Something went wrong.";
  }

  if (typeof error === "string") {
    return sanitizeMessage(error);
  }

  if (error instanceof Error) {
    const errorWithDetails = error as Error & {
      shortMessage?: string;
      reason?: string;
      info?: { error?: { message?: string } };
      data?: { message?: string };
    };

    return sanitizeMessage(
      errorWithDetails.shortMessage ??
        errorWithDetails.reason ??
        errorWithDetails.info?.error?.message ??
        errorWithDetails.data?.message ??
        error.message
    );
  }

  return "Something went wrong.";
}

function sanitizeMessage(message: string) {
  return message
    .replace(/^execution reverted:?\s*/i, "")
    .replace(/^Error:\s*/i, "")
    .trim();
}
