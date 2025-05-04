import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import LoginSignupForm from './components/Login';
import Home from './components/Home';
import Navbar from './components/Navbar';
import CreateProfile from './components/CreateProfile';
import EditProfile from './components/EditProfile';
import ChatPage from './components/ChatPage';
import ProfilePage from './components/ProfilePage';
import Quiz from './components/Quiz';
import Projects from './components/Projects';
import ProjectPage from './components/ProjectPage';
import UserAuth from './auth/UserAuth';
import { ChatProvider } from './auth/ChatProvider';

// This component runs *inside* <Router>
const AppContent = () => {
  const location = useLocation();
  const showNavbar = location.pathname !== '/';
  const withMargin = showNavbar;

  return (
    <>
      {showNavbar && <Navbar />}
      <div className={withMargin ? "mt-12 sm:mt-[70px] md:mt-[70px] lg:mt-[70px]" : ""}>
        <ChatProvider>
          <Routes>
            <Route path="/" element={<LoginSignupForm />} />
            <Route path="/home" element={<UserAuth><Home /></UserAuth>} />
            <Route path="/profile/create" element={<UserAuth><CreateProfile /></UserAuth>} />
            <Route path="/profile/edit" element={<UserAuth><EditProfile /></UserAuth>} />
            <Route path="/render/chat/:id" element={<UserAuth><ChatPage /></UserAuth>} />
            <Route path="/view/:id/profile" element={<UserAuth><ProfilePage /></UserAuth>} />
            <Route path="/quiz" element={<UserAuth><Quiz /></UserAuth>} />
            <Route path="/projects" element={<UserAuth><Projects /></UserAuth>} />
            <Route path="/project/:id" element={<UserAuth><ProjectPage /></UserAuth>} />
            <Route path="/chat/*" element={<ChatPage />} />
            <Route path="*" element={<Navigate to="/chat" replace />} />

          </Routes>
        </ChatProvider>
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
