import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { X, CheckCircle, AlertTriangle } from 'lucide-react';

const AIDetectionReportModal = ({ report, onClose, artworkTitle }) => {
  if (!report) return null;

  let resultData = {};
  try {
    const parsedResult = JSON.parse(report.detection_result);
    const content = parsedResult.choices[0].message.content;
    const cleanedContent = content.replace(/```json\n|\n```/g, '');
    const vlmResult = JSON.parse(cleanedContent);
    resultData.score = vlmResult.ai_generated_score || 0;
  } catch (e) {
    console.error("Could not parse AI detection result:", e);
    resultData.score = 0; // Default to 0 if parsing fails
  }

  const isAiGenerated = report.is_ai_generated;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg bg-white rounded-lg shadow-2xl animate-in fade-in-0 zoom-in-95">
        <CardHeader className="flex flex-row items-start justify-between border-b pb-4">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">AI Detection Report</CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Analysis for: <span className="font-semibold">{artworkTitle}</span>
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className={`flex items-center p-4 rounded-lg ${isAiGenerated ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} border`}>
            {isAiGenerated ? (
              <AlertTriangle className="h-8 w-8 text-red-500 mr-4" />
            ) : (
              <CheckCircle className="h-8 w-8 text-green-500 mr-4" />
            )}
            <div>
              <h3 className={`text-lg font-semibold ${isAiGenerated ? 'text-red-800' : 'text-green-800'}`}>
                {isAiGenerated ? 'AI Content Detected' : 'Verified as Original'}
              </h3>
              <p className={`text-sm ${isAiGenerated ? 'text-red-700' : 'text-green-700'}`}>
                Our system analysis indicates this artwork is {isAiGenerated ? 'likely AI-generated' : 'not AI-generated'}.
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Confidence Score</p>
            <p className={`text-5xl font-bold ${isAiGenerated ? 'text-red-600' : 'text-green-600'}`}>
              {(resultData.score * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              (Rejected if score ≥ 90%)
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Full API Response</h4>
            <pre className="bg-gray-100 p-3 rounded-md text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(JSON.parse(report.detection_result), null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIDetectionReportModal;
