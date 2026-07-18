import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Tag as TagIcon, 
  Folder as FolderIcon, 
  Trash2, 
  Edit3, 
  Calendar, 
  Clock, 
  BookOpen, 
  Filter, 
  X, 
  Check, 
  Download, 
  Upload, 
  Layers, 
  Info, 
  Sparkles, 
  Undo2,
  Bookmark,
  ChevronRight,
  Code,
  LogOut,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Note } from './types';
import { initialNotes } from './data/initialNotes';
import CustomMarkdown from './components/CustomMarkdown';
import AuthScreen from './components/AuthScreen';

export default function App() {
  // --- Auth & Session State ---
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('savdir_current_user');
  });

  const [usersList, setUsersList] = useState<{ username: string; passwordHash: string }[]>(() => {
    const saved = localStorage.getItem('savdir_users');
    return saved ? JSON.parse(saved) : [];
  });

  // --- Core State (User isolated) ---
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string>('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // --- Note Creator/Editor State ---
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDetails, setEditDetails] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [customCategoryActive, setCustomCategoryActive] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');

  // --- UI Helpers ---
  const [showCheatsheet, setShowCheatsheet] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Show a quick notification toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Synchronize and Load User-Specific Notes
  useEffect(() => {
    if (currentUser) {
      const userNotesKey = `savdir_notes_${currentUser}`;
      let saved = localStorage.getItem(userNotesKey);
      
      // Automatic legacy migration to ensure NO data is lost
      if (!saved) {
        const legacyNotes = localStorage.getItem('savdir_notes') || localStorage.getItem('savdirlyb_notes');
        if (legacyNotes) {
          saved = legacyNotes;
          localStorage.setItem(userNotesKey, legacyNotes);
          triggerToast(`Migrated your existing learning notes to user account: ${currentUser}`);
        } else {
          saved = JSON.stringify(initialNotes);
          localStorage.setItem(userNotesKey, saved);
        }
      }

      try {
        const parsedNotes = JSON.parse(saved);
        setNotes(parsedNotes);
        if (parsedNotes.length > 0) {
          setSelectedNoteId(parsedNotes[0].id);
        } else {
          setSelectedNoteId('');
        }
      } catch (e) {
        console.error('Failed to parse user learning notes', e);
        setNotes(initialNotes);
        if (initialNotes.length > 0) {
          setSelectedNoteId(initialNotes[0].id);
        }
      }
    } else {
      setNotes([]);
      setSelectedNoteId('');
    }
  }, [currentUser]);

  // Save notes when notes state or active user updates
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`savdir_notes_${currentUser}`, JSON.stringify(notes));
    }
  }, [notes, currentUser]);

  // Persist registered users array to localStorage database
  useEffect(() => {
    localStorage.setItem('savdir_users', JSON.stringify(usersList));
  }, [usersList]);


  // --- Derived Calculations ---
  const allCategories = useMemo(() => {
    const categoriesSet = new Set<string>();
    notes.forEach(note => {
      if (note.category) {
        categoriesSet.add(note.category);
      }
    });
    return Array.from(categoriesSet).sort();
  }, [notes]);

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    notes.forEach(note => {
      note.tags.forEach(tag => {
        if (tag.trim() !== '') {
          tagsSet.add(tag);
        }
      });
    });
    return Array.from(tagsSet).sort();
  }, [notes]);

  // Combined notes filtering
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      // 1. Category Filter
      if (selectedCategory !== 'All' && note.category !== selectedCategory) {
        return false;
      }

      // 2. Multi-tag Filter (Note must contain ALL selected tags)
      if (selectedTags.length > 0) {
        const matchesAllTags = selectedTags.every(tag => note.tags.includes(tag));
        if (!matchesAllTags) return false;
      }

      // 3. Keyword Search (Title OR Details section)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesTitle = note.title.toLowerCase().includes(query);
        const matchesDetails = note.details.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDetails) return false;
      }

      return true;
    });
  }, [notes, selectedCategory, selectedTags, searchQuery]);

  // Currently viewed note object
  const currentNote = useMemo(() => {
    return notes.find(n => n.id === selectedNoteId) || null;
  }, [notes, selectedNoteId]);

  // Auto-select the first matching note if current is filtered out or doesn't exist
  useEffect(() => {
    if (filteredNotes.length > 0) {
      const isCurrentStillVisible = filteredNotes.some(n => n.id === selectedNoteId);
      if (!isCurrentStillVisible) {
        setSelectedNoteId(filteredNotes[0].id);
      }
    }
  }, [filteredNotes, selectedNoteId]);

  // --- CRUD Actions ---

  const handleStartCreate = () => {
    setIsCreating(true);
    setIsEditing(false);
    setEditTitle('');
    // Prefill category with the currently chosen tab, if it's not 'All'
    setEditCategory(selectedCategory !== 'All' ? selectedCategory : (allCategories[0] || 'General'));
    setEditDetails('');
    setEditTags([]);
    setNewTagInput('');
    setCustomCategoryActive(false);
    setCustomCategoryName('');
  };

  const handleStartEdit = (note: Note) => {
    setIsEditing(true);
    setIsCreating(false);
    setEditTitle(note.title);
    setEditCategory(note.category);
    setEditDetails(note.details);
    setEditTags([...note.tags]);
    setNewTagInput('');
    setCustomCategoryActive(false);
    setCustomCategoryName('');
  };

  const handleAddTagToForm = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTag = newTagInput.trim();
    if (cleanTag && !editTags.includes(cleanTag)) {
      setEditTags([...editTags, cleanTag]);
      setNewTagInput('');
    }
  };

  const handleRemoveTagFromForm = (tagToRemove: string) => {
    setEditTags(editTags.filter(t => t !== tagToRemove));
  };

  const handleSaveNote = () => {
    if (!editTitle.trim()) {
      triggerToast('Please provide a heading for your note.');
      return;
    }

    const finalCategory = customCategoryActive && customCategoryName.trim()
      ? customCategoryName.trim()
      : editCategory.trim() || 'General';

    const now = new Date().toISOString();

    if (isCreating) {
      const newNote: Note = {
        id: Date.now().toString(),
        title: editTitle.trim(),
        category: finalCategory,
        details: editDetails,
        tags: editTags,
        createdAt: now,
        updatedAt: now
      };
      const updatedNotes = [newNote, ...notes];
      setNotes(updatedNotes);
      setSelectedNoteId(newNote.id);
      setIsCreating(false);
      triggerToast('Note successfully added!');
    } else if (isEditing && currentNote) {
      const updatedNotes = notes.map(n => {
        if (n.id === currentNote.id) {
          return {
            ...n,
            title: editTitle.trim(),
            category: finalCategory,
            details: editDetails,
            tags: editTags,
            updatedAt: now
          };
        }
        return n;
      });
      setNotes(updatedNotes);
      setIsEditing(false);
      triggerToast('Note successfully updated!');
    }
  };

  const handleDeleteNote = (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this learning entry?')) {
      const remainingNotes = notes.filter(n => n.id !== noteId);
      setNotes(remainingNotes);
      triggerToast('Note deleted.');
      if (selectedNoteId === noteId) {
        if (remainingNotes.length > 0) {
          setSelectedNoteId(remainingNotes[0].id);
        } else {
          setSelectedNoteId('');
        }
      }
    }
  };

  const toggleTagFilter = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedTags([]);
  };

  // --- Import / Export / Session Actions ---
  const exportNotesAsJSON = () => {
    if (!currentUser) return;
    const userObj = usersList.find(u => u.username === currentUser);
    const passwordHash = userObj ? userObj.passwordHash : '';

    const backupData = {
      savdir_backup: true,
      username: currentUser,
      passwordHash: passwordHash,
      notes: notes
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `savdir_backup_${currentUser}_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast('Backup downloaded! Keep this file to instantly log in on other devices.');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement> | File) => {
    let file: File | null = null;
    if (e instanceof File) {
      file = e;
    } else {
      const files = e?.target?.files;
      if (files && files.length > 0) {
        file = files[0];
      }
    }

    if (!file) return;

    const fileReader = new FileReader();
    fileReader.readAsText(file, "UTF-8");
    fileReader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        
        // Scenario 1: Complete Workspace Backup File
        if (imported && imported.savdir_backup && imported.username) {
          const { username: impUser, passwordHash: impHash, notes: impNotes } = imported;
          
          // 1. Ensure the user exists in our local database
          const userExists = usersList.some(u => u.username === impUser);
          if (!userExists) {
            setUsersList(prev => [...prev, { username: impUser, passwordHash: impHash }]);
          } else {
            // Update password if it has changed
            setUsersList(prev => prev.map(u => u.username === impUser ? { ...u, passwordHash: impHash } : u));
          }

          // 2. Save notes directly under the imported user's key
          localStorage.setItem(`savdir_notes_${impUser}`, JSON.stringify(impNotes));

          // 3. Login as the imported user
          setCurrentUser(impUser);
          localStorage.setItem('savdir_current_user', impUser);
          
          triggerToast(`Profile "${impUser}" and ${impNotes.length} notes restored successfully!`);
          return;
        }

        // Scenario 2: Legacy or Plain Notes Array File
        if (Array.isArray(imported)) {
          const isValid = imported.every(n => n.id && n.title && typeof n.details === 'string');
          if (isValid) {
            if (currentUser) {
              setNotes(imported);
              if (imported.length > 0) {
                setSelectedNoteId(imported[0].id);
              }
              triggerToast(`Successfully imported ${imported.length} notes!`);
            } else {
              alert('Please create or log in to a user profile first to import notes.');
            }
          } else {
            alert('Invalid notes file format. Make sure it contains correct schema objects.');
          }
        } else {
          alert('File format not recognized. Make sure it is a valid SAVDIR backup file.');
        }
      } catch (error) {
        alert('Failed to parse JSON file.');
      }
    };

    // Reset input value so same file can be uploaded again if needed
    if (!(e instanceof File) && e?.target) {
      e.target.value = '';
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('savdir_current_user');
    triggerToast('Logged out of your learning session.');
  };

  // Format date helper
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans text-gray-900" id="auth-root-wrapper">
        {/* Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black text-white px-5 py-2 rounded-md shadow-lg text-xs font-semibold flex items-center gap-2"
              id="toast-notification"
            >
              <Sparkles size={14} className="text-gray-400" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AuthScreen
          onLoginSuccess={(username) => {
            setCurrentUser(username);
            localStorage.setItem('savdir_current_user', username);
          }}
          usersList={usersList}
          onRegisterUser={(username, hash) => {
            setUsersList(prev => [...prev, { username, passwordHash: hash }]);
          }}
          triggerToast={triggerToast}
          onImportBackup={handleImportJSON}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans text-gray-900" id="app-root">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black text-white px-5 py-2 rounded-md shadow-lg text-xs font-semibold flex items-center gap-2"
            id="toast-notification"
          >
            <Sparkles size={14} className="text-gray-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Elegant Header Section */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30" id="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
            
            {/* Branding */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-sm bg-black flex items-center justify-center text-white font-bold text-xs tracking-wider">
                  S
                </div>
                <div>
                  <h1 className="text-lg font-semibold font-display text-gray-900 tracking-tight flex items-center gap-2">
                    SAVDIR
                  </h1>
                  <p className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">Personal Learning Hub</p>
                </div>
              </div>
              
              {/* Quick Actions (Mobile layout alignment) */}
              <div className="flex items-center gap-2 md:hidden">
                <button
                  id="btn-new-note-mobile"
                  onClick={handleStartCreate}
                  className="p-2 bg-black text-white rounded-md hover:bg-gray-900 transition mr-1"
                >
                  <Plus size={18} />
                </button>
                <div 
                  className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-[10px] font-bold uppercase text-gray-700"
                  title={`Logged in as ${currentUser}`}
                >
                  {currentUser ? currentUser.slice(0, 2) : ''}
                </div>
                <button
                  id="btn-logout-mobile"
                  onClick={handleLogout}
                  className="p-2 hover:bg-gray-100 text-gray-400 hover:text-black rounded-md transition"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>

            {/* Quick Stats Bento bar */}
            <div className="hidden lg:flex items-center gap-4 bg-gray-50/50 px-4 py-1.5 rounded-md border border-gray-100" id="stats-dashboard">
              <div className="text-center px-2 border-r border-gray-100">
                <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Total Notes</p>
                <p className="text-xs font-bold text-gray-800">{notes.length}</p>
              </div>
              <div className="text-center px-2 border-r border-gray-100">
                <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Categories</p>
                <p className="text-xs font-bold text-gray-800">{allCategories.length}</p>
              </div>
              <div className="text-center px-2">
                <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Unique Tags</p>
                <p className="text-xs font-bold text-gray-800">{allTags.length}</p>
              </div>
            </div>

            {/* Search Input and Export/Import Actions */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <div className="relative flex-1 min-w-[200px] md:w-64">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="search-bar"
                  type="text"
                  placeholder="Search headings or details..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-transparent rounded-full text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    id="btn-clear-search"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Import/Export buttons */}
              <div className="flex gap-1">
                <button
                  id="btn-export-notes"
                  onClick={exportNotesAsJSON}
                  className="p-2 bg-white border border-gray-100 hover:bg-gray-50 text-gray-500 hover:text-black rounded-md text-xs font-semibold uppercase tracking-wider transition flex items-center gap-1.5"
                  title="Export Notes Database (JSON)"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Backup</span>
                </button>
                <button
                  id="btn-import-trigger"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-white border border-gray-100 hover:bg-gray-50 text-gray-500 hover:text-black rounded-md text-xs font-semibold uppercase tracking-wider transition flex items-center gap-1.5"
                  title="Import Notes Database (JSON)"
                >
                  <Upload size={14} />
                  <span className="hidden sm:inline">Restore</span>
                </button>
                <input
                  id="import-file-input"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportJSON}
                  accept=".json"
                  className="hidden"
                />
              </div>

              {/* Create New Note (Desktop) */}
              <button
                id="btn-new-note"
                onClick={handleStartCreate}
                className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-900 transition font-semibold text-xs uppercase tracking-wider"
              >
                <Plus size={14} />
                <span>Create Note</span>
              </button>

              {/* User Session Controls (Desktop) */}
              <div className="hidden md:flex items-center gap-2 pl-3 border-l border-gray-100 ml-1">
                <div 
                  className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-xs font-bold uppercase text-gray-700 select-none cursor-default"
                  title={`Active Session: ${currentUser}`}
                >
                  {currentUser ? currentUser.slice(0, 2) : ''}
                </div>
                <button
                  id="btn-logout"
                  onClick={handleLogout}
                  className="p-2 hover:bg-gray-100 text-gray-400 hover:text-black rounded-md transition flex items-center justify-center"
                  title="Logout Session"
                >
                  <LogOut size={14} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6" id="app-workspace">
        
        {/* Dynamic Category Tabs Navigation Row */}
        <div className="bg-white border border-gray-100 rounded-md p-3 flex flex-wrap items-center justify-between gap-3" id="category-tabs-container">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none w-full md:w-auto">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mr-2 flex items-center gap-1">
              <Layers size={12} />
              <span>Categories:</span>
            </span>
            <button
              id="category-tab-all"
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition whitespace-nowrap ${
                selectedCategory === 'All'
                  ? 'bg-black text-white'
                  : 'bg-gray-50 hover:bg-gray-100/50 text-gray-500'
              }`}
            >
              All Notes ({notes.length})
            </button>
            {allCategories.map(cat => {
              const count = notes.filter(n => n.category === cat).length;
              return (
                <button
                  key={cat}
                  id={`category-tab-${cat}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-black text-white'
                      : 'bg-gray-50 hover:bg-gray-100/50 text-gray-500'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1 rounded-md" id="quick-tip-banner">
            ⭐ Add categories inside editor!
          </div>
        </div>

        {/* Tag Filters Hub (Fully customizable tag selections) */}
        {allTags.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-md p-3" id="tags-filtering-hub">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest flex items-center gap-1 shrink-0">
                <TagIcon size={12} />
                <span>Filter by Tags:</span>
              </span>
              <div className="flex flex-wrap items-center gap-1.5 overflow-y-auto max-h-16 pr-2">
                {allTags.map(tag => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      id={`tag-filter-${tag}`}
                      onClick={() => toggleTagFilter(tag)}
                      className={`text-xs px-2.5 py-1 rounded-md border transition flex items-center gap-1 ${
                        isSelected
                          ? 'bg-black border-black text-white font-semibold'
                          : 'bg-gray-50 border-gray-100 hover:border-gray-200 text-gray-500 hover:text-black'
                      }`}
                    >
                      <span>#{tag}</span>
                      {isSelected && <X size={11} className="text-white ml-0.5" />}
                    </button>
                  );
                })}
                {selectedTags.length > 0 && (
                  <button
                    id="btn-clear-tag-filters"
                    onClick={() => setSelectedTags([])}
                    className="text-xs text-gray-400 hover:text-black font-semibold uppercase tracking-wider flex items-center gap-0.5 ml-2"
                  >
                    Reset tag filters
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Filter summary bar */}
        {(selectedTags.length > 0 || searchQuery.trim() !== '' || selectedCategory !== 'All') && (
          <div className="flex items-center justify-between bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-md" id="filter-results-summary">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Filter size={12} className="text-gray-400" />
              <span>Showing <strong className="font-bold text-black">{filteredNotes.length}</strong> matching notes:</span>
              {selectedCategory !== 'All' && (
                <span className="bg-white border border-gray-100 px-1.5 py-0.5 rounded text-[10px] text-black font-semibold uppercase tracking-wider">
                  Category: {selectedCategory}
                </span>
              )}
              {selectedTags.length > 0 && (
                <span className="bg-white border border-gray-100 px-1.5 py-0.5 rounded text-[10px] text-black font-semibold uppercase tracking-wider">
                  Tags: {selectedTags.join(', ')}
                </span>
              )}
              {searchQuery && (
                <span className="bg-white border border-gray-100 px-1.5 py-0.5 rounded text-[10px] text-black font-semibold italic">
                  Search: "{searchQuery}"
                </span>
              )}
            </div>
            <button
              id="btn-clear-all-filters"
              onClick={clearAllFilters}
              className="text-xs text-black font-bold uppercase tracking-wider hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Workspace Splitting */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="split-workspace-columns">
          
          {/* LEFT COLUMN: The Nice Note UI Tab-navigator */}
          <section className="col-span-1 lg:col-span-5 flex flex-col gap-3" id="note-tabs-column">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Notes Collection ({filteredNotes.length})</h2>
              {filteredNotes.length > 0 && (
                <span className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">Select tab to view details</span>
              )}
            </div>

            {filteredNotes.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-md p-8 text-center" id="empty-filtered-list">
                <Bookmark className="mx-auto text-gray-300 mb-2.5" size={28} />
                <h3 className="font-semibold text-gray-700 text-sm">No notes match your filters</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-[260px] mx-auto leading-relaxed">
                  Try clearing some filters or write a new note in this category!
                </p>
                <button
                  id="btn-reset-filters"
                  onClick={clearAllFilters}
                  className="mt-4 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-xs rounded-md transition border border-gray-100 uppercase tracking-wider"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 overflow-y-auto max-h-[640px] pr-1.5" id="note-tabs-list">
                {filteredNotes.map((note) => {
                  const isActive = note.id === selectedNoteId;
                  // Truncate details snippet
                  const snippet = note.details
                    .replace(/[#*`\n]/g, ' ')
                    .slice(0, 85) + (note.details.length > 85 ? '...' : '');

                  return (
                    <motion.div
                      key={note.id}
                      id={`note-tab-item-${note.id}`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => {
                        setSelectedNoteId(note.id);
                        setIsEditing(false);
                        setIsCreating(false);
                      }}
                      className={`relative overflow-hidden cursor-pointer p-4 rounded-md border text-left transition-all bg-white ${
                        isActive
                          ? 'border-gray-100 shadow-xs'
                          : 'border-gray-100 hover:bg-gray-50/50'
                      }`}
                    >
                      {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-black"></div>}
                      
                      <div className="flex justify-between items-start gap-2">
                        <span className="inline-flex items-center gap-1 text-[9px] bg-black text-white font-bold px-1.5 py-0.5 rounded uppercase">
                          <FolderIcon size={8} />
                          {note.category}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {formatDate(note.updatedAt).split(',')[0]}
                        </span>
                      </div>

                      <h3 className={`mt-2 font-semibold text-sm leading-tight ${
                        isActive ? 'text-black' : 'text-gray-700'
                      }`}>
                        {note.title}
                      </h3>

                      <p className="mt-1.5 text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        {snippet || 'No details provided'}
                      </p>

                      {note.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {note.tags.map(t => (
                            <span 
                              key={t} 
                              className="text-[9px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-500 border border-gray-100 uppercase tracking-wider font-bold"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>

          {/* RIGHT COLUMN: Note Details, Creation, or Editing Workspace */}
          <section className="col-span-1 lg:col-span-7" id="workspace-detail-editor-panel">
            <AnimatePresence mode="wait">
              
              {/* NOTE CREATION OR EDITING FORM */}
              {isCreating || isEditing ? (
                <motion.div
                  key="note-editor"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white border border-gray-100 rounded-md p-6 space-y-4"
                  id="note-editor-container"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2 font-display text-sm uppercase tracking-wider">
                      <Edit3 size={15} className="text-black" />
                      <span>{isCreating ? 'Create New Note' : 'Edit Note'}</span>
                    </h3>
                    <button
                      id="btn-close-editor"
                      onClick={() => {
                        setIsCreating(false);
                        setIsEditing(false);
                      }}
                      className="p-1.5 hover:bg-gray-50 text-gray-400 hover:text-black rounded-md transition"
                      title="Cancel"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-3.5">
                    
                    {/* Note Heading */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                        Note Heading *
                      </label>
                      <input
                        id="editor-title"
                        type="text"
                        placeholder="e.g., Understanding SQL Window Functions"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3.5 py-2 border border-gray-100 bg-gray-50/50 rounded-md text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 focus:bg-white transition-all"
                      />
                    </div>

                    {/* Category Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Category
                        </label>
                        <button
                          id="btn-toggle-custom-category"
                          type="button"
                          onClick={() => setCustomCategoryActive(!customCategoryActive)}
                          className="text-[10px] text-gray-400 hover:text-black font-semibold uppercase tracking-wider"
                        >
                          {customCategoryActive ? 'Select existing category' : '+ Add custom category'}
                        </button>
                      </div>

                      {customCategoryActive ? (
                        <input
                          id="editor-custom-category"
                          type="text"
                          placeholder="Type new category name..."
                          value={customCategoryName}
                          onChange={(e) => setCustomCategoryName(e.target.value)}
                          className="w-full px-3.5 py-2 border border-gray-100 bg-gray-50/50 rounded-md text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 focus:bg-white transition-all"
                        />
                      ) : (
                        <select
                          id="editor-category"
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="w-full px-3.5 py-2 border border-gray-100 bg-gray-50/50 rounded-md text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-200 focus:bg-white transition-all"
                        >
                          {allCategories.length === 0 && <option value="General">General</option>}
                          {allCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Tags Multi-add Builder */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                        Tags ({editTags.length})
                      </label>
                      
                      <form onSubmit={handleAddTagToForm} className="flex gap-2">
                        <input
                          id="editor-tag-input"
                          type="text"
                          placeholder="e.g., Python (press Enter or add)"
                          value={newTagInput}
                          onChange={(e) => setNewTagInput(e.target.value)}
                          className="flex-1 px-3.5 py-1.5 border border-gray-100 bg-gray-50/50 rounded-md text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 focus:bg-white transition-all"
                        />
                        <button
                          id="btn-add-tag"
                          type="submit"
                          className="px-3 py-1.5 bg-black hover:bg-gray-900 text-white rounded-md text-xs font-semibold border border-black transition uppercase tracking-wider"
                        >
                          + Add
                        </button>
                      </form>

                      {/* Current Tags List inside Form */}
                      {editTags.length > 0 ? (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {editTags.map(tag => (
                            <span 
                              key={tag} 
                              className="inline-flex items-center gap-1 text-xs bg-gray-50 text-gray-700 pl-2.5 pr-1.5 py-1 rounded-md border border-gray-100 font-medium"
                            >
                              <span>#{tag}</span>
                              <button
                                type="button"
                                id={`btn-remove-tag-${tag}`}
                                onClick={() => handleRemoveTagFromForm(tag)}
                                className="w-4 h-4 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-black transition-colors"
                              >
                                <X size={10} />
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-gray-400 mt-1 italic font-mono">
                          No tags added yet. Type a tag and press Enter.
                        </p>
                      )}

                      {/* Tag suggestion panel */}
                      {allTags.length > 0 && (
                        <div className="mt-2">
                          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-1">Quick Add Tags:</span>
                          <div className="flex flex-wrap gap-1">
                            {allTags.filter(t => !editTags.includes(t)).slice(0, 8).map(tag => (
                              <button
                                key={tag}
                                id={`btn-quick-add-${tag}`}
                                type="button"
                                onClick={() => setEditTags([...editTags, tag])}
                                className="text-[10px] bg-gray-50 hover:bg-gray-100/85 text-gray-500 hover:text-black px-2 py-0.5 rounded border border-gray-100 transition"
                              >
                                + {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Note Details Markdown Textarea */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Details / Notes content *
                        </label>
                        <button
                          id="btn-toggle-cheatsheet"
                          type="button"
                          onClick={() => setShowCheatsheet(!showCheatsheet)}
                          className="text-[10px] text-gray-400 hover:text-black font-semibold uppercase tracking-wider flex items-center gap-1"
                        >
                          <Code size={11} />
                          <span>Formatting Help</span>
                        </button>
                      </div>

                      {/* Markdown Cheatsheet */}
                      {showCheatsheet && (
                        <div className="mb-2 p-3 bg-gray-50 border border-gray-100 rounded-md text-xs text-gray-500 grid grid-cols-2 gap-2 leading-relaxed" id="cheatsheet-pane">
                          <div>
                            <span className="font-bold text-gray-700">Headers:</span> <code className="bg-white px-1">### Section Heading</code>
                          </div>
                          <div>
                            <span className="font-bold text-gray-700">Code:</span> <code className="bg-white px-1">```python code_here ```</code>
                          </div>
                          <div>
                            <span className="font-bold text-gray-700">Bold:</span> <code className="bg-white px-1">**important text**</code>
                          </div>
                          <div>
                            <span className="font-bold text-gray-700">Lists:</span> <code className="bg-white px-1">* Bullet point</code>
                          </div>
                        </div>
                      )}

                      <textarea
                        id="editor-details"
                        rows={10}
                        placeholder="Type detailed learning notes here. Supports formatting: 
### Heading 3
**bold text** 
* list items
```sql
SELECT * FROM table;
```"
                        value={editDetails}
                        onChange={(e) => setEditDetails(e.target.value)}
                        className="w-full px-3.5 py-2 border border-gray-100 bg-gray-50/50 rounded-md text-xs text-gray-800 placeholder-gray-400 font-mono focus:outline-none focus:ring-1 focus:ring-gray-200 focus:bg-white transition-all leading-relaxed"
                      />
                    </div>

                  </div>

                  {/* Save/Cancel Action Footer */}
                  <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
                    <button
                      id="btn-cancel-save"
                      type="button"
                      onClick={() => {
                        setIsCreating(false);
                        setIsEditing(false);
                      }}
                      className="px-4 py-2 text-gray-400 hover:text-black text-xs font-semibold uppercase tracking-wider hover:bg-gray-50 rounded-md transition"
                    >
                      Cancel
                    </button>
                    <button
                      id="btn-save-note"
                      type="button"
                      onClick={handleSaveNote}
                      className="px-5 py-2 bg-black hover:bg-gray-900 text-white text-xs font-semibold uppercase tracking-wider rounded-md transition"
                    >
                      Save Entry
                    </button>
                  </div>
                </motion.div>
              ) : currentNote ? (
                
                /* DETAILED VIEW MODE OF ACTIVE NOTE TAB */
                <motion.div
                  key={`note-view-${currentNote.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-gray-100 rounded-md p-8 space-y-6"
                  id="note-detail-card"
                >
                  
                  {/* Title & Actions Bar */}
                  <div className="flex flex-col gap-2 border-b border-gray-100 pb-4">
                    <div className="flex items-center justify-between gap-4">
                      
                      {/* Category Pill */}
                      <span className="inline-flex items-center gap-1 text-[9px] bg-black text-white font-bold px-1.5 py-0.5 rounded uppercase">
                        <FolderIcon size={9} />
                        <span>{currentNote.category}</span>
                      </span>

                      {/* Detail Operations */}
                      <div className="flex items-center gap-1">
                        <button
                          id={`btn-edit-${currentNote.id}`}
                          onClick={() => handleStartEdit(currentNote)}
                          className="p-2 hover:bg-gray-50 text-gray-400 hover:text-black rounded-md transition flex items-center gap-1 text-xs font-semibold uppercase tracking-wider"
                          title="Edit Note"
                        >
                          <Edit3 size={14} />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          id={`btn-delete-${currentNote.id}`}
                          onClick={() => handleDeleteNote(currentNote.id)}
                          className="p-2 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-md transition flex items-center gap-1 text-xs font-semibold uppercase tracking-wider"
                          title="Delete Note"
                        >
                          <Trash2 size={14} />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>

                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold font-display text-gray-900 leading-tight tracking-tight mt-1">
                      {currentNote.title}
                    </h1>

                    {/* Metadata indicators */}
                    <div className="flex flex-wrap items-center gap-4 text-[10px] text-gray-400 font-mono tracking-wider uppercase mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>Created: {formatDate(currentNote.createdAt)}</span>
                      </span>
                      {currentNote.updatedAt !== currentNote.createdAt && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>Updated: {formatDate(currentNote.updatedAt)}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Active note's tag cloud */}
                  {currentNote.tags.length > 0 && (
                    <div className="space-y-1.5" id="active-note-tagcloud">
                      <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block">Note Tags:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {currentNote.tags.map(tag => (
                          <button
                            key={tag}
                            id={`active-tag-pills-${tag}`}
                            onClick={() => toggleTagFilter(tag)}
                            className="text-xs font-semibold bg-gray-50 hover:bg-gray-100 border border-gray-100 text-gray-600 hover:text-black px-2.5 py-1 rounded-md transition"
                            title={`Filter database by #${tag}`}
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Note Body with Custom Markdown Parser */}
                  <div className="prose prose-slate max-w-none pt-2" id="note-body-contents">
                    {currentNote.details ? (
                      <CustomMarkdown content={currentNote.details} />
                    ) : (
                      <p className="text-sm italic text-gray-400">No content details provided.</p>
                    )}
                  </div>

                </motion.div>
              ) : (
                
                /* EMPTY WORKSPACE STATE */
                <motion.div
                  key="empty-workspace"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white border border-gray-100 rounded-md p-12 text-center"
                  id="empty-workspace-view"
                >
                  <BookOpen size={40} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-sm font-semibold text-gray-800 font-display uppercase tracking-wider">No Note Entry Selected</h3>
                  <p className="text-xs text-gray-400 mt-2 max-w-sm mx-auto leading-relaxed">
                    Select a note tab from the left navigator, create a custom learning note, or clear your filters to start learning.
                  </p>
                  <div className="mt-6 flex justify-center gap-3">
                    <button
                      id="btn-create-first-note"
                      onClick={handleStartCreate}
                      className="px-4 py-2 bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-md hover:bg-gray-900 transition flex items-center gap-2"
                    >
                      <Plus size={14} />
                      <span>Write First Note</span>
                    </button>
                    {notes.length === 0 && (
                      <button
                        id="btn-seed-sample"
                        onClick={() => {
                          setNotes(initialNotes);
                          setSelectedNoteId(initialNotes[0].id);
                          triggerToast('Default sample database loaded.');
                        }}
                        className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-100 text-gray-500 hover:text-black text-xs font-semibold uppercase tracking-wider rounded-md transition"
                      >
                        Reset Defaults
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </section>

        </div>

      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-900 py-6 mt-12 text-center text-gray-500 text-xs" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-mono tracking-widest text-gray-400 font-bold uppercase">SAVDIR &copy; 2026</p>
          <p className="text-gray-600">A clean, client-side, offline-capable personal learning system.</p>
        </div>
      </footer>
    </div>
  );
}
