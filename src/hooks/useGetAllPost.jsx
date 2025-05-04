// import { setPosts } from '@/redux/PostSlice';
// import axios from 'axios';
// import { useEffect } from 'react';
// import { useDispatch } from 'react-redux';
// import { toast } from 'sonner';

// function useGetAllPost() {
//   const dispatch = useDispatch();

//   useEffect(() => {
//     const fetchPosts = async () => {
//       try {
//         const response = await axios.get(`${import.meta.env.VITE_URL}/post/allpost`, {
//           withCredentials: true,
//         });

//         if (response.data.success) {
//           // console.log(response.data.posts); // ✅ Fixed `res` -> `response`
//           dispatch(setPosts(response.data.posts));
//         }
//       } catch (error) {
//         toast.error(error.response?.data?.message || 'Error fetching posts');
//       }
//     };

//     fetchPosts();
//   }, [dispatch]); // ✅ Added `dispatch` to dependencies

//   return null; // ✅ This is a hook, so it shouldn't render anything
// }

// export default useGetAllPost;
