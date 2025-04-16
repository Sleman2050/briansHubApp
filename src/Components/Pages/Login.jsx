import React, { useState, useContext, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
} from "@material-tailwind/react";
import { Input } from "@material-tailwind/react";
import { Button } from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import ClipLoader from "react-spinners/ClipLoader";
import { AuthContext } from "../AppContext/AppContext";
import { auth, onAuthStateChanged, db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { FaGoogle } from "react-icons/fa";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState("student"); // Default to student
  const { signInWithGoogle, loginWithEmailAndPassword } =
    useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user role from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();

        // Navigate based on role
        if (userData?.role === "advisor") {
          navigate("/home");
        } else if (userData?.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/home");
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    });
  }, [navigate]);

  const initialValues = { email: "", password: "" };

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email address").required("Required"),
    password: Yup.string()
      .required("Required")
      .min(6, "Must be at least 6 characters long"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const { email, password } = formik.values;
    if (formik.isValid === true) {
      loginWithEmailAndPassword(email, password);
      setLoading(true);
    } else {
      setLoading(false);
      alert("Check your input fields");
    }
  };

  const formik = useFormik({ initialValues, validationSchema, handleSubmit });

  return (
    <>
      {loading ? (
        <div className="grid grid-cols-1 justify-items-center items-center h-screen">
          <ClipLoader color="#367fd6" size={150} speedMultiplier={0.5} />
        </div>
      ) : (
        <div className="grid grid-cols-1 h-screen justify-items-center items-center">
          <Card className="w-96">
            <CardHeader
              variant="gradient"
              color="teal"
              className="mb-4 grid h-28 place-items-center"
            >
              <Typography variant="h3" color="white">
                LOGIN
              </Typography>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-2">
                  <Input
                    name="email"
                    type="email"
                    label="Email"
                    size="lg"
                     className="input-teal-focus"
                    {...formik.getFieldProps("email")}
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <Typography variant="large" color="black">
                    {formik.errors.email+"!"}
                  </Typography>
                )}

                <div className="mt-4 mb-2">
                  <Input
                    name="password"
                    type="password"
                    label="Password"
                    size="lg"
                    className="input-teal-focus"
                    {...formik.getFieldProps("password")}
                  />
                  {formik.touched.password && formik.errors.password && (
                    <Typography variant="large" color="black">
                      {formik.errors.password+"!"}
                    </Typography>
                  )}
                </div>

                {/* User Type Selection */}
                <div className="mt-4 mb-2">
                  <label className="text-sm font-semibold">Login As:</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded mt-2"
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                  >
                    <option value="student">Student</option>
                    <option value="advisor">Advisor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <Button variant="gradient" fullWidth className="mb-4" type="submit" color="teal">
                  Login as {userType}
                </Button>
              </form>
            </CardBody>

            <CardFooter className="pt-0">
            <Button
      variant="gradient"
      fullWidth
      className="mb-4 flex items-center justify-center"
      color="teal"
      onClick={signInWithGoogle}
    >
      <FaGoogle className="text-white text-lg mr-2" />
      Sign In with Google
    </Button>
              {/* <Link to="/reset">
                <p className="ml-1 font-bold text-sm text-blue-500 text-center ">
                  Reset Password
                </p>
              </Link> */}
             <div className="mt-6 flex items-center justify-center text-gray-500">
      <p className="text-base">
        Don't have an account?
        <Link to="/register"  className="ml-1 font-bold text-teal-600 hover:underline">
          Register
        </Link>
      </p>
    </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
};

export default Login;
