import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dna, Cpu, BarChart3, CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import { eDNAData, ProcessedData } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";

interface DataProcessorProps {
  data: eDNAData[];
  onProcessingComplete: (processedData: ProcessedData) => void;
}

interface ProcessingStep {
  id: string;
  label: string;
  description: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  icon: any;
}

export const DataProcessor = ({ data, onProcessingComplete }: DataProcessorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [steps, setSteps] = useState<ProcessingStep[]>([
    {
      id: 'preprocess',
      label: 'Preprocessing',
      description: 'Quality filtering and sequence cleanup',
      progress: 0,
      status: 'pending',
      icon: Dna
    },
    {
      id: 'taxonomy',
      label: 'AI Taxonomy Classification',
      description: 'Deep learning sequence analysis',
      progress: 0,
      status: 'pending',
      icon: Cpu
    },
    {
      id: 'clustering',
      label: 'Clustering Analysis',
      description: 'Grouping unknown sequences',
      progress: 0,
      status: 'pending',
      icon: BarChart3
    },
    {
      id: 'biodiversity',
      label: 'Biodiversity Metrics',
      description: 'Computing diversity indices',
      progress: 0,
      status: 'pending',
      icon: CheckCircle
    }
  ]);
  const [processedResults, setProcessedResults] = useState<ProcessedData | null>(null);
  const { toast } = useToast();

  const updateStepProgress = (stepIndex: number, progress: number, status: ProcessingStep['status']) => {
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, progress, status } : step
    ));
    
    // Update overall progress
    const totalProgress = steps.reduce((sum, step, index) => 
      sum + (index <= stepIndex ? (index === stepIndex ? progress : 100) : 0), 0
    ) / steps.length;
    setOverallProgress(totalProgress);
  };

  const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Preprocessing functions
  const preprocessSequences = async (sequences: eDNAData[]): Promise<eDNAData[]> => {
    updateStepProgress(0, 0, 'processing');
    
    const processed: eDNAData[] = [];
    
    for (let i = 0; i < sequences.length; i++) {
      const seq = sequences[i];
      
      // Quality filtering
      const minLength = 10;
      const maxLength = 500;
      const minReadCount = 5;
      
      // Filter by sequence length and read count
      if (seq.raw_sequence.length >= minLength && 
          seq.raw_sequence.length <= maxLength && 
          seq.read_count >= minReadCount) {
        
        // Clean sequence (remove invalid characters)
        const cleanedSequence = seq.raw_sequence.replace(/[^ATCGN]/gi, '');
        
        if (cleanedSequence.length > 0) {
          processed.push({
            ...seq,
            raw_sequence: cleanedSequence
          });
        }
      }
      
      // Update progress
      updateStepProgress(0, (i + 1) / sequences.length * 100, 'processing');
      
      // Simulate processing time
      if (i % 10 === 0) await simulateDelay(50);
    }
    
    updateStepProgress(0, 100, 'completed');
    return processed;
  };

  // Simulated AI taxonomy classification
  const classifyTaxonomy = async (sequences: eDNAData[]) => {
    updateStepProgress(1, 0, 'processing');
    
    // Simulated taxonomy database
    const knownTaxa = [
      'Bacteria;Proteobacteria;Gammaproteobacteria',
      'Bacteria;Bacteroidetes;Flavobacteriia',
      'Eukaryota;Stramenopiles;Bacillariophyta',
      'Eukaryota;Alveolata;Dinoflagellata',
      'Bacteria;Actinobacteria;Actinobacteria',
      'Eukaryota;Opisthokonta;Metazoa;Arthropoda',
      'Eukaryota;Archaeplastida;Chlorophyta',
      'Bacteria;Cyanobacteria;Oscillatoriophycideae'
    ];

    const results = [];
    
    for (let i = 0; i < sequences.length; i++) {
      const seq = sequences[i];
      
      // Simulate AI classification based on sequence features
      const seqHash = seq.raw_sequence.split('').reduce((hash, char) => {
        return char.charCodeAt(0) + ((hash << 5) - hash);
      }, 0);
      
      const confidence = 0.6 + (Math.abs(seqHash) % 40) / 100; // 0.6-1.0
      const taxonIndex = Math.abs(seqHash) % knownTaxa.length;
      
      results.push({
        sequence_id: seq.sequence_id,
        predicted_taxon: knownTaxa[taxonIndex],
        confidence: parseFloat(confidence.toFixed(3))
      });
      
      updateStepProgress(1, (i + 1) / sequences.length * 100, 'processing');
      
      if (i % 20 === 0) await simulateDelay(100);
    }
    
    updateStepProgress(1, 100, 'completed');
    return results;
  };

  // Clustering for unknown sequences
  const performClustering = async (taxonomyResults: any[]) => {
    updateStepProgress(2, 0, 'processing');
    
    // Identify low-confidence predictions for clustering
    const lowConfidenceThreshold = 0.7;
    const unknownSequences = taxonomyResults.filter(result => result.confidence < lowConfidenceThreshold);
    
    // Simple clustering simulation
    const clusters: { [key: number]: string[] } = {};
    let clusterId = 1;
    
    unknownSequences.forEach((result, index) => {
      // Simulate clustering algorithm
      const clusterAssignment = (index % 3) + 1; // Simple grouping for demo
      
      if (!clusters[clusterAssignment]) {
        clusters[clusterAssignment] = [];
      }
      clusters[clusterAssignment].push(result.sequence_id);
      result.cluster_id = clusterAssignment;
      
      updateStepProgress(2, (index + 1) / unknownSequences.length * 100, 'processing');
    });
    
    await simulateDelay(500);
    updateStepProgress(2, 100, 'completed');
    
    return taxonomyResults;
  };

  // Biodiversity calculations
  const calculateBiodiversity = async (sequences: eDNAData[], taxonomyResults: any[]) => {
    updateStepProgress(3, 0, 'processing');
    
    // Create abundance matrix
    const speciesAbundance: { [taxon: string]: number } = {};
    
    taxonomyResults.forEach(result => {
      const taxon = result.predicted_taxon;
      const sequence = sequences.find(s => s.sequence_id === result.sequence_id);
      if (sequence) {
        speciesAbundance[taxon] = (speciesAbundance[taxon] || 0) + sequence.read_count;
      }
    });
    
    const abundances = Object.values(speciesAbundance);
    const totalReads = abundances.reduce((sum, count) => sum + count, 0);
    const proportions = abundances.map(count => count / totalReads);
    
    updateStepProgress(3, 25, 'processing');
    await simulateDelay(200);
    
    // Species richness
    const species_richness = Object.keys(speciesAbundance).length;
    
    updateStepProgress(3, 50, 'processing');
    await simulateDelay(200);
    
    // Shannon index: H = -Σ(p_i * ln(p_i))
    const shannon_index = -proportions.reduce((sum, p) => sum + (p * Math.log(p)), 0);
    
    updateStepProgress(3, 75, 'processing');
    await simulateDelay(200);
    
    // Simpson index: D = Σ(p_i^2)
    const simpson_index = proportions.reduce((sum, p) => sum + (p * p), 0);
    
    // Chao1 estimator (simplified)
    const singletons = abundances.filter(count => count === 1).length;
    const doubletons = abundances.filter(count => count === 2).length;
    const chao1_estimator = species_richness + (singletons * singletons) / (2 * (doubletons || 1));
    
    updateStepProgress(3, 100, 'completed');
    
    return {
      shannon_index: parseFloat(shannon_index.toFixed(3)),
      simpson_index: parseFloat(simpson_index.toFixed(3)),
      chao1_estimator: parseFloat(chao1_estimator.toFixed(1)),
      species_richness
    };
  };

  const startProcessing = async () => {
    setIsProcessing(true);
    setCurrentStep(0);
    
    try {
      // Step 1: Preprocessing
      setCurrentStep(0);
      const processedSequences = await preprocessSequences(data);
      
      if (processedSequences.length === 0) {
        throw new Error("No sequences passed quality filtering");
      }
      
      // Step 2: Taxonomy classification
      setCurrentStep(1);
      const taxonomyResults = await classifyTaxonomy(processedSequences);
      
      // Step 3: Clustering
      setCurrentStep(2);
      const clusteredResults = await performClustering(taxonomyResults);
      
      // Step 4: Biodiversity metrics
      setCurrentStep(3);
      const biodiversityMetrics = await calculateBiodiversity(processedSequences, clusteredResults);
      
      const finalResults: ProcessedData = {
        originalData: data,
        processedSequences: processedSequences,
        taxonomyResults: clusteredResults,
        biodiversityMetrics
      };
      
      setProcessedResults(finalResults);
      
      toast({
        title: "Processing Complete",
        description: `Successfully processed ${processedSequences.length} sequences`,
      });
      
      // Auto-advance after a brief delay
      setTimeout(() => {
        onProcessingComplete(finalResults);
      }, 2000);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Processing failed";
      updateStepProgress(currentStep, 0, 'error');
      toast({
        title: "Processing Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Processing Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{data.length}</div>
            <div className="text-sm text-muted-foreground">Input Sequences</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-secondary">AI-Driven</div>
            <div className="text-sm text-muted-foreground">Classification</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-accent">
              {processedResults ? processedResults.processedSequences.length : '—'}
            </div>
            <div className="text-sm text-muted-foreground">Quality Filtered</div>
          </CardContent>
        </Card>
      </div>

      {/* Processing Controls */}
      {!isProcessing && !processedResults && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Ready to Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <Dna className="h-4 w-4" />
                <AlertDescription>
                  This will run AI-driven taxonomy identification and biodiversity analysis on your {data.length} sequences.
                  Processing may take a few moments depending on dataset size.
                </AlertDescription>
              </Alert>
              <Button onClick={startProcessing} className="w-full gap-2" size="lg">
                <Cpu className="h-5 w-5" />
                Start AI Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Progress */}
      {isProcessing && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing in Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Overall Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{Math.round(overallProgress)}%</span>
                </div>
                <Progress value={overallProgress} className="h-3" />
              </div>

              {/* Step Progress */}
              <div className="space-y-4">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.id} className="flex items-center gap-4 p-3 rounded-lg border">
                      <div className={`
                        rounded-full p-2 transition-colors duration-300
                        ${step.status === 'completed' ? 'bg-secondary text-secondary-foreground' :
                          step.status === 'processing' ? 'bg-primary text-primary-foreground' :
                          step.status === 'error' ? 'bg-destructive text-destructive-foreground' :
                          'bg-muted text-muted-foreground'}
                      `}>
                        {step.status === 'processing' ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : step.status === 'error' ? (
                          <AlertTriangle className="h-4 w-4" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{step.label}</h4>
                          <Badge variant={
                            step.status === 'completed' ? 'secondary' :
                            step.status === 'processing' ? 'default' :
                            step.status === 'error' ? 'destructive' :
                            'outline'
                          }>
                            {step.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                        {step.status === 'processing' && (
                          <Progress value={step.progress} className="h-1" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Results */}
      {processedResults && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-secondary" />
              Processing Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 rounded-lg bg-secondary/10">
                <div className="text-2xl font-bold text-secondary">
                  {processedResults.processedSequences.length}
                </div>
                <div className="text-sm text-muted-foreground">Sequences Processed</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-primary/10">
                <div className="text-2xl font-bold text-primary">
                  {processedResults.biodiversityMetrics.species_richness}
                </div>
                <div className="text-sm text-muted-foreground">Species Identified</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-accent/10">
                <div className="text-2xl font-bold text-accent">
                  {processedResults.biodiversityMetrics.shannon_index}
                </div>
                <div className="text-sm text-muted-foreground">Shannon Index</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-primary-glow/10">
                <div className="text-2xl font-bold text-primary-glow">
                  {processedResults.taxonomyResults.filter(r => r.cluster_id).length}
                </div>
                <div className="text-sm text-muted-foreground">Novel Clusters</div>
              </div>
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Analysis complete! Proceed to the next step to visualize your biodiversity results.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};