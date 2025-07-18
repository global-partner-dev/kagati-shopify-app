/**
 * ResetPassword Component
 * 
 * This component handles the password reset process within the application. It utilizes 
 * the `useActionForm` hook from the `@gadgetinc/react` library to manage form submission
 * and validation. The component is designed to work within the context of a Gadget API 
 * and assumes that a reset password code is passed as a query parameter in the URL.
 * 
 * Hooks:
 * - `useLocation`: React Router hook used to access the location object and extract query parameters.
 * - `useActionForm`: Hook provided by Gadget to manage form state and handle API actions.
 * - `useAuth`: Provides authentication configuration, specifically the sign-in path in this case.
 * 
 * Form Fields:
 * - New Password: Input for the new password.
 * - Confirm Password: Input for confirming the new password. Validation ensures it matches the new password.
 * 
 * Features:
 * - **Form Submission:** Submits the form data to the `resetPassword` API action.
 * - **Validation:** Includes client-side validation to ensure passwords match.
 * - **Success/Error Messaging:** Displays appropriate messages based on the success or failure of the form submission.
 * 
 * Usage:
 * - This component is intended to be used on a page dedicated to password reset, typically accessed via an email link.
 * - After a successful password reset, users are prompted to sign in.
 * 
 * Example:
 * - This component is rendered when the user navigates to a route like `/reset-password?code=someResetCode`.
 */

import { useActionForm, useAuth } from "@gadgetinc/react";
import { api } from "../../api";
import { useLocation, Link } from "react-router-dom";

export default function () {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const {
    submit,
    register,
    watch,
    formState: { errors, isSubmitSuccessful, isSubmitting },
  } = useActionForm(api.user.resetPassword, {
    defaultValues: { code: params.get("code") },
  });
  const { configuration } = useAuth();

  return isSubmitSuccessful ? (
    <p className="format-message success">
      Password reset successfully. <Link to={configuration.signInPath}>Sign in now</Link>
    </p>
  ) : (
    <form className="custom-form" onSubmit={submit}>
      <h1 className="form-title">Reset password</h1>
      <input className="custom-input" placeholder="New password" type="password" {...register("password")} />
      {errors?.user?.password?.message && <p className="format-message error">{errors?.user?.password?.message}</p>}
      <input
        className="custom-input"
        placeholder="Confirm password"
        type="password"
        {...register("confirmPassword", {
          validate: (value) => value === watch("password") || "The passwords do not match",
        })}
      />
      {errors?.confirmPassword?.message && <p className="format-message error">{errors.confirmPassword.message}</p>}
      {errors?.root?.message && <p className="format-message error">{errors.root.message}</p>}
      <button disabled={isSubmitting} type="submit">
        Reset password
      </button>
    </form>
  );
}
