/**
 * ChangePassword Component
 * 
 * This functional component allows users to change their password within the application.
 * It utilizes the `useUser` and `useActionForm` hooks from `@gadgetinc/react` to manage the user state and handle form submission.
 * 
 * Features:
 * - **Form Submission:** Handles password change form submission using the `useActionForm` hook.
 * - **Validation:** Displays error messages for invalid password entries and submission errors.
 * - **Success Message:** Upon successful submission, a confirmation message is shown with a link back to the profile page.
 * 
 * Hooks:
 * - `useUser`: Fetches the current user data.
 * - `useActionForm`: Manages form state and handles submission for the password change action.
 * 
 * Render:
 * - Renders a form with input fields for the current and new passwords.
 * - Displays error messages if any validation or submission errors occur.
 * - Shows a success message after a successful password change.
 * 
 * Usage:
 * - This component is used within a user profile section where users can update their password.
 * 
 * Dependencies:
 * - `@gadgetinc/react`: Used for managing user state and handling form submissions.
 * - `react-router-dom`: Used for navigation within the app.
 */

import { useUser, useActionForm } from "@gadgetinc/react";
import { api } from "../../api";
import { Link } from "react-router-dom";

export default function () {
  const user = useUser(api);
  const {
    submit,
    register,
    formState: { errors, isSubmitSuccessful, isSubmitting },
  } = useActionForm(api.user.changePassword, { defaultValues: user });

  return isSubmitSuccessful ? (
    <p className="format-message success">
      Password changed successfully. <Link to="/signed-in">Back to profile</Link>
    </p>
  ) : (
    <form className="custom-form" onSubmit={submit}>
      <h1 className="form-title">Change password</h1>
      <input className="custom-input" type="password" placeholder="Current password" {...register("currentPassword")} />
      <input className="custom-input" type="password" placeholder="New password" {...register("newPassword")} />
      {errors?.user?.password?.message && <p className="format-message error">Password: {errors.user.password.message}</p>}
      {errors?.root?.message && <p className="format-message error">{errors.root.message}</p>}
      <Link to="/signed-in">Back to profile</Link>
      <button disabled={isSubmitting} type="submit">
        Change password
      </button>
    </form>
  );
}