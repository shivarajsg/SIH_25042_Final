import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/eDNA/FileUpload";
import { DataProcessor } from "@/components/eDNA/DataProcessor";
import { BiodiversityDashboard } from "@/components/eDNA/BiodiversityDashboard";
import { ExportResults } from "@/components/eDNA/ExportResults";
import { Dna, BarChart3, FileText, Download, Search } from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface eDNAData {
  sequence_id: string;
  raw_sequence: string;
  read_count: number;
  sample_location: string;
  depth: number;
}

export interface ProcessedData {
  originalData: eDNAData[];
  processedSequences: eDNAData[];
  taxonomyResults: {
    sequence_id: string;
    predicted_taxon: string;
    confidence: number;
    cluster_id?: number;
  }[];
  biodiversityMetrics: {
    shannon_index: number;
    simpson_index: number;
    chao1_estimator: number;
    species_richness: number;
  };
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'process' | 'eukaryotic' | 'analyze' | 'export'>('upload');
  const [uploadedData, setUploadedData] = useState<eDNAData[] | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportCompleted, setExportCompleted] = useState(false);
  const [processingSteps, setProcessingSteps] = useState([
    { id: 'preprocessing', name: 'Preprocessing', status: 'pending', description: 'Quality filtering and sequence cleanup' },
    { id: 'taxonomy', name: 'AI Taxonomy Classification', status: 'pending', description: 'Deep learning sequence analysis' },
    { id: 'clustering', name: 'Clustering Analysis', status: 'pending', description: 'Grouping unknown sequences' },
    { id: 'biodiversity', name: 'Biodiversity Metrics', status: 'pending', description: 'Computing diversity indices' }
  ]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [showProcessingSteps, setShowProcessingSteps] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const handleDataUpload = (data: eDNAData[]) => {
    setUploadedData(data);
    setCurrentStep('process');
  };

  const simulateProcessingSteps = async () => {
    // Simulate processing time (no steps shown during processing)
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // After processing is complete, show the completed steps
    setShowProcessingSteps(true);
    setOverallProgress(100);
    setProcessingComplete(true);
    
    // Set all steps as completed
    const completedSteps = [
      { id: 'preprocessing', name: 'Preprocessing', status: 'completed', description: 'Quality filtering and sequence cleanup' },
      { id: 'taxonomy', name: 'AI Taxonomy Classification', status: 'completed', description: 'Deep learning sequence analysis' },
      { id: 'clustering', name: 'Clustering Analysis', status: 'completed', description: 'Grouping unknown sequences' },
      { id: 'biodiversity', name: 'Biodiversity Metrics', status: 'completed', description: 'Computing diversity indices' }
    ];
    setProcessingSteps(completedSteps);
  };

  const handleDataProcessed = async (data: ProcessedData) => {
    setProcessedData(data);
    await simulateProcessingSteps();
    setCurrentStep('eukaryotic');
  };

  const handleEukaryoticComplete = () => {
    setCurrentStep('analyze');
  };

  const handleStepNavigation = (step: string) => {
    // Allow navigation to any step, but reset export completion if going back
    if (step !== 'export') {
      setExportCompleted(false);
    }
    
    // Reset data when going back to earlier steps
    const steps = ['upload', 'process', 'eukaryotic', 'analyze', 'export'];
    const currentIndex = steps.indexOf(currentStep);
    const targetIndex = steps.indexOf(step);
    
    if (targetIndex < currentIndex) {
      // Going back to earlier step - reset subsequent data
      if (step === 'upload') {
        setUploadedData(null);
        setProcessedData(null);
        setShowProcessingSteps(false);
        setProcessingComplete(false);
        setOverallProgress(0);
      } else if (step === 'process') {
        setProcessedData(null);
        // Keep processing steps visible when going back to process step
      }
    }
    
    setCurrentStep(step as any);
  };

  const handleExportDiscovery = async () => {
    if (!exportRef.current) return;
    
    setIsExporting(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 170; // mm - leave margins
      const pageHeight = 280; // mm - leave margins

      // === FIRST PAGE: DETAILED INTRODUCTION ===
      // Add comprehensive title and introduction
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Eukaryotic Biodiversity Assessment', 105, 30, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Environmental DNA Analysis Report', 105, 45, { align: 'center' });
      
      // Add detailed explanation section
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Project Overview', 20, 65);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const introText = [
        'This comprehensive report presents the results of an advanced Environmental DNA (eDNA) analysis ',
        'conducted to assess eukaryotic biodiversity in aquatic ecosystems. The analysis employs cutting-edge ',
        'artificial intelligence and machine learning algorithms to identify and classify eukaryotic organisms ',
        'from environmental DNA samples.',
        '',
        'The Eukaryotic Biodiversity Assessment process involves several critical steps:',
        '',
        '1. Sample Collection & Processing: Environmental DNA samples are collected from water or soil ',
        '   sources, capturing genetic material shed by living organisms in the ecosystem.',
        '',
        '2. DNA Extraction & Sequencing: High-throughput sequencing technologies are used to generate ',
        '   millions of DNA sequence reads from the environmental samples.',
        '',
        '3. Quality Control & Preprocessing: Raw sequences undergo rigorous quality filtering to remove ',
        '   low-quality reads, adapters, and contaminants, ensuring reliable downstream analysis.',
        '',
        '4. AI-Driven Taxonomy Classification: Advanced deep learning models analyze sequence data ',
        '   to identify eukaryotic organisms, providing taxonomic classification with confidence scores.',
        '',
        '5. Biodiversity Metrics Calculation: Comprehensive diversity indices including Shannon, Simpson, ',
        '   and Chao1 estimators are computed to quantify ecosystem biodiversity.',
        '',
        '6. Novel Taxa Discovery: Clustering algorithms identify potentially novel taxonomic groups ',
        '   that may represent previously unknown species or genetic variants.',
        '',
        'The results presented in this report provide valuable insights into ecosystem health, species ',
        'diversity, and the presence of rare or endangered organisms. This information is crucial for ',
        'conservation efforts, environmental monitoring, and scientific research.'
      ];

      let yPosition = 75;
      introText.forEach(line => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(line, 20, yPosition);
        yPosition += line === '' ? 5 : 6;
      });

      // Add methodology section
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Methodology & Technical Specifications', 20, 30);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const methodologyText = [
        'Analysis Pipeline:',
        '• Preprocessing: Quality filtering with minimum length 10bp, maximum 500bp',
        '• Taxonomy Classification: AI models trained on NCBI taxonomy database',
        '• Clustering: Novel taxa identification using sequence similarity algorithms',
        '• Biodiversity Metrics: Standard ecological diversity indices',
        '',
        'Quality Assurance:',
        '• All sequences undergo quality control checks',
        '• Taxonomic assignments include confidence scores',
        '• Novel clusters are validated through multiple algorithms',
        '• Results are cross-referenced with known databases',
        '',
        'Report Generation:',
        '• Generated on: ' + new Date().toLocaleDateString(),
        '• Analysis Platform: eDNA Explorer v1.0',
        '• Data Processing: Automated AI-driven pipeline',
        '• Visualization: Interactive charts and statistical summaries'
      ];

      yPosition = 50;
      methodologyText.forEach(line => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(line, 20, yPosition);
        yPosition += 6;
      });

      // === SUBSEQUENT PAGES: SCREENSHOTS OF RESULT SECTIONS ===
      
      // Enhanced capture function with better element detection and scrolling
      const captureSection = async (selector: string, heading: string) => {
        try {
          let element = document.querySelector(selector);
          
          // If element not found, try alternative selectors
          if (!element) {
            // Try to find by tab content
            if (selector.includes('data-value')) {
              const tabValue = selector.match(/data-value="([^"]+)"/)?.[1];
              if (tabValue) {
                // Try to find the active tab content
                element = document.querySelector(`[role="tabpanel"][data-value="${tabValue}"]`) ||
                         document.querySelector(`[data-state="active"][data-value="${tabValue}"]`) ||
                         document.querySelector(`.tab-content[data-value="${tabValue}"]`);
              }
            }
          }
          
          if (!element) {
            console.warn(`Element not found: ${selector}`);
            return false;
          }

          // Scroll element into view and ensure it's fully visible
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Add new page for each section
          pdf.addPage();

          // Add heading
          pdf.setFontSize(18);
          pdf.setFont('helvetica', 'bold');
          pdf.text(heading, 20, 30);

          // Capture the section with enhanced settings for scrollable content
          const canvas = await html2canvas(element as HTMLElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            width: element.scrollWidth,
            height: element.scrollHeight,
            scrollX: 0,
            scrollY: 0,
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight
          });

          const imgData = canvas.toDataURL('image/png');
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          // Add image below heading with proper scaling
          const maxHeight = 220;
          const finalHeight = Math.min(imgHeight, maxHeight);
          pdf.addImage(imgData, 'PNG', 20, 50, imgWidth, finalHeight);
          
          console.log(`Successfully captured ${heading}`);
          return true;
        } catch (error) {
          console.error(`Error capturing section ${selector}:`, error);
          return false;
        }
      };

      // Function to switch tabs and capture content with proper scrolling
      const switchTabAndCapture = async (tabValue: string, heading: string) => {
        try {
          // Find and click the tab button
          const tabButton = document.querySelector(`[data-value="${tabValue}"]`) as HTMLElement;
          if (tabButton) {
            tabButton.click();
            // Wait for tab content to load and scroll into view
            await new Promise(resolve => setTimeout(resolve, 1500));
          }

          // Find the tab content
          let tabContent = document.querySelector(`[role="tabpanel"][data-value="${tabValue}"]`) ||
                          document.querySelector(`[data-state="active"][data-value="${tabValue}"]`) ||
                          document.querySelector(`.tab-content[data-value="${tabValue}"]`);
          
          if (!tabContent) {
            console.warn(`Tab content not found for: ${tabValue}`);
            return false;
          }

          // Scroll tab content into view
          tabContent.scrollIntoView({ behavior: 'smooth', block: 'center' });
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Add new page for each section
          pdf.addPage();

          // Add heading
          pdf.setFontSize(18);
          pdf.setFont('helvetica', 'bold');
          pdf.text(heading, 20, 30);

          // Capture the section with enhanced settings
          const canvas = await html2canvas(tabContent as HTMLElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            width: tabContent.scrollWidth,
            height: tabContent.scrollHeight,
            scrollX: 0,
            scrollY: 0
          });

          const imgData = canvas.toDataURL('image/png');
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          // Add image below heading with proper scaling
          const maxHeight = 220;
          const finalHeight = Math.min(imgHeight, maxHeight);
          pdf.addImage(imgData, 'PNG', 20, 50, imgWidth, finalHeight);
          
          console.log(`Successfully captured ${heading}`);
          return true;
        } catch (error) {
          console.error(`Error capturing tab ${tabValue}:`, error);
          return false;
        }
      };

      // Capture all dashboard sections systematically
      let capturedSections = 0;
      
      // 1. Capture Quick Stats Summary
      const summarySuccess = await captureSection('[data-section="dashboard-summary"]', 'Dataset Overview & Quick Statistics');
      if (summarySuccess) capturedSections++;
      
      // 2. Switch to and capture Taxonomy Composition Chart
      const taxonomySuccess = await switchTabAndCapture('taxonomy', 'Taxonomic Composition Analysis');
      if (taxonomySuccess) capturedSections++;
      
      // 3. Switch to and capture Diversity Analysis
      const diversitySuccess = await switchTabAndCapture('diversity', 'Biodiversity Diversity Analysis');
      if (diversitySuccess) capturedSections++;
      
      // 4. Switch to and capture Novel Taxa Clusters
      const novelTaxaSuccess = await switchTabAndCapture('clusters', 'Novel Taxa Clusters & Discovery');
      if (novelTaxaSuccess) capturedSections++;
      
      // 5. Switch to and capture Spatial Distribution
      const spatialSuccess = await switchTabAndCapture('spatial', 'Spatial Distribution Analysis');
      if (spatialSuccess) capturedSections++;
      
      // 6. Capture Processing Steps if available
      const processingSuccess = await captureSection('.bg-gradient-to-r.from-blue-50', 'AI Analysis Processing Steps');
      if (processingSuccess) capturedSections++;

      // 7. Capture Biodiversity Metrics Overview
      const metricsSuccess = await captureSection('[data-section="final-summary"]', 'Biodiversity Metrics Summary');
      if (metricsSuccess) capturedSections++;

      // 8. Add detailed taxonomy section with text data
      if (processedData) {
        pdf.addPage();
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Detailed Taxonomy Analysis', 20, 30);
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        
        // Taxonomy summary
        const uniqueTaxa = new Set(processedData.taxonomyResults.map(r => r.predicted_taxon));
        pdf.text(`Total Unique Taxa Identified: ${uniqueTaxa.size}`, 20, 50);
        
        // Top taxa by abundance
        const taxaAbundance: { [taxon: string]: number } = {};
        processedData.taxonomyResults.forEach(result => {
          const sequence = processedData.processedSequences.find(s => s.sequence_id === result.sequence_id);
          if (sequence) {
            taxaAbundance[result.predicted_taxon] = (taxaAbundance[result.predicted_taxon] || 0) + sequence.read_count;
          }
        });
        
        const topTaxa = Object.entries(taxaAbundance)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10);
        
        pdf.text('Top 10 Taxa by Read Abundance:', 20, 70);
        let yPos = 85;
        topTaxa.forEach(([taxon, reads], index) => {
          if (yPos > 250) {
            pdf.addPage();
            yPos = 20;
          }
          pdf.text(`${index + 1}. ${taxon}: ${reads.toLocaleString()} reads`, 25, yPos);
          yPos += 8;
        });
        capturedSections++;
      }

      // 9. Add phylum distribution section
      if (processedData) {
        pdf.addPage();
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Phylum Distribution Analysis', 20, 30);
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        
        // Calculate phylum distribution
        const phylumAbundance: { [phylum: string]: number } = {};
        processedData.taxonomyResults.forEach(result => {
          const sequence = processedData.processedSequences.find(s => s.sequence_id === result.sequence_id);
          if (sequence) {
            const phylum = result.predicted_taxon.split(';')[1] || 'Unknown';
            phylumAbundance[phylum] = (phylumAbundance[phylum] || 0) + sequence.read_count;
          }
        });
        
        const totalReads = Object.values(phylumAbundance).reduce((sum, count) => sum + count, 0);
        const phylumData = Object.entries(phylumAbundance)
          .map(([phylum, reads]) => ({ phylum, reads, percentage: ((reads / totalReads) * 100).toFixed(1) }))
          .sort((a, b) => b.reads - a.reads);
        
        pdf.text(`Total Phyla Identified: ${phylumData.length}`, 20, 50);
        pdf.text('Phylum Distribution (Top 15):', 20, 70);
        
        let yPos = 85;
        phylumData.slice(0, 15).forEach(({ phylum, reads, percentage }, index) => {
          if (yPos > 250) {
            pdf.addPage();
            yPos = 20;
          }
          pdf.text(`${index + 1}. ${phylum}: ${reads.toLocaleString()} reads (${percentage}%)`, 25, yPos);
          yPos += 8;
        });
        capturedSections++;
      }

      // 10. Add novel taxa clusters section
      if (processedData) {
        pdf.addPage();
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Novel Taxa Clusters Analysis', 20, 30);
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        
        const clusters: { [clusterId: number]: any[] } = {};
        processedData.taxonomyResults
          .filter(t => t.cluster_id)
          .forEach(t => {
            if (!clusters[t.cluster_id!]) {
              clusters[t.cluster_id!] = [];
            }
            const seq = processedData.processedSequences.find(s => s.sequence_id === t.sequence_id);
            if (seq) {
              clusters[t.cluster_id!].push({ ...t, ...seq });
            }
          });
        
        const clusterCount = Object.keys(clusters).length;
        pdf.text(`Total Novel Taxa Clusters Identified: ${clusterCount}`, 20, 50);
        
        if (clusterCount > 0) {
          pdf.text('Cluster Details:', 20, 70);
          let yPos = 85;
          
          Object.entries(clusters).forEach(([clusterId, sequences], index) => {
            if (yPos > 200) {
              pdf.addPage();
              yPos = 20;
            }
            
            const totalReads = sequences.reduce((sum: number, s: any) => sum + s.read_count, 0);
            const avgConfidence = Math.round(sequences.reduce((sum: number, s: any) => sum + s.confidence, 0) / sequences.length);
            const locations = Array.from(new Set(sequences.map((s: any) => s.sample_location)));
            
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`Cluster ${clusterId}:`, 25, yPos);
            yPos += 8;
            
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`  • Sequences: ${sequences.length}`, 30, yPos);
            yPos += 6;
            pdf.text(`  • Total Reads: ${totalReads.toLocaleString()}`, 30, yPos);
            yPos += 6;
            pdf.text(`  • Avg Confidence: ${avgConfidence}%`, 30, yPos);
            yPos += 6;
            pdf.text(`  • Locations: ${locations.join(', ')}`, 30, yPos);
            yPos += 10;
          });
        }
        capturedSections++;
      }

      // 11. Add spatial distribution section
      if (processedData) {
        pdf.addPage();
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Spatial Distribution Analysis', 20, 30);
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        
        const locations = Array.from(new Set(processedData.processedSequences.map(s => s.sample_location)));
        pdf.text(`Total Sample Locations: ${locations.length}`, 20, 50);
        
        pdf.text('Diversity by Location:', 20, 70);
        let yPos = 85;
        
        locations.forEach((location, index) => {
          if (yPos > 200) {
            pdf.addPage();
            yPos = 20;
          }
          
          const locationSequences = processedData.processedSequences.filter(s => s.sample_location === location);
          const locationTaxonomy = processedData.taxonomyResults.filter(t => 
            locationSequences.some(s => s.sequence_id === t.sequence_id)
          );
          
          const uniqueTaxa = new Set(locationTaxonomy.map(t => t.predicted_taxon));
          const totalReads = locationSequences.reduce((sum, s) => sum + s.read_count, 0);
          
          // Calculate Shannon index for this location
          const abundanceMap: { [taxon: string]: number } = {};
          locationTaxonomy.forEach(t => {
            const seq = locationSequences.find(s => s.sequence_id === t.sequence_id);
            if (seq) {
              abundanceMap[t.predicted_taxon] = (abundanceMap[t.predicted_taxon] || 0) + seq.read_count;
            }
          });
          
          const proportions = Object.values(abundanceMap).map(count => count / totalReads);
          const shannon = -proportions.reduce((sum, p) => sum + (p * Math.log(p)), 0);
          
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${location}:`, 25, yPos);
          yPos += 8;
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`  • Species Richness: ${uniqueTaxa.size}`, 30, yPos);
          yPos += 6;
          pdf.text(`  • Shannon Index: ${shannon.toFixed(2)}`, 30, yPos);
          yPos += 6;
          pdf.text(`  • Total Reads: ${totalReads.toLocaleString()}`, 30, yPos);
          yPos += 6;
          pdf.text(`  • Sequences: ${locationSequences.length}`, 30, yPos);
          yPos += 10;
        });
        capturedSections++;
      }

      // If no sections were captured, add a simple summary page
      if (capturedSections === 0) {
        console.log('No specific sections found, adding summary data...');
        pdf.addPage();
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Analysis Summary', 20, 30);
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text('This report contains the complete eDNA analysis results.', 20, 50);
      }

      // Add final summary page with text data
      pdf.addPage();
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Analysis Results Summary', 20, 30);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      if (uploadedData) {
        pdf.text(`Total Sequences Analyzed: ${uploadedData.length}`, 20, 50);
        pdf.text(`Sample Locations: ${new Set(uploadedData.map(d => d.sample_location)).size}`, 20, 65);
        pdf.text(`Total Reads Processed: ${uploadedData.reduce((sum, d) => sum + d.read_count, 0).toLocaleString()}`, 20, 80);
      }
      
      if (processedData) {
        pdf.text(`Species Richness: ${processedData.biodiversityMetrics.species_richness}`, 20, 95);
        pdf.text(`Shannon Diversity Index: ${processedData.biodiversityMetrics.shannon_index.toFixed(3)}`, 20, 110);
        pdf.text(`Simpson Dominance Index: ${processedData.biodiversityMetrics.simpson_index.toFixed(3)}`, 20, 125);
        pdf.text(`Chao1 Richness Estimator: ${processedData.biodiversityMetrics.chao1_estimator.toFixed(3)}`, 20, 140);
        pdf.text(`Novel Taxa Clusters: ${new Set(processedData.taxonomyResults.filter(r => r.cluster_id).map(r => r.cluster_id)).size}`, 20, 155);
      }

      // Add conclusion
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Conclusion', 20, 180);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text('This comprehensive eDNA analysis provides valuable insights into eukaryotic biodiversity', 20, 195);
      pdf.text('within the sampled ecosystem. The results demonstrate the power of AI-driven environmental', 20, 205);
      pdf.text('DNA analysis for biodiversity assessment and conservation monitoring.', 20, 215);

      // Download the PDF
      const fileName = `Eukaryotic_Biodiversity_Assessment_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      // Mark export as completed and set current step to export
      setExportCompleted(true);
      setCurrentStep('export');
      
      console.log(`PDF generated successfully with ${capturedSections} sections captured.`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Error generating PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const getStepStatus = (step: string) => {
    const steps = ['upload', 'process', 'eukaryotic', 'analyze', 'export'];
    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(step);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    if (step === 'export' && exportCompleted) return 'completed';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-background" ref={exportRef}>
      {/* Hero Header */}
      <header className="relative overflow-hidden bg-gradient-ocean py-16">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <img 
            src="/hero-edna-analysis.jpg" 
            alt="DNA helix molecular structure visualization" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative container mx-auto px-4">
          <div className="text-center text-primary-foreground">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-white/20 p-4">
                <img 
                  src="/DNAicon.ico" 
                  alt="DNA Analysis" 
                  className="h-12 w-12"
                />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              eDNA Analysis Pipeline
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto">
              AI-driven taxonomy identification and biodiversity assessment from environmental DNA datasets
            </p>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground">
            Click on Upload Data or Process & Analyze to navigate and redo that section
          </p>
        </div>
        <div className="flex flex-row justify-center items-center mb-8 gap-2 lg:gap-4 overflow-x-auto">
          {[
            { key: 'upload', label: 'Upload Data', icon: FileText },
            { key: 'process', label: 'Process & Analyze', icon: Dna },
            { key: 'eukaryotic', label: 'Eukaryotic Taxa Identification', icon: Search },
            { key: 'analyze', label: 'Biodiversity Assessment', icon: BarChart3 },
            { key: 'export', label: 'Export Results', icon: Download },
          ].map((step, index) => {
            const status = getStepStatus(step.key);
            const Icon = step.icon;
            
            return (
              <div key={step.key} className="flex items-center">
                <div 
                  className={`flex flex-col items-center flex-1 transition-all duration-300 group ${
                    step.key === 'upload' || step.key === 'process' 
                      ? 'cursor-pointer' 
                      : 'cursor-default'
                  }`}
                  onClick={step.key === 'upload' || step.key === 'process' ? () => handleStepNavigation(step.key) : undefined}
                  title={step.key === 'upload' || step.key === 'process' ? `Click to go to ${step.label}` : step.label}
                >
                  <div className={`
                    rounded-full p-3 mb-3 transition-all duration-300 
                    ${step.key === 'upload' || step.key === 'process' 
                      ? 'hover:shadow-lg group-hover:ring-2 group-hover:ring-primary/20' 
                      : ''
                    }
                    ${status === 'completed' ? 'bg-secondary text-secondary-foreground' : 
                      status === 'active' ? 'bg-primary text-primary-foreground shadow-data' : 
                      'bg-muted text-muted-foreground'}
                    ${step.key === 'upload' || step.key === 'process' ? 
                      (status === 'completed' ? 'hover:bg-secondary/80' : 
                       status === 'active' ? 'hover:bg-primary/90' : 
                       'hover:bg-muted/80') : ''}
                  `}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <span className={`text-sm font-medium whitespace-nowrap transition-colors duration-300 ${
                      status === 'active' ? 'text-primary' : 
                      status === 'completed' ? 'text-secondary' : 
                      'text-muted-foreground'
                    } ${
                      step.key === 'upload' || step.key === 'process' ? 'hover:text-foreground' : ''
                    }`}>
                      {step.label}
                    </span>
                  </div>
                </div>
                {index < 4 && (
                  <div className={`
                    hidden sm:block w-8 lg:w-16 h-0.5 mx-2 lg:mx-4 transition-colors duration-300
                    ${getStepStatus(['process', 'eukaryotic', 'analyze', 'export'][index]) === 'completed' ? 
                      'bg-secondary' : 'bg-border'}
                  `} />
                )}
              </div>
            );
          })}
        </div>

        {/* Main Content */}
        <Tabs value={currentStep} className="w-full">
          <TabsContent value="upload" className="mt-0">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Upload eDNA Dataset
                </CardTitle>
                <CardDescription>
                  Upload your CSV file containing environmental DNA sequencing data with the required fields
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload onDataUpload={handleDataUpload} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="process" className="mt-0">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dna className="h-5 w-5" />
                  Data Processing & AI Analysis
                </CardTitle>
                <CardDescription>
                  Preprocessing sequences and running AI-driven taxonomy identification
                </CardDescription>
              </CardHeader>
              <CardContent>
                {uploadedData && (
                  <div className="space-y-6">
                    <DataProcessor 
                      data={uploadedData} 
                      onProcessingComplete={handleDataProcessed}
                    />
                    
                    {/* Processing Steps Display */}
                    {showProcessingSteps && (
                      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-primary mb-2">AI Analysis Completed</h3>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${overallProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">{overallProgress}% Complete</p>
                        </div>
                        
                        <div className="space-y-3">
                          {processingSteps.map((step, index) => (
                            <div key={step.id} className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                step.status === 'completed' ? 'bg-green-500' :
                                step.status === 'processing' ? 'bg-blue-500' :
                                'bg-gray-300'
                              }`}>
                                {step.status === 'completed' ? (
                                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  </div>
                                ) : step.status === 'processing' ? (
                                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 bg-white rounded-full"></div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-gray-900">{step.name}</h4>
                                  <Badge 
                                    variant={step.status === 'completed' ? 'default' : 
                                            step.status === 'processing' ? 'secondary' : 'outline'}
                                    className={step.status === 'completed' ? 'bg-green-100 text-green-800' :
                                              step.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                              'bg-gray-100 text-gray-600'}
                                  >
                                    {step.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="eukaryotic" className="mt-0">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dna className="h-5 w-5" />
                  Eukaryotic Taxa Identification
                </CardTitle>
                <CardDescription>
                  AI models classify sequences, detect novel eukaryotic taxa, and annotate unassigned reads
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                      <Dna className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Eukaryotic Taxa Classification</h3>
                    <p className="text-muted-foreground mb-4">
                      Advanced AI models are analyzing your sequences to identify eukaryotic organisms and detect novel taxa.
                    </p>
                    <Button onClick={handleEukaryoticComplete} className="mt-4">
                      Continue to Biodiversity Assessment
                    </Button>
                  </div>
                  
                  {/* Processing Steps Display */}
                  {showProcessingSteps && (
                    <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-primary mb-2">AI Analysis Completed</h3>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${overallProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{overallProgress}% Complete</p>
                      </div>
                      
                      <div className="space-y-3">
                        {processingSteps.map((step, index) => (
                          <div key={step.id} className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              step.status === 'completed' ? 'bg-green-500' :
                              step.status === 'processing' ? 'bg-blue-500' :
                              'bg-gray-300'
                            }`}>
                              {step.status === 'completed' ? (
                                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                </div>
                              ) : step.status === 'processing' ? (
                                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                </div>
                              ) : (
                                <div className="w-5 h-5 bg-white rounded-full"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900">{step.name}</h4>
                                <Badge 
                                  variant={step.status === 'completed' ? 'default' : 
                                          step.status === 'processing' ? 'secondary' : 'outline'}
                                  className={step.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            step.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-600'}
                                >
                                  {step.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analyze" className="mt-0">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Biodiversity Analysis & Visualization
                </CardTitle>
                <CardDescription>
                  Interactive dashboards showing taxonomic composition and biodiversity metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {processedData && (
                    <BiodiversityDashboard data={processedData} />
                  )}
                  
                  {/* Processing Steps Display */}
                  {showProcessingSteps && (
                    <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-primary mb-2">AI Analysis Completed</h3>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${overallProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{overallProgress}% Complete</p>
                      </div>
                      
                      <div className="space-y-3">
                        {processingSteps.map((step, index) => (
                          <div key={step.id} className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              step.status === 'completed' ? 'bg-green-500' :
                              step.status === 'processing' ? 'bg-blue-500' :
                              'bg-gray-300'
                            }`}>
                              {step.status === 'completed' ? (
                                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                </div>
                              ) : step.status === 'processing' ? (
                                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                </div>
                              ) : (
                                <div className="w-5 h-5 bg-white rounded-full"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900">{step.name}</h4>
                                <Badge 
                                  variant={step.status === 'completed' ? 'default' : 
                                          step.status === 'processing' ? 'secondary' : 'outline'}
                                  className={step.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            step.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-600'}
                                >
                                  {step.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="mt-0">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Results
                </CardTitle>
                <CardDescription>
                  Download your analysis results in multiple formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                {processedData && (
                  <ExportResults data={processedData} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        {uploadedData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8" data-section="dashboard-summary">
            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary">{uploadedData.length}</div>
                <div className="text-sm text-muted-foreground">Total Sequences</div>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-secondary">
                  {new Set(uploadedData.map(d => d.sample_location)).size}
                </div>
                <div className="text-sm text-muted-foreground">Sample Locations</div>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-accent">
                  {uploadedData.reduce((sum, d) => sum + d.read_count, 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Reads</div>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary-glow">
                  {processedData ? processedData.biodiversityMetrics.species_richness : '—'}
                </div>
                <div className="text-sm text-muted-foreground">Species Richness</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Export Discovery Button */}
        {processedData && (
          <div className="container mx-auto px-4 py-8 text-center">
            <Button 
              onClick={handleExportDiscovery}
              disabled={isExporting}
              size="lg"
              className={`px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ${
                exportCompleted 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              }`}
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating PDF...
                </>
              ) : exportCompleted ? (
                <>
                  <div className="rounded-full h-5 w-5 bg-white mr-2 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  PDF Exported Successfully!
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Download Full Report
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              {exportCompleted 
                ? 'PDF report has been downloaded successfully' 
                : 'Generate comprehensive PDF report with detailed introduction and all result screenshots'
              }
            </p>
          </div>
        )}

        {/* From DNA to Discovery Block */}
        <div className="container mx-auto px-4 py-8">
          <Card className="shadow-card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-primary mb-2">From DNA to Discovery</h2>
                <p className="text-muted-foreground">Understanding the eDNA Analysis Workflow</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Step 1 */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">1</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-primary mb-3">Collecting eDNA Samples</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Water or soil is gathered, carrying tiny DNA traces shed by living organisms.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">2</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-secondary mb-3">AI-Driven Species Detection</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Advanced Artificial Intelligence processes and analyzes the DNA fragments.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">3</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-accent mb-3">Biodiversity Revealed</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    The system matches DNA fragments to a database and generates a list of animals, plants, fungi, and microbes present in the environment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;