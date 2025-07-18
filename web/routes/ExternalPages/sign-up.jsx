import GoogleIcon from "../../assets/images/google.svg"; // Update with your image paths
import KaghatiLogo from "../../assets/images/kaghati_logo.jpeg";
import "../../assets/styles/ExternalApp.css";
import { useActionForm } from "@gadgetinc/react"; // Import Gadget hook
import { api } from "../../api"; // Update with your actual API setup
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function SignUp() {
  const {
    register, // Registers form fields
    submit,   // Submit handler
    formState: { errors, isSubmitSuccessful, isSubmitting }, // Tracks form state
  } = useActionForm(api.user.signUp); // This binds to the sign-up action in Gadget
  console.log("register", register)
  const { search } = useLocation();
  const navigate = useNavigate();
  return (
    <div className="sign-in-main" style={{ alignItems: "center", padding: "0 15%" }}>
      <div className="card" style={{ alignItems: "center" }}>
        <div className="logo" style={{ display: "flex" }}>
          <img src={KaghatiLogo} width={40} />
          <span className="bold-text">Kaghati</span>
        </div>
        <form className="custom-form" onSubmit={submit}>
          <h1 style={{ fontSize: "24px", fontWeight: "600", padding: "17px 0px 10px" }}>
            Create account
          </h1>
          
          {/* <Link className="google-oauth-button" to={`/auth/google/start${search}`} style={{ width: "100%" }}>
            <img src={GoogleIcon} width={22} height={22} /> Continue with Google
          </Link> */}

          {/* First Name and Last Name */}
          <div className="inlineElement">
            <input className="custom-input" style={{ padding: "2%" }} placeholder="First Name" {...register("firstName", { required: "First Name is required" })} />
            <input className="custom-input" style={{ padding: "2%" }} placeholder="Last Name" {...register("lastName", { required: "Last Name is required" })} />
          </div>

          {/* Email */}
          <input className="custom-input" style={{ padding: "2%" }} placeholder="Email" {...register("email", { required: "Email is required" })} />
          {errors.email && <p className="error">Email: {errors.email.message}</p>}

          {/* Password */}
          <input className="custom-input" style={{ padding: "2%" }} placeholder="Password" type="password" {...register("password", { required: "Password is required" })} />
          {errors.password && <p className="error">Password: {errors.password.message}</p>}

          {/* Submission errors */}
          {errors.root && <p className="error">{errors.root.message}</p>}

          {/* Submission success message */}
          {isSubmitSuccessful && <p className="success">Please check your inbox to verify your account</p>}

          {/* Sign-up Button */}
          <button disabled={isSubmitting} type="submit" className="sign-in-button" style={{ padding: "2%" }}>
            Sign Up
          </button>

          <div className="sign-up">
            <p>Already have an account? <Link to="/sign-in">Sign In</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
}