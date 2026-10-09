import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import {
  Search,
  Bot,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";

const AISidebar = ({ currentChat, setCurrentChat, setMessages }) => {
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  const [menuOpen, setMenuOpen] = useState(null);

  const [editingId, setEditingId] = useState(null);

  const [editedTitle, setEditedTitle] = useState("");

  const menuRef = useRef(null);

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(conversations);
      return;
    }

    setFiltered(
      conversations.filter((chat) =>
        chat.title.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, conversations]);

  useEffect(() => {
    const closeMenu = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(null);
      }
    };

    document.addEventListener("mousedown", closeMenu);

    return () =>
      document.removeEventListener("mousedown", closeMenu);
  }, []);

  const loadChats = async () => {
    try {
      const { data } = await api.get("/chat");

      setConversations(data || []);
      setFiltered(data || []);
    } catch (err) {
      console.log(err);

      setConversations([]);
      setFiltered([]);
    }

    setLoading(false);
  };

  const openConversation = async (id) => {
    try {
      setCurrentChat(id);

      const { data } = await api.get(`/chat/${id}`);

      setMessages(data.messages || []);
    } catch (err) {
      console.log(err);
    }
  };

  const renameConversation = async (id) => {
    if (!editedTitle.trim()) return;

    try {
      await api.patch(`/chat/${id}`, {
        title: editedTitle,
      });

      setEditingId(null);

      loadChats();
    } catch (err) {
      console.log(err);
    }
  };

  const deleteConversation = async (id) => {
    try {
      await api.delete(`/chat/${id}`);

      loadChats();

      if (currentChat === id) {
        setCurrentChat(null);
        setMessages([]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <aside className="w-[300px] bg-[#08111f] border-r border-slate-800 flex flex-col h-screen">

      {/* Logo */}

      <div className="px-6 pt-8 pb-6">

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-2xl bg-cyan-500 flex items-center justify-center">

            <Bot size={24} className="text-white" />

          </div>

          <div>

            <h2 className="text-white font-bold text-xl">

              FinMetrics AI

            </h2>

            <p className="text-slate-400 text-sm">

              Financial Assistant

            </p>

          </div>

        </div>

        {/* Search */}

        <div className="relative mt-7">

          <Search
            size={18}
            className="absolute left-4 top-3 text-slate-500"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversation..."
            className="w-full bg-[#111827] border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white outline-none focus:border-cyan-500"
          />

        </div>

      </div>

      {/* Conversation List */}

      <div className="flex-1 overflow-y-auto px-3 pb-5">

        {loading && (
          <div className="flex justify-center mt-16">

            <Loader2
              className="animate-spin text-cyan-400"
              size={24}
            />

          </div>
        )}

        {!loading && filtered.length === 0 && (

          <div className="mt-24 text-center">

            <MessageSquare
              className="mx-auto text-slate-600"
              size={46}
            />

            <p className="text-slate-400 mt-5">

              No conversations yet

            </p>

            <p className="text-slate-600 text-sm mt-2">

              Start chatting to create one.

            </p>

          </div>

        )}

        {!loading &&
          filtered.map((chat) => (

            <div
              key={chat._id}
              className={`group relative rounded-xl px-3 py-3 mb-2 cursor-pointer transition

              ${
                currentChat === chat._id
                  ? "bg-cyan-500/20 border border-cyan-500"
                  : "hover:bg-slate-800"
              }`}
              onClick={() => openConversation(chat._id)}
            >

              <div className="flex items-center gap-3">

                <MessageSquare
                  size={17}
                  className="text-cyan-400"
                />

                {editingId === chat._id ? (
                  <input
                    autoFocus
                    value={editedTitle}
                    onChange={(e) =>
                      setEditedTitle(e.target.value)
                    }
                    onBlur={() =>
                      renameConversation(chat._id)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        renameConversation(chat._id);
                      }
                    }}
                    className="bg-transparent text-white text-sm outline-none flex-1"
                  />
                ) : (
                  <span
                    className="text-sm text-white truncate flex-1"
                    title={chat.title}
                  >
                    {chat.title}
                  </span>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(
                      menuOpen === chat._id
                        ? null
                        : chat._id
                    );
                  }}
                  className="opacity-0 group-hover:opacity-100 transition"
                >

                  <MoreHorizontal
                    size={17}
                    className="text-slate-400"
                  />

                </button>

              </div>
                            {menuOpen === chat._id && (
                <div
                  ref={menuRef}
                  className="absolute right-3 top-12 z-20 w-44 rounded-xl border border-slate-700 bg-[#111827] shadow-2xl overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      setEditingId(chat._id);
                      setEditedTitle(chat.title);
                      setMenuOpen(null);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-slate-700 transition"
                  >
                    <Pencil size={16} />
                    Rename
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(null);
                      deleteConversation(chat._id);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Footer */}

      <div className="border-t border-slate-800 px-5 py-4">
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-full bg-cyan-500 flex items-center justify-center text-white font-semibold">
              FM
            </div>

            <div className="flex-1 overflow-hidden">

              <p className="text-white text-sm font-medium truncate">
                FinMetrics AI
              </p>

              <p className="text-xs text-slate-400">
                Smart Financial Assistant
              </p>

            </div>

          </div>

        </div>
      </div>

    </aside>
  );
};

export default AISidebar;