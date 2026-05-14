"use client";

import { useState } from "react";
import { X, Send, Loader2, Mail } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
}

export default function ContactModal({ isOpen, onClose, isLoggedIn }: ContactModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    email: '',
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        alert(data.message);
        onClose();
        setFormData({ title: '', email: '', content: '' });
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-lg rounded-3xl overflow-hidden animate-scale-in border-white/10 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="p-6 md:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">1:1 문의하기</h2>
            <p className="text-sm text-muted-foreground">
              {isLoggedIn ? "문의하신 내용은 마이페이지에서 확인하실 수 있습니다." : "답변을 받으실 이메일 주소를 입력해주세요."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoggedIn && (
              <div>
                <label className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1 mb-1.5 block">Email</label>
                <input
                  type="email"
                  required
                  placeholder="답변 받을 이메일 주소"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-primary/50 transition-all text-sm font-medium"
                />
              </div>
            )}
            
            <div>
              <label className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1 mb-1.5 block">Title</label>
              <input
                type="text"
                required
                placeholder="문의 제목을 입력해주세요"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-primary/50 transition-all text-sm font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1 mb-1.5 block">Content</label>
              <textarea
                required
                placeholder="문의 내용을 상세히 입력해주세요"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-primary/50 transition-all text-sm font-medium min-h-[150px] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold disabled:opacity-50 mt-2"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> 문의 접수하기</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
