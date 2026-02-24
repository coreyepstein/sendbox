import { Resend } from "resend";
import { getResendApiKey } from "./config.js";

let _client: Resend | null = null;

/** Get the Resend client singleton. */
export function getResend(): Resend {
  if (!_client) {
    _client = new Resend(getResendApiKey());
  }
  return _client;
}
