import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import axios from "axios";

function Login() {
  // const user = useState(state => state?.auth?.user);

  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(() => {
    return JSON.parse(localStorage.getItem("isSignup")) || false;
  });
  const [next, setNext] = useState(false);
  const [timer, setTimer] = useState(0);
  const [input, setInput] = useState({
    email: "",
    userName: "",
    password: "",
    otp: "",
  });

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // useEffect(() => {
  //   if(user){
  //     navigate('/home')
  //   }
  // },[])

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const changeHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const handleOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_URL}/user/sendotp`, {
        email: input.email,
      });

      if (res.data.success) {
        toast.success("OTP sent successfully!");
        setNext(true);
        setTimer(60);
      } else {
        toast.error(res.data.message || "An error occurred while sending OTP");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "server error");
    } finally {
      setLoading(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isSignup
        ? `${import.meta.env.VITE_URL}/user/signup`
        : `${import.meta.env.VITE_URL}/user/login`;

      const payload = isSignup
        ? {
            userName: input.userName,
            email: input.email,
            password: input.password,
            otp: input.otp,
          }
        : {
            email: input.email,
            password: input.password,
          };

      const res = await axios.post(endpoint, payload, {
        withCredentials: true,
      });

      if (res.data.success) {
        if (!isSignup) {
          dispatch(setAuthUser(res.data.user));
        }
        toast.success(
          res.data.message || `${isSignup ? "Signup" : "Login"} successful`
        );
        setInput({
          email: "",
          userName: "",
          password: "",
          otp: "",
        });
        navigate("/home");
      } else {
        toast.error(
          res.data.message ||
            `An error occurred during ${isSignup ? "signup" : "login"}`
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        <h1 className="text-4xl font-bold text-center mb-8 text-white">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h1>
        <form onSubmit={submitHandler} className="space-y-6">
          {isSignup && (
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Username
              </label>
              <Input
                type="text"
                name="userName"
                placeholder="Enter your username"
                value={input.userName}
                onChange={changeHandler}
                className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/50"
                disabled={loading}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Email
            </label>
            <Input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              value={input.email}
              onChange={changeHandler}
              className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/50"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Password
            </label>
            <Input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={input.password}
              onChange={changeHandler}
              className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/50"
              disabled={loading}
            />
          </div>
          {isSignup && (
            <>
              {!next && (
                <div>
                  <Button
                    className="w-full bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-xl transition-all duration-300"
                    onClick={handleOTP}
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </Button>
                </div>
              )}
              {next && (
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    OTP
                  </label>
                  <Input
                    type="tel"
                    name="otp"
                    value={input.otp}
                    onChange={changeHandler}
                    className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/50"
                    disabled={loading}
                  />
                </div>
              )}
              {next && timer > 0 && (
                <p className="text-white/70 text-sm text-center">
                  Resend OTP in {timer} seconds
                </p>
              )}
              {next && timer === 0 && (
                <Button
                  className="w-full bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-xl transition-all duration-300"
                  onClick={handleOTP}
                  disabled={loading}
                >
                  Resend OTP
                </Button>
              )}
            </>
          )}
          {(!isSignup || (isSignup && next)) && (
            <div>
              <Button
                className="w-full bg-white text-indigo-600 hover:bg-white/90 py-3 px-4 rounded-xl transition-all duration-300 font-semibold"
                type="submit"
                disabled={loading}
              >
                {loading ? "Processing..." : isSignup ? "Create Account" : "Sign In"}
              </Button>
            </div>
          )}
        </form>
        <div className="text-center mt-6">
          <p className="text-white/80">
            {isSignup ? "Already have an account?" : "Don't have an account?"}
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                localStorage.setItem("isSignup", JSON.stringify(!isSignup));
                setNext(false);
                setInput({
                  email: "",
                  userName: "",
                  password: "",
                  otp: "",
                });
              }}
              className="text-white font-semibold hover:text-white/90 ml-2 transition-colors duration-200"
            >
              {isSignup ? "Sign In" : "Create Account"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;