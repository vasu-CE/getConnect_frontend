import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Heart, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { removePost, setPosts } from "../redux/PostSlice";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { setAuthUser } from "@/redux/authSlice";

const Postcard = ({ post }) => {
  const { user } = useSelector((state) => state.auth);
  const { posts } = useSelector((state) => state.post);
  const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
  const [count, setCount] = useState(post?.likes?.length);
  const [isFollowing, setIsFollowing] = useState(false);
  const [comments, setComments] = useState(post?.comments || []);
  const [commentText, setCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const likeHandler = async () => {
    // Optimistic update
    const newLikedState = !liked;
    const newCount = newLikedState ? count + 1 : count - 1;

    setLiked(newLikedState);
    setCount(newCount);

    // Store the previous state for potential rollback
    const previousLiked = liked;
    const previousCount = count;

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_URL}/post/${post._id}/${
          newLikedState ? "like" : "dislike"
        }`,
        { withCredentials: true }
      );

      if (!response.data.success) {
        setLiked(previousLiked);
        setCount(previousCount);
        toast.error("Failed to update like state");
        return;
      }
      const updatedPosts = posts.map((p) =>
        p._id === post._id
          ? {
              ...p,
              likes: newLikedState
                ? [...p.likes, user._id]
                : p.likes.filter((id) => id !== user._id),
            }
          : p
      );
      dispatch(setPosts(updatedPosts));
    } catch (err) {
      // Revert changes in case of an error
      setLiked(previousLiked);
      setCount(previousCount);
      toast.error("Error liking the post");
    }
  };

  const deletePostHandler = async () => {
    dispatch(removePost(post._id));
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_URL}/post/delete/${post._id}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Post deleted successfully");
        // console.log(post._id);
      } else {
        toast.error("Failed to delete post");
      }
    } catch (err) {
      // Rollback the optimistic update if the API call fails
      dispatch(appendPost(post));
      toast.error(err.message);
    }
  };

  const followHandler = async () => {
    if (isLoading) return;

    if (
      isFollowing &&
      !window.confirm("Are you sure you want to unfollow this user?")
    ) {
      return;
    }

    setIsLoading(true);

    try {
      setIsFollowing(!isFollowing);

      const response = await axios.post(
        `${import.meta.env.VITE_URL}/user/connection/${post.author._id}`,
        {},
        { withCredentials: true }
      );

      if (!response.data.success) {
        // Rollback if failed
        setIsFollowing(isFollowing);
        toast.error(response.data.message || "Failed to update follow status");
        return;
      }
      const updatedUser = {
        ...user,
        connection: isFollowing
          ? user.connection.filter((id) => id != post.author?._id)
          : [...user.connection, post.author?._id],
      };
      dispatch(setAuthUser(updatedUser));
      toast.success(response.data.message);
    } catch (err) {
      // Rollback on error
      setIsFollowing(isFollowing);
      toast.error(err.message || "Failed to update follow status");
    } finally {
      setIsLoading(false);
    }
  };

  // Update follow state when user prop changes
  useEffect(() => {
    setIsFollowing(user?.connection?.includes(post.author?._id) || false);
  }, [user?.connection, post.author?._id]);

  const commentHandeler = async () => {
    try {
      if (!commentText.trim()) return;

      const tempComment = {
        _id: Date.now().toString(),
        text: commentText,
        user: {
          userName: user.userName,
          profilePicture: user.profilePicture,
        },
        createdAt: new Date().toISOString(),
      };

      setComments((prevComments) => [...prevComments, tempComment]);
      setCommentText("");
      const response = await axios.post(
        `${import.meta.env.VITE_URL}/post/${post._id}/comment`,
        { message: commentText },
        { withCredentials: true }
      );

      if (response.data.success) {
        setComments(response.data.comments);
      } else {
        setComments((prevComments) =>
          prevComments.filter((comment) => comment._id !== tempComment._id)
        );
        toast.error("Failed to post comment");
      }
      // console.log(comments);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const calculateTimeDifference = (createdAt) => {
    const postDate = new Date(createdAt);
    const currentDate = new Date();
    const differenceInMilliseconds = currentDate - postDate;

    const seconds = Math.floor(differenceInMilliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) {
      return `${years} year${years > 1 ? "s" : ""} ago`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? "s" : ""} ago`;
    } else if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else {
      return "Just now";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">
            <MoreVertical />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-white border border-gray-200 shadow-md rounded-lg"
        >
          {post.author?._id === user._id ? (
            <DropdownMenuItem
              onClick={deletePostHandler}
              className="text-red-500 hover:text-red-700"
            >
              Delete Post
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={followHandler}
              disabled={isLoading}
              className={`${
                isFollowing
                  ? "text-red-500 hover:text-red-700"
                  : "text-green-500 hover:text-green-700"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isLoading
                ? "Processing..."
                : isFollowing
                ? "Unfollow"
                : "Follow"}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center mb-4">
        <img
          src={post?.author?.profilePicture}
          alt="User"
          crossOrigin="anonymous"
          className="rounded-full w-10 h-10 object-cover mr-3 cursor-pointer"
          onClick={() => navigate(`/view/${post.author._id}/profile`)}
        />
        <div>
          <h4 className="text-gray-800 font-medium">
            {post.author?.userName || "John Doe"}
          </h4>
          <p className="text-gray-500 text-sm">
            {post?.createdAt
              ? calculateTimeDifference(post.createdAt)
              : "2 hours ago"}
          </p>
        </div>
      </div>

      <p className="text-gray-700 mb-3">{post?.caption || "Caption"}</p>

      {post.image && (
        <img
          src={post.image}
          alt="Post"
          className="w-full h-auto rounded-lg mb-3 "
          crossOrigin="anonymous"
        />
      )}

      <div className="flex items-center justify-between text-sm text-gray-500">
        <button
          onClick={likeHandler}
          className="flex items-center space-x-1 hover:text-gray-800 transition"
        >
          {liked ? <Heart fill="red" strokeWidth={0} /> : <Heart />}
          <div className="text-black text-md">{count}</div>
        </button>
        <Dialog>
          <DialogTrigger asChild>
            <button className="flex items-center space-x-1 hover:text-gray-800 transition">
              💬
              <span>Comment</span>
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Comments</DialogTitle>
            <div className="max-h-60 overflow-y-auto p-2">
              {comments?.length > 0 ? (
                comments?.map((comment) => (
                  comment._id && (
                    <div
                    key={comment._id}
                    className="flex items-center space-x-3 p-2 mb-2 bg-gray-100 rounded-lg shadow-sm"
                  >
                    <img
                      src={comment.user.profilePicture}
                      alt={comment.user.userName}
                      className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover"
                      crossOrigin="anonymus"
                    />
                    {/* {console.log(comment)} */}
                    {/* Comment Content */}
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-gray-800">
                          {comment.user.userName}
                        </h4>
                        <small className="text-gray-500 text-xs">
                          {calculateTimeDifference(comment.createdAt)}
                        </small>
                      </div>
                      <p className="text-gray-700 text-sm">{comment.text}</p>
                    </div>
                  </div>
                  )
                ))
              ) : (
                <p className="text-center text-gray-500">No comments yet</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    commentHandeler();
                  }
                }}
              />
              <Button onClick={commentHandeler}>Post</Button>
            </div>
          </DialogContent>
        </Dialog>
        <button className="flex items-center space-x-1 hover:text-gray-800 transition">
          <span>🔗</span>
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};

export default Postcard;
