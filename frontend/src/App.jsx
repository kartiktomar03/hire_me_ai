import React, { useState } from 'react';

function App() {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'jd'

  // --- PROJECT POPUP STATE ---
  const [selectedProject, setSelectedProject] = useState(null);

  // Three project folders shown on the desktop.
  const projectsData = {
    "ResearchLab": {
      title: "ResearchLab — AI Research Paper Assistant",
      description: "An AI-powered research assistant for PDF analysis, table and figure extraction, evidence-grounded Q&A, streaming summaries, and comparison across 2–5 research papers.",
      tech: ["Python", "Flask", "RAG", "Qdrant", "Groq API", "PyMuPDF"],
      github: "https://github.com/kartiktomar03/Research-Paper-Assistant"
    },
    "DPI Engine": {
      title: "Deep Packet Inspection & Filtering Engine",
      description: "A C++17 network traffic analysis and filtering engine with Ethernet/IPv4/TCP/UDP parsing, multithreaded processing, stateful flow tracking, and TLS SNI inspection.",
      tech: ["C++17", "TCP/IP", "PCAP", "Multithreading", "POSIX Threads"],
      github: "https://github.com/kartiktomar03/deep_packet_inspection"
    },
    "HireMe AI": {
      title: "HireMe AI — Interactive AI-Powered Portfolio",
      description: "A macOS-inspired portfolio featuring a streaming conversational AI HR agent, job-description matching, and resume-powered context via a React and FastAPI stack.",
      tech: ["React", "FastAPI", "Groq API", "Python", "PyPDF", "Tailwind CSS"],
      github: "https://github.com/kartiktomar03/hire_me_ai"
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
      
      {/* Subtle glass highlights without changing desktop layout */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-400/15 via-transparent to-indigo-950/20" />

      {/* Top Menu Bar */}
      <div className="w-full h-8 backdrop-blur-2xl bg-white/15 border-b border-white/30 text-white flex items-center px-4 text-sm font-semibold shadow-[0_4px_24px_rgba(15,23,42,0.10)] z-50">
        <span className="mr-6 cursor-pointer hover:text-gray-200"></span>
        <span className="mr-4 cursor-pointer hover:text-gray-200 font-bold">Kartik's Portfolio</span>
        <span className="mr-4 cursor-pointer hover:text-gray-200" onClick={() => setSelectedProject(projectsData["ResearchLab"])}>Projects</span>
        
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

      {/* Desktop Folders: same macOS desktop layout, three current projects */}
      <div className="absolute top-16 left-6 flex flex-col gap-5 z-10">
        {Object.entries(projectsData).map(([name, project]) => (
          <button
            key={name}
            type="button"
            className="flex flex-col items-center cursor-pointer group w-28 rounded-2xl p-2 bg-white/10 backdrop-blur-lg border border-white/20 shadow-[0_8px_30px_rgba(16,24,50,0.12)] hover:bg-white/20 hover:border-white/40 hover:-translate-y-1 transition-all duration-300"
            onClick={() => setSelectedProject(project)}
            aria-label={`Open ${name} project`}
          >
            <span className="text-5xl drop-shadow-lg group-hover:scale-110 transition-transform duration-300">📁</span>
            <span className="text-white text-xs mt-1 font-semibold bg-slate-900/40 backdrop-blur-xl border border-white/20 px-2 py-1 rounded-lg shadow-sm text-center leading-tight">
              {name}
            </span>
          </button>
        ))}

        {/* Resume PDF */}
        <a
          href="/kartik_tomar_resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center cursor-pointer group w-28 rounded-2xl p-2 bg-white/10 backdrop-blur-lg border border-white/20 shadow-[0_8px_30px_rgba(16,24,50,0.12)] hover:bg-white/20 hover:-translate-y-1 transition-all duration-300"
        >
          <span className="text-5xl drop-shadow-lg group-hover:scale-110 transition-transform duration-300">📄</span>
          <span className="text-white text-xs mt-1 font-semibold bg-slate-900/40 backdrop-blur-xl border border-white/20 px-2 py-1 rounded-lg shadow-sm text-center leading-tight">
            Resume.pdf
          </span>
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
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] max-w-[calc(100vw-24px)] bg-white/70 backdrop-blur-3xl rounded-2xl shadow-[0_24px_75px_rgba(15,23,42,0.35)] border border-white/70 flex flex-col z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="h-10 bg-white/35 backdrop-blur-xl border-b border-white/60 flex items-center px-4 relative shrink-0">
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
                  <span key={idx} className="bg-sky-100/70 backdrop-blur-md border border-white/75 text-blue-700 px-2.5 py-1 rounded-md text-xs font-semibold">{t}</span>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-white/60 flex justify-end gap-3">
              <button onClick={() => setSelectedProject(null)} className="px-4 py-2 bg-white/55 backdrop-blur-md border border-white/70 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors">
                Close
              </button>
              <a 
                href={selectedProject.github} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-slate-900/85 backdrop-blur-lg text-white rounded-lg text-sm font-semibold hover:bg-black transition-colors flex items-center gap-2 shadow-md"
              >
                <span>🔗 View on GitHub</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* AI AGENT WINDOW */}
      {isAiOpen && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[650px] max-w-[calc(100vw-24px)] h-[550px] max-h-[calc(100vh-70px)] bg-white/70 backdrop-blur-3xl rounded-2xl shadow-[0_24px_75px_rgba(15,23,42,0.35)] border border-white/70 flex flex-col z-50 overflow-hidden">
          
          <div className="h-10 bg-white/35 backdrop-blur-xl border-b border-white/60 flex items-center px-4 relative shrink-0">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 cursor-pointer hover:bg-red-600 shadow-sm" onClick={() => setIsAiOpen(false)}></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm"></div>
              <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2 text-gray-700 font-semibold text-sm">
              ✨ AI Agent Dashboard
            </div>
          </div>

          <div className="flex bg-white/25 backdrop-blur-lg border-b border-white/45 shrink-0">
            <button className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'chat' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('chat')}>
              💬 Chat with HR
            </button>
            <button className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'jd' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('jd')}>
              🎯 JD Matcher
            </button>
          </div>

          <div className="flex-1 overflow-hidden bg-white/10 flex flex-col">
            {activeTab === 'chat' && (
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-500/80 backdrop-blur-xl border border-white/30 text-white rounded-br-none' : 'bg-white/55 backdrop-blur-xl text-gray-800 border border-white/70 rounded-bl-none'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/55 backdrop-blur-xl border border-white/60 text-gray-500 text-sm p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                        <span className="animate-bounce">●</span><span className="animate-bounce delay-100">●</span><span className="animate-bounce delay-200">●</span>
                      </div>
                    </div>
                  )}
                </div>
                <form onSubmit={handleSendMessage} className="p-3 bg-white/30 backdrop-blur-xl border-t border-white/50 flex gap-2 shrink-0 relative z-50">
                  <input 
                    type="text" 
                    value={chatInput} 
                    onChange={(e) => setChatInput(e.target.value)} 
                    placeholder="Ask about Kartik..." 
                    className="flex-1 bg-white/55 backdrop-blur-lg border border-white/65 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <button type="submit" disabled={isChatLoading} className="bg-blue-500/85 backdrop-blur-lg border border-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors">
                    Send
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'jd' && (
              <div className="flex flex-col h-full p-6 overflow-y-auto">
                <p className="text-gray-600 text-sm mb-2 font-medium">Paste the Job Description here:</p>
                <textarea 
                  className="w-full h-32 bg-white/55 backdrop-blur-lg border border-white/60 rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none shadow-inner" 
                  placeholder="e.g. We are looking for a Python developer with React experience..."
                  value={jdInput}
                  onChange={(e) => setJdInput(e.target.value)}
                ></textarea>
                
                <button onClick={handleEvaluateJd} disabled={isJdLoading || !jdInput.trim()} className="mt-4 bg-blue-600/85 backdrop-blur-lg border border-white/25 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md">
                  {isJdLoading ? 'Analyzing Fit...' : 'Evaluate Match'}
                </button>

                {jdResult && (
                  <div className="mt-6 bg-white/55 backdrop-blur-xl p-4 rounded-xl border border-white/70 shadow-sm">
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

                    <div className="bg-white/40 backdrop-blur-lg p-3 rounded-lg text-sm text-gray-700 italic border-l-4 border-blue-500">
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
          <div className="backdrop-blur-3xl bg-white/20 rounded-2xl px-4 py-2 flex gap-4 shadow-[0_16px_42px_rgba(15,23,42,0.3)] border border-white/45">
            <button type="button" onClick={() => setSelectedProject(projectsData["ResearchLab"])} className="w-12 h-12 bg-white/55 backdrop-blur-xl border border-white/60 rounded-xl flex items-center justify-center cursor-pointer hover:-translate-y-2 transition-transform text-2xl shadow-sm" title="Projects">📁</button>
            <div className="w-12 h-12 bg-white/55 backdrop-blur-xl border border-white/60 rounded-xl flex items-center justify-center cursor-pointer hover:-translate-y-2 transition-transform text-2xl shadow-sm" title="Browser">🌐</div>
            <div 
              className="h-12 bg-blue-500/85 backdrop-blur-xl rounded-xl flex items-center justify-center cursor-pointer hover:-translate-y-2 transition-transform text-white font-bold px-4 shadow-lg border border-blue-400" 
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