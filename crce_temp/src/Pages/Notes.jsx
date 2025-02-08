import React, { useState, useEffect } from "react";
import axios from "axios";
import { PenLine, RefreshCw, Save, Wifi, WifiOff, Plus } from "lucide-react";

export default function NotesApp() {
  const [username, setUsername] = useState("testUser");
  const [header, setHeader] = useState("");
  const [text, setText] = useState("");
  const [notes, setNotes] = useState([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchNotes();
    loadOfflineNotes();
    window.addEventListener("online", syncOfflineNotes);
    window.addEventListener("offline", () => setIsOffline(true));

    return () => {
      window.removeEventListener("online", syncOfflineNotes);
      window.removeEventListener("offline", () => setIsOffline(true));
    };
  }, []);

  const fetchNotes = async () => {
    if (!navigator.onLine) return;
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/notes-find?username=${username}`);
      setNotes(response.data);
      localStorage.setItem("notes", JSON.stringify(response.data));
    } catch (error) {
      console.error("Error fetching notes", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewNote = async () => {
    if (!header || !text) return;
    
    const newNote = { username, header, text, createdAt: new Date() };
    
    if (navigator.onLine) {
      try {
        await axios.post("http://localhost:3000/notes", newNote);
        fetchNotes();
      } catch (error) {
        console.error("Error saving note", error);
      }
    } else {
      storeOfflineNote(newNote);
      setIsOffline(true);
      setNotes([...notes, newNote]);
    }

    setHeader("");
    setText("");
  };

  const storeOfflineNote = (note) => {
    const offlineNotes = JSON.parse(localStorage.getItem("offlineNotes")) || [];
    offlineNotes.push(note);
    localStorage.setItem("offlineNotes", JSON.stringify(offlineNotes));
  };

  const syncOfflineNotes = async () => {
    setIsOffline(false);
    const offlineNotes = JSON.parse(localStorage.getItem("offlineNotes")) || [];
    
    for (const note of offlineNotes) {
      try {
        await axios.post("http://localhost:3000/notes", note);
      } catch (error) {
        console.error("Error syncing note", error);
        return;
      }
    }

    localStorage.removeItem("offlineNotes");
    fetchNotes();
  };

  const loadOfflineNotes = () => {
    const storedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    setNotes(storedNotes);
  };

  const getRandomColor = () => {
    const colors = [
      'bg-blue-100',
      'bg-purple-100',
      'bg-pink-100',
      'bg-green-100',
      'bg-yellow-100',
      'bg-indigo-100'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between bg-white rounded-lg shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center gap-2">
            <PenLine className="w-6 h-6 text-purple-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Notes App
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {isOffline ? (
              <WifiOff className="w-5 h-5 text-red-500" />
            ) : (
              <Wifi className="w-5 h-5 text-green-500" />
            )}
            <span className="text-sm text-gray-500">
              {isOffline ? "Offline" : "Online"}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 space-y-4 transition-all duration-300 hover:shadow-xl">
          <input
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
            value={header}
            onChange={(e) => setHeader(e.target.value)}
            placeholder="Note Title"
          />
          <textarea
            className="w-full p-3 border border-gray-200 rounded-lg h-32 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200 resize-none"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start typing..."
          />
          <div className="flex justify-between gap-4">
            <button
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all duration-200 disabled:opacity-50"
              onClick={handleNewNote}
              disabled={!header || !text}
            >
              <Save className="w-4 h-4" />
              Save Note
            </button>
            <button
              className={`px-4 py-2 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition-all duration-200 ${
                isLoading ? "animate-spin" : ""
              }`}
              onClick={fetchNotes}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700 px-2">Previous Notes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {notes.map((note, index) => (
              <div
                key={index}
                className={`${getRandomColor()} aspect-square p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group relative`}
              >
                <div className="h-full flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">{note.header}</h3>
                  <p className="text-gray-600 mb-4 overflow-hidden line-clamp-4 flex-grow">{note.text}</p>
                  <div className="text-xs text-gray-400 mt-auto">
                    <time>{new Date(note.createdAt).toLocaleString()}</time>
                  </div>
                </div>
                <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="p-4 text-center">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{note.header}</h3>
                    <p className="text-gray-600">{note.text}</p>
                  </div>
                </div>
              </div>
            ))}
            {notes.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No notes yet. Start by creating one!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}