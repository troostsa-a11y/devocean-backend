/** Safe diagnostics: never pass raw provider messages, URLs or credentials to chat. */
export function voiceFailure(error: unknown, stage: "microphone" | "audio" | "service"): string {
  const name = error instanceof Error ? error.name : "";
  if (stage === "microphone") {
    if (name === "NotAllowedError" || name === "SecurityError")
      return "[microphone_permission] Microphone access was not allowed. Enable microphone access in your browser's site settings, then try Voice again. You can also continue here in text.";
    if (name === "NotFoundError")
      return "[microphone_missing] No microphone was found. Connect or enable a microphone, or continue here in text.";
    if (name === "NotReadableError")
      return "[microphone_busy] The microphone could not be opened. Close other apps using it and try Voice again, or continue here in text.";
    return "[microphone_unavailable] This browser could not access the microphone. Try opening the site in Safari or Chrome, or continue here in text.";
  }
  if (stage === "audio")
    return "[audio_initialization] Voice audio could not start in this browser. Try opening the site directly in Safari or Chrome, or continue here in text.";
  return "[voice_service_error] The voice service reported an error. Please try Voice again shortly, or continue here in text.";
}