import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';

function UserAuth({children}) {

    const user = useSelector((state) => state.auth.user);
    const [loading , setLoading] = useState(true);
    const navigate = useNavigate();
    
    useEffect(() => {
        if(user){
            setLoading(false);
        }
        
        if(!user){
            navigate('/');
        }
    }, [user, navigate])
    if(loading){
        return <div>Loading...</div>
    }
  return (
    <>
        {children}
    </>
  )
}

export default UserAuth
