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
// In your main file (e.g., index.js or App.js)
import "../../index.css";

const Regsiter = () => {
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState("student"); // Default role
  const { registerWithEmailAndPassword } = useContext(AuthContext);
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

  const initialValues = { name: "", email: "", password: "" };

  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Name is required")
      .min(4, "Must be at least 4 characters long"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Must be at least 6 characters long"),
  });

  const handleRegister = (e) => {
    e.preventDefault();
    const { name, email, password } = formik.values;
    if (formik.isValid === true) {
      registerWithEmailAndPassword(name, email, password, userType);
      setLoading(true);
    } else {
      setLoading(false);
      alert("Check your input fields");
    }
  };

  const formik = useFormik({ initialValues, validationSchema, handleRegister });

  return (
    <>
      {loading ? (
        <div className="grid grid-cols-1 justify-items-center items-center min-h-screen bg-gray-50">
          <ClipLoader color="#367fd6" size={150} speedMultiplier={0.5} />
        </div>
      ) : (
        <div className="grid grid-cols-1 justify-items-center items-center min-h-screen bg-gray-50">
          <Card className="w-96 shadow-xl rounded-lg">
            <CardHeader
              variant="gradient"
              color="teal"
              className="mb-4 grid h-24 place-items-center rounded-t-lg"
            >
              <Typography variant="h4" color="white" className="tracking-wider uppercase">
                Register
              </Typography>
            </CardHeader>
            <CardBody className="flex flex-col gap-4 px-8 py-6">
              <form onSubmit={handleRegister}>
                {/* Name Field */}
                <div className="mb-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Name 
                  </label>
                  <Input
                  name="name"
                  type="text"
                  size="lg"
                  placeholder="Enter your full name"
                  // Remove the following Tailwind focus classes so only the custom class applies:
                  // className="focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 input-teal-focus"
                  // Instead, only use the custom class:
                  className="input-teal-focus"
                    {...formik.getFieldProps("name")}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <Typography variant="small" color="black" className="mt-1">
                      {formik.errors.name+" !"}
                    </Typography>
                  )}
                </div>

                {/* Email Field */}
                <div className="mb-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email 
                  </label>
                  <Input
                    name="email"
                    type="email"
                    size="lg"
                    placeholder="Enter your email"
                     className="input-teal-focus"
                    {...formik.getFieldProps("email")}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <Typography variant="small" color="black" className="mt-1">
                      {formik.errors.email+" !"}
                    </Typography>
                  )}
                </div>

                {/* Password Field */}
                <div className="mb-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Password 
                  </label>
                  <Input
                    name="password"
                    type="password"
                    size="lg"
                    placeholder="Enter a strong password"
                    className="input-teal-focus"
 {...formik.getFieldProps("password")}
                  />
                  {formik.touched.password && formik.errors.password && (
                    <Typography variant="small" color="black" className="mt-1">
                      {formik.errors.password+" !"}
                    </Typography>
                  )}
                </div>

                {/* User Type Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1 ">
                    Register As:
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-400 focus:outline-none "
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                  >
                    <option value="student">Student</option>
                    <option value="advisor">Advisor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <Button
                  variant="gradient"
                  fullWidth
                  type="submit"
                  className="mt-2 bg-teal-600 hover:bg-teal-700 focus:bg-teal-700 shadow-md shadow-teal-300"
                  color="teal"
                >
                  Register as {userType}
                </Button>
              </form>
            </CardBody>
            <CardFooter className="pt-0 pb-6 flex flex-col items-center">
              <div className="mt-2 flex items-center justify-center">
                <Typography variant="small" className="text-gray-700">
                  Already have an account?
                </Typography>
                <Link to="/login">
                  <p className="ml-1 font-bold text-teal-600 hover:underline">
                    Login
                  </p>
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
};

export default Regsiter;
