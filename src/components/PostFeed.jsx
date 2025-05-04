import { useEffect, useRef, useState } from 'react';
import Postcard from './Postcard';
import axios from 'axios';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { setPosts } from '../redux/PostSlice';
import CreatePost from './CreatePost';

function PostFeed({ selectedInterests , width}) {
    const dispatch = useDispatch();
    const posts = useSelector((state) => state.post.posts) || [];
    const [loading, setLoading] = useState(false);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const loader = useRef(null);

    const fetchPosts = async (pageNumber = 1) => {
        if (loading) return;
        setLoading(true);
        // console.log("fetch post")
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_URL}/post/allpost`,
                {},
                {
                    params: { page: pageNumber, limit: 5 },
                    withCredentials: true,
                }
            );

            if (response.data.success) {
                const postsData = response.data.posts;
                const updatedPosts = pageNumber === 1 ? postsData : [...posts, ...postsData];
                dispatch(setPosts(updatedPosts));
                setFilteredPosts(filterPosts(updatedPosts, selectedInterests));
                setHasMore(postsData.length > 0);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error fetching posts');
        } finally {
            setLoading(false);
        }
    };

    const filterPosts = (posts, interests) => {
        if (!interests || interests.length === 0) return posts;
        return posts.filter(post =>
            interests.some(interest => post.author.interests.includes(interest))
        );
    };

    useEffect(() => {
        fetchPosts(page);
    }, [page]);

    useEffect(() => {
        // console.log(selectedInterest s)
        setFilteredPosts(filterPosts(posts, selectedInterests));
    }, [selectedInterests]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting && hasMore && !loading) {
                    setPage((prevPage) => prevPage + 1);
                }
            },
            {
                root: null,
                rootMargin: '50px',
                threshold: 1.0,
            }
        );

        const current = loader.current;
        if (current) observer.observe(current);

        return () => {
            if (current) observer.unobserve(current);
        };
    }, [hasMore, loading]);

    const handlePostDelete = (deletedPostId) => {
        setFilteredPosts(filteredPosts.filter(post => post._id !== deletedPostId));
        dispatch(setPosts(filteredPosts.filter(post => post._id !== deletedPostId)));
    };

    return (
        <div>
            <div className={`flex flex-col gap-6 w-[${width}] mb-10`}>
                {filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => <Postcard key={post._id} post={post} onDelete={handlePostDelete} />)
                ) : (
                     <div className="text-center py-12 flex flex-col items-center justify-center ">
                        <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No Post yet
                          </h3>
                          <p className="text-gray-600 mb-6">
                            Create your first Post to start collaborating with Others
                          </p>
                          <CreatePost text="Create Your First Post" />
                        </div>
                    </div>
                )}
            </div>
            {loading && <p className="text-center">Loading...</p>}
            <div ref={loader} />
        </div>
    );
}

export default PostFeed;