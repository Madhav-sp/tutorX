"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Home,
  BookOpen,
  BarChart3,
  Target,
  Settings,
  LogOut,
  Search,
  Bell,
  Zap,
  Play,
  Trophy,
  Cpu,
} from "lucide-react";
import WeatherWidget from "../components/WeatherWidget";
import OrangePlusButton from "../components/button";
import { useUser } from "@clerk/nextjs";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import JarvisAssistant from "../components/JarvisAssistant";
import CourseCreateModal from "../components/CourseCreateModal";
/* ================= PAGE ================= */

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#0b0b0c] text-gray-300 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          currentPage="Dashboard" 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <div className="flex flex-1 overflow-hidden">
          <MainContent 
            searchQuery={searchQuery} 
            setIsCreateModalOpen={setIsCreateModalOpen}
          />
          <RightPanel />
        </div>
      </div>
      <JarvisAssistant />
      <CourseCreateModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}

/* ================= MAIN CONTENT ================= */

// function MainContent() {
//   const router = useRouter();
//   const { user } = useUser();

//   const [courses, setCourses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showAll, setShowAll] = useState(false);
//   const [progressData, setProgressData] = useState({});

//   // Fetch courses
//   useEffect(() => {
//     if (!user) return;

//     const cached = sessionStorage.getItem("courses");

//     if (cached) {
//       const parsed = JSON.parse(cached);

//       // ✅ validate cached data (must contain real topics)
//       const hasValidTopics =
//         Array.isArray(parsed) &&
//         parsed.some(
//           (course) =>
//             Array.isArray(course.chapters) &&
//             course.chapters.some(
//               (ch) => Array.isArray(ch.topics) && ch.topics.length > 0
//             )
//         );

//       if (hasValidTopics) {
//         setCourses(parsed);
//         setLoading(false);
//         return;
//       } else {
//         // ❌ stale cache → remove it
//         sessionStorage.removeItem("courses");
//       }
//     }

//     // 🔄 fetch fresh data if no cache or stale cache
//     fetch("/api/course")
//       .then((res) => res.json())
//       .then((data) => {
//         setCourses(data || []);
//         sessionStorage.setItem("courses", JSON.stringify(data || []));
//         setLoading(false);
//       })
//       .catch(() => setLoading(false));
//   }, [user]);

//   // Fetch progress for all courses
//   useEffect(() => {
//     if (!user || courses.length === 0) return;

//     const fetchAllProgress = async () => {
//       const progressMap = {};

//       for (const course of courses) {
//         try {
//           const res = await fetch(`/api/progress?courseId=${course._id}`);
//           const data = await res.json();

//           if (data) {
//             const totalTopics = course.totalTopics || 0;

//             const completedTopics = Math.min(
//               data?.completedTopics?.length || 0,
//               totalTopics
//             );

//             const percentage =
//               totalTopics > 0
//                 ? Math.round((completedTopics / totalTopics) * 100)
//                 : 0;

//             progressMap[course._id] = {
//               percentage,
//               completedTopics,
//               totalTopics,
//             };
//           }
//         } catch (error) {
//           console.error(`Failed to fetch progress for ${course._id}:`, error);
//         }
//       }

//       setProgressData(progressMap);
//     };

//     fetchAllProgress();
//   }, [user, courses]);

//   const visibleCourses = showAll ? courses : courses.slice(0, 2);

//   const difficultyStyle = (level) => {
//     switch (level?.toLowerCase()) {
//       case "beginner":
//         return "bg-green-500/10 text-green-400";
//       case "intermediate":
//         return "bg-yellow-500/10 text-yellow-400";
//       case "advanced":
//         return "bg-red-500/10 text-red-400";
//       default:
//         return "bg-gray-500/10 text-gray-400";
//     }
//   };

//   // Calculate total stats
//   const totalCompleted = Object.values(progressData).reduce(
//     (sum, p) => sum + p.completedTopics,
//     0
//   );
//   const avgProgress =
//     courses.length > 0
//       ? Math.round(
//           Object.values(progressData).reduce(
//             (sum, p) => sum + p.percentage,
//             0
//           ) / courses.length
//         )
//       : 0;

//   return (
//     <main className="flex-1 overflow-y-auto p-8 relative custom-scroll">
//       <div className="max-w-5xl mx-auto space-y-12">
//         {/* METRICS */}
//         <section className="grid grid-cols-3 gap-6">
//           <div className="bg-[#111113] border border-white/5 rounded-2xl p-6">
//             <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
//               Average Progress
//             </p>
//             <div className="flex items-end gap-2">
//               <span className="text-3xl font-medium text-gray-100">
//                 {avgProgress}
//               </span>
//               <span className="text-sm text-gray-500">%</span>
//             </div>
//           </div>

