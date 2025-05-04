import { CircleX, Trash2, Users } from "lucide-react";
import React, { createRef, useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Input } from "./ui/input";
import axios from "axios";
import { toast } from "sonner";
import {
  initializeProjectSocket,
  receiveMessage,
  sendMessage,
} from "../../config/socket";
import { useSelector } from "react-redux";
import Markdown from 'markdown-to-jsx';
import hljs from 'highlight.js';
import { getWebContainer } from "../../config/webContainer";

function SyntaxHighlightedCode(props) {
  const ref = useRef(null)

  React.useEffect(() => {
      if (ref.current && props.className?.includes('lang-') && window.hljs) {
          window.hljs.highlightElement(ref.current)

          // hljs won't reprocess the element unless this attribute is removed
          ref.current.removeAttribute('data-highlighted')
      }
  }, [ props.className, props.children ])

  return <code {...props} ref={ref} />
}

function ProjectPage() {
  const location = useLocation();
  const onlineUsers = useSelector(state => state.chat.onlineUsers)
  const [isSidePanelOpen, setisSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(new Set());
  const [users, setUsers] = useState([]);
  const { id } = useParams();
  const [project, setProject] = useState(location.state?.project);
  const [message, setMessage] = useState("");
  const user = useSelector((state) => state.auth.user);
  const messageBox = createRef();

  const [messages , setMessages] = useState([])
  const [fileTree , setFileTree] = useState({})
  const [currentFile, setCurrentFile] = useState(null)
  const [openFiles , setOpenFiles] = useState([])
  const [webContainer , setWebContainer] = useState(null);
  const [iframeUrl , setIframUrl] = useState(null);

  const [ runProcess, setRunProcess ] = useState(null) 
  const [isInstalling, setIsInstalling] = useState(false);
  const [run , setRun] = useState(false)

  const socketRef = useRef(null);

  useEffect(() => {
    const socket = initializeProjectSocket(project._id);
    socketRef.current = socket;
    // console.log(project._id)
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id); 
    });
    if (!webContainer) {
      getWebContainer().then(container => {
          setWebContainer(container)
          console.log("container started")
      }).catch(err => {
        console.log("Error in web container" , err)
      })
    }

    receiveMessage(socket , "project-message", (data) => {
      let message;
      console.log(data.message)
      try {
        message = JSON.parse(data.message);
      } catch (e) {
        // If it's not a valid JSON, use the message as is
        message = data.message;
      }
      webContainer?.mount(message.fileTree)
      if(message.fileTree){
        setFileTree((prevFileTree) => {
          const updatedFileTree = {
            ...prevFileTree,
            ...message.fileTree,
          };

          saveFileTree(updatedFileTree);
          return updatedFileTree;
        });
        // setFileTree(message.fileTree);
        // saveFileTree(message.fileTree); // Save file tree to the database
      }
      // appendIncomingMsg(data);
      setMessages((prevmessages) => [...prevmessages , data])
    });

    const fetchUser = async () => {
      const response = await axios.get(`${import.meta.env.VITE_URL}/search/users`, {
        withCredentials: true,
      });
      setUsers(response.data);
      const res = await axios.get(
        `${import.meta.env.VITE_URL}/projects/get-project/${id}`,
        { withCredentials: true }
      );
      setProject(res.data.project);
      setFileTree(res.data.project.fileTree);
    };
    fetchUser();
  }, []);
  // useEffect(() => {
  //   console.log(webContainer);
  // },[webContainer])

  const selectedHandeler = (id) => {
    setSelectedUserId((prevSelectedUserId) => {
      const newSelectedUserId = new Set(prevSelectedUserId);
      if (newSelectedUserId.has(id)) {
        newSelectedUserId.delete(id);
      } else {
        newSelectedUserId.add(id);
      }

      return newSelectedUserId;
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]; 
    if (!file) return;
  
    const fileName = file.name;
    // console.log(file);
  
    try {
      if (fileTree?.[fileName]) {
        toast.error("File already exists!");
        return;
      }
  
      // Read the file content
      const fileContent = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result); // Resolve with the file content
        reader.onerror = () => reject(reader.error); // Reject on error
        reader.readAsText(file); // Read the file as text
      });
  
      // Update the file tree
      const updatedFileTree = {
        ...fileTree,
        [fileName]: {
          file: {
            contents: fileContent,
          },
        },
      };
      setFileTree(updatedFileTree);

      await saveFileTree(updatedFileTree);
  
      toast.success(`File '${fileName}' uploaded successfully!`);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const handleFileDelete = async (fileName) => {
    if (!fileTree[fileName]) {
      toast.error("File not found!");
      return;
    }

    const updatedFileTree = { ...fileTree };
    delete updatedFileTree[fileName];

    setFileTree(updatedFileTree);

    await saveFileTree(updatedFileTree);

    toast.success(`File '${fileName}' deleted successfully!`);
  };

  async function addCollabrators() {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_URL}/projects/add-user`,
        {
          projectId: id,
          users: Array.from(selectedUserId),
        },
        { withCredentials: true }
      );
      console.log(response.data);
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message);
    }
  }

  function sendMsg() {
    // console.log(user)
    if(!message.trim()) return;
    sendMessage(socketRef.current , "project-message", {
      message,
      sender: user,
    });
    // appendOutgoingMsg(message)
    setMessages((prevmessages) => [...prevmessages , {sender : user, message}])
    setMessage("");
  }

  function WriteAiMessage(message) {

    const messageObject = JSON.parse(message)

    return (
        <div
            className='overflow-auto bg-slate-950 text-white rounded-sm p-2'
        >
            <Markdown
                children={messageObject.text}
                options={{
                    overrides: {
                        code: SyntaxHighlightedCode,
                    },
                }}
            />
        </div>)
}

  async function saveFileTree(ft) {
    {console.log(fileTree)}
    const response = await axios.put(`${import.meta.env.VITE_URL}/projects/update-file-tree`, {
        projectId: project._id,
        fileTree: ft
    })
    {console.log(response.data)}
  }

  useEffect(() => {
    // console.log(messages);
    if (messageBox.current) {
      messageBox.current.scrollTo({
        top: messageBox.current.scrollHeight,
        // behavior: 'smooth'
      });
    }
  }, [messages]);

  return (
    <div className="flex h-[89vh] mt-10">
      {/* Left Sidebar */}
      <div className="left w-96 relative bg-slate-200 flex flex-col border-r">
        {/* Header */}
        <header>
          <div className="p-4 border-b flex justify-between items-center bg-white">
            <button
              className="hover:bg-slate-100 px-3 py-1.5 rounded-md"
              onClick={() => setIsModalOpen(!isModalOpen)}
            >
              Add collaborator
            </button>
            <button
              className="p-2 hover:bg-slate-100 rounded-full"
              onClick={() => setisSidePanelOpen(!isSidePanelOpen)}
            >
              <Users size={20} />
            </button>
          </div>
        </header>

        <div className="conversation-area pb-10 flex-grow flex flex-col relative">
          {/* Messages Area */}
            <div
              ref={messageBox}
              className="message-box p-1 flex-grow flex flex-col gap-1 overflow-y-scroll max-h-full"
              style={{ maxHeight: 'calc(100vh - 230px)' }}
            >
              {messages.map((msg, index) => (
                <div key={index} className={`${msg.sender._id === 'ai' ? 'max-w-[21rem]' : 'max-w-52'} ${msg.sender._id == user._id.toString() && 'ml-auto'}  message flex flex-col p-2 bg-slate-50 w-fit rounded-md`}>
                    <small className='opacity-65 text-xs'>{msg.sender.userName}</small>
                    <div className='text-sm'>
                        {msg.sender._id === 'ai' ?
                          WriteAiMessage(msg.message) : msg.message    
                        }
                    </div>
                </div>
              ))}
            </div>
          
          {/* Input Area */}
            <div className="p-4 border-t w-full bg-slate-100 absolute bottom-0">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown = {(e) => {
                  if(e.key == "Enter"){
                    sendMsg();
                  }
                }}
                className="flex-1 focus-visible:ring-transparent"
              />
              <button
                onClick={sendMsg}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Send
              </button>
            </div>
            </div>
        </div>

        <div
          className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 absolute transition-all ${
            isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          } top-0`}
        >
          <header className="flex justify-between items-center h-20 px-4 p-2 bg-slate-200">
            <h1 className="font-semibold text-lg">Collaborators</h1>

            <button
              onClick={() => setisSidePanelOpen(!isSidePanelOpen)}
              className="p-2"
            >
              <CircleX />
            </button>
          </header>

          <div className="users flex flex-col gap-2">
            {project.users &&
              project.users.map((user, index) => (
                <div
                  key={index}
                  className="user cursor-pointer hover:bg-slate-200 p-2 flex gap-2 items-center"
                >
                  {/* <div className='aspect-square rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600'>
                <User />
              </div> */}
                  <div className="relative">
                    <img
                      src={user.profilePicture}
                      alt="profilePic"
                      className="w-16 h-16 rounded-full object-cover"
                      crossOrigin="anonymus"
                    />
                    {
                      onlineUsers?.includes(user._id) && (
                      <div className="absolute right-0 bottom-0 h-5 w-5 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  <h1 className="font-semibold text-lg">{user.userName}</h1>
                </div>
              ))}
          </div>
        </div>
      </div>
      
      <section className="right bg-red-50 flex-grow h-[89vh] flex">
        <div className="explorer h-full max-w-64 min-w-52 bg-slate-300">
          <div className="file-tree w-full">
            <label className="text-center block p-2 px-4 mt-4 w-[92%] ml-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
              Upload File
              <input
                type="file"
                accept=".txt,.js,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {fileTree &&
              Object.keys(fileTree).map((file, index) => (
                <div key={index} className="flex items-center gap-2 w-full">
                  <button
                    onClick={() => {
                      setCurrentFile(file);
                      setOpenFiles([...new Set([...openFiles, file])]);
                    }}
                    className="tree-element cursor-pointer p-2 px-4 flex items-center gap-2 bg-slate-300 w-full"
                  >
                    <p className="font-semibold text-lg">{file}</p>
                  </button>
                  
                  <Trash2 onClick={() => handleFileDelete(file)} className="text-red-500 cursor-pointer mr-5" />
                </div>
              ))}

          </div>
        </div>

        <div className="code-editor flex flex-col flex-grow h-full shrink">

          <div className="top flex justify-between w-full">
            
          <div className="files flex">
            {
              openFiles.map((file, index) => (
                <div key={index} className={`flex items-center gap-2  bg-slate-300 ${currentFile === file ? 'bg-slate-400' : ''}`}>
                  <button
                    onClick={() => setCurrentFile(file)}
                    className="open-file cursor-pointer p-2 px-4 flex items-center w-fit"
                  >
                    <p className="font-semibold text-lg">{file}</p>
                  </button>
                  <button
                  
                    onClick={() => {
                      setOpenFiles(openFiles.filter(temp => temp!=file));
                      setCurrentFile(null);
                    }}
                    
                    className="text-red-500 cursor-pointer"
                  >
                    <CircleX size={"20px"} />
                  </button>
                </div>
              ))
            }
          </div>

            <div className="actions flex gap-2">
              <button
                onClick={async () => {
                  try {
                    setIsInstalling(true);
                    await webContainer?.mount(fileTree)
                    // Check if package.json exists before running npm install and start
                    if (!fileTree['package.json']) {
                      toast.error("package.json not found. Please create a package.json file before running npm install and start.");
                      setIsInstalling(false);
                      return;
                    }
                    
                    const installProcess = await webContainer?.spawn("npm", ["install"])
                    installProcess.output.pipeTo(new WritableStream({
                        write(chunk) {
                          console.log(chunk)
                        }
                    }))

                    await installProcess.exit;
                    setRun(true);

                    if (runProcess) {
                      runProcess.kill()
                    }
                    let tempRunProcess = await webContainer.spawn("npm", [ "start" ]);                

                    tempRunProcess.output.pipeTo(new WritableStream({
                        write(chunk) {
                          console.log(chunk)
                        }
                        
                    }))
                    setRunProcess(tempRunProcess)

                    webContainer.on('server-ready', (port, url) => {
                      // console.log(port, url)
                      toast.success(`Server is running on ${port}`)
                      setIframUrl(url)
                    })
                  } catch (error) {
                    console.error("Error running npm install or start:", error);
                  }finally {
                    setIsInstalling(false);
                  }
                }}
                disabled={isInstalling}
                className={`p-2 px-6 mt-5 mr-5 bg-slate-900 text-white ${isInstalling ? "cursor-not-allowed" : ""}`}
              >
                {isInstalling ? "Installing..." : run ? "Run" : "Build"}
              </button>
            </div>
          </div>
          
          
          <div className="bottom flex flex-grow max-w-full shrink overflow-auto">
            { fileTree &&
              fileTree[ currentFile ] && (
                <div className="code-editor-area h-full overflow-auto flex-grow bg-slate-50">
                  <pre
                      className="hljs h-full">
                      <code
                          className="hljs h-full outline-none"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                              const updatedContent = e.target.innerText;
                              const ft = {
                                  ...fileTree,
                                  [ currentFile ]: {
                                      file: {
                                        contents: updatedContent
                                      }
                                  }
                              }
                              setFileTree(ft)
                              saveFileTree(ft)
                              // saveFileTree(ft)
                          }}
                          dangerouslySetInnerHTML={{ __html: hljs.highlight(fileTree[ currentFile ].file?.contents , {language: "javascript", ignoreIllegals: true}).value }}
                          style={{
                              whiteSpace: 'pre-wrap',
                              paddingBottom: '25rem',
                              counterSet: 'line-numbering',
                          }}
                      />
                  </pre>
                </div>
              )
            }
          </div>
        </div>

        {iframeUrl && webContainer &&
          (<div className="flex min-w-96 flex-col h-full">
              <div className="address-bar">
                  <input type="text"
                    onChange={(e) => setIframUrl(e.target.value)}
                    value={iframeUrl} className="w-full p-2 px-4 bg-slate-200" />
              </div>
              <iframe src={iframeUrl} className="w-full h-full"></iframe>
          </div>)
        }


      </section>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md w-96 max-w-full relative">
            <header className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Select User</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2">
                <CircleX />
              </button>
            </header>
            <div className="users-list flex flex-col gap-2 mb-16 max-h-96 overflow-auto">
            {users?.map((user) => {
              // Check if the user is already in the project
              const isUserInProject = project.users.some(projectUser => projectUser._id === user._id);

              // If the user is already in the project, don't display them
              if (isUserInProject) {
                return null;
              }
            
              return (
                <div
                  key={user._id}
                  className={`user cursor-pointer hover:bg-slate-200 ${
                    Array.from(selectedUserId).includes(user._id) ? "bg-slate-200" : ""
                  } p-2 flex gap-2 items-center`}
                  onClick={() => selectedHandeler(user._id)}
                >
                  <img
                    src={user.profilePicture}
                    alt="profilePic"
                    className="w-14 h-14 rounded-full"
                    crossOrigin="anonymus"
                  />
                  <h1 className="font-semibold text-lg">{user?.userName || "User"}</h1>
                </div>
              );
            })}
              
            </div>
            <button
              onClick={addCollabrators}
              className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-blue-600 text-white rounded-md`}
            >
              Add Collaborators
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectPage;
