import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import axios from '../config/axios';
import { initializeSocket, sendMessage, receiveMessage } from '../config/socket';
import { UserContext } from '../context/user.context';
import Markdown from 'markdown-to-jsx';

// Syntax highlighting component using highlight.js
function SyntaxHighLightedCode(props) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && props.className?.includes('lang-') && window.hljs) {
      window.hljs.highlightElement(ref.current);
      ref.current.removeAttribute('data-highlighted');
    }
  }, [props.className, props.children]);

  return (
    <code
      {...props}
      ref={ref}
      style={{
        backgroundColor: '#1e1e1e',
        color: '#f8f8f2',
        padding: '0.5rem',
        borderRadius: '0.5rem',
        display: 'block',
        overflowX: 'auto',
      }}
    />
  );
}

const Proj = () => {
  const location = useLocation();
  const { id: projectId } = useParams();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState([]);
  const [project, setProject] = useState(null);
  const [message, setMessage] = useState('');
  const { user } = useContext(UserContext);
  const messageBox = useRef(null);
  const [messages, setMessages] = useState([]);
  const [fileTree ,setFileTree] = useState({
    "app.js": {
      content :`const express = require('express');`
    },
    "package.json": {
      content : `{
      "name":"temp-server",
      }`
    }

  });
  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([])


  const handleUserSelect = (id) => {
    setSelectedUserId((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };

  const addCollaborators = () => {
    if (!projectId) return;

    axios
      .put('/projects/add-user', {
        projectId,
        users: selectedUserId,
      })
      .then((res) => {
        console.log('Collaborators added:', res.data);

        // Update project users immediately
        if (res.data.project) {
          setProject(res.data.project);
        } else {
          // fallback: fetch project again
          axios.get(`/projects/get-project/${projectId}`)
            .then((res) => setProject(res.data.project))
            .catch(console.error);
        }

        setIsModalOpen(false);
        setSelectedUserId([]);
      })
      .catch((err) => {
        console.error('Error adding collaborators:', err);
      });
  };

  const send = () => {
    if (!user || !user._id) {
      console.error('User not available');
      return;
    }
    console.log("Sending message:", message);

    const msgObj = {
      message,
      sender: user,
    };

    sendMessage('project-message', msgObj);
    setMessages((prevMessages) => [...prevMessages, msgObj]);
    setMessage('');
  };

  function WriteAiMessage({ message }) {
    let content = '';

    if (typeof message === 'string') {
      content = message;
    } else if (typeof message === 'object' && message !== null) {
      content = message.text || JSON.stringify(message);
    } else {
      content = String(message);
    }

    return (
      <div className="overflow-auto bg-black text-amber-50 p-2 rounded-2xl">
        <Markdown
          className="text-sm"
          options={{
            overrides: {
              code: {
                component: SyntaxHighLightedCode,
              },
            },
          }}
        >
          {content}
        </Markdown>
      </div>
    );
  }

  useEffect(() => {
    if (!projectId) return;

    let socket;
    let messageHandler;

    axios
      .get(`/projects/get-project/${projectId}`)
      .then((res) => {
        const fetchedProject = res.data.project;
        setProject(fetchedProject);

        socket = initializeSocket(fetchedProject._id);

        messageHandler = (data) => {
          console.log("Received message:", data.message);

          let msgText = data.message;
          if (typeof data.message === 'object' && data.message !== null && 'text' in data.message) {
            msgText = data.message.text;
          }
          const newMsg = {
            ...data,
            message: msgText,
          };
          setMessages((prevMessages) => [...prevMessages, newMsg]);
        };

        receiveMessage('project-message', messageHandler);
      })
      .catch((err) => {
        console.error('Failed to fetch project:', err);
      });

    axios
      .get('/users/all')
      .then((res) => {
        setUsers(res.data.users);
      })
      .catch((err) => {
        console.error(err);
      });

    return () => {
      if (socket && messageHandler) {
        socket.off('project-message', messageHandler);
      }
    };
  }, [projectId]);

  useEffect(() => {
    if (messageBox.current) {
      messageBox.current.scrollTop = messageBox.current.scrollHeight;
    }
  }, [messages]);

  return (


    <main className="h-screen w-screen flex overflow-hidden">
  <section className="left h-full min-w-80 flex flex-col bg-amber-100 overflow-hidden">
    <header className="flex justify-between items-center p-2 px-4 w-full bg-slate-300">
      <button onClick={() => setIsModalOpen(true)} className="flex gap-2 items-center">
        <i className="ri-add-line text-lg"></i>
        <span>Add Collaborators</span>
      </button>
      <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className="p-2">
        <i className="ri-group-fill"></i>
      </button>
    </header>

    <div className="conversation-area flex-grow flex flex-col min-h-0">
      <div
        ref={messageBox}
        className="flex-1 overflow-y-auto p-4 gap-2 flex flex-col bg-amber-100"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message max-w-56 w-fit p-2 rounded-md flex flex-col overflow-hidden ${
              msg.sender?._id === user._id
                ? 'ml-auto bg-amber-200'
                : msg.sender?._id === 'ai'
                ? 'bg-purple-100 max-w-72'
                : 'bg-amber-200 max-w-54'
            }`}
          >
            <small className="opacity-65 text-xs">{msg.sender?.email || 'Unknown'}</small>
            {msg.sender?._id === 'ai' ? (
              <WriteAiMessage message={msg.message} />
            ) : (
              <p className="text-sm">{msg.message}</p>
            )}
          </div>
        ))}
      </div>

      <div className="inputField sticky bottom-0 w-full flex bg-white p-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter message"
          className="flex-grow border rounded-md px-3 py-2 outline-none"
        />
        <button
          onClick={send}
          className={`ml-2 px-4 py-2 rounded-md transition text-white ${
            message.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
          disabled={!message.trim()}
        >
          <i className="ri-send-plane-fill"></i>
        </button>
      </div>
    </div>

    <div
      className={`sidepanel fixed top-0 left-0 h-full bg-slate-200 z-50 transition-transform duration-300 transform ${
        isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'
      } w-60 sm:w-72 md:w-80`}
    >
      <header className="flex justify-end p-2 px-3 bg-slate-400">
        <button onClick={() => setIsSidePanelOpen(false)}>
          <i className="ri-close-line"></i>
        </button>
      </header>

      <div className="users flex flex-col p-2 gap-2 overflow-y-auto h-full">
        {project?.users?.map((user) => (
          <div
            key={user._id}
            className="user cursor-pointer hover:bg-slate-400 flex gap-3 items-center p-2 rounded-md"
          >
            <div className="rounded-full flex items-center justify-center w-10 h-10 bg-slate-400 text-white">
              <i className="ri-user-fill text-lg"></i>
            </div>
            <h1 className="font-semibold text-sm sm:text-base truncate">{user.email}</h1>
          </div>
        ))}
      </div>
    </div>
  </section>

  <section className="right bg-red-50 flex-grow h-full flex overflow-auto">
    <div className="explorer h-full max-w-64 min-w-52 bg-slate-200">
      <div className="file-tree w-full">
        {Object.keys(fileTree).map((file, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentFile(file);
              setOpenFiles([...new Set([...openFiles, file])]);
            }}
            className="tree-element cursor-pointer p-2 px-4 flex"
          >
            <p className="font-semibold text-lg">{file}</p>
          </button>
        ))}
      </div>
    </div>

    <div className="code-editor flex-grow overflow-auto">
      <div className="top">
        <div className="files flex">
          {openFiles.map((file, index) => (
            <button
              key={index}
              onClick={() => setCurrentFile(file)}
              className={`open-file cursor-pointer p-2 px-4 flex items-center w-fit gap-2 bg-slate-300 ${
                currentFile === file ? 'bg-slate-400' : ''
              }`}
            >
              <p className="font-semibold text-lg">{file}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  </section>

  {isModalOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md mx-4 p-4 relative">
        <button onClick={() => setIsModalOpen(false)} className="absolute top-2 right-3 text-xl">
          <i className="ri-close-line"></i>
        </button>
        <h2 className="text-xl font-semibold mb-4">Select Collaborators</h2>
        <div className="users flex flex-col gap-2 max-h-64 overflow-y-auto">
          {users.map((user) => (
            <div
              key={user._id}
              onClick={() => handleUserSelect(user._id)}
              className={`user cursor-pointer hover:bg-slate-200 flex gap-3 items-center p-2 rounded-md ${
                selectedUserId.includes(user._id) ? 'bg-slate-300' : ''
              }`}
            >
              <div className="rounded-full flex items-center justify-center w-10 h-10 bg-slate-600 text-white">
                <i className="ri-user-fill text-lg"></i>
              </div>
              <span className="text-base font-medium">{user.email}</span>
            </div>
          ))}
        </div>
        <button
          onClick={addCollaborators}
          className="mt-4 w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
        >
          Done
        </button>
      </div>
    </div>
  )}
</main>
  );
};

export default Proj;
