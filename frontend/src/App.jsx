import React, { useState } from 'react';

function App() {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'jd'

  // --- PROJECT POPUP STATE ---
  const [selectedProject, setSelectedProject] = useState(null);

  const projectsData = {
    "DPI Engine": {
      title: "Deep Packet Inspection Engine",
      description: "A high-performance packet inspection and network analysis engine built for monitoring and parsing network traffic securely and efficiently.",
      tech: ["C++17", "Networking", "Sockets","Multithreading"],
      github: "https://github.com/kartiktomar03/deep_packet_inspection"
    },
    "Sentimental Analyzer": {
      title: "Sentimental Analyzer",
      description: "An AI-powered application utilizing Python and Streamlit to evaluate and analyze public reactions and sentiments toward government policies.",
      tech: ["Python", "Streamlit", "NLP", "Machine Learning"],
      github: "https://github.com/your-username/sentimental-analyzer"
    }
  };

  // --- CHAT STATE ---
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am Kartik\'s AI Agent. Ask me anything about his skills, projects, or experience.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // --- JD MATCHER STATE ---
  const [jdInput, setJdInput] = useState('');
  const [jdResult, setJdResult] = useState(null);
  const [isJdLoading, setIsJdLoading] = useState(false);

  // ==========================================
  // API CALL: CHAT WITH HR (Streaming)
  // ==========================================
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { role: 'user', content: chatInput };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch('https://hiremeai-backend-hd69.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg.content })
      });

      if (!response.body) throw new Error("No stream found");

      setIsChatLoading(false);
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            content: newMessages[lastIndex].content + chunk
          };
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat API Error:", error);
      setIsChatLoading(false);
      setMessages((prev) => [...prev, { role: 'assistant', content: "Oops! Backend is not running." }]);
    }
  };

  // ==========================================
  // API CALL: JD MATCHER
  // ==========================================
  const handleEvaluateJd = async () => {
    if (!jdInput.trim()) return;
    setIsJdLoading(true);
    setJdResult(null);

    try {
      const response = await fetch('https://hiremeai-backend-hd69.onrender.com/evaluate-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_description: jdInput })
      });
      const data = await response.json();
      setJdResult(data);
    } catch (error) {
      console.error("JD Matcher Error:", error);
      alert("Error connecting to backend!");
    } finally {
      setIsJdLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-cover bg-center flex flex-col justify-between overflow-hidden relative font-sans" 
         style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')" }}>
      
      {/* Top Menu Bar */}
      <div className="w-full h-8 backdrop-blur-md bg-white/20 text-white flex items-center px-4 text-sm font-semibold shadow-sm z-50">
        <span className="mr-6 cursor-pointer hover:text-gray-200"></span>
        <span className="mr-4 cursor-pointer hover:text-gray-200 font-bold">Kartik's Portfolio</span>
        <span className="mr-4 cursor-pointer hover:text-gray-200" onClick={() => setSelectedProject(projectsData["DPI Engine"])}>Projects</span>
        
        {/* CONTACT LINK (Opens Mail Client) */}
        <a 
          href="mailto:kartiktomar3405@gmail.com?subject=Inquiry from Portfolio&body=Hi Kartik, I saw your portfolio and wanted to connect with you." 
          className="mr-4 cursor-pointer hover:text-gray-200 text-white no-underline"
        >
          Contact
        </a>

        {/* RESUME LINK */}
        <a 
          href="/kartik_tomar_resume.pdf" 
          target="_blank" 
          rel="noopener noreferrer"
          className="cursor-pointer hover:text-gray-200 text-white no-underline"
        >
          Resume
        </a>
      </div>

      {/* Desktop Folders */}
      <div className="absolute top-16 left-6 flex flex-col gap-6 z-10">
        
        {/* Project 1: DPI Engine */}
        <div 
          className="flex flex-col items-center cursor-pointer group w-24"
          onClick={() => setSelectedProject(projectsData["DPI Engine"])}
        >
          <div className="text-5xl drop-shadow-md group-hover:scale-110 transition-transform">📁</div>
          <span className="text-white text-xs mt-1 font-medium bg-black/30 px-2 py-1 rounded shadow-sm text-center leading-tight">DPI Engine</span>
        </div>

        {/* Project 2: Sentimental Analyzer */}
        <div 
          className="flex flex-col items-center cursor-pointer group w-24"
          onClick={() => setSelectedProject(projectsData["Sentimental Analyzer"])}
        >
          <div className="text-5xl drop-shadow-md group-hover:scale-110 transition-transform">📁</div>
          <span className="text-white text-xs mt-1 font-medium bg-black/30 px-2 py-1 rounded shadow-sm text-center leading-tight">Sentimental Analyzer</span>
        </div>

        {/* Resume PDF */}
        <a 
          href="/kartik_tomar_resume.pdf" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex flex-col items-center cursor-pointer group w-24 mt-4"
        >
          <div className="text-5xl drop-shadow-md group-hover:scale-110 transition-transform">📄</div>
          <span className="text-white text-xs mt-1 font-medium bg-black/30 px-2 py-1 rounded shadow-sm text-center leading-tight">Resume.pdf</span>
        </a>

      </div>

      {/* Main Desktop Area */}
      <div className="flex-grow flex items-center justify-center z-0">
        <div className="text-center">
          <p className="text-white text-xl mb-2 font-light drop-shadow-md">Hey, I'm Kartik! welcome to my</p>
          <h1 className="text-white text-7xl font-bold tracking-wider drop-shadow-2xl" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>PORTFOLIO</h1>
        </div>
      </div>

      {/* PROJECT DETAILS POPUP MODAL */}
      {selectedProject && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] bg-white/95 backdrop-blur-2xl rounded-xl shadow-2xl border border-white/40 flex flex-col z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="h-10 bg-gray-100/90 border-b border-gray-200 flex items-center px-4 relative shrink-0">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 cursor-pointer hover:bg-red-600 shadow-sm" onClick={() => setSelectedProject(null)}></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm"></div>
              <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2 text-gray-700 font-semibold text-sm">
              📁 {selectedProject.title}
            </div>
          </div>
          <div className="p-6 flex flex-col gap-4">
            <p className="text-gray-700 text-sm leading-relaxed">{selectedProject.description}</p>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Tech Stack</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedProject.tech.map((t, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-xs font-semibold">{t}</span>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setSelectedProject(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors">
                Close
              </button>
              <a 
                href={selectedProject.github} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-black transition-colors flex items-center gap-2 shadow-md"
              >
                <span>🔗 View on GitHub</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* AI AGENT WINDOW */}
      {isAiOpen && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[650px] h-[550px] bg-white/95 backdrop-blur-2xl rounded-xl shadow-2xl border border-white/40 flex flex-col z-50 overflow-hidden">
          
          <div className="h-10 bg-gray-100/90 border-b border-gray-200 flex items-center px-4 relative shrink-0">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 cursor-pointer hover:bg-red-600 shadow-sm" onClick={() => setIsAiOpen(false)}></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm"></div>
              <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2 text-gray-700 font-semibold text-sm">
              ✨ AI Agent Dashboard
            </div>
          </div>

          <div className="flex bg-gray-50 border-b border-gray-200 shrink-0">
            <button className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'chat' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('chat')}>
              💬 Chat with HR
            </button>
            <button className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'jd' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('jd')}>
              🎯 JD Matcher
            </button>
          </div>

          <div className="flex-1 overflow-hidden bg-gray-50/50 flex flex-col">
            {activeTab === 'chat' && (
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 text-gray-500 text-sm p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                        <span className="animate-bounce">●</span><span className="animate-bounce delay-100">●</span><span className="animate-bounce delay-200">●</span>
                      </div>
                    </div>
                  )}
                </div>
                <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 flex gap-2 shrink-0 relative z-50">
                  <input 
                    type="text" 
                    value={chatInput} 
                    onChange={(e) => setChatInput(e.target.value)} 
                    placeholder="Ask about Kartik..." 
                    className="flex-1 bg-gray-100 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <button type="submit" disabled={isChatLoading} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors">
                    Send
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'jd' && (
              <div className="flex flex-col h-full p-6 overflow-y-auto">
                <p className="text-gray-600 text-sm mb-2 font-medium">Paste the Job Description here:</p>
                <textarea 
                  className="w-full h-32 bg-white border border-gray-300 rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none shadow-inner" 
                  placeholder="e.g. We are looking for a Python developer with React experience..."
                  value={jdInput}
                  onChange={(e) => setJdInput(e.target.value)}
                ></textarea>
                
                <button onClick={handleEvaluateJd} disabled={isJdLoading || !jdInput.trim()} className="mt-4 bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md">
                  {isJdLoading ? 'Analyzing Fit...' : 'Evaluate Match'}
                </button>

                {jdResult && (
                  <div className="mt-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-800">Match Score</h3>
                      <div className={`text-xl font-black ${jdResult.match_percentage >= 70 ? 'text-green-500' : jdResult.match_percentage >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {jdResult.match_percentage}%
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 font-bold mb-1 uppercase tracking-wider">Matching Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {jdResult.matching_skills?.map((skill, i) => (
                          <span key={i} className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">{skill}</span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-gray-500 font-bold mb-1 uppercase tracking-wider">Missing Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {jdResult.missing_skills?.map((skill, i) => (
                          <span key={i} className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-semibold">{skill}</span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 italic border-l-4 border-blue-500">
                      "{jdResult.evaluation_summary}"
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* THE DOCK */}
      {!isAiOpen && (
        <div className="w-full flex justify-center pb-4 z-50 transition-all duration-300">
          <div className="backdrop-blur-xl bg-white/30 rounded-2xl px-4 py-2 flex gap-4 shadow-2xl border border-white/20">
            <div className="w-12 h-12 bg-white/80 rounded-xl flex items-center justify-center cursor-pointer hover:-translate-y-2 transition-transform text-2xl shadow-sm" title="Projects">📁</div>
            <div className="w-12 h-12 bg-white/80 rounded-xl flex items-center justify-center cursor-pointer hover:-translate-y-2 transition-transform text-2xl shadow-sm" title="Browser">🌐</div>
            <div 
              className="h-12 bg-blue-500 rounded-xl flex items-center justify-center cursor-pointer hover:-translate-y-2 transition-transform text-white font-bold px-4 shadow-lg border border-blue-400" 
              title="Ask AI"
              onClick={() => setIsAiOpen(true)}
            >
              ✨ Ask Me
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

export default App;