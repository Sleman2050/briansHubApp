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
import { auth, onAuthStateChanged } from "../firebase/firebase";

const Regsiter = () => {
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState("student"); // Default role
  const { registerWithEmailAndPassword } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/");
        setLoading(false);
      } else {
        setLoading(false);
      }
    });
  }, [navigate]);

  const initialValues = { name: "", email: "", password: "" };

  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Required")
      .min(4, "Must be at least 4 characters long"),
    email: Yup.string().email("Invalid email address").required("Required"),
    password: Yup.string()
      .required("Required")
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
        <div className="grid grid-cols-1 justify-items-center items-center h-screen">
          <ClipLoader color="#367fd6" size={150} speedMultiplier={0.5} />
        </div>
      ) : (
        <div className="grid grid-cols-1 justify-items-center items-center h-screen">
          <Card className="w-96">
            <CardHeader
              variant="gradient"
              color="blue"
              className="mb-4 grid h-28 place-items-center"
            >
              <Typography variant="h3" color="white">
                REGISTER
              </Typography>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              <form onSubmit={handleRegister}>
                <Input
                  name="name"
                  type="text"
                  label="Name"
                  size="lg"
                  {...formik.getFieldProps("name")}
                  className="mb-2"
                />
                {formik.touched.name && formik.errors.name && (
                  <Typography variant="small" color="red">
                    {formik.errors.name}
                  </Typography>
                )}

                <Input
                  name="email"
                  type="email"
                  label="Email"
                  size="lg"
                  {...formik.getFieldProps("email")}
                  className="mt-4"
                />
                {formik.touched.email && formik.errors.email && (
                  <Typography variant="small" color="red">
                    {formik.errors.email}
                  </Typography>
                )}

                <Input
                  name="password"
                  type="password"
                  label="Password"
                  size="lg"
                  {...formik.getFieldProps("password")}
                  className="mt-4"
                />
                {formik.touched.password && formik.errors.password && (
                  <Typography variant="small" color="red">
                    {formik.errors.password}
                  </Typography>
                )}

                {/* User Type Selection */}
                <div className="mt-4 mb-2">
                  <label className="text-sm font-semibold">Register As:</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded mt-2"
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                  >
                    <option value="student">Student</option>
                    <option value="advisor">Advisor</option>
                  </select>
                </div>

                <Button variant="gradient" fullWidth type="submit" className="mt-4">
                  Register as {userType}
                </Button>
              </form>
            </CardBody>

            <CardFooter className="pt-0">
              <div className="mt-6 flex justify-center">
                Already have an account?
                <Link to="/login">
                  <p className="ml-1 font-bold text-blue-500 text-center">
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
