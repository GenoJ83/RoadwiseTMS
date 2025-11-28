import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import Footer from './Footer';
import Chart from 'chart.js/auto';

const ReportGenerator = () => {
  const [reportType, setReportType] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedJunctions, setSelectedJunctions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState([]);
  const navigate = useNavigate();

  const mainChartRef = useRef(null);
  const congestionChartRef = useRef(null);
  const incidentsChartRef = useRef(null);
  const junctionsChartRef = useRef(null);
  const [chartData, setChartData] = useState(null);

  const reportTypes = [
    { id: 'daily', name: 'Daily Traffic Report', description: '24-hour traffic summary', icon: '📅' },
    { id: 'weekly', name: 'Weekly Analysis', description: '7-day traffic patterns', icon: '📊' },
    { id: 'monthly', name: 'Monthly Summary', description: '30-day comprehensive report', icon: '📈' },
    { id: 'incident', name: 'Incident Report', description: 'Traffic incidents and accidents', icon: '🚨' },
    { id: 'performance', name: 'Performance Report', description: 'System performance metrics', icon: '⚡' },
    { id: 'custom', name: 'Custom Report', description: 'Custom date range and metrics', icon: '🔧' }
  ];

  const junctions = [
    { id: 'north', name: 'North Junction', location: 'Main Street' },
    { id: 'east', name: 'East Junction', location: 'Highway Exit' },
    { id: 'south', name: 'South Junction', location: 'City Center' }
  ];

  // Generate mock traffic data for reports
  const generateMockData = (reportType, dateRange, selectedJunctions) => {
    const junctions = selectedJunctions.length > 0 ? selectedJunctions : ['north', 'east', 'south'];
    const data = {
      summary: {
        totalVehicles: Math.floor(Math.random() * 5000) + 1000,
        averageWaitTime: (Math.random() * 10 + 5).toFixed(1),
        congestionLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        incidents: Math.floor(Math.random() * 10),
        efficiency: (Math.random() * 20 + 80).toFixed(1)
      },
      junctions: junctions.map(junction => ({
        name: junctions.find(j => j.id === junction)?.name || junction,
        vehicles: Math.floor(Math.random() * 2000) + 500,
        waitTime: (Math.random() * 15 + 3).toFixed(1),
        congestion: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        trafficLights: Math.floor(Math.random() * 50) + 20
      })),
      timeline: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        vehicles: Math.floor(Math.random() * 200) + 50,
        cyclists: Math.floor(Math.random() * 50) + 5, // Add cyclists per hour
        congestion: Math.random()
      })),
      incidents: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => ({
        id: i + 1,
        type: ['Accident', 'Traffic Jam', 'Broken Light', 'Construction'][Math.floor(Math.random() * 4)],
        location: junctions[Math.floor(Math.random() * junctions.length)],
        severity: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        duration: Math.floor(Math.random() * 120) + 30
      }))
    };
    return data;
  };

  // Add a hidden canvas for chart rendering
  // Place this just before the return statement
  // Add a hidden canvas for chart rendering
  // Place this just before the return statement

  // Chart rendering function for main chart
  const renderChart = (data) => {
    const ctx = document.getElementById('reportChart').getContext('2d');
    if (window.reportChartInstance) {
      window.reportChartInstance.destroy();
    }
    window.reportChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.timeline.map(item => `${item.hour}:00`),
        datasets: [
          {
            label: 'Vehicles per Hour',
            data: data.timeline.map(item => item.vehicles),
            borderColor: 'rgba(88, 28, 135, 1)',
            backgroundColor: 'rgba(88, 28, 135, 0.1)',
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Cyclists per Hour',
            data: data.timeline.map(item => item.cyclists),
            borderColor: 'rgba(16, 185, 129, 1)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
          }
        ]
      },
      options: {
        responsive: false,
        plugins: {
          legend: { display: true }
        },
        scales: {
          x: { title: { display: true, text: 'Hour' } },
          y: { title: { display: true, text: 'Count' } }
        }
      }
    });
  };

  // Chart rendering function for congestion chart
  const renderCongestionChart = (data) => {
    const ctx = document.getElementById('reportCongestionChart').getContext('2d');
    if (window.reportCongestionChartInstance) {
      window.reportCongestionChartInstance.destroy();
    }
    window.reportCongestionChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.timeline.map(item => `${item.hour}:00`),
        datasets: [{
          label: 'Congestion Level',
          data: data.timeline.map(item => Math.round(item.congestion * 100)),
          borderColor: 'rgba(239, 68, 68, 1)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4,
        }]
      },
      options: {
        responsive: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { title: { display: true, text: 'Hour' } },
          y: { title: { display: true, text: 'Congestion (%)', color: '#ef4444' }, min: 0, max: 100 }
        }
      }
    });
  };

  // Chart rendering function for incidents chart
  const renderIncidentsChart = (data) => {
    const ctx = document.getElementById('reportIncidentsChart').getContext('2d');
    if (window.reportIncidentsChartInstance) {
      window.reportIncidentsChartInstance.destroy();
    }
    // Count incidents per hour (randomly assign for mock)
    const incidentsPerHour = Array(24).fill(0);
    data.incidents.forEach(inc => {
      const hour = Math.floor(Math.random() * 24);
      incidentsPerHour[hour] += 1;
    });
    window.reportIncidentsChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        datasets: [{
          label: 'Incidents per Hour',
          data: incidentsPerHour,
          backgroundColor: 'rgba(251, 191, 36, 0.7)',
          borderColor: 'rgba(251, 191, 36, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { title: { display: true, text: 'Hour' } },
          y: { title: { display: true, text: 'Incidents' }, min: 0 }
        }
      }
    });
  };

  // Chart rendering function for junctions chart
  const renderJunctionsChart = (data) => {
    const ctx = document.getElementById('reportJunctionsChart').getContext('2d');
    if (window.reportJunctionsChartInstance) {
      window.reportJunctionsChartInstance.destroy();
    }
    window.reportJunctionsChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.junctions.map(j => j.name),
        datasets: [{
          label: 'Vehicles by Junction',
          data: data.junctions.map(j => j.vehicles),
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(251, 191, 36, 0.7)'
          ],
          borderColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(251, 191, 36, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { title: { display: true, text: 'Junction' } },
          y: { title: { display: true, text: 'Vehicles' }, min: 0 }
        }
      }
    });
  };

  // Update generatePDFReport to accept chartImage
  const generatePDFReport = (report, data, chartImage) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = 20;

    // Header
    doc.setFontSize(24);
    doc.setTextColor(88, 28, 135); // Purple color
    doc.text('RoadWise TMS', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    doc.setFontSize(16);
    doc.setTextColor(75, 85, 99); // Gray color
    doc.text(report.name, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Report Info
    doc.setFontSize(12);
    doc.setTextColor(55, 65, 81);
    doc.text(`Generated: ${report.timestamp}`, margin, yPosition);
    yPosition += 8;
    doc.text(`Report Type: ${report.name}`, margin, yPosition);
    yPosition += 8;
    doc.text(`Junctions: ${report.junctions.length === 3 ? 'All' : report.junctions.join(', ')}`, margin, yPosition);
    yPosition += 15;

    // --- Insert Chart Visualization ---
    if (chartImage) {
      doc.setFontSize(14);
      doc.setTextColor(88, 28, 135);
      doc.text('Traffic Volume Chart', margin, yPosition);
      yPosition += 5;
      doc.addImage(chartImage, 'PNG', margin, yPosition, pageWidth - 2 * margin, 40);
      yPosition += 45;
    }
    // --- End Chart Visualization ---

    // Summary Section
    doc.setFontSize(14);
    doc.setTextColor(88, 28, 135);
    doc.text('Executive Summary', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    doc.text(`Total Vehicles: ${data.summary.totalVehicles.toLocaleString()}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Average Wait Time: ${data.summary.averageWaitTime} minutes`, margin, yPosition);
    yPosition += 6;
    doc.text(`Congestion Level: ${data.summary.congestionLevel}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Incidents: ${data.summary.incidents}`, margin, yPosition);
    yPosition += 6;
    doc.text(`System Efficiency: ${data.summary.efficiency}%`, margin, yPosition);
    yPosition += 15;

    // Junction Details
    if (data.junctions.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(88, 28, 135);
      doc.text('Junction Analysis', margin, yPosition);
      yPosition += 10;

      data.junctions.forEach((junction, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(12);
        doc.setTextColor(59, 130, 246); // Blue color
        doc.text(junction.name, margin, yPosition);
        yPosition += 6;

        doc.setFontSize(10);
        doc.setTextColor(55, 65, 81);
        doc.text(`  Vehicles: ${junction.vehicles.toLocaleString()}`, margin, yPosition);
        yPosition += 5;
        doc.text(`  Wait Time: ${junction.waitTime} minutes`, margin, yPosition);
        yPosition += 5;
        doc.text(`  Congestion: ${junction.congestion}`, margin, yPosition);
        yPosition += 5;
        doc.text(`  Traffic Light Cycles: ${junction.trafficLights}`, margin, yPosition);
        yPosition += 8;
      });
    }

    // Incidents Section
    if (data.incidents.length > 0) {
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(88, 28, 135);
      doc.text('Incident Report', margin, yPosition);
      yPosition += 10;

      data.incidents.forEach((incident, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(10);
        doc.setTextColor(55, 65, 81);
        doc.text(`${index + 1}. ${incident.type} - ${incident.location}`, margin, yPosition);
        yPosition += 5;
        doc.text(`   Severity: ${incident.severity} | Duration: ${incident.duration} minutes`, margin, yPosition);
        yPosition += 8;
      });
    }

    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, doc.internal.pageSize.height - 10, { align: 'right' });
      doc.text('Generated by RoadWise TMS', margin, doc.internal.pageSize.height - 10);
    }

    return doc;
  };

  const handleGenerateReport = () => {
    if (!reportType) {
      alert('Please select a report type');
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      const newReport = {
        id: Date.now(),
        type: reportType,
        name: reportTypes.find(r => r.id === reportType)?.name,
        timestamp: new Date().toLocaleString(),
        status: 'completed',
        size: Math.floor(Math.random() * 5) + 1 + ' MB',
        junctions: selectedJunctions.length > 0 ? selectedJunctions : ['all']
      };
      
      setGeneratedReports(prev => [newReport, ...prev]);
      setIsGenerating(false);
    }, 3000);
  };

  const toggleJunction = (junctionId) => {
    setSelectedJunctions(prev => 
      prev.includes(junctionId) 
        ? prev.filter(id => id !== junctionId)
        : [...prev, junctionId]
    );
  };

  // Update downloadReport to render chart and add to PDF
  const downloadReport = async (report) => {
    try {
      // Generate mock data for the report
      const data = generateMockData(report.type, dateRange, selectedJunctions);

      // Render all charts to hidden canvases
      renderChart(data);
      renderCongestionChart(data);
      renderIncidentsChart(data);
      renderJunctionsChart(data);

      // Wait for charts to render
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for rendering

      // Get chart images as data URLs
      const chartCanvas = document.getElementById('reportChart');
      const chartImage = chartCanvas.toDataURL('image/png', 1.0);
      const congestionCanvas = document.getElementById('reportCongestionChart');
      const congestionImage = congestionCanvas.toDataURL('image/png', 1.0);
      const incidentsCanvas = document.getElementById('reportIncidentsChart');
      const incidentsImage = incidentsCanvas.toDataURL('image/png', 1.0);
      const junctionsCanvas = document.getElementById('reportJunctionsChart');
      const junctionsImage = junctionsCanvas.toDataURL('image/png', 1.0);

      // Generate PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      let yPosition = 20;

      // Header
      doc.setFontSize(24);
      doc.setTextColor(88, 28, 135); // Purple color
      doc.text('RoadWise TMS', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
      doc.setFontSize(16);
      doc.setTextColor(75, 85, 99); // Gray color
      doc.text(report.name, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;
      doc.setFontSize(12);
      doc.setTextColor(55, 65, 81);
      doc.text(`Generated: ${report.timestamp}`, margin, yPosition);
      yPosition += 8;
      doc.text(`Report Type: ${report.name}`, margin, yPosition);
      yPosition += 8;
      doc.text(`Junctions: ${report.junctions.length === 3 ? 'All' : report.junctions.join(', ')}`, margin, yPosition);
      yPosition += 15;

      // --- Insert All Chart Visualizations ---
      const chartSections = [
        { title: 'Traffic Volume (Vehicles per Hour)', image: chartImage },
        { title: 'Congestion Level (%)', image: congestionImage },
        { title: 'Incidents per Hour', image: incidentsImage },
        { title: 'Vehicles by Junction', image: junctionsImage }
      ];
      chartSections.forEach(({ title, image }) => {
        if (yPosition > 200) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFontSize(14);
        doc.setTextColor(88, 28, 135);
        doc.text(title, margin, yPosition);
        yPosition += 5;
        doc.addImage(image, 'PNG', margin, yPosition, pageWidth - 2 * margin, 40);
        yPosition += 45;
      });
      // --- End Chart Visualizations ---

      // Summary Section
      doc.setFontSize(14);
      doc.setTextColor(88, 28, 135);
      doc.text('Executive Summary', margin, yPosition);
      yPosition += 10;
      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);
      doc.text(`Total Vehicles: ${data.summary.totalVehicles.toLocaleString()}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Average Wait Time: ${data.summary.averageWaitTime} minutes`, margin, yPosition);
      yPosition += 6;
      doc.text(`Congestion Level: ${data.summary.congestionLevel}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Incidents: ${data.summary.incidents}`, margin, yPosition);
      yPosition += 6;
      doc.text(`System Efficiency: ${data.summary.efficiency}%`, margin, yPosition);
      yPosition += 15;

      // Junction Details
      if (data.junctions.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(88, 28, 135);
        doc.text('Junction Analysis', margin, yPosition);
        yPosition += 10;
        data.junctions.forEach((junction, index) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          doc.setFontSize(12);
          doc.setTextColor(59, 130, 246);
          doc.text(junction.name, margin, yPosition);
          yPosition += 6;
          doc.setFontSize(10);
          doc.setTextColor(55, 65, 81);
          doc.text(`  Vehicles: ${junction.vehicles.toLocaleString()}`, margin, yPosition);
          yPosition += 5;
          doc.text(`  Wait Time: ${junction.waitTime} minutes`, margin, yPosition);
          yPosition += 5;
          doc.text(`  Congestion: ${junction.congestion}`, margin, yPosition);
          yPosition += 5;
          doc.text(`  Traffic Light Cycles: ${junction.trafficLights}`, margin, yPosition);
          yPosition += 8;
        });
      }

      // Incidents Section
      if (data.incidents.length > 0) {
        if (yPosition > 200) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFontSize(14);
        doc.setTextColor(88, 28, 135);
        doc.text('Incident Report', margin, yPosition);
        yPosition += 10;
        data.incidents.forEach((incident, index) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          doc.setFontSize(10);
          doc.setTextColor(55, 65, 81);
          doc.text(`${index + 1}. ${incident.type} - ${incident.location}`, margin, yPosition);
          yPosition += 5;
          doc.text(`   Severity: ${incident.severity} | Duration: ${incident.duration} minutes`, margin, yPosition);
          yPosition += 8;
        });
      }

      // Footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, doc.internal.pageSize.height - 10, { align: 'right' });
        doc.text('Generated by RoadWise TMS', margin, doc.internal.pageSize.height - 10);
      }

      // Download the PDF
      const fileName = `RoadWise_TMS_${report.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      // Clean up chart instances
      if (window.reportChartInstance) { window.reportChartInstance.destroy(); window.reportChartInstance = null; }
      if (window.reportCongestionChartInstance) { window.reportCongestionChartInstance.destroy(); window.reportCongestionChartInstance = null; }
      if (window.reportIncidentsChartInstance) { window.reportIncidentsChartInstance.destroy(); window.reportIncidentsChartInstance = null; }
      if (window.reportJunctionsChartInstance) { window.reportJunctionsChartInstance.destroy(); window.reportJunctionsChartInstance = null; }

      console.log('Report downloaded successfully:', fileName);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    }
  };

  // Helper to get current mock data for visible charts
  useEffect(() => {
    if (!reportType) return;
    const data = generateMockData(reportType, dateRange, selectedJunctions);
    setChartData(data);
  }, [reportType, dateRange, selectedJunctions]);

  // Chart rendering for visible charts
  useEffect(() => {
    if (!chartData) return;
    // Main traffic volume chart
    if (mainChartRef.current) {
      if (mainChartRef.current._chartInstance) {
        mainChartRef.current._chartInstance.destroy();
      }
      mainChartRef.current._chartInstance = new Chart(mainChartRef.current, {
        type: 'line',
        data: {
          labels: chartData.timeline.map(item => `${item.hour}:00`),
          datasets: [
            {
              label: 'Vehicles per Hour',
              data: chartData.timeline.map(item => item.vehicles),
              borderColor: 'rgba(88, 28, 135, 1)',
              backgroundColor: 'rgba(88, 28, 135, 0.1)',
              fill: true,
              tension: 0.4,
            },
            {
              label: 'Cyclists per Hour',
              data: chartData.timeline.map(item => item.cyclists),
              borderColor: 'rgba(16, 185, 129, 1)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              fill: true,
              tension: 0.4,
            }
          ]
        },
        options: {
          plugins: { legend: { display: true } },
          scales: {
            x: { title: { display: true, text: 'Hour' } },
            y: { title: { display: true, text: 'Count' } }
          }
        }
      });
    }
    // Congestion level chart
    if (congestionChartRef.current) {
      if (congestionChartRef.current._chartInstance) {
        congestionChartRef.current._chartInstance.destroy();
      }
      congestionChartRef.current._chartInstance = new Chart(congestionChartRef.current, {
        type: 'line',
        data: {
          labels: chartData.timeline.map(item => `${item.hour}:00`),
          datasets: [{
            label: 'Congestion Level',
            data: chartData.timeline.map(item => Math.round(item.congestion * 100)),
            borderColor: 'rgba(239, 68, 68, 1)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.4,
          }]
        },
        options: {
          plugins: { legend: { display: true } },
          scales: {
            x: { title: { display: true, text: 'Hour' } },
            y: { title: { display: true, text: 'Congestion (%)', color: '#ef4444' }, min: 0, max: 100 }
          }
        }
      });
    }
    // Incidents per hour chart
    if (incidentsChartRef.current) {
      if (incidentsChartRef.current._chartInstance) {
        incidentsChartRef.current._chartInstance.destroy();
      }
      // Count incidents per hour (randomly assign for mock)
      const incidentsPerHour = Array(24).fill(0);
      chartData.incidents.forEach(inc => {
        const hour = Math.floor(Math.random() * 24);
        incidentsPerHour[hour] += 1;
      });
      incidentsChartRef.current._chartInstance = new Chart(incidentsChartRef.current, {
        type: 'bar',
        data: {
          labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
          datasets: [{
            label: 'Incidents per Hour',
            data: incidentsPerHour,
            backgroundColor: 'rgba(251, 191, 36, 0.7)',
            borderColor: 'rgba(251, 191, 36, 1)',
            borderWidth: 1
          }]
        },
        options: {
          plugins: { legend: { display: true } },
          scales: {
            x: { title: { display: true, text: 'Hour' } },
            y: { title: { display: true, text: 'Incidents' }, min: 0 }
          }
        }
      });
    }
    // Junction vehicle counts
    if (junctionsChartRef.current) {
      if (junctionsChartRef.current._chartInstance) {
        junctionsChartRef.current._chartInstance.destroy();
      }
      junctionsChartRef.current._chartInstance = new Chart(junctionsChartRef.current, {
        type: 'bar',
        data: {
          labels: chartData.junctions.map(j => j.name),
          datasets: [{
            label: 'Vehicles by Junction',
            data: chartData.junctions.map(j => j.vehicles),
            backgroundColor: [
              'rgba(59, 130, 246, 0.7)',
              'rgba(16, 185, 129, 0.7)',
              'rgba(251, 191, 36, 0.7)'
            ],
            borderColor: [
              'rgba(59, 130, 246, 1)',
              'rgba(16, 185, 129, 1)',
              'rgba(251, 191, 36, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          plugins: { legend: { display: true } },
          scales: {
            x: { title: { display: true, text: 'Junction' } },
            y: { title: { display: true, text: 'Vehicles' }, min: 0 }
          }
        }
      });
    }
  }, [chartData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Report Navigation */}
      <nav className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-xl border-b border-purple-500">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg border-2 border-white border-opacity-30 bg-white">
                <img 
                  src="/logo.jpeg" 
                  alt="RoadWise TMS Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-2xl font-bold tracking-wide">RoadWise TMS</div>
                <div className="text-sm text-purple-100 font-medium">Report Generator</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/officer')}
                className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Report Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 bg-white rounded-2xl shadow-xl p-8 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Traffic Report Generator</h1>
              <p className="text-gray-600">Generate comprehensive traffic reports and analytics</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Reports Generated</div>
              <div className="text-lg font-semibold text-purple-600">{generatedReports.length}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Report Type Selection */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Report Type</h2>
            <div className="space-y-4">
              {reportTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                    reportType === type.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{type.icon}</div>
                    <div className="text-left">
                      <div className="text-lg font-semibold text-gray-800">{type.name}</div>
                      <div className="text-sm text-gray-600">{type.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Report Configuration */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Report Configuration</h2>
            
            {/* Date Range */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Date Range</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Junction Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Junctions (Optional)</label>
              <div className="space-y-2">
                {junctions.map((junction) => (
                  <button
                    key={junction.id}
                    onClick={() => toggleJunction(junction.id)}
                    className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${
                      selectedJunctions.includes(junction.id)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className="text-sm font-semibold text-gray-800">{junction.name}</div>
                        <div className="text-xs text-gray-600">{junction.location}</div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 ${
                        selectedJunctions.includes(junction.id)
                          ? 'bg-purple-500 border-purple-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedJunctions.includes(junction.id) && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Leave unselected to include all junctions
              </div>
            </div>
          </div>
        </div>

        {/* Report Visualizations */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Report Visualizations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Traffic Volume Chart */}
            <div>
              <h3 className="text-lg font-semibold text-purple-700 mb-2">Traffic Volume (Vehicles per Hour)</h3>
              <canvas ref={mainChartRef} width="400" height="220" />
            </div>
            {/* Congestion Level Chart */}
            <div>
              <h3 className="text-lg font-semibold text-red-600 mb-2">Congestion Level (%)</h3>
              <canvas ref={congestionChartRef} width="400" height="220" />
            </div>
            {/* Incidents per Hour Chart */}
            <div>
              <h3 className="text-lg font-semibold text-yellow-600 mb-2">Incidents per Hour</h3>
              <canvas ref={incidentsChartRef} width="400" height="220" />
            </div>
            {/* Vehicles by Junction Chart */}
            <div>
              <h3 className="text-lg font-semibold text-blue-600 mb-2">Vehicles by Junction</h3>
              <canvas ref={junctionsChartRef} width="400" height="220" />
            </div>
          </div>
        </div>

        {/* Generate Report */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Generate Report</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Selected Report Type</div>
              <div className="text-lg font-semibold text-gray-800">
                {reportType ? reportTypes.find(r => r.id === reportType)?.name : 'None selected'}
              </div>
            </div>
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating || !reportType}
              className={`py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold ${
                isGenerating || !reportType
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700'
              }`}
            >
              <div className="text-2xl mb-2">{isGenerating ? '⏳' : '📊'}</div>
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>

        {/* Generated Reports */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Generated Reports</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {generatedReports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">📊</div>
                <div className="text-lg font-semibold">No reports generated yet</div>
                <div className="text-sm">Generate your first report to see it here</div>
              </div>
            ) : (
              generatedReports.map((report) => (
                <div key={report.id} className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <div className="text-lg font-semibold text-gray-800">{report.name}</div>
                      <div className="text-sm text-gray-600">{report.timestamp}</div>
                      <div className="text-xs text-gray-500">
                        Junctions: {report.junctions.length === 3 ? 'All' : report.junctions.join(', ')}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-600">✓ {report.status}</div>
                        <div className="text-xs text-gray-500">{report.size}</div>
                      </div>
                      <button
                        onClick={() => downloadReport(report)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        📥 Download
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Report Templates */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Report Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">📋 Standard Report</h3>
              <p className="text-sm text-gray-600 mb-4">Basic traffic statistics and metrics</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Traffic flow rates</li>
                <li>• Wait times</li>
                <li>• Congestion levels</li>
                <li>• Basic charts</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">📈 Detailed Analysis</h3>
              <p className="text-sm text-gray-600 mb-4">Comprehensive traffic analysis</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Peak hour analysis</li>
                <li>• Trend identification</li>
                <li>• Performance metrics</li>
                <li>• Recommendations</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">🚨 Incident Report</h3>
              <p className="text-sm text-gray-600 mb-4">Emergency and incident documentation</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Incident details</li>
                <li>• Response times</li>
                <li>• Impact assessment</li>
                <li>• Action taken</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add hidden canvas for chart rendering */}
      <canvas id="reportChart" width="600" height="300" style={{ visibility: 'hidden', position: 'absolute', left: '-9999px' }}></canvas>
      <canvas id="reportCongestionChart" width="600" height="300" style={{ visibility: 'hidden', position: 'absolute', left: '-9999px' }}></canvas>
      <canvas id="reportIncidentsChart" width="600" height="300" style={{ visibility: 'hidden', position: 'absolute', left: '-9999px' }}></canvas>
      <canvas id="reportJunctionsChart" width="600" height="300" style={{ visibility: 'hidden', position: 'absolute', left: '-9999px' }}></canvas>
      <Footer />
    </div>
  );
};

export default ReportGenerator; 