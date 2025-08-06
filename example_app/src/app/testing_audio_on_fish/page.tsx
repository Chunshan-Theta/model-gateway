'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface ModelInfo {
  _id: string;
  type: string;
  title: string;
  description: string;
  cover_image: string;
  author: {
    _id: string;
    nickname: string;
    avatar: string;
  };
}

export default function TestingAudioOnFish() {
  const searchParams = useSearchParams();
  const [modelId, setModelId] = useState<string>('');
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [formData, setFormData] = useState({
    text: '',
    authorization: '',
    model: 'speech-1.5',
    temperature: 0.0,
    top_p: 0.9,
    reference_id: '',
    prosody: '',
    speed: 1.0,
    volume: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingModel, setIsLoadingModel] = useState(false);

  useEffect(() => {
    const urlModelId = searchParams.get('modelId') || searchParams.get('id');
    const urlToken = searchParams.get('token');
    
    if (urlModelId) {
      setModelId(urlModelId);
      setFormData(prev => ({ ...prev, reference_id: urlModelId }));
    }
    
    if (urlToken) {
      setFormData(prev => ({ ...prev, authorization: decodeURIComponent(urlToken) }));
    }
    
    // 如果有 token 和模型 ID，立即載入模型信息
    if (urlModelId && urlToken) {
      fetchModelInfo(urlModelId, decodeURIComponent(urlToken));
    }
  }, [searchParams]);

  // 當 authorization token 變化時，如果有模型 ID 則重新載入模型信息
  useEffect(() => {
    if (formData.authorization && modelId && !modelInfo) {
      fetchModelInfo(modelId);
    }
  }, [formData.authorization, modelId, modelInfo]);

  const fetchModelInfo = async (id: string, token?: string) => {
    const authToken = token || formData.authorization;
    if (!authToken) return;
    
    setIsLoadingModel(true);
    try {
      const response = await fetch(`https://api.fish.audio/model/${id}`, {
        headers: {
          'Authorization': authToken
        }
      });

      if (response.ok) {
        const modelData: ModelInfo = await response.json();
        setModelInfo(modelData);
      }
    } catch (err) {
      console.error('獲取模型信息失敗:', err);
    } finally {
      setIsLoadingModel(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleModelIdSubmit = () => {
    if (modelId && formData.authorization) {
      setFormData(prev => ({ ...prev, reference_id: modelId }));
      fetchModelInfo(modelId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setAudioUrl(null);

    if (!formData.text) {
      setError('請輸入要轉換的文本');
      setIsSubmitting(false);
      return;
    }

    if (!formData.authorization) {
      setError('請輸入 Authorization Token');
      setIsSubmitting(false);
      return;
    }

    if (!formData.reference_id) {
      setError('請輸入模型 ID');
      setIsSubmitting(false);
      return;
    }

    try {
      const requestBody = {
        input: formData.text,
        model: formData.reference_id,
        base_model: formData.model,
        temperature: formData.temperature,
        top_p: formData.top_p,
        speed: formData.speed,
        volume: formData.volume,
        references: [
          {
            reference_id: formData.reference_id
          }
        ]
      };

      if (formData.prosody) {
        (requestBody as any).prosody = formData.prosody;
      }

      const response = await fetch('https://voiss-models.zeabur.app/tts/fishaudio/v2/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      // 創建音頻 URL
      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

    } catch (err) {
      setError(err instanceof Error ? err.message : '語音合成失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-center">文本轉語音</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側表單 */}
          <div className="space-y-6">
            {/* 模型設置 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">模型設置</h2>
              
              <div className="space-y-4">
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
                  <label className="block text-sm font-medium mb-2">模型 ID *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={modelId}
                      onChange={(e) => setModelId(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="輸入模型 ID 或從網址獲取"
                    />
                    <button
                      onClick={handleModelIdSubmit}
                      disabled={!modelId || !formData.authorization || isLoadingModel}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-md transition-colors"
                    >
                      {isLoadingModel ? '載入中...' : '載入'}
                    </button>
                  </div>
                  {modelId && !formData.authorization && (
                    <p className="text-sm text-yellow-400 mt-1">請先輸入 Authorization Token 再載入模型</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">語音模型</label>
                  <select
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="speech-1.5">speech-1.5</option>
                    <option value="speech-1.6">speech-1.6</option>
                    <option value="s1">s1</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 高級設置 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">高級設置</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">變化度 ({formData.temperature})</label>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">0</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={formData.temperature}
                      onChange={(e) => setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-400">1</span>
                    <span className="text-sm text-white w-12">{formData.temperature}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">速度 ({formData.speed}x)</label>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">0.5x</span>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={formData.speed}
                      onChange={(e) => setFormData(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-400">2x</span>
                    <span className="text-sm text-white w-12">{formData.speed}x</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">音量 ({formData.volume})</label>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">-10</span>
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      step="1"
                      value={formData.volume}
                      onChange={(e) => setFormData(prev => ({ ...prev, volume: parseInt(e.target.value) }))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-400">10</span>
                    <span className="text-sm text-white w-12">{formData.volume}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Top P ({formData.top_p})</label>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">0.1</span>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={formData.top_p}
                      onChange={(e) => setFormData(prev => ({ ...prev, top_p: parseFloat(e.target.value) }))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-400">1</span>
                    <span className="text-sm text-white w-12">{formData.top_p}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 輸入內容 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">輸入內容</h2>
              <div>
                <label className="block text-sm font-medium mb-2">要轉換的文本 *</label>
                <textarea
                  name="text"
                  value={formData.text}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="不是說了不要嗎？你怎麼搞得像是好的呢？"
                  required
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-400">標點</span>
                  <span className="text-sm text-gray-400">{formData.text.length} / 500 characters</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.text || !formData.authorization || !formData.reference_id}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-md transition-colors"
            >
              {isSubmitting ? '生成中...' : '生成語音'}
            </button>
          </div>

          {/* 右側信息和結果區域 */}
          <div className="space-y-6">
            {/* 模型信息 */}
            {modelInfo && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">模型信息</h3>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden">
                    {modelInfo.cover_image && (
                      <img
                        src={modelInfo.cover_image}
                        alt={modelInfo.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{modelInfo.title}</h4>
                    <p className="text-sm text-gray-400 mt-1">{modelInfo.description}</p>
                    <p className="text-sm text-gray-500 mt-2">作者: {modelInfo.author.nickname}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 錯誤信息 */}
            {error && (
              <div className="bg-red-800 border border-red-600 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-200 mb-2">錯誤</h3>
                <p className="text-red-300">{error}</p>
              </div>
            )}

            {/* 音頻結果 */}
            {audioUrl && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">生成的語音</h3>
                <audio controls className="w-full">
                  <source src={audioUrl} type="audio/mpeg" />
                  您的瀏覽器不支持音頻播放。
                </audio>
                <div className="mt-4">
                  <a
                    href={audioUrl}
                    download="generated_speech.mp3"
                    className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    下載音頻
                  </a>
                </div>
              </div>
            )}

            {/* 載入中狀態 */}
            {(isSubmitting || isLoadingModel) && (
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-400">
                  {isLoadingModel ? '載入模型信息中...' : '生成語音中...'}
                </p>
              </div>
            )}

            {/* 默認提示 */}
            {!audioUrl && !error && !isSubmitting && !isLoadingModel && (
              <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-400">
                填寫表單並點擊"生成語音"來創建音頻
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
