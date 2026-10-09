import { useEffect, useState } from "react";
import PersonalNotesDashboard from "./components/personalNotesDashboard/index.jsx";
import BackToTop from "./components/backToTop/index.jsx";
import SiteFooter from "./components/siteFooter/index.jsx";
import SiteHeader from "./components/siteHeader/index.jsx";
import styles from "./App.module.css";
const App = () => {
 const [showBackToTop, setShowBackToTop] = useState(false);
 useEffect(() => { const update = () => setShowBackToTop(window.scrollY > 50); window.addEventListener("scroll", update, { passive: true }); update(); return () => window.removeEventListener("scroll", update); }, []);
 return <div className={styles.appShell} id="top"><SiteHeader title="Personal Notes" mark="N" repoUrl="https://github.com/a2rp/personal-notes-dashboard" navItems={[["Notes","#notes"],["Tags","#tags"]]} /><main className={styles.pageContent}><PersonalNotesDashboard /></main><SiteFooter repoUrl="https://github.com/a2rp/personal-notes-dashboard" /><BackToTop visible={showBackToTop} /></div>;
};
export default App;