//           <div className="bg-[#111113] border border-white/5 rounded-2xl p-6">
//             <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
//               Topics Completed
//             </p>
//             <div className="flex items-end gap-2">
//               <span className="text-3xl font-medium text-gray-100">
//                 {totalCompleted}
//               </span>
//               <span className="text-sm text-gray-500">Topics</span>
//             </div>
//           </div>

//           <div className="bg-[#111113] border border-white/5 rounded-2xl p-6">
//             <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
//               Total Courses
//             </p>
//             <div className="flex items-end gap-2">
//               <span className="text-3xl font-medium text-gray-100">
//                 {courses.length}
//               </span>
//               <span className="text-sm text-gray-500">Courses</span>
//             </div>
//           </div>
//         </section>

//         {/* ACTIVE MODULES */}
//         <section>
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-xs uppercase tracking-widest text-gray-500">
//               Active Modules
//             </h2>

//             {courses.length > 2 && (
//               <button
//                 onClick={() => setShowAll(!showAll)}
//                 className="text-xs text-orange-400 hover:text-orange-300 transition cursor-pointer"
//               >
//                 {showAll ? "Show less" : "View all"}
//               </button>
//             )}
//           </div>

//           {loading && <p className="text-sm text-gray-500">Loading courses…</p>}

//           {!loading && courses.length === 0 && (
//             <div className="text-center py-12">
//               <p className="text-sm text-gray-500 mb-4">
//                 No courses yet. Create your first one to get started.
//               </p>
//             </div>
//           )}

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//             {visibleCourses.map((course) => {
//               const progress = progressData[course._id] || {
//                 percentage: 0,
//                 completedTopics: 0,
//                 totalTopics: 0,
//               };

//               return (
//                 <div
//                   key={course._id}
//                   className="bg-[#111113] border border-white/5 rounded-3xl p-7
//                            hover:border-orange-500/20 transition-colors"
//                 >
//                   {/* HEADER */}
//                   <div className="flex justify-between items-start mb-6">
//                     <div>
//                       <h3 className="text-lg font-medium text-gray-100 mb-2 line-clamp-2 uppercase">
//                         {course.title}
//                       </h3>

//                       <div className="flex items-center gap-3 text-xs text-gray-500">
//                         <span
//                           className={`px-2 py-1 rounded-full ${difficultyStyle(
//                             course.difficulty
//                           )}`}
//                         >
//                           {course.difficulty || "Unknown"}
//                         </span>

//                         <span>
//                           Created{" "}
//                           {new Date(course.createdAt).toLocaleDateString()}
//                         </span>
//                       </div>
//                     </div>

//                     <button
//                       onClick={() => router.push(`/course/${course._id}`)}
//                       className="w-10 h-10 rounded-full border border-white/10
//                                flex items-center justify-center
//                                hover:bg-orange-500 hover:text-black transition cursor-pointer"
//                     >
//                       <Play className="w-4 h-4 fill-current" />
//                     </button>
//                   </div>

//                   {/* PROGRESS */}
//                   {/* <div>
//                     <div className="flex justify-between text-xs text-gray-500 mb-2">
//                       <span>Progress</span>
//                       <span className="text-gray-300">
//                         {progress.completedTopics}/{progress.totalTopics} topics
//                         • {progress.percentage}%
//                       </span>
//                     </div>

//                     <div className="h-1 bg-white/10 rounded-full overflow-hidden">
//                       <div
//                         className="h-full bg-orange-500 transition-all duration-500"
//                         style={{ width: `${progress.percentage}%` }}
//                       />
//                     </div>
//                   </div> */}
//                   {(() => {
//                     const completed = progress?.completedTopics ?? 0;
//                     const total = progress?.totalTopics ?? 0;
//                     const percentage =
//                       total > 0 ? Math.round((completed / total) * 100) : 0;

//                     return (
//                       <div>
//                         <div className="flex justify-between text-xs text-gray-500 mb-2">
//                           <span>Progress</span>
//                           <span className="text-gray-300">
//                             {completed}/{total} topics • {percentage}%
//                           </span>
//                         </div>

//                         <div className="h-1 bg-white/10 rounded-full overflow-hidden">
//                           <div
//                             className="h-full bg-orange-500 transition-all duration-500"
//                             style={{ width: `${percentage}%` }}
//                           />
//                         </div>
//                       </div>
//                     );
//                   })()}
//                 </div>
//               );
//             })}
//           </div>
//           <div className="relative bg-[#111113] mt-5 border border-orange-500/30 rounded-3xl p-8 flex flex-col justify-between">
//             {/* 🔥 Badge */}
//             <span className="absolute -top-3 left-6 bg-orange-500 text-black text-xs font-semibold px-3 py-1 rounded-4xl shadow">
//               NEW
//             </span>

