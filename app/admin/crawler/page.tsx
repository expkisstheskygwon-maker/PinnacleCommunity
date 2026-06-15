'use client';

import { useState, useEffect } from 'react';

export default function CrawlerAdminPage() {
  const [targets, setTargets] = useState<any[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState('spotlight');
  const [newSubCategory, setNewSubCategory] = useState('최신 동향');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTargets();
  }, []);

  const fetchTargets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/crawler/targets');
      const data = await res.json();
      if (data.success) {
        setTargets(data.targets || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    try {
      const res = await fetch('/api/crawler/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newUrl, category: newCategory, subCategory: newSubCategory })
      });
      if (res.ok) {
        setNewUrl('');
        fetchTargets();
      } else {
        const data = await res.json();
        alert(data.error || '추가 실패');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/crawler/targets?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTargets();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggle = async (id: number, currentStatus: number) => {
    try {
      const res = await fetch('/api/crawler/targets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: currentStatus === 1 ? 0 : 1 })
      });
      if (res.ok) {
        fetchTargets();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">오토 포스터 (크롤러) 타겟 관리</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold mb-4">새 타겟 URL 추가</h2>
        <form onSubmit={handleAdd} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">피나클 URL</label>
            <input 
              type="url" 
              value={newUrl} 
              onChange={e => setNewUrl(e.target.value)}
              placeholder="https://www.pinnacle.com/betting-resources/ko/..." 
              className="w-full px-4 py-2 border rounded-md"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
            <input 
              type="text" 
              value={newCategory} 
              onChange={e => setNewCategory(e.target.value)}
              className="w-32 px-4 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">서브 카테고리</label>
            <input 
              type="text" 
              value={newSubCategory} 
              onChange={e => setNewSubCategory(e.target.value)}
              className="w-32 px-4 py-2 border rounded-md"
            />
          </div>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
            추가
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-500 text-sm">ID</th>
              <th className="px-6 py-3 font-medium text-gray-500 text-sm">URL</th>
              <th className="px-6 py-3 font-medium text-gray-500 text-sm">저장 위치</th>
              <th className="px-6 py-3 font-medium text-gray-500 text-sm">마지막 수집</th>
              <th className="px-6 py-3 font-medium text-gray-500 text-sm">상태</th>
              <th className="px-6 py-3 font-medium text-gray-500 text-sm">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">로딩 중...</td></tr>
            ) : targets.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">등록된 타겟이 없습니다.</td></tr>
            ) : (
              targets.map(target => (
                <tr key={target.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">{target.id}</td>
                  <td className="px-6 py-4 text-sm max-w-xs truncate">
                    <a href={target.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      {target.url}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{target.category} / {target.subCategory}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {target.lastCrawledAt ? new Date(target.lastCrawledAt).toLocaleString() : '수집 이력 없음'}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleToggle(target.id, target.isActive)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${target.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                    >
                      {target.isActive ? '활성' : '비활성'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleDelete(target.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
