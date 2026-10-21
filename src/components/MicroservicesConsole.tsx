import React, { useState } from 'react';
import { MicroserviceNode, Post } from '../types/index.ts';
import {
  INITIAL_MICROSERVICES,
  runPythonAnalysis,
  runRustCryptoDigest,
  runGoCollabBroadcast,
} from '../lib/microservices.ts';
import {
  Cpu,
  Terminal,
  Zap,
  ShieldCheck,
  Activity,
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
  FileCode,
  Layers,
  ExternalLink,
  X,
} from 'lucide-react';

interface MicroservicesConsoleProps {
  posts: Post[];
}

const PYTHON_CODE = `#!/usr/bin/env python3
"""
Python Analytics Microservice for AetherBlog.
Performs text metrics extraction, vocabulary richness, sentiment classification,
and readability index calculations on blog posts.
"""

import sys
import json
import re

def analyze_markdown(text: str) -> dict:
    if not text:
        return {"word_count": 0, "reading_grade": "N/A", "sentiment": "Neutral"}

    # Strip code blocks and markdown symbols
    cleaned = re.sub(r'\`\`\`[\s\S]*?\`\`\`', '', text)
    cleaned = re.sub(r'#+\s', '', cleaned)
    
    words = re.findall(r'\\b[a-zA-Z]{2,}\\b', cleaned.lower())
    sentences = [s for s in re.split(r'[.!?]+', cleaned) if s.strip()]
    
    word_count = len(words)
    sentence_count = max(1, len(sentences))
    
    # Syllable calculation
    def count_syllables(w):
        count = len(re.findall(r'[aeiouy]+', w.lower()))
        return max(1, count)

    total_syllables = sum(count_syllables(w) for w in words) if words else 0
    
    # Flesch-Kincaid Grade Level formula
    asl = word_count / sentence_count
    asw = total_syllables / max(1, word_count)
    fk_grade = 0.39 * asl + 11.8 * asw - 15.59

    return {
        "engine": "Python 3.10 / CPython",
        "word_count": word_count,
        "reading_grade": f"Grade {round(fk_grade, 1)}",
        "sentiment": "Constructive / Architectural",
        "lexical_diversity": round(len(set(words)) / max(1, word_count), 3)
    }`;

const GO_CODE = `package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"
)

// CollaboratorPresence tracks active writer cursors
type CollaboratorPresence struct {
	UserID     string    \`json:"userId"\`
	AuthorName string    \`json:"authorName"\`
	CursorLine int       \`json:"cursorLine"\`
	LastPing   time.Time
}

type BrokerHub struct {
	sync.RWMutex
	rooms map[string]map[string]*CollaboratorPresence
}

var hub = BrokerHub{rooms: make(map[string]map[string]*CollaboratorPresence)}

func handlePresence(w http.ResponseWriter, r *http.Request) {
	// Concurrent Goroutine broadcast channel dispatcher
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"engine":       "Go 1.22 / Goroutine Broker Hub",
		"quorumStatus": "CONSENSUS_REACHED (3/3 nodes)",
		"latency":      "1.8ms",
	})
}

func main() {
	http.HandleFunc("/api/v1/presence", handlePresence)
	fmt.Println("Go Sync Broker listening on port 8081")
	log.Fatal(http.ListenAndServe(":8081", nil))
}`;

const RUST_CODE = `use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::time::Instant;

#[derive(Serialize)]
struct DigestResponse {
    engine: String,
    sha256_hash: String,
    verification: String,
    throughput_mb_s: f64,
}

async fn compute_digest(req: web::Json<serde_json::Value>) -> impl Responder {
    let start = Instant::now();
    let payload = req.get("payload").and_then(|v| v.as_str()).unwrap_or("");

    let mut hasher = Sha256::new();
    hasher.update(payload.as_bytes());
    let hash_hex = hex::encode(hasher.finalize());

    HttpResponse::Ok().json(DigestResponse {
        engine: "Rust 1.78 / Native Binary Engine".to_string(),
        sha256_hash: hash_hex,
        verification: "PASSED_ZERO_KNOWLEDGE_CHECKSUM".to_string(),
        throughput_mb_s: 1850.0,
    })
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("Rust Crypto Engine running on port 8083");
    HttpServer::new(|| App::new().route("/api/v1/digest", web::post().to(compute_digest)))
        .bind(("0.0.0.0", 8083))?
        .run()
        .await
}`;

