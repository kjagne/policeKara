import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, Briefcase } from "lucide-react";

interface EvidenceFormProps {
  onSubmit: (formData: any, files: File[]) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const EvidenceForm: React.FC<EvidenceFormProps> = ({
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [evidenceType, setEvidenceType] = useState("physical");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newFiles = Array.from(files);
    setSelectedFiles(prev => [...prev, ...newFiles]);
    
    // Create preview URLs for images
    const newPreviewUrls = newFiles.map(file => {
      if (file.type.startsWith('image/')) {
        return URL.createObjectURL(file);
      }
      return '';
    });
    
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };
  
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    
    // Revoke object URL to avoid memory leaks
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = {
      evidenceType: form.evidenceType.value,
      description: form.description.value,
      locationFound: form.locationFound.value,
      foundDate: form.foundDate.value,
      notes: form.notes.value,
    };
    
    onSubmit(formData, selectedFiles);
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="evidenceType">Evidence Type *</Label>
                <Select 
                  name="evidenceType" 
                  value={evidenceType} 
                  onValueChange={setEvidenceType}
                >
                  <SelectTrigger id="evidenceType" className="mt-1">
                    <SelectValue placeholder="Select evidence type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="physical">Physical</SelectItem>
                    <SelectItem value="digital">Digital</SelectItem>
                    <SelectItem value="documentary">Documentary</SelectItem>
                    <SelectItem value="biological">Biological</SelectItem>
                    <SelectItem value="weapon">Weapon</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="foundDate">Date Found *</Label>
                <Input 
                  id="foundDate" 
                  name="foundDate" 
                  type="datetime-local" 
                  required 
                  className="mt-1" 
                  defaultValue={new Date().toISOString().slice(0, 16)} 
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="locationFound">Location Found *</Label>
              <Input 
                id="locationFound" 
                name="locationFound" 
                required 
                className="mt-1" 
                placeholder="Enter the location where evidence was found"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea 
                id="description" 
                name="description" 
                required 
                className="mt-1" 
                rows={3} 
                placeholder="Provide a detailed description of the evidence"
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea 
                id="notes" 
                name="notes" 
                className="mt-1" 
                rows={2} 
                placeholder="Any additional notes about the evidence"
              />
            </div>
            
            <div>
              <Label>Evidence Photos/Files</Label>
              <div className="mt-2 border-2 border-dashed rounded-md p-6 text-center">
                <input
                  type="file"
                  id="evidenceFiles"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="flex flex-col items-center">
                  <Briefcase className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium mb-1">Drag files here or click to upload</p>
                  <p className="text-xs text-muted-foreground mb-4">Upload photos or documents related to this evidence</p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => document.getElementById('evidenceFiles')?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Select Files
                  </Button>
                </div>
              </div>
              
              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <Label>Selected Files ({selectedFiles.length})</Label>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        {file.type.startsWith('image/') && previewUrls[index] ? (
