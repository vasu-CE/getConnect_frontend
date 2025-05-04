import axios from "axios";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Button } from "./ui/button";
import { useDispatch } from "react-redux";
import { appendPost } from "../redux/PostSlice";
import { Loader, Image, X } from "lucide-react";

function CreatePost({ className , text }) {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const onDrop = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/bmp': ['.bmp'],
      'image/svg+xml': ['.svg'],
    },
    maxFiles: 1,
  });
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select an image");
      return;
    }
    
    setLoading(true);
    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("image", file);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_URL}/post/addPost`,
        formData,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        toast.success("Post created successfully");
        dispatch(appendPost(response.data.post));
        setCaption("");
        setFile(null);
        setDialogOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className={`w-full bg-blue-600 text-white hover:bg-blue-700 transition-all ${className}`}>
          {text ? text : "Create Post"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create New Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div
              {...getRootProps()}
              className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center cursor-pointer hover:border-slate-300 transition-colors"
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <Image className="w-5 h-5 text-slate-500" />
                  <span className="text-sm text-slate-600">{file.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="ml-2 text-slate-500 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Image className="w-8 h-8 text-slate-400" />
                  <p className="text-sm text-slate-500">Click or drag image here</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 resize-none"
              rows={3}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-slate-900 text-white hover:bg-slate-800"
            disabled={loading || !file}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                <span>Posting...</span>
              </div>
            ) : (
              "Post"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreatePost;
