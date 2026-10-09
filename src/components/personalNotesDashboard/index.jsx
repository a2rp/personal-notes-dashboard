import { useEffect, useMemo, useRef, useState } from "react";
import { FiFileText, FiPlus, FiSearch, FiBookmark, FiDownload, FiTrash2 } from "react-icons/fi";
import styles from "./styles.module.css";
const key = "personal-notes-v1";
const seed = [{ id: "n1", title: "Ideas for a slower week", body: "Leave more space between commitments.\n\nTry a walk before checking messages, and keep one evening open.", tags: ["Personal", "Ideas"], pinned: true, updated: Date.now() }, { id: "n2", title: "Reading list", body: "The Creative Act\nFour Thousand Weeks\nHow to Do Nothing", tags: ["Reading"], pinned: false, updated: Date.now() - 3600000 }, { id: "n3", title: "Project notes", body: "A place for loose thoughts, useful links, and the next action.", tags: ["Work"], pinned: false, updated: Date.now() - 86400000 }];
const load = () => { try { const data = JSON.parse(localStorage.getItem(key)); return Array.isArray(data) ? data : seed; } catch { return seed; } };
const PersonalNotesDashboard = () => {
    const [notes, setNotes] = useState(load);
    const [selectedId, setSelectedId] = useState(() => load()[0]?.id ?? null);
    const [search, setSearch] = useState("");
    const [tag, setTag] = useState("All notes");
    const [removing, setRemoving] = useState(null);
    const cancelRef = useRef(null);
    useEffect(() => localStorage.setItem(key, JSON.stringify(notes)), [notes]);
    useEffect(() => {
        if (!removing) return undefined;
        cancelRef.current?.focus();
        const onKey = (event) => { if (event.key === "Escape") setRemoving(null); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [removing]);
    const tags = useMemo(() => [...new Set(notes.flatMap((note) => note.tags))].sort(), [notes]);
    const shown = useMemo(() => notes.filter((note) => {
        const matchTag = tag === "All notes" || note.tags.includes(tag);
        return matchTag && (note.title + " " + note.body + " " + note.tags.join(" ")).toLowerCase().includes(search.toLowerCase());
    }).sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updated - a.updated), [notes, search, tag]);
    const active = notes.find((note) => note.id === selectedId) || shown[0] || null;
    const update = (field, value) => { if (!active) return; setNotes((items) => items.map((note) => note.id === active.id ? { ...note, [field]: value, updated: Date.now() } : note)); };
    const create = () => { const note = { id: crypto.randomUUID(), title: "Untitled note", body: "", tags: [], pinned: false, updated: Date.now() }; setNotes((items) => [note, ...items]); setSelectedId(note.id); setTag("All notes"); };
    const exportNote = () => { if (!active) return; const file = new Blob(["# " + active.title + "\n\n" + active.body + "\n"], { type: "text/markdown" }); const url = URL.createObjectURL(file); const link = document.createElement("a"); link.href = url; link.download = active.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".md"; link.click(); URL.revokeObjectURL(url); };
    const setTags = (value) => update("tags", value.split(",").map((item) => item.trim()).filter(Boolean));
    return <section className={styles.notesApp} id="notes">
        <header className={styles.heading}><div><span>PERSONAL ARCHIVE</span><h1>Thoughts, kept close.</h1><p>A calm place for the ideas you want to find again.</p></div><button onClick={create}><FiPlus /> New note</button></header>
        <div className={styles.noteShell}>
            <aside className={styles.rail} id="tags"><label><FiSearch /><span className={styles.sr}>Search notes</span><input placeholder="Find a note" value={search} onChange={(event) => setSearch(event.target.value)} /></label><div className={styles.tagList}><p>YOUR NOTES</p>{["All notes", ...tags].map((item) => <button className={tag === item ? styles.activeTag : ""} onClick={() => setTag(item)} key={item}>{item}<small>{item === "All notes" ? notes.length : notes.filter((note) => note.tags.includes(item)).length}</small></button>)}</div><small className={styles.local}>Stored only on this device</small></aside>
            <div className={styles.noteList}><div className={styles.listHeading}><strong>{tag}</strong><span>{shown.length} notes</span></div>{shown.map((note) => <button className={[styles.notePreview, active?.id === note.id ? styles.activeNote : ""].join(" ")} onClick={() => setSelectedId(note.id)} key={note.id}><span className={styles.previewTitle}>{note.pinned && <FiBookmark />}{note.title}</span><span className={styles.previewBody}>{note.body || "Start writing..."}</span><small>{new Date(note.updated).toLocaleDateString("en", { month: "short", day: "numeric" })}</small></button>)}{!shown.length && <p className={styles.none}>No notes match this search.</p>}</div>
            <article className={styles.editor} aria-label="Note editor">{active ? <><div className={styles.editorBar}><span><i />Saved locally</span><div><button onClick={() => update("pinned", !active.pinned)} aria-pressed={active.pinned} aria-label={active.pinned ? "Unpin note" : "Pin note"}><FiBookmark /></button><button onClick={exportNote} aria-label="Export note as Markdown"><FiDownload /></button><button onClick={() => setRemoving(active)} aria-label="Delete note"><FiTrash2 /></button></div></div><input className={styles.titleInput} value={active.title} onChange={(event) => update("title", event.target.value)} aria-label="Note title" /><div className={styles.tagInput}><FiFileText /><input value={active.tags.join(", ")} onChange={(event) => setTags(event.target.value)} aria-label="Comma-separated tags" placeholder="Add tags separated by commas" /></div><textarea value={active.body} onChange={(event) => update("body", event.target.value)} aria-label="Note text" placeholder="Write something worth remembering..." /><footer><span>{active.body.trim().split(/\s+/).filter(Boolean).length} words</span><span>Autosaves as you type</span></footer></> : <div className={styles.noActive}><FiFileText /><h2>Your page is clear.</h2><p>Create a note to start collecting your thoughts.</p><button onClick={create}><FiPlus /> Create first note</button></div>}</article>
        </div>
        {removing && <div className={styles.modal}><section role="dialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-copy"><FiTrash2 /><h2 id="delete-title">Delete this note?</h2><p id="delete-copy"><strong>{removing.title}</strong> and its text will be removed from this browser.</p><div><button ref={cancelRef} onClick={() => setRemoving(null)}>Keep note</button><button onClick={() => { const rest = notes.filter((note) => note.id !== removing.id); setNotes(rest); setSelectedId(rest[0]?.id ?? null); setRemoving(null); }}>Delete note</button></div></section></div>}
    </section>;
};
export default PersonalNotesDashboard;
