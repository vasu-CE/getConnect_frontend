import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useSelector } from "react-redux"
import axios from "axios"
import { toast } from "sonner"
import { Book, FileText, Zap, ImageIcon, MessageCircle, Award, Users, Mail, Plus } from "lucide-react"

const ProfilePage = () => {
  const author = useSelector((state) => state.auth.user)
  const { id } = useParams()
  const [user, setUser] = useState({})
  const [posts, setPosts] = useState([])
  const [followed, setFollowed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_URL}/view/${id}/profile`, { withCredentials: true })
        if (response.data.success) {
          setUser(response.data.author)
          // console.log(response.data.author.connection)
          // console.log(author._id)
          setFollowed(response.data.author.connection.includes(author._id))
          setPosts(response.data.posts)
        } else {
          toast.error(response.data.message)
        }
      } catch (err) {
        toast.error(err.message)
      }
    }
    fetchProfile()
  }, [id , author._id])

 

  const resumeHandler = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_URL}/render/resume/${id}`)
      if (response.data.success) {
        const resumeData = response.data.resumeImg
        const newTab = window.open()
        newTab.document.write(`<iframe src="${resumeData}" width="100%" height="100%" style="border:none;"></iframe>`)
      } else {
        toast.error(response.data.message)
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  const messageHandler = () => {
    navigate(`/render/chat/${id}`)
  }

  const followHandler = async () => {
    const prevFollowed = followed;
    setFollowed(!prevFollowed);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_URL}/user/connection/${id}`,
        {},
        { withCredentials: true }
      );

      if (!data.success) {
        setFollowed(prevFollowed);
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const formatTimeDifference = (createdAt) => {
    const diff = new Date() - new Date(createdAt)
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header */}
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-indigo-600">
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-black bg-opacity-50 text-white">
              <h1 className="text-3xl font-bold">{user?.userName}</h1>
              <p className="mt-2 text-lg">{user?.bio || "No bio available."}</p>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <img
                  src={user?.profilePicture || "/defaultProfilePic.jpg"}
                  alt={user?.userName}
                   crossOrigin="anonymous"
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <Award className="text-yellow-500" />
                    <span className="font-semibold">Score: {user?.score || 0}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Users className="text-blue-500" />
                    <span>Connections: {user?.connection?.length || 0}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-4">
                {author._id === id ? (
                  <button className="bg-green-500 text-white px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-green-600 transition duration-300">
                    <Plus size={20} />
                    <span>Create Post</span>
                  </button>
                ) : (
                  followed ? (
                    <button onClick={followHandler} className="bg-red-500 text-white px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-red-700 transition duration-300">
                      <span>Unfollow</span>
                    </button>
                  ) : (
                    <button onClick={followHandler} className="bg-green-500 text-white px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-green-600 transition duration-300">
                      <span>Follow</span>
                    </button>
                  )
                )}
                
                <button
                  onClick={messageHandler}
                  className="bg-blue-500 text-white px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-blue-600 transition duration-300"
                >
                  <Mail size={20} />
                  <span>Message</span>
                </button>
              </div>
            </div>

            {/* Education and Resume */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg shadow">
                <h2 className="text-xl font-semibold flex items-center">
                  <Book className="mr-2 text-blue-500" />
                  Education
                </h2>
                <p className="mt-2">Charusat University</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg shadow">
                <h2 className="text-xl font-semibold flex items-center">
                  <FileText className="mr-2 text-blue-500" />
                  Resume
                </h2>
                {user?.resume ? (
                  <button
                    onClick={resumeHandler}
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
                  >
                    View Resume
                  </button>
                ) : (
                  <p className="mt-2 text-gray-600">No resume available</p>
                )}
              </div>
            </div>

            {/* Interests */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold flex items-center">
                <Zap className="mr-2 text-yellow-500" />
                Interests
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {user?.interests?.length ? (
                  user.interests.map((interest, index) => (
                    <span key={index} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">
                      {interest}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-600">No interests available.</p>
                )}
              </div>
            </div>

            {/* Posts */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold flex items-center mb-4">
                <ImageIcon className="mr-2 text-green-500" />
                Posts
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <div
                      key={post._id}
                      className="bg-white rounded-lg shadow-md overflow-hidden"
                    >
                      <img src={post.image || "/placeholder.svg"}
                       alt="Post"
                        crossOrigin="anonymous"
                       className="w-full h-48 object-cover" />
                      <div className="p-4">
                        <p className="text-gray-800 font-medium">{post.caption || "No caption"}</p>
                        <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
                          <span>{formatTimeDifference(post.createdAt)}</span>
                          <div className="flex items-center">
                            <MessageCircle size={16} className="mr-1" />
                            <span>{post.comments?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 col-span-3">No posts available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
