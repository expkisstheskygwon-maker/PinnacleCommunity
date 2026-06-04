"use client";

import React, { useState } from "react";
import { 
  Globe, Sparkles, Cpu, CheckCircle2, ArrowRight, ArrowLeft, 
  Play, Download, Upload, Database, Eye, Check, AlertTriangle, Key
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DummyGeneratorView() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");

  // Step 1: Crawl Settings
  const [crawlUrl, setCrawlUrl] = useState("");
  const [crawlScope, setCrawlScope] = useState("weekly"); // daily, weekly, monthly
  const [crawlLimit, setCrawlLimit] = useState(5);
  const [crawlKeyword, setCrawlKeyword] = useState("");
  const [crawledData, setCrawledData] = useState<any[]>([]);

  // Step 2: AI Settings
  const [aiProvider, setAiProvider] = useState("gemini"); // gemini, openai
  const [geminiKey, setGeminiKey] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("dummy_generator_gemini_key") || "";
    }
    return "";
  });
  const [openaiKey, setOpenaiKey] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("dummy_generator_openai_key") || "";
    }
    return "";
  });
  const apiKey = aiProvider === "gemini" ? geminiKey : openaiKey;
  const [aiParams, setAiParams] = useState({
    gender: "무작위",
    age: "20대~30대",
    occupation: "일반 직장인",
    tone: "정성스럽고 일반적인 글",
    typos: false,
    uploadTime: "오후"
  });

  // Step 3: Local Engine Settings
  const [localParams, setLocalParams] = useState(() => {
    if (typeof window !== "undefined") {
      const tzoffset = (new Date()).getTimezoneOffset() * 60000;
      const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 16);
      return {
        totalCount: 100,
        dateMode: "random",
        eventDate: localISOTime,
        eventDuration: 6,
      };
    }
    return {
      totalCount: 100,
      dateMode: "random",
      eventDate: "",
      eventDuration: 6,
    };
  });
  const [generatedPosts, setGeneratedPosts] = useState<any[]>([]);

  // Step 4: Upload Settings
  const [targetCategory, setTargetCategory] = useState("free");
  const [allowHtml, setAllowHtml] = useState(false);
  const [apiConfig, setApiConfig] = useState({
    useExternalApi: false,
    endpointUrl: "",
    apiKey: ""
  });

  const handleCategoryChange = (cat: string) => {
    setTargetCategory(cat);
    setAllowHtml(["notices", "guide", "analysis", "spotlight"].includes(cat));
  };

  // Keep track of API key in LocalStorage
  const handleApiKeyChange = (val: string) => {
    if (aiProvider === "gemini") {
      setGeminiKey(val);
      localStorage.setItem("dummy_generator_gemini_key", val);
    } else {
      setOpenaiKey(val);
      localStorage.setItem("dummy_generator_openai_key", val);
    }
  };

  // Step 1 Trigger: Run Scraper
  const handleStartCrawl = async () => {
    if (!crawlUrl) {
      alert("크롤링할 게시판 URL을 입력해주세요.");
      return;
    }
    setLoading(true);
    setStatusText("외부 커뮤니티 데이터 분석 및 크롤링 중...");
    try {
      const res = await fetch("/api/admin/dummy/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: crawlUrl, scope: crawlScope, limit: crawlLimit, keyword: crawlKeyword })
      });
      const data = await res.json();
      if (data.success) {
        setCrawledData(data.data);
        setStatusText(`성공적으로 ${data.crawledCount}개의 게시글과 댓글 데이터 분석 완료.`);
        setStep(2);
      } else {
        alert(data.error || "크롤링에 실패했습니다. 올바른 주소인지 확인해주세요.");
      }
    } catch (err) {
      console.error(err);
      alert("크롤링 중 예상치 못한 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 & 3 Trigger: Process AI and Scale Locally
  const handleGenerateAndScale = async () => {
    if (!apiKey) {
      alert("AI 가공을 위해 API Key를 입력해주세요.");
      return;
    }
    setLoading(true);
    setStatusText("AI 맥락 가공 및 100개 단위 로컬 시나리오 대량 팽창 중...");
    try {
      const res = await fetch("/api/admin/dummy/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crawledData,
          aiProvider,
          apiKey,
          aiParams,
          localParams
        })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedPosts(data.posts);
        setStatusText(`성공적으로 ${data.count}개의 더미 게시글이 완벽하게 빌드되었습니다.`);
        setStep(4);
      } else {
        alert(data.error || "AI 가공 또는 대량 생성에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("생성 과정 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // Step 4 Trigger: Upload Dummy Data
  const handleUploadData = async () => {
    if (generatedPosts.length === 0) {
      alert("업로드할 더미 데이터가 없습니다.");
      return;
    }
    
    const confirmMsg = apiConfig.useExternalApi 
      ? `지정한 외부 API (${apiConfig.endpointUrl})로 ${generatedPosts.length}개의 게시글을 전송하시겠습니까?`
      : `현재 사이트의 [${targetCategory}] 게시판에 ${generatedPosts.length}개의 게시글과 댓글을 직접 삽입하시겠습니까? (이 작업은 영구적입니다.)`;
      
    if (!confirm(confirmMsg)) return;

    setLoading(true);
    setStatusText("데이터 무결성 검증 및 일괄 데이터베이스 트랜잭션 주입 중...");
    try {
      const res = await fetch("/api/admin/dummy/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          posts: generatedPosts,
          category: targetCategory,
          apiConfig,
          allowHtml
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        // Reset/Go back
        setStep(1);
        setCrawledData([]);
        setGeneratedPosts([]);
      } else {
        alert(data.error || "업로드에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("업로드 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadJson = () => {
    if (generatedPosts.length === 0) return;
    const jsonStr = JSON.stringify(generatedPosts, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pinnacle_dummy_posts_${targetCategory}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const STEPS = [
    { num: 1, label: "크롤링 분석", icon: Globe },
    { num: 2, label: "AI 맥락 가공", icon: Sparkles },
    { num: 3, label: "로컬 시나리오 대량생성", icon: Cpu },
    { num: 4, label: "검증 및 업로드", icon: CheckCircle2 }
  ];

  return (
    <div className="space-y-6 animate-fade-in text-white">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 text-red-400">
          <Sparkles className="w-6 h-6 text-red-500 animate-pulse" /> 더미 게시글 생성기 (Dummy Post Generator)
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          트렌디한 외부 게시글을 크롤링하여 AI가 맥락을 유지한 상태로 풍부한 100개 단위의 고유 한국어 더미글 및 댓글을 실시간 빌드합니다.
        </p>
      </div>

      {/* Stepper progress */}
      <div className="grid grid-cols-4 gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
        {STEPS.map((s) => (
          <div 
            key={s.num}
            className={cn(
              "flex items-center gap-3 p-2 rounded-xl transition-all",
              step === s.num 
                ? "bg-red-500/10 border border-red-500/20 text-red-400 font-bold" 
                : "text-muted-foreground opacity-60"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
              step === s.num ? "bg-red-500 text-white" : "bg-white/10"
            )}>
              {s.num}
            </div>
            <div className="text-xs">
              <span className="block text-[10px] text-muted-foreground">Step {s.num}</span>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Main Form Area */}
      <div className="glass-card rounded-2xl border border-white/10 p-6 space-y-6 bg-[#0f121d]/80 backdrop-blur-xl">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-red-500/20 border-t-red-500 animate-spin" />
            <p className="text-sm font-bold text-red-400 animate-pulse">{statusText}</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Step 1: Scrape & Filter */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-red-400">1. 외부 게시판 소스 크롤링</h3>
                  <p className="text-xs text-muted-foreground">
                    대상 사이트에서 최신 트렌드를 파악하기 위해 최신 본문글과 댓글을 긁어올 URL을 입력해 주세요. (공지는 자동으로 필터링됩니다.)
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">게시판 URL 주소</label>
                    <div className="flex gap-2">
                      <input 
                        type="url" 
                        placeholder="예: https://gall.dcinside.com/board/lists?id=football"
                        value={crawlUrl}
                        onChange={(e) => setCrawlUrl(e.target.value)}
                        className="flex-1 px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-red-500/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">수집 주기 설정</label>
                      <select 
                        value={crawlScope}
                        onChange={(e) => setCrawlScope(e.target.value)}
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-red-500/50"
                      >
                        <option value="daily">일 단위 수집</option>
                        <option value="weekly">주 단위 수집 (권장)</option>
                        <option value="monthly">월 단위 수집</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">분석할 기본 게시글 수</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="10"
                        value={crawlLimit}
                        onChange={(e) => setCrawlLimit(parseInt(e.target.value) || 5)}
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-red-500/50"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">키워드 필터 (선택 사항)</label>
                      <input 
                        type="text" 
                        placeholder="예: 다저스 (비워두면 전체 수집)"
                        value={crawlKeyword}
                        onChange={(e) => setCrawlKeyword(e.target.value)}
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-red-500/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    onClick={handleStartCrawl}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover:opacity-90 transition-opacity"
                  >
                    게시판 크롤링 및 분석 시작 <Play className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: AI Settings */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-red-400">2. AI를 이용한 게시글 맥락 가공</h3>
                  <p className="text-xs text-muted-foreground">
                    수집된 원본을 가공 조건에 맞춰 AI가 새롭게 작성할 페르소나와 톤앤매너 규칙을 정의합니다.
                  </p>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setAiProvider("gemini")}
                      className={cn(
                        "flex-1 py-3 rounded-xl border font-bold text-sm transition-all",
                        aiProvider === "gemini" ? "border-red-500 bg-red-500/10 text-red-400" : "border-white/10 hover:bg-white/5"
                      )}
                    >
                      Gemini API (추천)
                    </button>
                    <button 
                      onClick={() => setAiProvider("openai")}
                      className={cn(
                        "flex-1 py-3 rounded-xl border font-bold text-sm transition-all",
                        aiProvider === "openai" ? "border-red-500 bg-red-500/10 text-red-400" : "border-white/10 hover:bg-white/5"
                      )}
                    >
                      OpenAI API
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-yellow-400" /> {aiProvider.toUpperCase()} API Key 입력
                    </label>
                    <input 
                      type="password" 
                      placeholder="sk-..."
                      value={apiKey}
                      onChange={(e) => handleApiKeyChange(e.target.value)}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">가상 필자 페르소나 (성별/연령)</label>
                    <input 
                      type="text" 
                      value={`${aiParams.gender} / ${aiParams.age}`}
                      onChange={(e) => {
                        const parts = e.target.value.split("/");
                        setAiParams({ ...aiParams, gender: parts[0]?.trim() || "무작위", age: parts[1]?.trim() || "30대" });
                      }}
                      placeholder="남성 / 20대 후반"
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">글 종류 및 성격 (분량/톤앤매너)</label>
                    <select 
                      value={aiParams.tone}
                      onChange={(e) => setAiParams({ ...aiParams, tone: e.target.value })}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none"
                    >
                      <option value="random">다채로운 톤 섞기 (위 톤앤매너 랜덤 분포)</option>
                      <option value="정성스러운 내용의 정중한 어투">정성스러운 글 (장문)</option>
                      <option value="TMI 형태의 매우 긴 장문글">TMI 형태의 긴 수다</option>
                      <option value="성의 없는 1줄짜리 짧고 가벼운 글">성의 없는 1줄 코멘트</option>
                      <option value="고민 상담 및 동정심 자극 어투">고민 상담 및 조언</option>
                      <option value="진지함이 가득한 분석글 어조">진지한 정보글</option>
                      <option value="아재개그가 섞인 가볍고 유쾌한 어조">유쾌하고 진부한 어조</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={aiParams.typos}
                      onChange={(e) => setAiParams({ ...aiParams, typos: e.target.checked })}
                      className="w-4 h-4 rounded text-red-500 bg-black border-white/20 focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-sm font-bold">오탈자 및 신조어 가끔 포함 (자연스러움 증대)</span>
                  </label>
                </div>

                <div className="flex justify-between pt-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> 이전으로
                  </button>
                  <button 
                    onClick={() => setStep(3)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover:opacity-90 transition-opacity"
                  >
                    다음 단계 설정 <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Local Engine & Scale */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-red-400">3. 로컬 로직 기반 게시글 대량 팽창</h3>
                  <p className="text-xs text-muted-foreground">
                    AI 크레딧을 절약하고 실제 활성화된 커뮤니티처럼 맥락을 자연스럽게 확장하여 더미 데이터를 조립합니다.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">최종 생성할 게시글 수량</label>
                      <input 
                        type="number" 
                        value={localParams.totalCount}
                        onChange={(e) => setLocalParams({ ...localParams, totalCount: parseInt(e.target.value) || 100 })}
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-red-500/50"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        AI가 생성한 고품질 시나리오 5개를 기반으로, 로컬 텍스트 변형 모듈이 고유한 닉네임과 일정 간격의 작성일자(조회수 비례)를 자동으로 매핑해 100개 세트를 제작합니다.
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">작성일 분포 설정</label>
                      <select 
                        value={localParams.dateMode}
                        onChange={(e) => setLocalParams({ ...localParams, dateMode: e.target.value })}
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-red-500/50"
                      >
                        <option value="random">최근 30일 간 균일 분포 (기본값)</option>
                        <option value="event">특정 사건(이슈) 시점에 집중 분포</option>
                      </select>
                    </div>

                    {localParams.dateMode === "event" && (
                      <div className="grid grid-cols-2 gap-4 animate-fade-in">
                        <div>
                          <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">기준 사건 일시</label>
                          <input 
                            type="datetime-local" 
                            value={localParams.eventDate}
                            onChange={(e) => setLocalParams({ ...localParams, eventDate: e.target.value })}
                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-red-500/50 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">집중 지속 시간 (시간)</label>
                          <input 
                            type="number" 
                            min="1"
                            max="72"
                            value={localParams.eventDuration}
                            onChange={(e) => setLocalParams({ ...localParams, eventDuration: parseInt(e.target.value) || 6 })}
                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-red-500/50"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4 text-xs">
                    <p className="font-bold text-red-400">⚙️ 로컬 적용 자동화 규칙</p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li><strong>한국식 정밀 닉네임 규칙</strong>: 오독 방지, 자연스러운 단어 접미사 결합</li>
                      <li><strong>조회수 및 피드백 상관관계</strong>: 댓글 수 ∝ 조회수 ∝ 추천 수 비례 룰 적용</li>
                      <li>
                        <strong>타임라인 분포</strong>:
                        {localParams.dateMode === 'event' 
                          ? '지정한 기준 사건 발생 직후 지정한 시간(지속 시간) 동안 게시물의 85%가 집중 생성되며, 댓글 반응 속도가 훨씬 빠르게 밀집됩니다.'
                          : '지난 30일 간 가상의 트렌디한 사건 날짜 전후로 고르게 분산 매핑됩니다.'
                        }
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button 
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> 이전으로
                  </button>
                  <button 
                    onClick={handleGenerateAndScale}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover:opacity-90 transition-opacity"
                  >
                    더미 게시글 생성하기 <Play className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Verification and Upload */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="space-y-2 flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-emerald-400">4. 최종 데이터 검증 및 일괄 배포</h3>
                    <p className="text-xs text-muted-foreground">
                      생성된 {generatedPosts.length}개의 데이터 상세 목록을 최종 확인하고 대상 사이트 및 게시판에 업로드합니다.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleDownloadJson}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold transition-all"
                    >
                      <Download className="w-3.5 h-3.5" /> JSON 다운로드
                    </button>
                  </div>
                </div>

                {/* API Config for target upload */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground block mb-1">대상 게시판 카테고리</label>
                    <select 
                      value={targetCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
                    >
                      <option value="free">자유게시판 (free)</option>
                      <option value="analysis">분석/칼럼 (analysis)</option>
                      <option value="guide">가입/입출금 가이드 (guide)</option>
                      <option value="qna">Q&A (qna)</option>
                      <option value="notices">공지사항 (notices)</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={allowHtml}
                        onChange={(e) => setAllowHtml(e.target.checked)}
                        className="w-4 h-4 rounded text-red-500 bg-black border-white/20"
                      />
                      <span className="text-xs font-bold text-white">HTML 태그 유지 (공지/분석글용)</span>
                    </label>
                    <p className="text-[9px] text-muted-foreground mt-0.5 leading-relaxed">
                      체크 해제 시 줄바꿈/띄어쓰기가 사람처럼 불규칙하게(1~3줄 개행) 텍스트로 가독성 있게 자동 변환됩니다.
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer mt-6">
                      <input 
                        type="checkbox"
                        checked={apiConfig.useExternalApi}
                        onChange={(e) => setApiConfig({ ...apiConfig, useExternalApi: e.target.checked })}
                        className="w-4 h-4 rounded text-red-500 bg-black border-white/20"
                      />
                      <span className="text-xs font-bold">외부 사이트 API로 전송</span>
                    </label>
                  </div>

                  {apiConfig.useExternalApi && (
                    <div className="col-span-1 md:col-span-3 grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                      <div>
                        <label className="text-[10px] text-muted-foreground uppercase block mb-1">API Endpoint URL</label>
                        <input 
                          type="text" 
                          placeholder="https://another-site.com/api/posts/bulk"
                          value={apiConfig.endpointUrl}
                          onChange={(e) => setApiConfig({ ...apiConfig, endpointUrl: e.target.value })}
                          className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground uppercase block mb-1">API Bearer 토큰 Key</label>
                        <input 
                          type="password" 
                          placeholder="API 토큰 입력"
                          value={apiConfig.apiKey}
                          onChange={(e) => setApiConfig({ ...apiConfig, apiKey: e.target.value })}
                          className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Preview Table list */}
                <div className="max-h-[300px] overflow-y-auto border border-white/10 rounded-xl bg-black/20">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-white/5 border-b border-white/10 uppercase tracking-widest text-[9px] text-muted-foreground sticky top-0">
                      <tr>
                        <th className="p-3">제목</th>
                        <th className="p-3">작성자</th>
                        <th className="p-3 text-center">조회수</th>
                        <th className="p-3 text-center">추천</th>
                        <th className="p-3 text-center">댓글수</th>
                        <th className="p-3">작성일</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {generatedPosts.slice(0, 10).map((p, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="p-3 font-bold truncate max-w-[200px]" title={p.title}>{p.title}</td>
                          <td className="p-3 text-muted-foreground">{p.author}</td>
                          <td className="p-3 text-center">{p.views}</td>
                          <td className="p-3 text-center">{p.likes}</td>
                          <td className="p-3 text-center text-emerald-400">[{p.comments?.length || 0}]</td>
                          <td className="p-3 text-[10px] text-muted-foreground">{p.createdAt.split('T')[0]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {generatedPosts.length > 10 && (
                    <div className="p-3 text-center text-muted-foreground text-[10px] border-t border-white/5 bg-white/[0.01]">
                      외 {generatedPosts.length - 10}개의 더미 게시글이 목록 뒤에 더 존재합니다.
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <button 
                    onClick={() => setStep(3)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> 이전으로
                  </button>

                  <div className="flex gap-2">
                    <button 
                      onClick={handleUploadData}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    >
                      <Upload className="w-4 h-4" /> 업로드 실행
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
