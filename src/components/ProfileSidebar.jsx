import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Edit2, UserPlus, User, Mail, MapPin, Calendar } from "lucide-react";
import CreatePost from "./CreatePost";

const ProfileSidebar = () => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  // const CreateProfileNavigator = () => navigate("/profile/create");
  const EditNavigator = () => navigate("/profile/edit");

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl rounded-xl overflow-hidden border border-gray-100 mt-10">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-24 rounded-t-xl" />
      <CardContent className="p-6 -mt-12">
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 border-4 border-white rounded-full overflow-hidden shadow-lg">
            <img
              src={user?.profilePicture}
              alt={user.userName}
              crossOrigin="anonymous"
              className="object-cover w-full h-full"
            />
          </div>
          <div className="text-center ">
            <h3 className="text-2xl font-bold text-gray-800">
              {user?.userName || "Guest User"}
            </h3>
            {user?.email && (
              <div className="flex items-center justify-center text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                <span className="text-sm">{user.email}</span>
              </div>
            )}
          </div>
          {user?.bio && (
            <p className="text-sm text-center text-gray-600 bg-gray-50 mb-2 rounded-lg w-full">
              {user.bio}
            </p>
          )}
          {user?.interests && user.interests.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-2 w-full">
              {user.interests.slice(0, 3).map((interest, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-600 px-3 py-1 rounded-full"
                >
                  {interest}
                </Badge>
              ))}
              {user.interests.length > 3 && (
                <Badge
                  variant="secondary"
                  className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-600 px-3 py-1 rounded-full"
                >
                  +{user.interests.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <Separator className="bg-gray-100" />
      <CardFooter className="flex flex-col gap-4">
        <CreatePost />

        {user && (
          <>
            {/* <Button
              onClick={CreateProfileNavigator}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 border border-blue-200 text-white hover:bg-blue-500 hover:shadow-md transition-all duration-200"
            >
              <User className="h-5 w-5" />
              Create Profile
            </Button> */}

            <Button
              onClick={EditNavigator}
              className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:from-indigo-600 hover:to-blue-600 shadow-md transition-all duration-300"
            >
              <Edit2 className="mr-2 h-5 w-5" />
              Edit Profile
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProfileSidebar;
