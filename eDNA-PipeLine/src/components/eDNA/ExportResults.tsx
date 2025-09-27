import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileText, BarChart3, CheckCircle, Package } from "lucide-react";
import { ProcessedData } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";

interface ExportResultsProps {
  data: ProcessedData;
}

interface ExportOptions {
  abundanceMatrix: boolean;
  taxonomyResults: boolean;
  biodiversityMetrics: boolean;
  sequenceData: boolean;
  visualizations: boolean;
}

export const ExportResults = ({ data }: ExportResultsProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    abundanceMatrix: true,
    taxonomyResults: true,
    biodiversityMetrics: true,
    sequenceData: false,
    visualizations: false
  });
  const { toast } = useToast();

  const generateAbundanceMatrix = () => {
    const abundanceMap: { [taxon: string]: { [location: string]: number } } = {};
    const locations = Array.from(new Set(data.processedSequences.map(s => s.sample_location)));

    // Initialize abundance matrix
    data.taxonomyResults.forEach(result => {
      const sequence = data.processedSequences.find(s => s.sequence_id === result.sequence_id);
      if (sequence) {
        if (!abundanceMap[result.predicted_taxon]) {
          abundanceMap[result.predicted_taxon] = {};
          locations.forEach(loc => {
            abundanceMap[result.predicted_taxon][loc] = 0;
          });
        }
        abundanceMap[result.predicted_taxon][sequence.sample_location] += sequence.read_count;
      }
    });

    // Convert to CSV format
    const headers = ['Taxon', ...locations];
    const rows = Object.entries(abundanceMap).map(([taxon, locationCounts]) => [
      taxon,
      ...locations.map(loc => locationCounts[loc] || 0)
    ]);

    return [headers, ...rows];
  };

  const generateTaxonomyResults = () => {
    const headers = ['sequence_id', 'predicted_taxon', 'confidence', 'cluster_id', 'sample_location', 'depth', 'read_count'];
    const rows = data.taxonomyResults.map(result => {
      const sequence = data.processedSequences.find(s => s.sequence_id === result.sequence_id);
      return [
        result.sequence_id,
        result.predicted_taxon,
        result.confidence,
        result.cluster_id || '',
        sequence?.sample_location || '',
        sequence?.depth || '',
        sequence?.read_count || ''
      ];
    });

    return [headers, ...rows];
  };

  const generateBiodiversityReport = () => {
    const locations = Array.from(new Set(data.processedSequences.map(s => s.sample_location)));
    const headers = ['metric', 'overall', ...locations];
    
    // Calculate per-location metrics
    const locationMetrics = locations.map(location => {
      const locationSequences = data.processedSequences.filter(s => s.sample_location === location);
      const locationTaxonomy = data.taxonomyResults.filter(t => 
        locationSequences.some(s => s.sequence_id === t.sequence_id)
      );
      
      const uniqueTaxa = new Set(locationTaxonomy.map(t => t.predicted_taxon));
      const totalReads = locationSequences.reduce((sum, s) => sum + s.read_count, 0);
      
      // Calculate Shannon index
      const abundanceMap: { [taxon: string]: number } = {};
      locationTaxonomy.forEach(t => {
        const seq = locationSequences.find(s => s.sequence_id === t.sequence_id);
        if (seq) {
          abundanceMap[t.predicted_taxon] = (abundanceMap[t.predicted_taxon] || 0) + seq.read_count;
        }
      });
      
      const proportions = Object.values(abundanceMap).map(count => count / totalReads);
      const shannon = -proportions.reduce((sum, p) => sum + (p * Math.log(p)), 0);
      const simpson = proportions.reduce((sum, p) => sum + (p * p), 0);
      
      return {
        species_richness: uniqueTaxa.size,
        shannon_index: parseFloat(shannon.toFixed(3)),
        simpson_index: parseFloat(simpson.toFixed(3)),
        total_sequences: locationSequences.length,
        total_reads: totalReads
      };
    });

    const rows = [
      ['Species Richness', data.biodiversityMetrics.species_richness, ...locationMetrics.map(m => m.species_richness)],
      ['Shannon Index', data.biodiversityMetrics.shannon_index, ...locationMetrics.map(m => m.shannon_index)],
      ['Simpson Index', data.biodiversityMetrics.simpson_index, ...locationMetrics.map(m => m.simpson_index)],
      ['Chao1 Estimator', data.biodiversityMetrics.chao1_estimator, ...Array(locations.length).fill('')],
      ['Total Sequences', data.processedSequences.length, ...locationMetrics.map(m => m.total_sequences)],
      ['Total Reads', data.processedSequences.reduce((sum, s) => sum + s.read_count, 0), ...locationMetrics.map(m => m.total_reads)]
    ];

    return [headers, ...rows];
  };

  const downloadCSV = (csvData: any[][], filename: string) => {
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDFReport = () => {
    // This would generate a comprehensive PDF report
    // For now, we'll create a text-based summary
    const reportContent = `
eDNA BIODIVERSITY ANALYSIS REPORT
=================================

Dataset Summary:
- Total sequences analyzed: ${data.processedSequences.length}
- Original sequences: ${data.originalData.length}
- Sequences after quality filtering: ${data.processedSequences.length}
- Sample locations: ${Array.from(new Set(data.processedSequences.map(s => s.sample_location))).length}
- Total reads: ${data.processedSequences.reduce((sum, s) => sum + s.read_count, 0).toLocaleString()}

Biodiversity Metrics:
- Species Richness: ${data.biodiversityMetrics.species_richness}
- Shannon Diversity Index: ${data.biodiversityMetrics.shannon_index}
- Simpson Dominance Index: ${data.biodiversityMetrics.simpson_index}
- Chao1 Richness Estimator: ${data.biodiversityMetrics.chao1_estimator}

Taxonomic Composition:
${data.taxonomyResults.reduce((acc, result) => {
  const phylum = result.predicted_taxon.split(';')[1] || 'Unknown';
  acc[phylum] = (acc[phylum] || 0) + 1;
  return acc;
}, {} as { [key: string]: number })}

Novel Taxa Clusters:
- Number of clusters identified: ${new Set(data.taxonomyResults.filter(r => r.cluster_id).map(r => r.cluster_id)).size}
- Sequences in clusters: ${data.taxonomyResults.filter(r => r.cluster_id).length}

This report was generated on ${new Date().toLocaleDateString()} using the eDNA Analysis Pipeline.
    `;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'edna-biodiversity-report.txt');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async (exportType: 'individual' | 'package') => {
    setIsExporting(true);
    
    try {
      if (exportType === 'individual') {
        let fileCount = 0;

        if (exportOptions.abundanceMatrix) {
          const abundanceData = generateAbundanceMatrix();
          downloadCSV(abundanceData, 'abundance-matrix.csv');
          fileCount++;
        }

        if (exportOptions.taxonomyResults) {
          const taxonomyData = generateTaxonomyResults();
          downloadCSV(taxonomyData, 'taxonomy-results.csv');
          fileCount++;
        }

        if (exportOptions.biodiversityMetrics) {
          const biodiversityData = generateBiodiversityReport();
          downloadCSV(biodiversityData, 'biodiversity-metrics.csv');
          fileCount++;
        }

        if (exportOptions.sequenceData) {
          const sequenceHeaders = ['sequence_id', 'raw_sequence', 'read_count', 'sample_location', 'depth'];
          const sequenceRows = data.processedSequences.map(seq => [
            seq.sequence_id,
            seq.raw_sequence,
            seq.read_count,
            seq.sample_location,
            seq.depth
          ]);
          downloadCSV([sequenceHeaders, ...sequenceRows], 'processed-sequences.csv');
          fileCount++;
        }

        toast({
          title: "Export Complete",
          description: `Successfully exported ${fileCount} file(s)`,
        });

      } else {
        // Export complete package
        const abundanceData = generateAbundanceMatrix();
        const taxonomyData = generateTaxonomyResults();
        const biodiversityData = generateBiodiversityReport();
        
        downloadCSV(abundanceData, 'abundance-matrix.csv');
        await new Promise(resolve => setTimeout(resolve, 500));
        downloadCSV(taxonomyData, 'taxonomy-results.csv');
        await new Promise(resolve => setTimeout(resolve, 500));
        downloadCSV(biodiversityData, 'biodiversity-metrics.csv');
        await new Promise(resolve => setTimeout(resolve, 500));
        generatePDFReport();

        toast({
          title: "Complete Package Exported",
          description: "All analysis results have been downloaded",
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "An error occurred during export",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleOptionChange = (option: keyof ExportOptions, checked: boolean) => {
    setExportOptions(prev => ({ ...prev, [option]: checked }));
  };

  const selectedCount = Object.values(exportOptions).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Export Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{data.processedSequences.length}</div>
            <div className="text-sm text-muted-foreground">Processed Sequences</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-secondary">
              {data.biodiversityMetrics.species_richness}
            </div>
            <div className="text-sm text-muted-foreground">Identified Taxa</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-accent">
              {Array.from(new Set(data.processedSequences.map(s => s.sample_location))).length}
            </div>
            <div className="text-sm text-muted-foreground">Sample Locations</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary-glow">
              {new Set(data.taxonomyResults.filter(r => r.cluster_id).map(r => r.cluster_id)).size}
            </div>
            <div className="text-sm text-muted-foreground">Novel Clusters</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="selective" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="selective">Selective Export</TabsTrigger>
          <TabsTrigger value="complete">Complete Package</TabsTrigger>
        </TabsList>

        <TabsContent value="selective" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Choose Export Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="abundance"
                        checked={exportOptions.abundanceMatrix}
                        onCheckedChange={(checked) => handleOptionChange('abundanceMatrix', checked as boolean)}
                      />
                      <label htmlFor="abundance" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Abundance Matrix
                      </label>
                      <Badge variant="secondary" className="text-xs">CSV</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      Taxa abundance across all sample locations
                    </p>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="taxonomy"
                        checked={exportOptions.taxonomyResults}
                        onCheckedChange={(checked) => handleOptionChange('taxonomyResults', checked as boolean)}
                      />
                      <label htmlFor="taxonomy" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Taxonomy Results
                      </label>
                      <Badge variant="secondary" className="text-xs">CSV</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      AI classification results with confidence scores
                    </p>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="biodiversity"
                        checked={exportOptions.biodiversityMetrics}
                        onCheckedChange={(checked) => handleOptionChange('biodiversityMetrics', checked as boolean)}
                      />
                      <label htmlFor="biodiversity" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Biodiversity Metrics
                      </label>
                      <Badge variant="secondary" className="text-xs">CSV</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      Shannon, Simpson, Chao1 indices by location
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sequences"
                        checked={exportOptions.sequenceData}
                        onCheckedChange={(checked) => handleOptionChange('sequenceData', checked as boolean)}
                      />
                      <label htmlFor="sequences" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Processed Sequences
                      </label>
                      <Badge variant="secondary" className="text-xs">CSV</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      Quality-filtered sequence data with metadata
                    </p>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="visualizations"
                        checked={exportOptions.visualizations}
                        onCheckedChange={(checked) => handleOptionChange('visualizations', checked as boolean)}
                        disabled
                      />
                      <label htmlFor="visualizations" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Visualizations
                      </label>
                      <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      Publication-ready charts and graphs
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    {selectedCount} option{selectedCount !== 1 ? 's' : ''} selected
                  </div>
                  <Button
                    onClick={() => handleExport('individual')}
                    disabled={selectedCount === 0 || isExporting}
                    className="gap-2"
                  >
                    {isExporting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Export Selected
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complete" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Complete Analysis Package
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Export all analysis results including abundance matrix, taxonomy results, 
                    biodiversity metrics, and a comprehensive summary report.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Data Files
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Abundance matrix (CSV)</li>
                      <li>• Taxonomy classification results (CSV)</li>
                      <li>• Biodiversity metrics by location (CSV)</li>
                      <li>• Quality-filtered sequences (CSV)</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Summary Report
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Dataset overview and statistics</li>
                      <li>• Biodiversity assessment summary</li>
                      <li>• Novel taxa cluster analysis</li>
                      <li>• Processing methodology notes</li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <Button
                    onClick={() => handleExport('package')}
                    disabled={isExporting}
                    size="lg"
                    className="gap-2"
                  >
                    {isExporting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Download className="h-5 w-5" />
                    )}
                    Download Complete Package
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Analysis Complete */}
      <Card className="shadow-card bg-gradient-forest/5 border-secondary">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-secondary/20 p-3">
              <CheckCircle className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Analysis Complete!</h3>
              <p className="text-muted-foreground">
                Your eDNA biodiversity analysis has been completed successfully. 
                Export your results for further analysis or publication.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};