"use client";

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, Target, Zap, DollarSign, BarChart3, History, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface BettingStatsDashboardProps {
  records: any[];
}

export default function BettingStatsDashboard({ records }: BettingStatsDashboardProps) {
  // 1. Basic Stats Calculation
  const finishedRecords = records.filter(r => r.status !== 'pending');
  const totalStake = finishedRecords.reduce((acc, r) => acc + r.stake, 0);
  const totalReturn = finishedRecords.reduce((acc, r) => acc + r.resultAmount, 0);
  const netProfit = totalReturn - totalStake;
  const roi = totalStake > 0 ? (netProfit / totalStake) * 100 : 0;
  
  const wins = finishedRecords.filter(r => r.status === 'won').length;
  const losses = finishedRecords.filter(r => r.status === 'lost').length;
  const winRate = (wins + losses) > 0 ? (wins / (wins + losses)) * 100 : 0;

  const avgOdds = finishedRecords.length > 0 
    ? finishedRecords.reduce((acc, r) => acc + r.odds, 0) / finishedRecords.length 
    : 0;
  
  const avgStake = finishedRecords.length > 0 
    ? totalStake / finishedRecords.length 
    : 0;

  // 2. Data for Line Chart (Cumulative Profit)
  const sortedRecords = [...finishedRecords].sort((a, b) => new Date(a.betDate).getTime() - new Date(b.betDate).getTime());
  let cumulativeProfit = 0;
  const profitData = sortedRecords.map(r => {
    cumulativeProfit += (r.resultAmount - r.stake);
    return {
      date: new Date(r.betDate).toLocaleDateString(),
      profit: cumulativeProfit
    };
  });

  const lineData = {
    labels: profitData.map(d => d.date),
    datasets: [
      {
        fill: true,
        label: '누적 수익',
        data: profitData.map(d => d.profit),
        borderColor: netProfit >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
        backgroundColor: netProfit >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // 3. Data for Doughnut Chart (Profit by Sport)
  const profitBySport: Record<string, number> = {};
  finishedRecords.forEach(r => {
    const profit = r.resultAmount - r.stake;
    profitBySport[r.sport] = (profitBySport[r.sport] || 0) + profit;
  });

  const doughnutData = {
    labels: Object.keys(profitBySport),
    datasets: [
      {
        data: Object.values(profitBySport),
        backgroundColor: [
          'rgba(59, 130, 246, 0.6)',
          'rgba(16, 185, 129, 0.6)',
          'rgba(245, 158, 11, 0.6)',
          'rgba(139, 92, 246, 0.6)',
          'rgba(236, 72, 153, 0.6)',
        ],
        borderWidth: 0,
      },
    ],
  };

  // 4. Data for Bar Chart (Win/Loss by Sport)
  const winLossBySport: Record<string, { won: number; lost: number }> = {};
  finishedRecords.forEach(r => {
    if (!winLossBySport[r.sport]) winLossBySport[r.sport] = { won: 0, lost: 0 };
    if (r.status === 'won') winLossBySport[r.sport].won++;
    if (r.status === 'lost') winLossBySport[r.sport].lost++;
  });

  const barData = {
    labels: Object.keys(winLossBySport),
    datasets: [
      {
        label: '적중',
        data: Object.values(winLossBySport).map(v => v.won),
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
      },
      {
        label: '미적중',
        data: Object.values(winLossBySport).map(v => v.lost),
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: { size: 10 }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: { size: 10 }
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="glass-card rounded-2xl p-5 border-white/5 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-primary/15 p-2 rounded-xl">
              <BarChart3 className="w-4 h-4 text-primary" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">ROI</span>
          </div>
          <p className={cn("text-xl font-black", roi >= 0 ? "text-emerald-400" : "text-red-400")}>
            {roi.toFixed(1)}%
          </p>
          <div className="flex items-center gap-1 mt-1">
             {roi >= 0 ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
             <span className="text-[9px] text-muted-foreground">누적 수익률</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border-white/5 bg-gradient-to-br from-orange-500/5 to-transparent">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-orange-500/15 p-2 rounded-xl">
              <Target className="w-4 h-4 text-orange-400" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Win Rate</span>
          </div>
          <p className="text-xl font-black text-white">
            {winRate.toFixed(1)}%
          </p>
          <div className="flex items-center gap-1 mt-1 text-muted-foreground text-[9px]">
             <span>{wins}승 / {losses}패</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border-white/5 bg-gradient-to-br from-emerald-500/5 to-transparent">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-emerald-500/15 p-2 rounded-xl">
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Net Profit</span>
          </div>
          <p className={cn("text-xl font-black", netProfit >= 0 ? "text-emerald-400" : "text-red-400")}>
            {netProfit >= 0 ? '+' : ''}{netProfit.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 mt-1 text-muted-foreground text-[9px]">
             <span>누적 순수익</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border-white/5 bg-gradient-to-br from-purple-500/5 to-transparent">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-500/15 p-2 rounded-xl">
              <History className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Avg. Odds</span>
          </div>
          <p className="text-xl font-black text-white">
            @{avgOdds.toFixed(2)}
          </p>
          <div className="flex items-center gap-1 mt-1 text-muted-foreground text-[9px]">
             <span>평균 배당률</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border-white/5 bg-gradient-to-br from-blue-500/5 to-transparent">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-500/15 p-2 rounded-xl">
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Avg. Stake</span>
          </div>
          <p className="text-xl font-black text-white">
            {Math.round(avgStake).toLocaleString()}
          </p>
          <div className="flex items-center gap-1 mt-1 text-muted-foreground text-[9px]">
             <span>평균 베팅 금액</span>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 border-white/5">
          <h4 className="text-sm font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> 누적 손익 추이
          </h4>
          <div className="h-[300px]">
            {profitData.length > 0 ? (
               <Line data={lineData} options={options} />
            ) : (
               <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">데이터가 부족합니다.</div>
            )}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border-white/5">
          <h4 className="text-sm font-bold mb-6 flex items-center gap-2">
            <Target className="w-4 h-4 text-orange-400" /> 종목별 적중 현황
          </h4>
          <div className="h-[300px]">
            {Object.keys(winLossBySport).length > 0 ? (
               <Bar data={barData} options={options} />
            ) : (
               <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">데이터가 부족합니다.</div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 border-white/5 lg:col-span-1">
          <h4 className="text-sm font-bold mb-6 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" /> 종목별 수익 비중
          </h4>
          <div className="h-[250px] flex items-center justify-center">
            {Object.keys(profitBySport).length > 0 ? (
               <Doughnut 
                 data={doughnutData} 
                 options={{
                   ...options,
                   plugins: {
                     legend: {
                       display: true,
                       position: 'bottom',
                       labels: { color: 'rgba(255,255,255,0.5)', font: { size: 10 } }
                     }
                   }
                 }} 
               />
            ) : (
               <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">데이터가 부족합니다.</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border-white/5 flex flex-col justify-center">
          <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
            <h5 className="font-bold text-primary mb-2 flex items-center gap-2">💡 분석 리포트</h5>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {finishedRecords.length > 0 ? (
                <>
                  현재까지 총 <strong>{finishedRecords.length}</strong>건의 베팅을 완료하셨습니다.
                  {roi > 0 ? (
                    ` 수익률은 ${roi.toFixed(1)}%로 안정적인 성과를 보이고 있습니다.`
                  ) : (
                    ` 현재 마이너스 수익률을 기록 중입니다. 베팅 전략 재검토가 필요할 수 있습니다.`
                  )}
                  {Object.keys(profitBySport).length > 0 && (
                    <> 주력 종목은 <strong>{Object.entries(profitBySport).sort((a, b) => b[1] - a[1])[0][0]}</strong>입니다. </>
                  )}
                  평균 배당률은 <strong>@{avgOdds.toFixed(2)}</strong>이며, 회당 평균 <strong>{Math.round(avgStake).toLocaleString()}</strong>원을 베팅하고 계십니다.
                </>
              ) : (
                "아직 완료된 베팅이 없습니다. 베팅 저널에 결과를 입력하시면 실시간으로 통계 분석이 이루어집니다."
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
