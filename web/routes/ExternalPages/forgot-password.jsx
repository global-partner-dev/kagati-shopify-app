/**
 * ForgotPassword Component
 * 
 * This functional component renders a form that allows users to request a password reset email.
 * It uses the Gadget API to send a "Forgot Password" email to the user-provided email address.
 * 
 * Features:
 * - **Forgot Password Request:** Enables users to request a password reset by entering their email address.
 * - **Form Handling:** Utilizes the `useActionForm` hook from Gadget to manage form submission and state.
 * - **Success Message:** Displays a success message if the "Forgot Password" email is sent successfully.
 * - **Loading State:** Disables the submit button and indicates loading while the request is being processed.
 * 
 * Hooks:
 * - `useActionForm`: Gadget hook used to manage form submission and state. It handles the submission of the form and tracks the submission state.
 * 
 * API Integration:
 * - **Gadget API:** Integrates with the `api.user.sendResetPassword` action from the Gadget API to send the "Forgot Password" email.
 * 
 * Render:
 * - Renders a form with an input field for the user's email and a submit button.
 * - Displays a success message upon successful form submission.
 * - The form is disabled while the submission is in progress to prevent multiple submissions.
 * 
 * Usage:
 * - This component is typically used in a user authentication flow where users can request a "Forgot Password" email if they forget their password.
 * - It can be linked from a "Forgot Password?" link on a login page.
 * 
 * Example Usage:
 * - `ForgotPassword` can be rendered within a route like `/forgot-password` to provide users with an option to reset their password.
 * 
 * Notes:
 * - Ensure the Gadget API endpoint `api.user.sendResetPassword` is correctly set up to handle the "Forgot Password" requests.
 * - Customize the styles for `.format-message`, `.custom-form`, `.form-title`, `.custom-input`, and the submit button to match the app's design.
 */

import { useActionForm } from "@gadgetinc/react";
import { api } from "../../api";

export default function () {
  const {
    submit,
    register,
    formState: { isSubmitSuccessful, isSubmitting },
  } = useActionForm(api.user.sendResetPassword);

  return isSubmitSuccessful ? (
    <p className="format-message success">Email has been sent. Please check your inbox.</p>
  ) : (
    <form className="custom-form" onSubmit={submit}>
      <h1 className="form-title">Reset password</h1>
      <input className="custom-input" placeholder="Email" {...register("email")} />
      <button disabled={isSubmitting} type="submit">
        Send reset link
      </button>
    </form>
  );
}