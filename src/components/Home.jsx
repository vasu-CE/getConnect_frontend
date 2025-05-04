import { useEffect, useState } from 'react';
import PostFeed from './PostFeed.jsx';
import ProfileSidebar from './ProfileSidebar';
import Community from './Community';
import { toast } from 'sonner';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { updateConnection } from '@/redux/authSlice.js';

function Home() {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try{
        const response =await axios.get(`${import.meta.env.VITE_URL}/user/connection` , {withCredentials : true});
        // console.log(response.data.follower);
        // user.connection = response.data.follower
        dispatch(updateConnection(response.data.follower))
      }catch(err){
        toast.error("Error in fetching Data" , err);
      }
    }
    fetchData();
  },[]);
 
  return (
    <div className="flex bg-slate-200 min-h-screen overflow-hidden">
      <div className="hidden lg:block fixed w-1/5 p-6 rounded-lg h-screen">
        <ProfileSidebar />
      </div>

      <div className="w-full lg:w-[34vw] lg:ml-[32vw] p-6">
        <PostFeed selectedInterests={selectedInterests} />
      </div>

      <div className="hidden lg:block fixed right-0 w-1/5 p-6 rounded-lg h-screen">
        <Community
          selectedInterests={selectedInterests}
          setSelectedInterests={setSelectedInterests}
        />
      </div>
    </div>
  );
}

export default Home;
