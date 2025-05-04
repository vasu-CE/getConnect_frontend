import { useSelector, useDispatch } from "react-redux"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { setAuthUser } from "@/redux/authSlice"

function CreateProfile() {
  const user = useSelector((state) => state.auth.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    userName: user.userName || "",
    bio: user.bio || "",
    experience: "",
    interest: "",
    city: "",
    state: "",
    country: "",
    gender: "",
    profilePic: null,
    resume: null,
  })

  const [interests, setInterests] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_URL}/render/interests`, {
          withCredentials: true,
        })
        setInterests(response.data.newInterest)
      } catch (err) {
        toast.error("Failed to fetch interests")
      }
    }

    fetchInterests()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, files } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formDataToSend = new FormData()
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key])
      })

      const response = await axios.post(`${import.meta.env.VITE_URL}/user/register`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      })

      if (response.data.success) {
        toast.success(response.data.message)
        dispatch(setAuthUser(response.data.user))
        navigate("/home")
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex mt-4 justify-center items-center bg-[#D8BFD8] min-h-screen p-4">
      <form className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl space-y-6" onSubmit={handleSubmit}>
        <h2 className="text-3xl font-bold text-center mb-6">Create Your Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="userName">Username</Label>
            <Input
              id="userName"
              name="userName"
              placeholder={user.userName}
              value={formData.userName}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="experience">Experience</Label>
            <Select name="experience" onValueChange={(value) => handleSelectChange("experience", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-1 year">0-1 year</SelectItem>
                <SelectItem value="1-3 years">1-3 years</SelectItem>
                <SelectItem value="3+ years">3+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="interest">Interest</Label>
            <Select name="interest" onValueChange={(value) => handleSelectChange("interest", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an interest" />
              </SelectTrigger>
              <SelectContent>
                {interests.map((interest) => (
                  <SelectItem key={interest} value={interest}>
                    {interest}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Select name="city" onValueChange={(value) => handleSelectChange("city", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="New York">New York</SelectItem>
                <SelectItem value="Los Angeles">Los Angeles</SelectItem>
                {/* Add more cities as needed */}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Select name="state" onValueChange={(value) => handleSelectChange("state", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="California">California</SelectItem>
                <SelectItem value="Texas">Texas</SelectItem>
                {/* Add more states as needed */}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select name="country" onValueChange={(value) => handleSelectChange("country", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USA">USA</SelectItem>
                <SelectItem value="India">India</SelectItem>
                {/* Add more countries as needed */}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <RadioGroup onValueChange={(value) => handleSelectChange("gender", value)}>
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
          <div className="space-y-2">
            <Label htmlFor="profilePic">Profile Picture</Label>
            <Input id="profilePic" name="profilePic" type="file" onChange={handleChange} className="cursor-pointer" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resume">Resume</Label>
            <Input id="resume" name="resume" type="file" onChange={handleChange} className="cursor-pointer" />
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Create Profile"}
        </Button>
      </form>
    </div>
  )
}

export default CreateProfile

