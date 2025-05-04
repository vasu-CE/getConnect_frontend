import { setAuthUser } from "@/redux/authSlice";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Loader2, X } from "lucide-react";

const EditProfile = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [availableInterests, setAvailableInterests] = useState([]);
  const [oldInterests, setOldInterests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    userName: user.userName || "",
    bio: user.bio || "",
    profilePic: null,
    experience: "",
    resume: null,
    gender: "Male",
    interests: [],
    deleteInterest: [],
  });

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_URL}/render/interests`,
          {
            withCredentials: true,
          }
        );

        setOldInterests(response.data.oldInterest);
        setAvailableInterests(response.data.newInterest);
      } catch (error) {
        toast.error("Error fetching interests:", error);
      }
    };

    fetchInterests();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const fieldValue = files ? files[0] : value;

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    console.log(formData.experience);
  }, [formData.experience]);

  const updateInterest = (type, action, value) => {
    setFormData((prev) => {
      const list = prev[type];

      if (action == "add" && !list.includes(value)) {
        return {
          ...prev,
          [type]: [...list, value],
        };
      }

      if (action == "remove") {
        return {
          ...prev,
          [type]: list.filter((item) => item !== value),
        };
      }

      return prev;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_URL}/profile/edit`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        dispatch(setAuthUser(response.data.user));
        navigate("/home");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-b from-purple-100 to-pink-100  p-4 mt-9 sm:px-6 lg:px-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Edit Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="userName">Change Username</Label>
                <Input
                  id="userName"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  placeholder={user?.userName}
                  className="focus-visible:ring-offset-0 focus-visible:ring-1"
                />
              </div>

              <div>
                <Label htmlFor="bio">Change Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder={user?.bio}
                  rows={3}
                  className="focus-visible:ring-offset-0 focus-visible:ring-1"
                />
              </div>

              <div>
                <Label htmlFor="profilePic">Change Profile Picture</Label>
                <Input
                  id="profilePic"
                  type="file"
                  name="profilePic"
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience</Label>
                <Select
                  name="experience"
                  onValueChange={(value) =>
                    handleSelectChange("experience", value)
                  }
                >
                  <SelectTrigger className="focus-visible:ring-offset-0 focus-visible:ring-1">
                    <SelectValue placeholder="Select your experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1 year">0-1 year</SelectItem>
                    <SelectItem value="1-3 years">1-3 years</SelectItem>
                    <SelectItem value="3+ years">3+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="interests">Select Interests</Label>
                <Select
                  onValueChange={(value) =>
                    updateInterest("interests", "add", value)
                  }
                >
                  <SelectTrigger className='focus-visible:ring-offset-0 focus-visible:ring-1'>
                    <SelectValue placeholder="Select an Interest" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableInterests.map((interest, index) => (
                      <SelectItem key={index} value={interest}>
                        {interest}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.interests.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="p-1 px-3 bg-green-100">
                      {interest}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-auto p-0"
                        onClick={() =>
                          updateInterest("interests", "remove", interest)
                        }
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="deleteInterest">Delete Interest</Label>
                <Select
                  onValueChange={(value) =>
                    updateInterest("deleteInterest", "add", value)
                  }
                >
                  <SelectTrigger className="focus-visible:ring-offset-0 focus-visible:ring-1">
                    <SelectValue placeholder="Select an interest to delete" />
                  </SelectTrigger>
                  <SelectContent>
                    {oldInterests.map((interest, index) => (
                      <SelectItem key={index} value={interest}>
                        {interest}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.deleteInterest.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="p-1 px-3 bg-red-100 text-red-600">
                      {interest}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-auto p-0"
                        onClick={() =>
                          updateInterest("deleteInterest", "remove", interest)
                        }
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="resume">Resume</Label>
                <Input
                  id="resume"
                  type="file"
                  name="resume"
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Gender</Label>
                <RadioGroup
                  name="gender"
                  value={formData.gender}
                  onValueChange={(value) =>
                    handleChange({ target: { name: "gender", value } })
                  }
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  Updating... <Loader2 className="animate-spin"/>
                </>
              ) : (
                "Updated Profile"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProfile;
