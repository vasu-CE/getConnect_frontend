import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Code2,
  HomeIcon,
  LibraryBig,
  LogOut,
  MessageCircle,
  User,
  Menu,
  X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import axios from "axios";
import { setAuthUser } from "@/redux/authSlice";
import { setPosts } from "@/redux/PostSlice";
import { useIsLargeScreen } from "@/Responsive/useIsLargeScreen";

function Navbar() {
  const user = useSelector((state) => state.auth.user);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const isLargeScreen = useIsLargeScreen();

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_URL}/search/users`,
        { withCredentials: true }
      );
      setUsers(response.data);
    };
    fetchUsers();
  }, []);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearch(value);
    if (value.trim()) {
      setFilteredUsers(
        users.filter((u) =>
          u.userName?.toLowerCase().includes(value.toLowerCase())
        )
      );
    } else {
      setFilteredUsers([]);
    }
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const logoutHandler = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_URL}/user/logout`,
        {},
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success("Logged out successfully");
        dispatch(setAuthUser(null));
        dispatch(setPosts(null));
        navigate("/");
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const renderNavItems = () => (
    <>
      <Link to="/home" onClick={() => setMenuOpen(false)}>
        <Button variant="outline" size="icon" className="w-full p-4">
          <HomeIcon /> Home
        </Button>
      </Link>
      <Link to={`/render/chat/${user?._id}`} onClick={() => setMenuOpen(false)}>
        <Button variant="outline" size="icon" className="w-full p-4">
          <MessageCircle /> Messaging
        </Button>
      </Link>

      {isLargeScreen && (
        <Link to="/projects" onClick={() => setMenuOpen(false)}>
          <Button variant="outline" size="icon" className="w-full p-4">
            <Code2 /> Project
          </Button>
        </Link>
      )}

      <Link to="/quiz" onClick={() => setMenuOpen(false)}>
        <Button variant="outline" size="icon" className="w-full p-4">
          <LibraryBig /> Quiz
        </Button>
      </Link>
      <Link
        to={`/view/${user?._id}/profile`}
        onClick={() => setMenuOpen(false)}
      >
        <Button variant="outline" size="icon" className="w-full p-4">
          <User /> Profile
        </Button>
      </Link>
      <Button
        className="text-white w-full p-4 bg-red-500 hover:bg-red-600"
        onClick={() => {
          setMenuOpen(false);
          logoutHandler();
        }}
      >
        <LogOut /> Logout
      </Button>
    </>
  );

  return (
    <div className="fixed top-0 left-0   w-full bg-bg shadow-lg z-50">
      
      <div className="flex mx-4 items-center justify-between h-[50px] sm:h-[60px] md:h-[60px] lg:h-[70px] px-4">
        <Link to="/home" className="flex-shrink-0">
          <img
            src="../images/getConnect.png"
            alt="GetConnect"
            className="h-[40px] sm:h-[40px] md:h-[50px] lg:h-[60px]"
          />
        </Link>

        {/* Desktop search */}
        <div className="hidden lg:block relative w-96">
          <Input
            id="search"
            type="text"
            placeholder="Search"
            value={search}
            onChange={handleSearchChange}
            className="w-full p-3 rounded-full border-2 border-gray-300 focus-visible:ring-transparent"
          />
          {filteredUsers.length > 0 && (
            <ul
              id="list"
              className="absolute mt-2 w-full bg-white border border-gray-300 rounded-md shadow-xl max-h-48 overflow-y-auto"
            >
              {filteredUsers.map((user) => (
                <li
                  key={user._id}
                  className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                >
                  <Link
                    onClick={() => {
                      setSearch("");
                      setFilteredUsers([]);
                    }}
                    to={`/view/${user._id}/profile`}
                  >
                    {user.userName}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Desktop nav items */}
        <div className="hidden lg:flex items-center space-x-5">
          {renderNavItems()}
        </div>

        {/* Hamburger menu button (mobile & tablet only) */}
        <button
          className="lg:hidden p-2"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile/Tablet vertical menu */}
      {menuOpen && (
        <div className="lg:hidden bg-bg shadow-md">
          <div className="flex flex-col px-4 py-2 space-y-2">
            <div className="relative">
              <Input
                id="search-mobile"
                type="text"
                placeholder="Search"
                value={search}
                onChange={handleSearchChange}
                className="w-full p-3 rounded-full border-2 border-gray-300 focus-visible:ring-transparent"
              />
              {filteredUsers.length > 0 && (
                <ul
                  id="list"
                  className="absolute mt-2 w-full bg-white border border-gray-300 rounded-md shadow-xl max-h-48 overflow-y-auto"
                >
                  {filteredUsers.map((user) => (
                    <li
                      key={user._id}
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                    >
                      <Link
                        onClick={() => {
                          setSearch("");
                          setFilteredUsers([]);
                        }}
                        to={`/view/${user._id}/profile`}
                      >
                        {user.userName}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-col space-y-2">{renderNavItems()}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;