//             <div>
//               <h3 className="text-xl font-semibold text-white mb-3">
//                 Try NotebookLLM
//               </h3>
//               <p className="text-sm text-gray-400">
//                 Upload PDFs, generate summaries, notes, flashcards and chat with
//                 your documents.
//               </p>
//             </div>

//             <button
//               onClick={() => router.push("/notebook")}
//               className="mt-6 bg-orange-500 text-black px-6 py-2 rounded-lg text-sm font-semibold w-fit hover:opacity-90"
//             >
//               Try Now
//             </button>
//           </div>
//         </section>
//       </div>

//       {/* FLOATING CREATE BUTTON */}
//       <div className="fixed bottom-6 right-[calc(320px+24px)] z-50">
//         <OrangePlusButton
//           className="cursor-pointer"
//           onClick={() => router.push("/create-course")}
//         />
//       </div>
//     </main>
//   );
// }
function MainContent({ searchQuery, setIsCreateModalOpen }) {
  const router = useRouter();
  const { user } = useUser();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [progressData, setProgressData] = useState({});
  const [avgProgress, setAvgProgress] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);

  /* ================= COURSES CACHE ================= */

  useEffect(() => {
    if (!user) return;

    const cachedCourses = sessionStorage.getItem("dashboard_courses_v2");
    if (cachedCourses) {
      const parsed = JSON.parse(cachedCourses);
      setCourses(parsed);
      setLoading(false);
      return;
    }

    fetch("/api/course")
      .then((res) => res.json())
      .then((data) => {
        const safeData = data || [];
        setCourses(safeData);
        sessionStorage.setItem(
          "dashboard_courses_v2",
          JSON.stringify(safeData)
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  /* ================= PROGRESS + STATS CACHE ================= */

  useEffect(() => {
    if (!user || courses.length === 0) return;

    const cachedProgress = sessionStorage.getItem("dashboard_progress_v2");
    const cachedStats = sessionStorage.getItem("dashboard_stats_v2");

    if (cachedProgress && cachedStats) {
      setProgressData(JSON.parse(cachedProgress));

      const stats = JSON.parse(cachedStats);
      setAvgProgress(stats.avgProgress);
      setTotalCompleted(stats.totalCompleted);
      return;
    }

    const fetchAllProgress = async () => {
      const progressMap = {};
      let completedSum = 0;
      let percentageSum = 0;

      for (const course of courses) {
        try {
          const res = await fetch(`/api/progress?courseId=${course._id}`);
          const data = await res.json();

          const totalTopics = course.totalTopics || 0;
          const completedTopics = Math.min(
            data?.completedTopics?.length || 0,
            totalTopics
          );

          const percentage =
            totalTopics > 0
              ? Math.round((completedTopics / totalTopics) * 100)
              : 0;

          progressMap[course._id] = {
            completedTopics,
            totalTopics,
            percentage,
          };

          completedSum += completedTopics;
          percentageSum += percentage;
        } catch (err) {
          console.error("Progress fetch failed:", err);
        }
      }

      const avg =
        courses.length > 0 ? Math.round(percentageSum / courses.length) : 0;

      setProgressData(progressMap);
      setTotalCompleted(completedSum);
      setAvgProgress(avg);

      sessionStorage.setItem(
        "dashboard_progress_v2",
        JSON.stringify(progressMap)
      );
      sessionStorage.setItem(
        "dashboard_stats_v2",
        JSON.stringify({
          totalCompleted: completedSum,
          avgProgress: avg,
        })
      );
    };

    fetchAllProgress();
  }, [user, courses]);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const visibleCourses = showAll ? filteredCourses : filteredCourses.slice(0, 2);

  const difficultyStyle = (level) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "bg-green-500/10 text-green-400";
      case "intermediate":
        return "bg-yellow-500/10 text-yellow-400";
      case "advanced":
        return "bg-red-500/10 text-red-400";
      default:
        return "bg-gray-500/10 text-gray-400";
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-8 relative custom-scroll">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* METRICS */}
        <section className="grid grid-cols-3 gap-6">
          <div className="bg-[#111113] border border-white/5 rounded-2xl p-6">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
              Average Progress
            </p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-medium text-gray-100">
                {avgProgress}
              </span>
              <span className="text-sm text-gray-500">%</span>
            </div>
          </div>

          <div className="bg-[#111113] border border-white/5 rounded-2xl p-6">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
              Topics Completed
            </p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-medium text-gray-100">
                {totalCompleted}
              </span>
              <span className="text-sm text-gray-500">Topics</span>
            </div>
          </div>

          <div className="bg-[#111113] border border-white/5 rounded-2xl p-6">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
              Total Courses
            </p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-medium text-gray-100">
                {courses.length}
              </span>
              <span className="text-sm text-gray-500">Courses</span>
            </div>
          </div>
        </section>

        {/* ACTIVE MODULES */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs uppercase tracking-widest text-gray-500">
              Active Modules
            </h2>

            {courses.length > 2 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-xs text-orange-400 hover:text-orange-300"
              >
                {showAll ? "Show less" : "View all"}
              </button>
            )}
          </div>

          {loading && <p className="text-sm text-gray-500">Loading courses…</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {visibleCourses.map((course) => {
              const progress = progressData[course._id] || {
                completedTopics: 0,
                totalTopics: 0,
                percentage: 0,
              };

              return (
                <div
                  key={course._id}
                  className="bg-[#111113] border border-white/5 rounded-3xl p-7 hover:border-orange-500/20"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-100 mb-2 uppercase">
                        {course.title}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span
                          className={`px-2 py-1 rounded-full ${difficultyStyle(
                            course.difficulty
                          )}`}
                        >
                          {course.difficulty || "Unknown"}
                        </span>
                        <span>
                          Created{" "}
                          {new Date(course.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/course/${course._id}`)}
                      className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-orange-500 hover:text-black"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>Progress</span>
                      <span className="text-gray-300">
                        {progress.completedTopics}/{progress.totalTopics} topics
                        • {progress.percentage}%
                      </span>
                    </div>

                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 transition-all duration-500"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* NOTEBOOK LM CARD */}
          <div className="relative bg-[#111113] mt-5 border border-orange-500/30 rounded-3xl p-8 flex flex-col justify-between">
            <span className="absolute -top-3 left-6 bg-orange-500 text-black text-xs font-semibold px-3 py-1 rounded-full">
              NEW
            </span>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Try NotebookLLM
              </h3>
              <p className="text-sm text-gray-400">
                Upload PDFs, generate summaries, notes, flashcards and chat with
                your documents.
              </p>
            </div>

            <button
              onClick={() => router.push("/notebook")}
              className="mt-6 bg-orange-500 text-black px-6 py-2 rounded-lg text-sm font-semibold w-fit hover:opacity-90"
            >
              Try Now
            </button>
          </div>
        </section>
      </div>

      <div className="fixed bottom-6 right-[calc(320px+24px)] z-50">
        <OrangePlusButton
          className="cursor-pointer"
          onClick={() => setIsCreateModalOpen(true)}
        />
      </div>
    </main>
  );
}

/* ================= RIGHT PANEL ================= */

function RightPanel() {
  const { user } = useUser();
  const [upcoming, setUpcoming] = useState([]);
  useEffect(() => {
    if (!user) return;

    fetch("/api/goals", {
      headers: {
        "x-user-id": user.id, // ✅ THIS WAS MISSING
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const upcomingTasks = (data || [])
          .filter((t) => !t.completed)
          .slice(0, 2)
          .map((t) => ({
            label: t.text,
            time: "Today",
          }));

        if (upcomingTasks.length > 0) {
          setUpcoming(upcomingTasks);
        } else {
          setUpcoming([
            { label: "DSA Practice", time: "Today" },
            { label: "Java Revision", time: "Today" },
          ]);
        }
      })
      .catch(() => {
        setUpcoming([
          { label: "DSA Practice", time: "Today" },
          { label: "Java Revision", time: "Today" },
        ]);
      });
  }, [user]);



  return (
    <aside className="w-80 bg-[#0e0e10] border-l border-white/5 p-8 space-y-10">
      <div>
        <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">
          Activity
        </h3>

        <div className="flex items-end gap-1 h-32">
          {[40, 70, 45, 90, 60, 30, 50].map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-sm ${i === 3 ? "bg-orange-500" : "bg-white/10"
                }`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">
          Upcoming
        </h3>

        <div className="space-y-3">
          {upcoming.map((e, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl"
            >
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-gray-200">{e.label}</p>
                <p className="text-xs text-gray-500">{e.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-[#111113] border border-orange-500/20">
        <p className="text-xs uppercase text-gray-400 mb-2">Pro Plan</p>
        <p className="text-lg font-semibold text-gray-100 mb-4">
          Unlock Cloud Compute
        </p>
        <button className="bg-orange-500 text-black px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90">
          Upgrade
        </button>
      </div>
    </aside>
  );
}