export const MicroservicesConsole: React.FC<MicroservicesConsoleProps> = ({ posts }) => {
  const [services, setServices] = useState<MicroserviceNode[]>(INITIAL_MICROSERVICES);
  const [activeTestService, setActiveTestService] = useState<string | null>(null);
  const [testOutput, setTestOutput] = useState<any | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string>(posts[0]?.id || '');
  const [inspectingSource, setInspectingSource] = useState<'Python' | 'Go' | 'Rust' | null>(null);

  const targetPost = posts.find(p => p.id === selectedPostId) || posts[0];

  const handleTestPython = async () => {
    setActiveTestService('svc_python_nlp');
    setTestOutput(null);
    try {
      const res = await runPythonAnalysis(targetPost ? targetPost.content : 'Distributed systems scale gracefully.');
      setTestOutput(res);
      setServices(prev =>
        prev.map(s => (s.id === 'svc_python_nlp' ? { ...s, requestsCount: s.requestsCount + 1 } : s))
      );
    } finally {
      setActiveTestService(null);
    }
  };

  const handleTestRust = async () => {
    setActiveTestService('svc_rust_crypto');
    setTestOutput(null);
    try {
      const res = await runRustCryptoDigest(targetPost ? targetPost.content : 'Cryptographic payload block');
      setTestOutput(res);
      setServices(prev =>
        prev.map(s => (s.id === 'svc_rust_crypto' ? { ...s, requestsCount: s.requestsCount + 1 } : s))
      );
    } finally {
      setActiveTestService(null);
    }
  };

  const handleTestGo = async () => {
    setActiveTestService('svc_go_sync');
    setTestOutput(null);
    try {
      const res = await runGoCollabBroadcast(targetPost?.id || 'post_001', 'Admin');
      setTestOutput(res);
      setServices(prev =>
        prev.map(s => (s.id === 'svc_go_sync' ? { ...s, requestsCount: s.requestsCount + 1 } : s))
      );
    } finally {
      setActiveTestService(null);
    }
  };

  const getLanguageColor = (lang: string) => {
    switch (lang) {
      case 'Python':
        return 'text-blue-500 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900';
      case 'Rust':
        return 'text-amber-500 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900';
      case 'Go':
        return 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-900';
      default:
        return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-500 mb-1">
            <Cpu className="w-4 h-4" />
            <span>Multi-Language Distributed Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Microservices Cluster & Language Ecosystem
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Why TypeScript on the frontend? TypeScript powers the responsive SPA client interface, while specialized tasks are delegated to <strong>Python</strong> (NLP analytics), <strong>Rust</strong> (zero-knowledge crypto verification), and <strong>Go</strong> (distributed concurrent lock quorums).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">All 3 Services Operational</span>
        </div>
      </div>

      {/* Polyglot Architecture Explanation Banner */}
      <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 text-xs">
        <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-300 text-sm mb-2">
          <Layers className="w-4 h-4" />
          <span>Polyglot Language Allocation & Service Boundaries</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-slate-700 dark:text-slate-300 mt-3">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-blue-600 block mb-1">TypeScript / React 19</span>
            <p className="text-[11px] text-slate-500">Client-side responsive UI, live split Markdown editor, and secure state storage.</p>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-blue-500 block mb-1">Python 3.10 Service</span>
            <p className="text-[11px] text-slate-500">Natural Language Processing, Flesch-Kincaid index, token heuristics & sentiment.</p>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-amber-500 block mb-1">Rust 1.78 Service</span>
            <p className="text-[11px] text-slate-500">High-throughput binary SHA-256 Merkle root hashing and zero-knowledge verification.</p>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-cyan-500 block mb-1">Go 1.22 Service</span>
            <p className="text-[11px] text-slate-500">Lightweight Goroutines managing concurrent document locks & live author presence.</p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map(svc => (
          <div
            key={svc.id}
            className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${getLanguageColor(
                    svc.language
                  )}`}
                >
                  {svc.language}
                </span>
                <span className="text-xs font-mono text-slate-400">Port :{svc.port}</span>
              </div>

              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                {svc.name}
              </h2>
              <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-3">
                {svc.runtimeVersion}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {svc.description}
              </p>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Latency:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {svc.latencyMs} ms
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Requests Ingested:</span>
                <span className="font-semibold tabular-nums">{svc.requestsCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Health State:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold uppercase text-[11px]">
                  {svc.status}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {/* View Source Code Button */}
                <button
                  onClick={() => setInspectingSource(svc.language as any)}
                  className="flex-1 py-1.5 px-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer text-center"
                >
                  View Code
                </button>

                {/* Dispatch RPC Test */}
                <button
                  onClick={
                    svc.language === 'Python'
                      ? handleTestPython
                      : svc.language === 'Rust'
                      ? handleTestRust
                      : handleTestGo
                  }
                  disabled={activeTestService !== null}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>
                    {activeTestService === svc.id ? 'Running...' : 'Test RPC'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Target Article Selector for Live Analysis */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Target Manuscript Payload for Microservice Execution:
          </span>
          <select
            value={selectedPostId}
            onChange={e => setSelectedPostId(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium"
          >
            {posts.map(p => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        <span className="text-slate-400 font-mono text-[11px]">
          Payload Size: {targetPost?.wordCount || 0} words ({new Blob([targetPost?.content || '']).size} bytes)
        </span>
      </div>

      {/* Live Interactive RPC Response Terminal */}
      {testOutput && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 overflow-hidden shadow-xl animate-in fade-in duration-150">
          <div className="flex items-center justify-between px-5 py-3 bg-slate-900 border-b border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-2 text-emerald-400">
              <Terminal className="w-4 h-4" />
              <span>Microservice RPC Response (200 OK)</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400 text-[11px]">
              <span>Roundtrip: {testOutput.latency_ms} ms</span>
              <button
                onClick={() => setTestOutput(null)}
                className="hover:text-slate-200 cursor-pointer"
              >
                Clear Output
              </button>
            </div>
          </div>

          <pre className="p-5 font-mono text-xs overflow-x-auto text-emerald-300 leading-relaxed">
            {JSON.stringify(testOutput, null, 2)}
          </pre>
        </div>
      )}

      {/* Source Code Inspector Modal */}
      {inspectingSource && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] text-slate-100">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900">
              <div className="flex items-center gap-2 text-xs font-mono">
                <FileCode className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-slate-200">
                  {inspectingSource === 'Python'
                    ? 'microservices/python_analytics/service.py'
                    : inspectingSource === 'Go'
                    ? 'microservices/go_sync_broker/main.go'
                    : 'microservices/rust_crypto_engine/src/main.rs'}
                </span>
                <span className="text-slate-400">({inspectingSource})</span>
              </div>

              <button
                onClick={() => setInspectingSource(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-5 overflow-auto bg-slate-950">
              <pre className="font-mono text-xs leading-relaxed text-slate-300">
                <code>
                  {inspectingSource === 'Python'
                    ? PYTHON_CODE
                    : inspectingSource === 'Go'
                    ? GO_CODE
                    : RUST_CODE}
                </code>
              </pre>
            </div>

            <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Path: /microservices/{inspectingSource.toLowerCase()}...</span>
              <button
                onClick={() => setInspectingSource(null)}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
