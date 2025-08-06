'use client';

import { useState } from 'react';
import Image from "next/image";

interface ApiResponse {
  _id: string;
  type: string;
  title: string;
  description: string;
  cover_image: string;
  train_mode: string;
  state: string;
  tags: string[];
  samples: string[];
  created_at: string;
  updated_at: string;
  languages: string[];
  visibility: string;
  lock_visibility: boolean;
  default_text: string;
  like_count: number;
  mark_count: number;
  shared_count: number;
  task_count: number;
  unliked: boolean;
  liked: boolean;
  marked: boolean;
  author: {
    _id: string;
    nickname: string;
    avatar: string;
  };
}

export default function TrainingAudioOnFish() {
  const [formData, setFormData] = useState({
    title: '',
    texts: '',
    authorization: '',
    visibility: 'public',
    type: 'tts',
    train_mode: 'fast',
    enhance_audio_quality: 'true'
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!audioFile) {
      setError('請選擇音頻文件');
      setIsSubmitting(false);
      return;
    }

    if (!formData.authorization) {
      setError('請輸入 Authorization Token');
      setIsSubmitting(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('voices', audioFile);
      formDataToSend.append('visibility', formData.visibility);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('train_mode', formData.train_mode);
      formDataToSend.append('enhance_audio_quality', formData.enhance_audio_quality);
      formDataToSend.append('texts', formData.texts);
      formDataToSend.append('title', formData.title);
      
      if (coverImage) {
        formDataToSend.append('cover_image', coverImage);
      }

      const response = await fetch('https://api.fish.audio/model', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${formData.authorization}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openFishAudio = () => {
    if (response?._id) {
      window.open(`https://fish.audio/zh-CN/m/${response._id}/`, '_blank');
    }
  };

  const goToTesting = () => {
    if (response?._id) {
      const testingUrl = `/testing_audio_on_fish?modelId=${response._id}&token=${encodeURIComponent(formData.authorization)}`;
      window.open(testingUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-center">訓練新聲音</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側表單 */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">聲音詳情</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">標題 *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="輸入聲音標題"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Authorization Token *</label>
                  <input
                    type="password"
                    name="authorization"
                    value={formData.authorization}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="輸入 API Token"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">可見性</label>
                  <select
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="public">公開</option>
                    {/* <option value="private">私有</option> */}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">訓練模式</label>
                  <select
                    name="train_mode"
                    value={formData.train_mode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="fast">快速</option>
                    {/* <option value="slow">慢速</option> */}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">輸入音頻</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">音頻文件 (支持 wav, m4a, 3gp, mp3) *</label>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioChange}
                      className="hidden"
                      id="audio-upload"
                    />
                    <label htmlFor="audio-upload" className="cursor-pointer">
                      <div className="text-gray-400">
                        <svg className="mx-auto h-12 w-12 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {audioFile ? audioFile.name : '點擊上傳音頻文件'}
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">封面圖片 *</label>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="hidden"
                      id="cover-upload"
                    />
                    <label htmlFor="cover-upload" className="cursor-pointer">
                      <div className="text-gray-400">
                        <svg className="mx-auto h-12 w-12 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {coverImage ? coverImage.name : '點擊上傳封面圖片'}
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">輸入內容</h2>
              <div>
                <label className="block text-sm font-medium mb-2">訓練音檔所包含的內容 *</label>
                <textarea
                  name="texts"
                  value={formData.texts}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="輸入要訓練的文本內容"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-md transition-colors"
            >
              {isSubmitting ? '訓練中...' : '訓練'}
            </button>
          </div>

          {/* 右側回應區域 */}
          <div className="space-y-6">
            {error && (
              <div className="bg-red-800 border border-red-600 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-200 mb-2">錯誤</h3>
                <p className="text-red-300">{error}</p>
              </div>
            )}

            {response && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">訓練結果</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">ID:</span>
                    <span className="text-white font-mono">{response._id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">標題:</span>
                    <span className="text-white">{response.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">狀態:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      response.state === 'trained' ? 'bg-green-600 text-green-100' : 'bg-yellow-600 text-yellow-100'
                    }`}>
                      {response.state}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">可見性:</span>
                    <span className="text-white">{response.visibility}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">訓練模式:</span>
                    <span className="text-white">{response.train_mode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">創建時間:</span>
                    <span className="text-white">{new Date(response.created_at).toLocaleString('zh-TW')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">作者:</span>
                    <span className="text-white">{response.author.nickname}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={openFishAudio}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    前往 Fish Audio 查看
                  </button>
                  <button
                    onClick={goToTesting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    測試語音合成
                  </button>
                </div>
              </div>
            )}

            {!response && !error && (
              <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-400">
                提交表單後，結果將在此處顯示
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
