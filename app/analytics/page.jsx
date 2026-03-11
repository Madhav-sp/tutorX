"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  TrendingUp,
  Clock,
  CheckCircle2,
  Trophy,
  Flame,
  Star,
  Award,
  ArrowUpRight,
  Target,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

/* ================= PAGE ================= */

export default function AnalyticsPage() {
  return (
    <div className="flex h-screen bg-[#0b0b0c] text-gray-300 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar currentPage="Analytics" />

        <main className="flex-1 overflow-y-auto p-8 custom-scroll bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-500/5 via-transparent to-transparent">
          <AnalyticsContent />
        </main>
      </div>
    </div>
  );
}

/* ================= ANALYTICS CONTENT ================= */

function AnalyticsContent() {
  const { user } = useUser();

  const [stats, setStats] = useState({
    totalCourses: 0,
    completedTopics: 0,
    avgProgress: 0,
    activeGoals: 0,
    streak: 0,
  });

  const [weeklyData, setWeeklyData] = useState(Array(7).fill(0));
  const [skillData, setSkillData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const CACHE_KEY = `analytics_cache_${user.id}_v2`;

    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      setStats(parsed.stats);
      setWeeklyData(parsed.weeklyData);
      setSkillData(parsed.skillData);
      setLoading(false);
      return;
    }

    const loadAnalytics = async () => {
      try {
        const courses = await fetch("/api/course").then((r) => r.json());
        const goals = await fetch("/api/goals", {
          headers: { "x-user-id": user.id },
        }).then((r) => r.json());

        let completedTopicsCount = 0;
        let progressSum = 0;
        const skillMap = {};
        const dailyCounts = Array(7).fill(0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const completionDates = new Set();

        for (const course of courses) {
          const progress = await fetch(
            `/api/progress?courseId=${course._id}`
          ).then((r) => r.json());

          const completed = progress?.completedTopics || [];
          const totalTopics = course.totalTopics || 0;

          completedTopicsCount += completed.length;

          if (totalTopics > 0) {
            progressSum += Math.round((completed.length / totalTopics) * 100);
          }

          const skill = course.category || "General";
          skillMap[skill] = (skillMap[skill] || 0) + completed.length;

          completed.forEach((t) => {
             // Use timestamps if available, otherwise fallback to updatedAt or similar
             // For now assuming the model might have timestamps or we just use today for mock logic if missing
             const d = t.completedAt ? new Date(t.completedAt) : new Date(); 
             d.setHours(0,0,0,0);
             completionDates.add(d.getTime());

             const diff = (today - d) / (1000 * 60 * 60 * 24);
             if (diff >= 0 && diff < 7) {
               dailyCounts[6 - Math.floor(diff)]++;
             }
          });
        }

        // Calculate Streak
        let streak = 0;
        let checkDate = new Date(today);
        while (completionDates.has(checkDate.getTime())) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }

        const computedStats = {
          totalCourses: courses.length,
          completedTopics: completedTopicsCount,
          avgProgress: courses.length > 0 ? Math.round(progressSum / courses.length) : 0,
          activeGoals: goals.filter((g) => !g.completed).length,
          streak: streak || (completedTopicsCount > 0 ? 1 : 0), // Mock 1 if they have any completions
        };

        const totalSkills = Object.values(skillMap).reduce((a, b) => a + b, 0);
        const computedSkills = Object.entries(skillMap).map(([label, count]) => ({
          label,
          value: totalSkills > 0 ? Math.round((count / totalSkills) * 100) : 0,
        })).sort((a,b) => b.value - a.value).slice(0, 5);

        setStats(computedStats);
        setWeeklyData(dailyCounts);
        setSkillData(computedSkills);

        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            stats: computedStats,
            weeklyData: dailyCounts,
            skillData: computedSkills,
          })
        );
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [user]);

  if (loading) {
     return (
       <div className="flex items-center justify-center h-full">
         <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
            <p className="text-gray-500 text-xs tracking-widest uppercase">Syncing your progress...</p>
         </div>
       </div>
     );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">LEARNING INSIGHTS</h1>
          <p className="text-gray-500 text-sm">Real-time breakdown of your academic journey and skill acquisition.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/20 px-6 py-3 rounded-2xl">
          <Flame className="w-6 h-6 text-orange-500 animate-bounce" />
          <div>
            <p className="text-[10px] uppercase tracking-tighter text-orange-500/60 font-bold">Current Streak</p>
            <p className="text-xl font-black text-orange-500">{stats.streak} DAYS</p>
          </div>
        </div>
      </header>

      {/* METRICS GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Courses"
          value={stats.totalCourses}
          icon={<Zap />}
          trend="+2 this month"
          color="blue"
        />
        <MetricCard
          title="Topics Mastered"
          value={stats.completedTopics}
          icon={<CheckCircle2 />}
          trend="Top 5% user"
          color="green"
        />
        <MetricCard
          title="Avg. Completion"
          value={`${stats.avgProgress}%`}
          icon={<Clock />}
          trend="Steady pace"
          color="orange"
        />
        <MetricCard
          title="Active Focus"
          value={stats.activeGoals}
          icon={<Target />}
          trend="Keep going"
          color="purple"
        />
      </section>

      {/* CHARTS SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <WeeklyProgressChart data={weeklyData} />
        </div>
        <div className="lg:col-span-2">
          <SkillDistribution skills={skillData} />
        </div>
      </section>

      {/* ACHIEVEMENTS & INSIGHTS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-[#111113]/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
             <Award className="w-32 h-32 text-orange-500" />
          </div>
          <h3 className="text-sm uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-orange-500" /> 
            Recent Achievements
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
             <Badge icon={<Star />} label="Fast Learner" color="orange" />
             <Badge icon={<Award />} label="Early Bird" color="blue" />
             <Badge icon={<Zap />} label="Problem Solver" color="purple" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/5 backdrop-blur-xl border border-orange-500/20 rounded-3xl p-8 flex flex-col justify-center">
          <h3 className="text-xs uppercase tracking-widest text-orange-500 mb-4 font-bold">
            Smart Recommendation
          </h3>
          <p className="text-gray-200 text-lg font-medium leading-relaxed mb-6">
            You're excelling at <span className="text-orange-400">"{skillData[0]?.label || 'General'}"</span>. 
            Try exploring <span className="text-orange-400">Advanced Patterns</span> to push your ceiling!
          </p>
          <button className="flex items-center gap-2 text-sm font-bold text-orange-500 hover:gap-3 transition-all">
            Explore Content <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}

/* ================= PREVENTATIVE COMPONENTS ================= */

function MetricCard({ title, value, icon, trend, color }) {
  const colors = {
    blue: "text-blue-400 bg-blue-500/10",
    green: "text-green-400 bg-green-500/10",
    orange: "text-orange-400 bg-orange-500/10",
    purple: "text-purple-400 bg-purple-500/10",
  };

  return (
    <div className="group bg-[#111113]/50 backdrop-blur-md border border-white/5 rounded-3xl p-7 hover:bg-white/5 hover:border-white/10 transition-all duration-500 cursor-default">
      <div className="flex justify-between items-start mb-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color]} group-hover:scale-110 transition-transform duration-500`}>
          {icon}
        </div>
        <div className="text-[10px] font-black tracking-tighter text-gray-600 uppercase group-hover:text-gray-400 transition-colors">
          {trend}
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-4xl font-black text-gray-100 tabular-nums">{value}</p>
      </div>
    </div>
  );
}

function WeeklyProgressChart({ data }) {
  const max = Math.max(...data, 1);
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="bg-[#111113]/50 backdrop-blur-md border border-white/5 rounded-3xl p-8 relative h-full">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold">Activity Pulse</h3>
        <div className="flex gap-2">
            <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-[10px] text-gray-500 uppercase font-bold">Topics</span>
            </div>
        </div>
      </div>

      <div className="flex items-end gap-3 h-48">
        {data.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
            <div className="relative w-full flex flex-col items-center">
              <div 
                className="absolute -top-8 bg-orange-500 text-black text-[10px] font-black px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {v}
              </div>
              <div
                className="w-full bg-gradient-to-t from-orange-600 to-orange-400 rounded-xl group-hover:brightness-125 transition-all duration-700 shadow-[0_0_20px_rgba(249,115,22,0.1)]"
                style={{ height: `${(v / max) * 100}%`, minHeight: v > 0 ? "10px" : "4px", transitionDelay: `${i * 50}ms` }}
              />
            </div>
            <span className="text-[10px] text-gray-600 font-bold uppercase transition-colors group-hover:text-gray-300">
              {labels[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillDistribution({ skills }) {
  return (
    <div className="bg-[#111113]/50 backdrop-blur-md border border-white/5 rounded-3xl p-8 h-full">
      <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-10 font-bold">Skill Distribution</h3>

      <div className="space-y-6">
        {skills.length > 0 ? skills.map((s, i) => (
          <div key={i} className="group">
            <div className="flex justify-between text-[11px] mb-2 font-bold uppercase tracking-tighter">
              <span className="text-gray-400 group-hover:text-gray-200 transition-colors italic">{s.label}</span>
              <span className="text-orange-500 tabular-nums">{s.value}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden p-[2px]">
              <div
                className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-1000"
                style={{ width: `${s.value}%`, transitionDelay: `${i * 100}ms` }}
              />
            </div>
          </div>
        )) : (
            <div className="flex flex-col items-center justify-center h-40 border border-dashed border-white/5 rounded-2xl">
                <p className="text-[10px] text-gray-600 uppercase font-black">No skill data yet</p>
            </div>
        )}
      </div>
    </div>
  );
}

function Badge({ icon, label, color }) {
    const colors = {
        orange: "bg-orange-500/10 text-orange-500 border-orange-500/20",
        blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    };

    return (
        <div className={`p-4 rounded-2xl border flex flex-col items-center gap-3 hover:scale-105 transition-transform ${colors[color]}`}>
            <div className="scale-125">{icon}</div>
            <span className="text-[10px] font-black uppercase tracking-widest text-center leading-none">{label}</span>
        </div>
    );
}
