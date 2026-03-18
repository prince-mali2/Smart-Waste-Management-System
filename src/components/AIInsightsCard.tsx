import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Brain, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';

interface AIInsightsCardProps {
  reports: any[];
}

export const AIInsightsCard: React.FC<AIInsightsCardProps> = ({ reports }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSummary = async () => {
    if (reports.length === 0) {
      setSummary("No complaint data available for analysis.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      // Take latest 20 reports
      const latestReports = reports.slice(0, 20);
      const reportsText = latestReports.map(r => 
        `Priority: ${r.priority}, Status: ${r.status}, Location: ${r.location?.address || 'Unknown'}, Description: ${r.description}`
      ).join('\n');

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the following waste complaints and provide a short summary highlighting major issues, high priority areas, and trends in 2-3 lines.\n\nComplaints:\n${reportsText}`,
        config: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
        }
      });

      const text = response.text;
      if (text) {
        setSummary(text);
      } else {
        throw new Error("Empty response from AI");
      }
    } catch (err) {
      console.error("AI Summary Error:", err);
      setError("Failed to generate AI insights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reports.length > 0 && !summary) {
      generateSummary();
    }
  }, [reports]);

  return (
    <Card className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-white to-emerald-50/30 dark:from-gray-900/50 dark:to-emerald-900/10">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Brain className="h-24 w-24 text-emerald-600" />
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white">AI Insights</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={generateSummary} 
          disabled={loading}
          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="relative min-h-[80px]">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-4/6"></div>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-red-500 dark:text-red-400 text-sm"
            >
              <AlertCircle className="h-4 w-4" />
              <p>{error}</p>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed italic"
            >
              {summary || "No insights generated yet."}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {reports.length === 0 && !loading && (
        <p className="text-xs text-gray-500 mt-4">No complaint data available for analysis.</p>
      )}
    </Card>
  );
};
