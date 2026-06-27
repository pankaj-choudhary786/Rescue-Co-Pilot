/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Volume2,
  VolumeX,
  Mic,
} from 'lucide-react';
export default function LifeSaverAgent({
  messages,
  onSendMessage,
  isAgentThinking,
  agentStatus,
  onTriggerPanic,
  onTriggerSprint,
  onTriggerSummary,
}) {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);
  const [isSpeechOn, setIsSpeechOn] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [voiceError, setVoiceError] = useState(null);
  const suggestionPills = [
    {
      label: "😰 I'm feeling overwhelmed",
      value: "I'm feeling completely overwhelmed by my current deadlines.",
    },
    {
      label: '🚨 Activate Panic Mode',
      value: 'Activate Panic Mode right now',
    },
    {
      label: '📅 Summarize my day',
      value: 'Give me an executive summary of my remaining schedule',
    },
    {
      label: '⚡ Focus Sprint',
      value: 'Activate a 25-minute deep focus block',
    },
  ];

  // Initialize browser Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';
      rec.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
      };
      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText((prev) => (prev ? prev + ' ' + transcript : transcript));
        }
      };
      rec.onerror = (event) => {
        console.warn('Speech recognition parameter error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setVoiceError(
            'Microphone permission blocked. Please open this app in a new tab if you are inside an iframe subframe, or grant mic permission in your address bar.',
          );
        } else if (event.error === 'no-speech') {
          setVoiceError(
            'No speech detected. Please speak clearly into your mic.',
          );
        } else {
          setVoiceError(`Speech error detected: ${event.error}`);
        }
      };
      rec.onend = () => {
        setIsListening(false);
      };
      setRecognition(rec);
    }
  }, []);

  // Text-To-Speech Audio Feedback synthesizer output
  useEffect(() => {
    if (isSpeechOn && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.sender === 'agent') {
        const cleanSpeakText = lastMsg.text.replace(/[*#`_~:]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanSpeakText);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [messages, isSpeechOn]);
  const toggleListening = () => {
    if (!recognition) {
      setVoiceError(
        'Speech Recognition is not supported on this preview container subframe. Try switching browser frames or grant device accessibility.',
      );
      return;
    }
    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (err) {
        console.error('Failed to trigger micro-nodes:', err);
      }
    }
  };
  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };
  const handlePillClick = (value) => {
    onSendMessage(value);
  };

  // Autoscroll chat history
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages, isAgentThinking]);
  return (
    <div
      id="ai-lifesaver-card"
      className="glassmorphism-card rounded-2xl p-5 flex flex-col h-full relative overflow-hidden border border-white/5"
    >
      {/* Decorative pulse glow in the top-right */}
      <div
        className={`absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${isAgentThinking ? 'bg-indigo-500/15' : 'bg-emerald-500/10'}`}
      ></div>

      {/* CARD HEADER */}
      <div className="flex items-center justify-between border-b border-light/5 pb-3.5 mb-3.5 shrink-0 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <span
              className={`absolute -inset-1 rounded-full opacity-60 blur-sm ${isAgentThinking ? 'bg-indigo-500/30 animate-pulse' : 'bg-emerald-500/20'}`}
            ></span>

            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
              <Bot
                className={`w-4.5 h-4.5 ${isAgentThinking ? 'animate-bounce' : ''}`}
              />
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-100 font-display flex items-center gap-1.5">
              AI Life-Saver
              <span className="text-[9px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded">
                Active Desk
              </span>
            </h2>
            <p className="text-[10px] font-mono text-slate-400 uppercase">
              Agent State:{' '}
              <span className="text-emerald-400 font-bold">{agentStatus}</span>
            </p>
          </div>
        </div>

        {/* Ambient Voice Feedback Toggle Button */}
        <button
          type="button"
          onClick={() => setIsSpeechOn(!isSpeechOn)}
          className={`flex items-center gap-1.5 text-[9px] font-mono font-bold border px-3 py-1 rounded-lg transition-all cursor-pointer ${isSpeechOn ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400 font-black shadow-md shadow-indigo-500/5' : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-350'}`}
          title={
            isSpeechOn
              ? 'Mute vocal AI response'
              : 'Activate AI vocal response feedback'
          }
        >
          {isSpeechOn ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>VOICE SYNTH ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              <span>VOICE OUT</span>
            </>
          )}
        </button>
      </div>

      {/* CHAT DISPLAY FEED */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3.5 mb-3.5 min-h-0 relative z-10">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed border ${isUser ? 'bg-indigo-600 border-indigo-500 text-white rounded-br-none shadow-[0_2px_8px_rgba(79,70,229,0.15)]' : 'bg-slate-920 border-slate-900 text-slate-350 rounded-bl-none'}`}
              >
                {/* Sender badge */}
                {!isUser && (
                  <div className="flex items-center gap-1.5 mb-1.5 font-mono text-[9px] font-bold text-indigo-450 uppercase">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Rescue Guardian</span>
                  </div>
                )}

                <p className="whitespace-pre-wrap tracking-wide">{msg.text}</p>

                {/* Sub-action Card embedded within chat if AI suggests Panic rescheduling */}
                {msg.actionRequired && (
                  <div className="mt-3.5 p-3 rounded-xl bg-rose-950/20 border border-rose-500/15 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-450 animate-bounce" />
                      <span className="text-[10px] font-mono font-semibold text-rose-400 uppercase">
                        {msg.actionRequired.label}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-350">
                      {msg.actionRequired.description}
                    </p>

                    <div className="flex gap-2 justify-end mt-1">
                      {msg.actionRequired.type === 'panic' && (
                        <button
                          type="button"
                          onClick={onTriggerPanic}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-md text-[10px] transition-colors flex items-center gap-1"
                        >
                          Execute Panic Mitigation{' '}
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                      {msg.actionRequired.type === 'sprint' && (
                        <button
                          type="button"
                          onClick={onTriggerSprint}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md text-[10px] transition-colors flex items-center gap-1"
                        >
                          Boot Focus Buffer <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-right text-[8px] font-mono text-slate-500 mt-1 uppercase">
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* AI Thinking Animation */}
        {isAgentThinking && (
          <div className="flex justify-start">
            <div className="bg-slate-925/90 border border-white/5 rounded-2xl rounded-bl-none p-4 max-w-[80%] flex items-center gap-3">
              <div className="flex gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                  style={{
                    animationDelay: '0ms',
                  }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                  style={{
                    animationDelay: '150ms',
                  }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                  style={{
                    animationDelay: '300ms',
                  }}
                />
              </div>
              <span className="text-[10px] font-mono text-slate-450 uppercase font-bold animate-pulse">
                Analyzing Calamity Path...
              </span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* SUGGESTION PILLS SHORTCUT */}
      {messages.length < 5 && (
        <div className="shrink-0 mb-3.5 relative z-10">
          <p className="text-[9px] font-mono text-slate-550 font-bold uppercase tracking-wider mb-1.5">
            Suggested Intercepts
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestionPills.map((pill, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePillClick(pill.value)}
                className="text-[10px] bg-slate-920 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 px-2.5 py-1 rounded-lg text-slate-400 hover:text-slate-200 transition-all cursor-pointer font-semibold"
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* VOICE ASSISTANCE ERROR INFORMATION BANNER */}
      {voiceError && (
        <div className="shrink-0 mb-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-200 font-mono relative z-10 flex items-start justify-between gap-2.5">
          <div className="flex gap-2">
            <span className="text-amber-400 font-black">ℹ️</span>
            <span className="leading-relaxed">{voiceError}</span>
          </div>
          <button
            type="button"
            onClick={() => setVoiceError(null)}
            className="text-slate-500 hover:text-slate-200 cursor-pointer font-black text-xs px-1"
          >
            ×
          </button>
        </div>
      )}

      {/* CORE INPUT BOX */}
      <form
        onSubmit={handleSend}
        className="shrink-0 relative z-10 flex gap-1.5"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            isListening
              ? '🎤 Listening to your voice... Speak now!'
              : "Instruct the Guardian: 'I feel completely swamped...'"
          }
          className={`flex-1 bg-slate-920 text-xs px-4 py-3 rounded-xl border transition-all placeholder:text-slate-500 duration-300 ${isListening ? 'border-rose-500/80 text-rose-300 bg-rose-950/10 ring-2 ring-rose-500/20' : 'border-slate-900 text-slate-300 focus:outline-none focus:border-indigo-500/80 focus:bg-slate-920/80'}`}
          disabled={isAgentThinking}
        />

        {/* VOICE INPUT DIRECT MICROPHONE BUTTON */}
        <button
          type="button"
          onClick={toggleListening}
          disabled={isAgentThinking}
          className={`px-3.5 rounded-xl border flex items-center justify-center shrink-0 cursor-pointer transition-all duration-300 ${isListening ? 'bg-rose-500/15 border-rose-500/40 text-rose-400 animate-pulse shadow-md shadow-rose-500/20' : 'bg-slate-920 border-slate-900 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-400'}`}
          title={
            isListening
              ? 'Click to stop dictation'
              : 'Click to dictate command via hardware Microphone'
          }
        >
          {isListening ? (
            <Mic className="w-4 h-4 animate-bounce text-rose-450" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>

        <button
          type="submit"
          id="btn-agent-send"
          disabled={!inputText.trim() || isAgentThinking}
          className="px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white hover:glow-indigo disabled:opacity-40 disabled:hover:shadow-none transition-all flex items-center justify-center shrink-0 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
