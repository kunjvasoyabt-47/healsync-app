"use client";

import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { Users, TrendingUp, CalendarCheck, Activity } from "lucide-react";

// Using your @theme variables for consistency
const STATUS_COLORS: Record<string, string> = {
  PAID: "#1a8a7f",            // --color-primary
  APPROVED_UNPAID: "#f59e0b", // Amber
  REJECTED: "#ef0d0d",        // --color-danger
};

// 🟢 Specific Interface to remove 'any' errors
interface AnalyticsData {
  totalAppointments: number;
  statusDistribution: Array<{ 
    status: string; 
    _count: { id: number } 
  }>;
  dayWise: Record<string, number>;
}

export default function AnalysisClient({ initialData }: { initialData: AnalyticsData }) {
  
  // 🟢 Fixed: Explicitly defining all 7 days ensures Wednesday shows even if count is 0
  const barData = useMemo(() => {
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    
    return daysOfWeek.map(day => ({
      name: day,
      // Use 0 as fallback if the day is missing from backend response
      count: initialData.dayWise[day] || 0
    }));
  }, [initialData]);

  const pieData = useMemo(() => {
    return initialData.statusDistribution.map((item) => ({
      name: item.status.replace("_", " "),
      value: item._count.id,
      key: item.status
    }));
  }, [initialData]);

  // Calculate Total Revenue from 'PAID' status
  const totalRevenue = useMemo(() => {
    const paidStats = initialData.statusDistribution.find(
      (item) => item.status === "PAID"
    );
    const paidCount = paidStats?._count.id || 0;
    return paidCount * 500;
  }, [initialData]);

  // 🟢 NEW: Calculate Average Revenue Per Day based on active days
  const avgRevenuePerDay = useMemo(() => {
    const activeDaysCount = Object.keys(initialData.dayWise).length;
    return activeDaysCount > 0 ? Math.round(totalRevenue / activeDaysCount) : 0;
  }, [initialData.dayWise, totalRevenue]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* KPI Cards Grid - Updated to 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-bg-surface p-6 rounded-3xl border border-border-main shadow-sm flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-tight">Total Appointments</p>
            <h2 className="text-2xl font-black text-text-main">{initialData.totalAppointments}</h2>
          </div>
        </div>

        <div className="bg-bg-surface p-6 rounded-3xl border border-border-main shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-2xl text-green-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-tight">Total Revenue</p>
            <h2 className="text-2xl font-black text-text-main">
              ₹{totalRevenue.toLocaleString()}
            </h2>
          </div>
        </div>

        {/* 🟢 NEW: Average Revenue Card with Vibrant Red Accent */}
        <div className="bg-bg-surface p-6 rounded-3xl border border-border-main shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-2xl text-[#ef0d0d]">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-tight">Avg. Revenue / Day</p>
            <h2 className="text-2xl font-black text-text-main">
              ₹{avgRevenuePerDay.toLocaleString()}
            </h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Trend Bar Chart */}
        <div className="bg-bg-card p-6 rounded-3xl border border-border-main shadow-md h-[400px]">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-text-card-title">
            <TrendingUp size={18} className="text-primary"/> Weekly Booking Volume
          </h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                interval={0}
                tick={{fill: '#4b5563', fontSize: 12}} 
              />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 12}} />
              <Tooltip 
                cursor={{ fill: 'transparent' }} 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                }} 
              />
              <Bar dataKey="count" fill="#1a8a7f" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Appointment Status Donut Chart */}
        <div className="bg-bg-card p-6 rounded-3xl border border-border-main shadow-md h-[400px]">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-text-card-title">
            <CalendarCheck size={18} className="text-primary"/> Status Breakdown
          </h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie 
                data={pieData} 
                innerRadius={70} 
                outerRadius={90} 
                paddingAngle={8} 
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.key] || "#9ca3af"} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}