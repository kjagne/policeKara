import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Brain,
  BarChart2,
  TrendingUp,
  Map,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Play,
  Save,
  Download,
  Settings,
  Filter,
  Sliders,
  Eye,
  Plus,
  Trash2,
  Edit,
  Layers,
  FileText,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Types
interface PredictionModel {
  id: string;
  name: string;
  description: string;
  type: string;
  status: "active" | "training" | "inactive" | "failed";
  accuracy: number;
  last_trained: string;
  created_at: string;
  updated_at: string;
  parameters: any;
  features: string[];
  created_by?: string;
}

interface PredictionResult {
  id: string;
  model_id: string;
  prediction_date: string;
  target_date: string;
  district: string;
  crime_type: string;
  predicted_count: number;
  confidence: number;
  actual_count?: number;
  accuracy?: number;
  created_at: string;
  model?: PredictionModel;
}

interface ModelTrainingJob {
  id: string;
  model_id: string;
  status: "queued" | "running" | "completed" | "failed";
  progress: number;
  start_time: string;
  end_time?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
  model?: PredictionModel;
}

const PredictiveModeling: React.FC = () => {
  const [models, setModels] = useState<PredictionModel[]>([]);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [trainingJobs, setTrainingJobs] = useState<ModelTrainingJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("models");
  const [selectedModel, setSelectedModel] = useState<PredictionModel | null>(null);
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);
  const [isPredictionDialogOpen, setIsPredictionDialogOpen] = useState(false);
  const [isTrainingDialogOpen, setIsTrainingDialogOpen] = useState(false);
  const [newModelData, setNewModelData] = useState({
    name: "",
    description: "",
    type: "regression",
    features: [] as string[],
    parameters: {},
  });
  const [newPredictionData, setNewPredictionData] = useState({
    model_id: "",
    target_date: new Date().toISOString().split("T")[0],
    district: "all",
    crime_type: "all",
  });
  const [availableFeatures, setAvailableFeatures] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [crimeTypes, setCrimeTypes] = useState<string[]>([]);
  const [activeTrainingJob, setActiveTrainingJob] = useState<ModelTrainingJob | null>(null);

  useEffect(() => {
    fetchModels();
    fetchPredictions();
    fetchTrainingJobs();
    fetchMetadata();
  }, []);

  // Simulate polling for training job updates
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTrainingJob && activeTrainingJob.status === "running") {
      interval = setInterval(() => {
        updateTrainingJobProgress();
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTrainingJob]);

  const fetchModels = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("prediction_models")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setModels(data);
      }
    } catch (error) {
      console.error("Error fetching prediction models:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPredictions = async () => {
    try {
      const { data, error } = await supabase
        .from("prediction_results")
        .select("*, model:model_id(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setPredictions(data);
      }
    } catch (error) {
      console.error("Error fetching predictions:", error);
    }
  };

  const fetchTrainingJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("model_training_jobs")
        .select("*, model:model_id(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setTrainingJobs(data);
        // Find any active training job
        const activeJob = data.find(job => job.status === "running");
        if (activeJob) {
          setActiveTrainingJob(activeJob);
        }
      }
    } catch (error) {
      console.error("Error fetching training jobs:", error);
    }
  };

  const fetchMetadata = async () => {
    try {
      // Fetch available features
      setAvailableFeatures([
        "crime_type",
        "district",
        "time_of_day",
        "day_of_week",
        "month",
        "temperature",
        "precipitation",
        "holiday",
        "event",
        "population_density",
        "unemployment_rate",
        "previous_incidents",
      ]);

      // Fetch districts
      const { data: districtData, error: districtError } = await supabase
        .from("crime_incidents")
        .select("district")
        .order("district")
        .limit(100);

      if (districtError) throw districtError;

      if (districtData) {
        const uniqueDistricts = Array.from(
          new Set(districtData.map((item) => item.district))
        );
        setDistricts(uniqueDistricts);
      }

      // Fetch crime types
      const { data: crimeTypeData, error: crimeTypeError } = await supabase
        .from("crime_incidents")
        .select("crime_type")
        .order("crime_type")
        .limit(100);

      if (crimeTypeError) throw crimeTypeError;

      if (crimeTypeData) {
        const uniqueTypes = Array.from(
          new Set(crimeTypeData.map((item) => item.crime_type))
        );
        setCrimeTypes(uniqueTypes);
      }
    } catch (error) {
      console.error("Error fetching metadata:", error);
    }
  };

  const handleCreateModel = async () => {
    if (!newModelData.name || newModelData.features.length === 0) {
      alert("Please provide a name and select at least one feature");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("prediction_models")
        .insert([
          {
            name: newModelData.name,
            description: newModelData.description,
            type: newModelData.type,
            status: "inactive",
            accuracy: 0,
            features: newModelData.features,
            parameters: newModelData.parameters,
            created_by: "current-user-id", // Replace with actual user ID
          },
        ])
        .select();

      if (error) throw error;

      if (data) {
        await fetchModels();
        setIsModelDialogOpen(false);
        setNewModelData({
          name: "",
          description: "",
          type: "regression",
          features: [],
          parameters: {},
        });
        alert("Model created successfully!");
      }
    } catch (error) {
      console.error("Error creating model:", error);
      alert("Failed to create model. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteModel = async (modelId: string) => {
    if (!confirm("Are you sure you want to delete this model?")) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("prediction_models")
        .delete()
        .eq("id", modelId);

      if (error) throw error;

      await fetchModels();
      alert("Model deleted successfully!");
    } catch (error) {
      console.error("Error deleting model:", error);
      alert("Failed to delete model. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrainModel = async (model: PredictionModel) => {
    setSelectedModel(model);
    setIsTrainingDialogOpen(true);
  };

  const startModelTraining = async () => {
    if (!selectedModel) return;

    setIsLoading(true);
    try {
      // Update model status
      await supabase
        .from("prediction_models")
        .update({ status: "training", updated_at: new Date().toISOString() })
        .eq("id", selectedModel.id);

      // Create training job
      const { data, error } = await supabase
        .from("model_training_jobs")
        .insert([
          {
            model_id: selectedModel.id,
            status: "running",
            progress: 0,
            start_time: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;

      if (data) {
        setActiveTrainingJob(data[0]);
        await fetchModels();
        await fetchTrainingJobs();
        setIsTrainingDialogOpen(false);
      }
    } catch (error) {
      console.error("Error starting model training:", error);
      alert("Failed to start training. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateTrainingJobProgress = () => {
    if (!activeTrainingJob) return;

    // Simulate progress updates
    const newProgress = Math.min(activeTrainingJob.progress + Math.random() * 5, 100);
    setActiveTrainingJob({
      ...activeTrainingJob,
      progress: newProgress,
      status: newProgress >= 100 ? "completed" : "running",
    });

    // If training is complete, update the model and job
    if (newProgress >= 100) {
      completeTraining();
    }
  };

  const completeTraining = async () => {
    if (!activeTrainingJob) return;

    try {
      // Update training job
      await supabase
        .from("model_training_jobs")
        .update({
          status: "completed",
          progress: 100,
          end_time: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", activeTrainingJob.id);

      // Update model
      const accuracy = 0.75 + Math.random() * 0.2; // Random accuracy between 75% and 95%
      await supabase
        .from("prediction_models")
        .update({
          status: "active",
          accuracy,
          last_trained: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", activeTrainingJob.model_id);

      await fetchModels();
      await fetchTrainingJobs();
      setActiveTrainingJob(null);
      alert("Model training completed successfully!");
    } catch (error) {
      console.error("Error completing training:", error);
    }
  };

  const handleCreatePrediction = async () => {
    if (!newPredictionData.model_id || !newPredictionData.target_date) {
      alert("Please select a model and target date");
      return;
    }

    setIsLoading(true);
    try {
      // Generate a random prediction count and confidence
      const predictedCount = Math.floor(Math.random() * 50) + 1;
      const confidence = 0.6 + Math.random() * 0.35; // Random confidence between 60% and 95%

      const { data, error } = await supabase
        .from("prediction_results")
        .insert([
          {
            model_id: newPredictionData.model_id,
            prediction_date: new Date().toISOString(),
            target_date: newPredictionData.target_date,
            district: newPredictionData.district,
            crime_type: newPredictionData.crime_type,
            predicted_count: predictedCount,
            confidence,
          },
        ])
        .select();

      if (error) throw error;

      if (data) {
        await fetchPredictions();
        setIsPredictionDialogOpen(false);
        setNewPredictionData({
          model_id: "",
          target_date: new Date().toISOString().split("T")[0],
          district: "all",
          crime_type: "all",
        });
        alert("Prediction generated successfully!");
      }
    } catch (error) {
      console.error("Error creating prediction:", error);
      alert("Failed to generate prediction. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePrediction = async (predictionId: string) => {
    if (!confirm("Are you sure you want to delete this prediction?")) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("prediction_results")
        .delete()
        .eq("id", predictionId);

      if (error) throw error;

      await fetchPredictions();
      alert("Prediction deleted successfully!");
    } catch (error) {
      console.error("Error deleting prediction:", error);
      alert("Failed to delete prediction. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Data for model performance chart
  const getModelPerformanceData = () => {
    return models.map((model) => ({
      name: model.name,
      accuracy: model.accuracy * 100,
    }));
  };

  // Data for prediction accuracy chart
  const getPredictionAccuracyData = () => {
    const filteredPredictions = predictions.filter(
      (pred) => pred.actual_count !== undefined
    );
    return filteredPredictions.map((pred) => ({
      name: `${pred.crime_type} (${formatDate(pred.target_date)})`,
      predicted: pred.predicted_count,
      actual: pred.actual_count || 0,
    }));
  };

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <div className="w-full h-full p-6 bg-background">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Predictive Modeling</h1>
          <p className="text-muted-foreground">
            Create, train, and use AI models to predict crime patterns
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsPredictionDialogOpen(true)}
          >
            <TrendingUp className="mr-2 h-4 w-4" /> Generate Prediction
          </Button>
          <Button onClick={() => setIsModelDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Model
          </Button>
        </div>
      </div>

      {activeTrainingJob && activeTrainingJob.status === "running" && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start">
              <Brain className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-blue-800">
                  Training model: {activeTrainingJob.model?.name}
                </h3>
                <div className="mt-2">
                  <Progress
                    value={activeTrainingJob.progress}
                    className="h-2"
                  />
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  {activeTrainingJob.progress.toFixed(0)}% complete
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>AI Models</CardTitle>
            <CardDescription>Predictive models available</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{models.length}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {models.filter((m) => m.status === "active").length} active models
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Predictions</CardTitle>
            <CardDescription>Generated crime forecasts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{predictions.length}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {predictions.filter((p) => new Date(p.target_date) > new Date()).length} upcoming predictions
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Average Accuracy</CardTitle>
            <CardDescription>Model prediction performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {models.length > 0
                ? `${(models.reduce((acc, model) => acc + model.accuracy, 0) / models.length * 100).toFixed(1)}%`
                : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="models" className="flex items-center">
            <Brain className="mr-2 h-4 w-4" />
            AI Models
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center">
            <TrendingUp className="mr-2 h-4 w-4" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center">
            <BarChart2 className="mr-2 h-4 w-4" />
            Performance Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Prediction Models</CardTitle>
              <CardDescription>
                Manage and train your crime prediction models
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : models.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Model Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Features</TableHead>
                        <TableHead>Accuracy</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Trained</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {models.map((model) => (
                        <TableRow key={model.id}>
                          <TableCell className="font-medium">
                            {model.name}
                          </TableCell>
                          <TableCell>
                            {model.type.charAt(0).toUpperCase() +
                              model.type.slice(1)}
                          </TableCell>
                          <TableCell>
                            {model.features.length} features
                          </TableCell>
                          <TableCell>
                            {model.accuracy > 0
                              ? `${(model.accuracy * 100).toFixed(1)}%`
                              : "Not trained"}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                model.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : model.status === "training"
                                  ? "bg-blue-100 text-blue-800"
                                  : model.status === "failed"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {model.status.charAt(0).toUpperCase() +
                                model.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {model.last_trained
                              ? formatDate(model.last_trained)
                              : "Never"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              {model.status !== "training" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleTrainModel(model)}
                                >
                                  <Play className="h-4 w-4 text-green-500" />
                                  <span className="sr-only">Train</span>
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteModel(model.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-2 text-sm font-semibold">No models yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Get started by creating a new prediction model.
                  </p>
                  <div className="mt-6">
                    <Button onClick={() => setIsModelDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" /> New Model
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Training Jobs</CardTitle>
              <CardDescription>
                History of model training activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trainingJobs.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Model</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>End Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Progress</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trainingJobs.slice(0, 5).map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">
                            {job.model?.name || "Unknown Model"}
                          </TableCell>
                          <TableCell>{formatDate(job.start_time)}</TableCell>
                          <TableCell>
                            {job.end_time ? formatDate(job.end_time) : "In progress"}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                job.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : job.status === "running"
                                  ? "bg-blue-100 text-blue-800"
                                  : job.status === "failed"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {job.status.charAt(0).toUpperCase() +
                                job.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${
                                  job.status === "completed"
                                    ? "bg-green-500"
                                    : job.status === "running"
                                    ? "bg-blue-500"
                                    : job.status === "failed"
                                    ? "bg-red-500"
                                    : "bg-gray-500"
                                }`}
                                style={{ width: `${job.progress}%` }}
                              ></div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No training jobs found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Crime Predictions</CardTitle>
              <CardDescription>
                AI-generated crime forecasts and their accuracy
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : predictions.length > 0 ? (
                <div className="rounded-md border">
                  <Table