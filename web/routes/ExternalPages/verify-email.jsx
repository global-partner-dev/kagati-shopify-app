/**
 * Email Verification Component
 * 
 * This React functional component handles email verification for users.
 * It extracts a verification code from the URL parameters, then attempts to verify the email address associated with that code.
 * 
 * Hooks:
 * - `useLocation`: React Router hook used to access the current URL's location object and query parameters.
 * - `useAction`: Gadget hook to trigger the email verification action on the backend (`api.user.verifyEmail`).
 * - `useAuth`: Gadget hook to access the authentication configuration, such as the sign-in path.
 * - `useEffect`: React hook used to trigger the email verification process when the component mounts.
 * - `useRef`: React hook used to track if the verification attempt has already been made to prevent duplicate requests.
 * 
 * Features:
 * - **Automatic Email Verification:**
 *   - On component mount, it checks for a `code` query parameter in the URL and attempts to verify the user's email.
 *   - Ensures that the verification process is only attempted once using `useRef`.
 * - **Error Handling:**
 *   - If an error occurs during the verification process, it is displayed to the user.
 * - **Success Handling:**
 *   - If the verification is successful, a success message is displayed along with a link to the sign-in page.
 * 
 * Conditional Rendering:
 * - Displays an error message if the verification fails.
 * - Displays a success message if the verification succeeds.
 * - Renders nothing if the verification is still in progress.
 * 
 * Dependencies:
 * - React Router for accessing URL parameters and navigation.
 * - Gadget hooks for triggering the verification action and accessing authentication configuration.
 * 
 * Usage:
 * - This component is used in the email verification flow of the application.
 * - It is typically rendered when the user clicks on an email verification link, which directs them to this page with a verification code in the URL.
 */

import { api } from "../../api";
import { useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAction, useAuth } from "@gadgetinc/react";

export default function () {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const code = params.get("code");
  const [{ error: verifyEmailError, data }, verifyEmail] = useAction(api.user.verifyEmail);
  const verificationAttempted = useRef(false);
  const { configuration } = useAuth();

  useEffect(() => {
    if (!verificationAttempted.current) {
      code && verifyEmail({ code });
      verificationAttempted.current = true;
    }
  }, []);

  if (verifyEmailError) {
    return <p className="format-message error">{verifyEmailError.message}</p>;
  }

  return data ? (
    <p className="format-message success">
      Email has been verified successfully. <Link to={configuration.signInPath}>Sign in now</Link>
    </p>
  ) : null;
}
