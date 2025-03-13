import React from "react";
import { API_BASE_URL } from "@/config";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DollarSign, X } from "lucide-react";

interface AnalysisResultsProps {
  screenshotPath: string | null;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ screenshotPath }) => {
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  if (!screenshotPath) return null;

  // Extract the base path and filename without extension
  const basePath = screenshotPath.substring(0, screenshotPath.lastIndexOf("."));
  const parts = [`${basePath}_part1.jpg`, `${basePath}_part2.jpg`, `${basePath}_part3.jpg`];

  // Convert Node.js paths to URL paths
  const getImageUrl = (path: string) => {
    console.log("path", path);
    // Extract everything after 'screenshots/'
    const relativePath = path.split("screenshots/")[1];
    // Use the Python API URL with /api prefix
    return `${API_BASE_URL}/screenshots/${relativePath}`;
  };

  return (
    <div className="mt-4 space-y-4">
      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
        <DollarSign className="w-4 h-4 mr-2 text-[#9b87f5]" />
        PDP Analysis Results
      </h4>
      <div className="grid grid-cols-3 gap-4">
        {parts.map((path, index) => (
          <div
            key={index}
            className="relative rounded-lg overflow-hidden shadow-lg cursor-pointer transition-transform hover:scale-105"
            onClick={() => setSelectedImage(getImageUrl(path))}
          >
            <img
              src={getImageUrl(path)}
              alt={`Screenshot part ${index + 1}`}
              className="w-full h-48 object-cover"
              loading="lazy"
            />
            <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              Part {index + 1}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-screen-lg w-full p-0">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <span className="sr-only">Close</span>
          </button>
          {selectedImage && (
            <img src={selectedImage} alt="Full size screenshot" className="w-full h-auto" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnalysisResults;
