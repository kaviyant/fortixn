/* ==========================================================================
   FORTIX - Core JavaScript Application Engine
   Interactive Dashboards, Simulated Attacks, Cyber Time Machine, and AI Engines
   ========================================================================== */

// 1. Global Application State
const state = {
  isLoggedIn: false,
  globalTrustIndex: 96,
  activePrivilegedUsers: 142,
  highRiskProfiles: 3,
  activeIncidents: 0,
  selectedTab: 'executive',
  activeScenario: 'theft', // default for simulator
  simRunning: false,
  timeMachineStep: 6, // 0 to 6 representing current states
  
  // Database datasets
  users: {
    james: {
      name: "James Sterling",
      role: "Senior Foreign Exchange Trader",
      dept: "Treasury Operations",
      branch: "London Canary Wharf",
      privilege: "Tier-2 Assets Access",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
      behaviors: [
        { label: "Working Hours Variance", value: 12, max: 100 },
        { label: "Login Pattern Stability", value: 94, max: 100 },
        { label: "Device Integrity Check", value: 98, max: 100 },
        { label: "Database Select Query Volume", value: 25, max: 100 },
        { label: "File Export Logs", value: 5, max: 100 },
        { label: "Cloud Upload Rates", value: 10, max: 100 }
      ],
      baseline: [85, 90, 95, 20, 10, 8],
      current: [82, 91, 98, 25, 12, 11],
      baselineScores: [94, 95, 96, 95, 96, 95, 96]
    },
    priya: {
      name: "Priya Sharma",
      role: "Core Banking Database Administrator",
      dept: "Database Admin Operations",
      branch: "Mumbai Corporate Center",
      privilege: "Tier-1 SysAdmin Access",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80",
      behaviors: [
        { label: "Working Hours Variance", value: 8, max: 100 },
        { label: "Login Pattern Stability", value: 98, max: 100 },
        { label: "Device Integrity Check", value: 100, max: 100 },
        { label: "Database Select Query Volume", value: 88, max: 100 },
        { label: "File Export Logs", value: 2, max: 100 },
        { label: "Cloud Upload Rates", value: 5, max: 100 }
      ],
      baseline: [90, 95, 98, 70, 5, 5],
      current: [88, 94, 98, 88, 7, 6],
      baselineScores: [98, 97, 98, 99, 98, 98, 97]
    },
    marcus: {
      name: "Marcus Vance",
      role: "Cloud DevOps Engineering Lead",
      dept: "Cloud DevOps Team",
      branch: "New York Wall Street",
      privilege: "Tier-1 Infrastructure Admin",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
      behaviors: [
        { label: "Working Hours Variance", value: 35, max: 100 },
        { label: "Login Pattern Stability", value: 75, max: 100 },
        { label: "Device Integrity Check", value: 92, max: 100 },
        { label: "Database Select Query Volume", value: 10, max: 100 },
        { label: "File Export Logs", value: 45, max: 100 },
        { label: "Cloud Upload Rates", value: 65, max: 100 }
      ],
      baseline: [80, 85, 90, 15, 30, 25],
      current: [45, 60, 88, 12, 75, 80],
      baselineScores: [90, 88, 85, 82, 80, 78, 79]
    }
  },

  vendors: [
    { name: "CloudStrike API Connector", company: "CrowdStrike Integrations", trust: 98, status: "Secure", risk: "Low", expiry: "2027-12-15", class: "low" },
    { name: "Infosys Remote Admin Key", company: "Infosys Security Services", trust: 94, status: "Active", risk: "Low", expiry: "2026-10-01", class: "low" },
    { name: "Snowflake Analytics Bridge", company: "Snowflake Inc.", trust: 78, status: "Warning", risk: "Medium", expiry: "2026-08-30", class: "warning-vendor" },
    { name: "PaloAlto External Firewalls", company: "Palo Alto Networks", trust: 97, status: "Secure", risk: "Low", expiry: "2027-01-10", class: "low" },
    { name: "Apex DevOps Contractors", company: "Apex Consulting", trust: 45, status: "Revoked", risk: "Critical", expiry: "Expired", class: "critical-vendor" }
  ],

  evidence: [
    { item: "Treasury Export database records.csv", source: "James Sterling (London Host)", hash: "3F7D2B11A46C9E8E2D770D6A78BC33F27AE2D1A1054E3CDE4490B678F1A2C3D4", time: "2026-07-16 18:42:01", status: "Verified Quantum Safe", verifyClass: "severity-low" },
    { item: "Clerk Laptop mount log report.log", source: "Branch Terminal Node 14.8", hash: "8E04C2D1F57A8293B8C1D6E2E504A76D22E891C80B4A2D3C4E5F6A7B8C9D0E1F", time: "2026-07-16 19:15:33", status: "Verified Quantum Safe", verifyClass: "severity-low" },
    { item: "Cloud bucket transfer metrics.xml", source: "External Vendor AWS Bridge", hash: "9A8B7C6D5E4F3G2H1I0J9K8L7M6N5O4P3Q2R1S0T9U8V7W6X5Y4Z3A2B1C0D9E8F", time: "2026-07-16 20:05:12", status: "Sign Checked", verifyClass: "severity-medium" }
  ],

  alerts: [
    { status: "Quarantined", severity: "Low", user: "Priya Sharma", dept: "Database Admin", risk: "12%", time: "2026-07-16 21:04:12", action: "None required" },
    { status: "Active Monitor", severity: "Medium", user: "Marcus Vance", dept: "DevOps Operations", risk: "48%", time: "2026-07-16 21:15:45", action: "Verify credentials" },
    { status: "Friction Triggered", severity: "High", user: "James Sterling", dept: "Treasury Trading", risk: "72%", time: "2026-07-16 21:30:22", action: "Hardware Token Prompted" }
  ]
};

// 2. Navigation Tab Controller
function switchTab(tabId) {
  state.selectedTab = tabId;
  
  // Update Navigation menu item visual classes
  document.querySelectorAll('.sidebar-nav-item').forEach(item => {
    if (item.getAttribute('data-tab') === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Switch display grids for screens
  document.querySelectorAll('.screen-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  const targetPanel = document.getElementById(`screen-${tabId}`);
  if (targetPanel) {
    targetPanel.classList.add('active');
  }

  // Force chart update on layout rendering
  initTabCharts(tabId);
}

// 3. Login Particle Canvas Animation
let particleAnimId = null;
function initLoginCanvas() {
  const canvas = document.getElementById('login-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const particles = [];
  const particleCount = 60;
  
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      r: Math.random() * 2 + 1
    });
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
    for (let p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    }

    particleAnimId = requestAnimationFrame(loop);
  }

  loop();
}

// 4. Authenticate & Gateway Loading
function handleLogin(event) {
  event.preventDefault();
  const btn = event.target.querySelector('button');
  const overlay = document.getElementById('login-overlay');
  
  btn.innerHTML = 'Connecting Secure Vault...';
  btn.disabled = true;
  
  // Simulated decryption latency
  setTimeout(() => {
    overlay.classList.add('hidden');
    state.isLoggedIn = true;
    cancelAnimationFrame(particleAnimId);
    showToast('Platform Authenticated: Secure Zero Trust Session Initialized', 'success');
    
    // Set up core application views
    initAppCore();
  }, 1200);
}

// 5. Toast System
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = `
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>`;
  if (type === 'critical') {
    icon = `
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
      </svg>`;
  } else if (type === 'success') {
    icon = `
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
      </svg>`;
  } else if (type === 'warning') {
    icon = `
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
      </svg>`;
  }

  toast.innerHTML = `
    ${icon}
    <div style="flex: 1;">
      <div style="font-weight: 600;">System Notification</div>
      <div style="font-size: 11px; color: var(--color-muted); margin-top: 2px;">${msg}</div>
    </div>
    <span class="toast-close" onclick="this.parentElement.remove()">×</span>
  `;
  container.appendChild(toast);
  
  // Auto dismiss
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.animation = 'toastSlideIn 0.3s reverse';
      setTimeout(() => toast.remove(), 300);
    }
  }, 4500);
}

// 6. Chart.js Global Reference Management
const charts = {};

function initTabCharts(tabId) {
  // Destroy existing charts of the same canvas to prevent overlap bugs
  const destroyChart = (id) => {
    if (charts[id]) {
      charts[id].destroy();
      delete charts[id];
    }
  };

  if (tabId === 'executive') {
    destroyChart('threat-timeline');
    destroyChart('insider-trend');
    
    // Executive Threat Timeline Chart
    const ctx1 = document.getElementById('chart-threat-timeline').getContext('2d');
    charts['threat-timeline'] = new Chart(ctx1, {
      type: 'line',
      data: {
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Now'],
        datasets: [
          {
            label: 'Access Requests',
            data: state.simRunning ? [140, 155, 340, 480, 520, 780, 1120] : [120, 98, 280, 420, 390, 240, 310],
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Anomalous Threat Blocks',
            data: state.simRunning ? [0, 1, 2, 4, 3, 14, 25] : [1, 0, 2, 0, 1, 3, 1],
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#94A3B8', font: { family: 'Inter' } } }
        },
        scales: {
          x: { grid: { color: 'rgba(148, 163, 184, 0.05)' }, ticks: { color: '#94A3B8' } },
          y: { grid: { color: 'rgba(148, 163, 184, 0.05)' }, ticks: { color: '#94A3B8' } }
        }
      }
    });

    // Executive Insider Trend Chart
    const ctx2 = document.getElementById('chart-insider-trend').getContext('2d');
    charts['insider-trend'] = new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: ['Treasury', 'DB Admin', 'DevOps', 'Sales', 'HR', 'Executive'],
        datasets: [{
          label: 'Anomalous Metric Score Count',
          data: state.simRunning ? [45, 12, 88, 15, 2, 8] : [12, 8, 35, 14, 1, 2],
          backgroundColor: state.simRunning ? 'rgba(239, 68, 68, 0.6)' : 'rgba(59, 130, 246, 0.6)',
          borderColor: state.simRunning ? '#EF4444' : '#3B82F6',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#94A3B8' } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#94A3B8' } },
          y: { grid: { color: 'rgba(148, 163, 184, 0.05)' }, ticks: { color: '#94A3B8' } }
        }
      }
    });
  }

  if (tabId === 'soc') {
    destroyChart('soc-confidence');
    destroyChart('soc-device-health');
    destroyChart('soc-dept-risk');

    const ctxConfidence = document.getElementById('chart-soc-confidence').getContext('2d');
    charts['soc-confidence'] = new Chart(ctxConfidence, {
      type: 'doughnut',
      data: {
        labels: ['Certain Threat', 'High Confidence', 'Suspicious Baseline'],
        datasets: [{
          data: state.simRunning ? [45, 45, 10] : [2, 10, 88],
          backgroundColor: ['#EF4444', '#F59E0B', '#10B981'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: '#94A3B8', boxWidth: 10 } } },
        cutout: '70%'
      }
    });

    const ctxDevice = document.getElementById('chart-soc-device-health').getContext('2d');
    charts['soc-device-health'] = new Chart(ctxDevice, {
      type: 'doughnut',
      data: {
        labels: ['Compliant', 'Anomalous Settings', 'Compromised'],
        datasets: [{
          data: state.simRunning ? [80, 15, 5] : [98, 2, 0],
          backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: '#94A3B8', boxWidth: 10 } } },
        cutout: '70%'
      }
    });

    const ctxDept = document.getElementById('chart-soc-dept-risk').getContext('2d');
    charts['soc-dept-risk'] = new Chart(ctxDept, {
      type: 'bar',
      data: {
        labels: ['UK', 'US', 'IN', 'SG', 'AE'],
        datasets: [{
          label: 'Active Anomalous Connections',
          data: state.simRunning ? [42, 28, 94, 15, 8] : [5, 12, 18, 4, 1],
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: '#3B82F6',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#94A3B8' } },
          y: { grid: { color: 'rgba(148, 163, 184, 0.05)' }, ticks: { color: '#94A3B8' } }
        }
      }
    });
  }

  if (tabId === 'digital-twin') {
    destroyChart('twin-comparison');
    
    // Baseline vs Current Behavior double area line
    const activeUser = state.users[document.getElementById('twin-user-select').value];
    const ctxTwin = document.getElementById('chart-twin-comparison').getContext('2d');
    
    charts['twin-comparison'] = new Chart(ctxTwin, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Behavioral Baseline (Normal)',
            data: activeUser.baselineScores,
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            fill: true,
            tension: 0.3
          },
          {
            label: 'Current Monitored Behavior',
            data: state.simRunning && activeUser.name === "James Sterling" 
              ? [94, 95, 96, 75, 45, 12, 8] 
              : activeUser.baselineScores.map(val => val + (Math.random() - 0.5) * 4),
            borderColor: state.simRunning && activeUser.name === "James Sterling" ? '#EF4444' : '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            fill: true,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#94A3B8' } } },
        scales: {
          x: { grid: { color: 'rgba(148, 163, 184, 0.05)' }, ticks: { color: '#94A3B8' } },
          y: { grid: { color: 'rgba(148, 163, 184, 0.05)' }, ticks: { color: '#94A3B8' } }
        }
      }
    });
  }

  if (tabId === 'trustdna') {
    destroyChart('trustdna-radar');
    destroyChart('trustdna-history');

    const ctxRadar = document.getElementById('chart-trustdna-radar').getContext('2d');
    charts['trustdna-radar'] = new Chart(ctxRadar, {
      type: 'radar',
      data: {
        labels: ['Identity', 'Behavior', 'Device', 'Network', 'Data', 'Command', 'Cloud'],
        datasets: [
          {
            label: 'Current Profile Posture',
            data: state.simRunning ? [45, 30, 75, 50, 40, 25, 60] : [96, 92, 98, 94, 97, 90, 95],
            borderColor: state.simRunning ? '#EF4444' : '#10B981',
            backgroundColor: state.simRunning ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            borderWidth: 2
          },
          {
            label: 'Corporate Security Baseline',
            data: [90, 90, 92, 92, 90, 90, 90],
            borderColor: 'rgba(59, 130, 246, 0.4)',
            backgroundColor: 'rgba(59, 130, 246, 0.02)',
            borderWidth: 1,
            borderDash: [5, 5]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#94A3B8' } } },
        scales: {
          r: {
            angleLines: { color: 'rgba(148, 163, 184, 0.1)' },
            grid: { color: 'rgba(148, 163, 184, 0.1)' },
            pointLabels: { color: '#94A3B8', font: { size: 10 } },
            ticks: { display: false }
          }
        }
      }
    });

    const ctxHist = document.getElementById('chart-trustdna-history').getContext('2d');
    charts['trustdna-history'] = new Chart(ctxHist, {
      type: 'line',
      data: {
        labels: Array.from({length: 15}, (_, i) => `Day ${i+1}`),
        datasets: [{
          label: 'Trust Index Stable Rating',
          data: state.simRunning ? [96, 96, 97, 95, 96, 95, 94, 92, 90, 85, 78, 62, 54, 48, 48] : [95, 96, 96, 95, 96, 95, 96, 97, 96, 95, 96, 95, 96, 96, 96],
          borderColor: state.simRunning ? '#EF4444' : '#3B82F6',
          backgroundColor: state.simRunning ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#94A3B8' } },
          y: { grid: { color: 'rgba(148, 163, 184, 0.05)' }, ticks: { color: '#94A3B8' } }
        }
      }
    });
  }

  if (tabId === 'insider-detection') {
    destroyChart('insider-heatmap');
    
    // Mock Heatmap Grid
    const ctxHeat = document.getElementById('chart-insider-heatmap').getContext('2d');
    charts['insider-heatmap'] = new Chart(ctxHeat, {
      type: 'bar',
      data: {
        labels: ['NY DevOps', 'LDN Trading', 'MUM DB Admin', 'SG Compliance', 'HK Sales', 'AE Admin'],
        datasets: [
          {
            label: 'Low Risk Events',
            data: [45, 32, 50, 12, 10, 4],
            backgroundColor: '#10B981'
          },
          {
            label: 'Medium Risk Events',
            data: state.simRunning ? [14, 25, 20, 2, 4, 1] : [4, 8, 12, 1, 2, 0],
            backgroundColor: '#F59E0B'
          },
          {
            label: 'Critical Risk Anomalies',
            data: state.simRunning ? [2, 18, 5, 0, 0, 1] : [0, 1, 0, 0, 0, 0],
            backgroundColor: '#EF4444'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#94A3B8' } } },
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { color: '#94A3B8' } },
          y: { stacked: true, grid: { color: 'rgba(148, 163, 184, 0.05)' }, ticks: { color: '#94A3B8' } }
        }
      }
    });
  }

  if (tabId === 'vendor-risk') {
    destroyChart('vendor-heatmap');
    
    const ctxVendor = document.getElementById('chart-vendor-heatmap').getContext('2d');
    charts['vendor-heatmap'] = new Chart(ctxVendor, {
      type: 'bar',
      data: {
        labels: ['CrowdStrike Integrations', 'Infosys Remote Key', 'Snowflake Bridge', 'PaloAlto Firewalls', 'Apex DevOps Contracts'],
        datasets: [{
          label: 'Calculated Vendor Danger Coefficient',
          data: state.simRunning ? [12, 8, 48, 10, 94] : [8, 6, 28, 8, 65],
          backgroundColor: state.simRunning ? 'rgba(239, 68, 68, 0.6)' : 'rgba(245, 158, 11, 0.6)',
          borderColor: state.simRunning ? '#EF4444' : '#F59E0B',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#94A3B8' } },
          y: { grid: { color: 'rgba(148, 163, 184, 0.05)' }, ticks: { color: '#94A3B8' } }
        }
      }
    });
  }

  if (tabId === 'explainable-ai') {
    destroyChart('explainable-weights');
    
    const ctxExplain = document.getElementById('chart-explainable-weights').getContext('2d');
    charts['explainable-weights'] = new Chart(ctxExplain, {
      type: 'bar',
      data: {
        labels: ['Out-of-Hours Session', 'Data Export Rate', 'Unusual Query Schema', 'Hardware Token Miss', 'Remote IP Distance', 'External Cloud Bucket Hops'],
        datasets: [{
          label: 'Model Feature Importance weight (%)',
          data: [15, 25, 20, 10, 15, 15],
          backgroundColor: '#3B82F6'
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(148, 163, 184, 0.05)' }, ticks: { color: '#94A3B8' } },
          y: { grid: { display: false }, ticks: { color: '#94A3B8' } }
        }
      }
    });
  }

  if (tabId === 'compliance') {
    destroyChart('comp-rbi');
    destroyChart('comp-iso');
    destroyChart('comp-nist');
    destroyChart('comp-pci');

    const opts = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      cutout: '80%'
    };

    charts['comp-rbi'] = new Chart(document.getElementById('chart-comp-rbi').getContext('2d'), {
      type: 'doughnut',
      data: { datasets: [{ data: [98.2, 1.8], backgroundColor: ['#10B981', 'rgba(255, 255, 255, 0.05)'] }] },
      options: opts
    });

    charts['comp-iso'] = new Chart(document.getElementById('chart-comp-iso').getContext('2d'), {
      type: 'doughnut',
      data: { datasets: [{ data: [100, 0], backgroundColor: ['#10B981', 'rgba(255, 255, 255, 0.05)'] }] },
      options: opts
    });

    charts['comp-nist'] = new Chart(document.getElementById('chart-comp-nist').getContext('2d'), {
      type: 'doughnut',
      data: { datasets: [{ data: [95.4, 4.6], backgroundColor: ['#10B981', 'rgba(255, 255, 255, 0.05)'] }] },
      options: opts
    });

    charts['comp-pci'] = new Chart(document.getElementById('chart-comp-pci').getContext('2d'), {
      type: 'doughnut',
      data: { datasets: [{ data: [100, 0], backgroundColor: ['#10B981', 'rgba(255, 255, 255, 0.05)'] }] },
      options: opts
    });
  }
}

// 7. Interactive SVG Neural AI Swarm Canvas
function initSwarmEngine() {
  const container = document.getElementById('swarm-nodes-svg');
  if (!container) return;
  container.innerHTML = ''; // Clear

  const nodes = [
    { id: 'behavior', label: 'Behavior AI', x: 80, y: 150, acc: '99.4%', status: 'Active & Calibrated. Monitoring keystroke rates & active browser transitions.', fill: '#3B82F6' },
    { id: 'identity', label: 'Identity AI', x: 80, y: 270, acc: '99.9%', status: 'Active. Correlating spatial logins against bank directory paths.', fill: '#3B82F6' },
    { id: 'device', label: 'Device AI', x: 220, y: 80, acc: '98.8%', status: 'Active. Validating CPU metrics and Yubikey hardware registers.', fill: '#3B82F6' },
    { id: 'database', label: 'Database AI', x: 220, y: 340, acc: '99.1%', status: 'Active. Tracking SQL anomalies against relational table schemas.', fill: '#3B82F6' },
    { id: 'network', label: 'Network AI', x: 380, y: 150, acc: '99.2%', status: 'Active. Verifying network connection speeds & external host DNS checks.', fill: '#3B82F6' },
    { id: 'correlation', label: 'Threat Correlation AI', x: 380, y: 270, acc: '99.8%', status: 'Active. Fusing threat signals across network hops.', fill: '#10B981' },
    { id: 'explainable', label: 'Explainable AI (XAI)', x: 520, y: 210, acc: '97.5%', status: 'Active. Mapping calculated outputs to clean audit weight logs.', fill: '#3B82F6' }
  ];

  // Draw Links
  const links = [
    { from: 'behavior', to: 'network' },
    { from: 'identity', to: 'database' },
    { from: 'device', to: 'network' },
    { from: 'database', to: 'correlation' },
    { from: 'network', to: 'correlation' },
    { from: 'correlation', to: 'explainable' }
  ];

  // Render Link paths
  links.forEach(l => {
    const fromNode = nodes.find(n => n.id === l.from);
    const toNode = nodes.find(n => n.id === l.to);
    
    // Draw background link line
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const d = `M ${fromNode.x} ${fromNode.y} Q ${(fromNode.x + toNode.x)/2} ${(fromNode.y + toNode.y)/2 - 20} ${toNode.x} ${toNode.y}`;
    path.setAttribute('d', d);
    path.setAttribute('class', 'swarm-link-line');
    container.appendChild(path);

    // Draw active signal pulse line
    const pulsePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pulsePath.setAttribute('d', d);
    pulsePath.setAttribute('class', 'swarm-link-pulse');
    if (state.simRunning) {
      pulsePath.style.stroke = 'var(--color-crimson)';
      pulsePath.style.animationDuration = '2s';
    }
    container.appendChild(pulsePath);
  });

  // Render Node Gs
  nodes.forEach(n => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.style.cursor = 'pointer';
    g.onclick = () => selectSwarmNode(n);

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', n.x);
    circle.setAttribute('cy', n.y);
    circle.setAttribute('r', 25);
    circle.setAttribute('class', 'swarm-node-circle');
    if (state.simRunning && (n.id === 'correlation' || n.id === 'explainable' || n.id === 'behavior')) {
      circle.style.stroke = 'var(--color-crimson)';
      circle.style.filter = 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.4))';
    } else {
      circle.style.stroke = n.fill;
    }
    g.appendChild(circle);

    // Text Label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', n.x);
    text.setAttribute('y', n.y + 4);
    text.setAttribute('class', 'swarm-node-text');
    text.textContent = n.label.split(' ')[0];
    g.appendChild(text);

    container.appendChild(g);
  });
}

function selectSwarmNode(node) {
  document.getElementById('swarm-selected-node-title').innerText = node.label;
  document.getElementById('swarm-selected-node-desc').innerText = node.status;
  document.getElementById('swarm-selected-accuracy').innerText = node.acc;
  
  const bar = document.getElementById('swarm-selected-bar');
  bar.style.width = node.acc;
  
  const statusBox = document.getElementById('swarm-status-box');
  if (state.simRunning && (node.id === 'correlation' || node.id === 'explainable' || node.id === 'behavior')) {
    statusBox.className = 'explainable-reason-card failed';
    statusBox.innerHTML = `<strong>Node Warning Trigger:</strong> Active anomaly detected. Exfiltration vector verified. Action locked.`;
    statusBox.style.background = 'rgba(239, 68, 68, 0.05)';
  } else {
    statusBox.className = 'explainable-reason-card passed';
    statusBox.innerHTML = `<strong>Node Status:</strong> Active & Calibrated. Verifying transaction parameters.`;
    statusBox.style.background = 'rgba(16, 185, 129, 0.05)';
  }
}

// 8. Interactive Collusion Node Graph
function initCollusionGraph() {
  const container = document.getElementById('collusion-svg');
  if (!container) return;
  container.innerHTML = '';

  const entities = [
    { id: 'jsterling', name: 'James Sterling', type: 'Trader', x: 180, y: 140, risk: state.simRunning ? 'critical' : 'low' },
    { id: 'psharma', name: 'Priya Sharma', type: 'SysAdmin', x: 260, y: 220, risk: 'low' },
    { id: 'apex_con', name: 'Apex Dev Contractor', type: 'Vendor', x: 420, y: 150, risk: state.simRunning ? 'critical' : 'warning' },
    { id: 'db_vault', name: 'Treasury DB Server', type: 'Asset', x: 300, y: 80, risk: state.simRunning ? 'critical' : 'low' },
    { id: 'cloud_bucket', name: 'Backup AWS S3 Bucket', type: 'Asset', x: 480, y: 280, risk: state.simRunning ? 'critical' : 'low' }
  ];

  const communicationPaths = [
    { from: 'jsterling', to: 'db_vault', active: state.simRunning },
    { from: 'psharma', to: 'db_vault', active: false },
    { from: 'apex_con', to: 'db_vault', active: state.simRunning },
    { from: 'apex_con', to: 'cloud_bucket', active: state.simRunning },
    { from: 'jsterling', to: 'apex_con', active: state.simRunning }
  ];

  // Draw links
  communicationPaths.forEach(path => {
    const fromEnt = entities.find(e => e.id === path.from);
    const toEnt = entities.find(e => e.id === path.to);

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', fromEnt.x);
    line.setAttribute('y1', fromEnt.y);
    line.setAttribute('x2', toEnt.x);
    line.setAttribute('y2', toEnt.y);
    
    if (path.active) {
      line.setAttribute('class', 'collusion-link active-suspicious');
    } else {
      line.setAttribute('class', 'collusion-link');
    }
    container.appendChild(line);
  });

  // Draw nodes
  entities.forEach(ent => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'node-group');
    g.onclick = () => selectCollusionNode(ent);

    // Pulsing risk ring
    const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ring.setAttribute('cx', ent.x);
    ring.setAttribute('cy', ent.y);
    ring.setAttribute('r', 16);
    if (ent.risk === 'critical') {
      ring.setAttribute('class', 'node-ring suspicious');
    } else {
      ring.setAttribute('class', 'node-ring');
      ring.setAttribute('stroke', 'rgba(59, 130, 246, 0.1)');
    }
    g.appendChild(ring);

    // Node core dot
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', ent.x);
    dot.setAttribute('cy', ent.y);
    dot.setAttribute('r', 8);
    dot.setAttribute('class', 'node-dot');
    
    let color = '#3B82F6';
    if (ent.risk === 'critical') color = '#EF4444';
    else if (ent.risk === 'warning') color = '#F59E0B';
    else if (ent.type === 'Asset') color = '#10B981';
    
    dot.setAttribute('stroke', color);
    dot.setAttribute('fill', 'var(--bg-midnight)');
    g.appendChild(dot);

    // Text name
    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', ent.x);
    txt.setAttribute('y', ent.y + 26);
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('fill', 'var(--color-soft-white)');
    txt.setAttribute('font-size', '9');
    txt.setAttribute('font-weight', '600');
    txt.textContent = ent.name;
    g.appendChild(txt);

    // Text type label
    const subtxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    subtxt.setAttribute('x', ent.x);
    subtxt.setAttribute('y', ent.y + 36);
    subtxt.setAttribute('text-anchor', 'middle');
    subtxt.setAttribute('fill', 'var(--color-muted)');
    subtxt.setAttribute('font-size', '8');
    subtxt.textContent = ent.type;
    g.appendChild(subtxt);

    container.appendChild(g);
  });
}

function selectCollusionNode(ent) {
  const riskTxt = document.getElementById('collusion-risk-percent');
  const descTxt = document.getElementById('collusion-risk-desc');
  const alertBox = document.getElementById('collusion-alert-box');

  if (state.simRunning && (ent.id === 'jsterling' || ent.id === 'apex_con')) {
    riskTxt.innerText = '94%';
    riskTxt.style.color = 'var(--color-crimson)';
    descTxt.innerText = `Collusion confirmed between James Sterling (Trader) & Apex Dev Contractor. Shared folders indicate unauthorized backups of Treasury DB Server written to Backup S3 Bucket.`;
    alertBox.className = 'explainable-reason-card failed';
    alertBox.innerHTML = `<strong>Zero-Trust Containment Suggested:</strong> Revoke security tokens immediately for the compromised accounts.`;
    alertBox.style.background = 'rgba(239, 68, 68, 0.05)';
  } else {
    riskTxt.innerText = '12%';
    riskTxt.style.color = 'var(--color-emerald)';
    descTxt.innerText = `All communications align with historical directory patterns. Selected entity ${ent.name} (${ent.type}) is operating within standard access bounds.`;
    alertBox.className = 'explainable-reason-card passed';
    alertBox.innerHTML = `<strong>Security Posture:</strong> Clean. Entity communication channels verified against active compliance policies.`;
    alertBox.style.background = 'rgba(16, 185, 129, 0.05)';
  }
}

function triggerCollusionContainment() {
  if (state.simRunning) {
    showToast('Friction Rules Applied: Compromised Credential Tokens Revoked', 'success');
    state.simRunning = false;
    resetSimulation();
  } else {
    showToast('Active Zero-Trust Shields already initialized', 'info');
  }
}

// 9. Interactive Cyber Time Machine Scrubber Engine
const timeMachineEvents = [
  { step: 0, title: "09:12 - Office VPN login", desc: "Trader James Sterling logs into London corporate VPN from verified home IP coordinate.", status: "Normal Activity", class: "active" },
  { step: 1, title: "10:05 - System Authorization", desc: "MFA verified via hardware security token. Device parameters verified.", status: "MFA Check Passed", class: "active" },
  { step: 2, title: "14:12 - Database Queries", desc: "James queries FX Treasury tables. Rate of SELECT rows remains within baseline.", status: "DB Access Validated", class: "active" },
  { step: 3, title: "18:42 - USB Storage Mounted", desc: "Unauthorized USB storage device mounted on trader laptop. Access triggers alerts.", status: "Friction Warn Triggered", class: "active-warning" },
  { step: 4, title: "18:45 - High Volume Data Export", desc: "Trader copies decrypted transaction vaults onto local mounted USB.", status: "High Risk Anomalous Event", class: "active-critical" },
  { step: 5, title: "18:48 - External Cloud Export", desc: "Laptop triggers backup script uploading archives to unverified external S3 bucket.", status: "Threat Confirmed", class: "active-critical" },
  { step: 6, title: "18:50 - Session Revoked", desc: "Fortix Swarm Engine kills all session credentials, locks active directories.", status: "Threat Contained", class: "active-critical" }
];

function initTimeMachine() {
  const container = document.getElementById('time-machine-nodes');
  if (!container) return;
  container.innerHTML = '';

  timeMachineEvents.forEach(evt => {
    const node = document.createElement('div');
    node.className = `timeline-node ${evt.step === state.timeMachineStep ? evt.class : ''}`;
    node.onclick = () => setTimeMachineStep(evt.step);

    node.innerHTML = `
      <div class="timeline-node-dot">${evt.step + 1}</div>
      <div class="timeline-node-label">${evt.title.split(' - ')[0]}</div>
    `;
    container.appendChild(node);
  });

  // Update track bar progress
  const progress = document.getElementById('time-machine-progress');
  const pct = (state.timeMachineStep / (timeMachineEvents.length - 1)) * 100;
  progress.style.width = `${pct}%`;

  // Render detail box
  const activeEvt = timeMachineEvents[state.timeMachineStep];
  document.getElementById('time-machine-timestamp').innerText = `Scrubbing System Time: ${activeEvt.title}`;
  document.getElementById('tm-stage-name').innerText = activeEvt.title;
  document.getElementById('tm-stage-desc').innerText = activeEvt.desc;
  
  const statusLabel = document.getElementById('tm-stage-status');
  statusLabel.innerText = activeEvt.status;
  
  if (activeEvt.class === 'active') {
    statusLabel.style.color = 'var(--color-emerald)';
  } else if (activeEvt.class === 'active-warning') {
    statusLabel.style.color = 'var(--color-amber)';
  } else {
    statusLabel.style.color = 'var(--color-crimson)';
  }
}

function setTimeMachineStep(step) {
  state.timeMachineStep = Math.max(0, Math.min(timeMachineEvents.length - 1, step));
  initTimeMachine();
}

function scrubTimeMachineStep(offset) {
  setTimeMachineStep(state.timeMachineStep + offset);
}

function resetTimeMachine() {
  state.timeMachineStep = 6;
  initTimeMachine();
  showToast('Time Machine: Switched back to Live Security Feed', 'info');
}

// 10. Real-Time Streaming Logs Generator
let logTimer = null;
const mockActivityLogs = [
  { desc: "Priya Sharma query: SELECT * FROM CoreBank.VaultAccounts LIMIT 10", dept: "DB Admin", risk: "Low", ip: "10.201.5.11" },
  { desc: "James Sterling login: Canary Wharf Branch, Hardware Token MFA Verified", dept: "Treasury", risk: "Low", ip: "10.102.14.8" },
  { desc: "Cloud Service Tunnel check: API Token refreshed for CrowdStrike logs", dept: "Cloud API", risk: "Low", ip: "172.16.8.9" },
  { desc: "VPN tunnel opened: Marcus Vance connected from WallSt Host", dept: "DevOps", risk: "Low", ip: "192.168.1.104" },
  { desc: "System update check: All 12 servers audit-ready, hashes matching", dept: "Compliance", risk: "Low", ip: "10.0.0.1" }
];

function initLiveLogging() {
  const container = document.getElementById('live-log-container');
  if (!container) return;
  container.innerHTML = '';

  // Initial fill
  for (let i = 0; i < 6; i++) {
    addLiveLogEvent();
  }

  // Interval generation
  if (logTimer) clearInterval(logTimer);
  logTimer = setInterval(() => {
    addLiveLogEvent();
  }, 3500);
}

function addLiveLogEvent() {
  const container = document.getElementById('live-log-container');
  if (!container) return;

  const randLog = mockActivityLogs[Math.floor(Math.random() * mockActivityLogs.length)];
  const row = document.createElement('div');
  row.className = 'feed-event-row';
  
  let riskColor = 'var(--color-emerald)';
  if (randLog.risk === 'High') riskColor = 'var(--color-crimson)';
  
  row.innerHTML = `
    <div class="feed-event-left">
      <div class="feed-event-icon">
        <svg width="14" height="14" fill="none" stroke="var(--color-electric)" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <div class="feed-event-details">
        <span class="feed-event-desc">${randLog.desc}</span>
        <span class="feed-event-meta">IP: ${randLog.ip} • Dept: ${randLog.dept}</span>
      </div>
    </div>
    <span style="font-weight:700; font-size:10px; color:${riskColor};">${randLog.risk}</span>
  `;

  container.prepend(row);
  
  // Cap count
  if (container.children.length > 25) {
    container.lastChild.remove();
  }
}

// 11. Red Team Simulator Control Dashboard
function selectScenario(scen) {
  state.activeScenario = scen;
  document.querySelectorAll('.scenario-card').forEach(card => {
    card.classList.remove('active');
  });
  document.getElementById(`scen-${scen}`).classList.add('active');
}

function startSimulation() {
  if (state.simRunning) {
    showToast('A simulation is already actively running. Click Reset first.', 'warning');
    return;
  }

  state.simRunning = true;
  showToast(`Simulating Attack Scenario: ${state.activeScenario.toUpperCase()}`, 'critical');

  const statusLabel = document.getElementById('sim-status-label');
  statusLabel.innerText = "ATTACK VECTOR RUNNING";
  statusLabel.style.color = "var(--color-crimson)";

  const effectsTxt = document.getElementById('sim-effects-text');
  const alertBox = document.getElementById('sim-alert-box');
  const riskIndex = document.getElementById('sim-risk-index');

  // Trigger scenario updates
  if (state.activeScenario === 'theft') {
    state.globalTrustIndex = 48;
    state.highRiskProfiles = 4;
    state.activeIncidents = 1;

    effectsTxt.innerHTML = `
      - James Sterling baseline comparison variance spikes.<br>
      - Unauthorized USB storage media mount flagged.<br>
      - Out-of-hours bulk SQLite schema dump verified.<br>
      - Inter-departmental collusion vector alerted.
    `;
    alertBox.className = "explainable-reason-card failed";
    alertBox.innerHTML = `<strong>Simulator Critical Warning:</strong> Out-of-hours unauthorized files backup locked. Session killed automatically.`;
    alertBox.style.background = 'rgba(239, 68, 68, 0.05)';
    riskIndex.innerText = "48% Trust (Critical Anomaly)";
    riskIndex.style.color = "var(--color-crimson)";

    // Inject alert to global queues
    injectSimulatedAlert("Blocked", "High", "James Sterling", "Treasury", "94% Variance", "USB Data Exfil Attempted");
  } 
  else if (state.activeScenario === 'usb') {
    state.globalTrustIndex = 62;
    state.highRiskProfiles = 4;
    state.activeIncidents = 1;

    effectsTxt.innerHTML = `
      - Branch terminal 14.8 mounted USB drive with anomalous shell script.<br>
      - Device integrity score drops below corporate safety bounds.<br>
      - Zero Trust credential verification forced.
    `;
    alertBox.className = "explainable-reason-card failed";
    alertBox.innerHTML = `<strong>Simulator Alert:</strong> Threat isolated. Host machine quarantined from corporate DNS.`;
    alertBox.style.background = 'rgba(239, 68, 68, 0.05)';
    riskIndex.innerText = "62% Trust (Warning Posture)";
    riskIndex.style.color = "var(--color-amber)";

    injectSimulatedAlert("Quarantined", "High", "Terminal 14.8", "Branch Ops", "82% Variance", "Malicious USB Mount");
  }
  else if (state.activeScenario === 'malware') {
    state.globalTrustIndex = 35;
    state.activeIncidents = 2;

    effectsTxt.innerHTML = `
      - Suspicious background service calling external network bridge.<br>
      - Server cluster collusion links active.<br>
      - Distributed neural models flag ransomware signal behaviors.
    `;
    alertBox.className = "explainable-reason-card failed";
    alertBox.innerHTML = `<strong>Autonomous Containment:</strong> Backup directories locked. Internal bridges closed.`;
    alertBox.style.background = 'rgba(239, 68, 68, 0.05)';
    riskIndex.innerText = "35% Trust (Emergency Containment)";
    riskIndex.style.color = "var(--color-crimson)";

    injectSimulatedAlert("Locked", "Critical", "Core Server 5", "IT Infra", "96% Variance", "Suspicious Host Outbound");
  }
  else if (state.activeScenario === 'vendor') {
    state.globalTrustIndex = 58;
    state.activeIncidents = 1;

    effectsTxt.innerHTML = `
      - Apex DevOps Contractor accessed DB systems post token expiration.<br>
      - Dynamic policy locks credential token.<br>
      - Vendor risk rating upgraded to critical.
    `;
    alertBox.className = "explainable-reason-card failed";
    alertBox.innerHTML = `<strong>API Revoked:</strong> System Admin credentials locked automatically. CISO notified.`;
    alertBox.style.background = 'rgba(239, 68, 68, 0.05)';
    riskIndex.innerText = "58% Trust (High Danger)";
    riskIndex.style.color = "var(--color-amber)";

    injectSimulatedAlert("Revoked", "Medium", "Apex Contractor", "Third-Party", "74% Variance", "Expired API Key Access");
  }

  // Refresh active dashboard states
  updateGlobalCounters();
  refreshTables();
  initSwarmEngine();
  initCollusionGraph();
  
  // Apply visual flowchart changes
  updateAdaptiveFlowchart();
}

function resetSimulation() {
  state.simRunning = false;
  state.globalTrustIndex = 96;
  state.highRiskProfiles = 3;
  state.activeIncidents = 0;

  showToast('Security posture restored to baseline limits', 'success');

  const statusLabel = document.getElementById('sim-status-label');
  statusLabel.innerText = "Ready / Idle";
  statusLabel.style.color = "var(--color-emerald)";

  const effectsTxt = document.getElementById('sim-effects-text');
  effectsTxt.innerText = 'Select a scenario and click "Start Attack Simulation" to inspect platform behavioral changes.';

  const alertBox = document.getElementById('sim-alert-box');
  alertBox.className = "explainable-reason-card passed";
  alertBox.innerHTML = `<strong>Security Alert status:</strong> Active protection online.`;
  alertBox.style.background = 'rgba(16, 185, 129, 0.05)';

  const riskIndex = document.getElementById('sim-risk-index');
  riskIndex.innerText = "96% Trust (Normal)";
  riskIndex.style.color = "var(--color-emerald)";

  // Remove injected logs
  state.alerts = state.alerts.filter(a => !a.injected);

  updateGlobalCounters();
  refreshTables();
  initSwarmEngine();
  initCollusionGraph();
  updateAdaptiveFlowchart();
}

function injectSimulatedAlert(status, severity, user, dept, risk, action) {
  state.alerts.unshift({
    status: status,
    severity: severity,
    user: user,
    dept: dept,
    risk: risk,
    time: new Date().toISOString().replace('T', ' ').slice(0, 19),
    action: action,
    injected: true
  });
}

function updateGlobalCounters() {
  document.getElementById('global-trust-val').innerText = `${state.globalTrustIndex}%`;
  
  // Dashboard indicators
  document.getElementById('kpi-trust-idx').innerText = `${state.globalTrustIndex}%`;
  document.getElementById('kpi-high-risk').innerText = state.highRiskProfiles;
  
  const activeInc = document.getElementById('kpi-incidents');
  const activeIncTrend = document.getElementById('kpi-incidents-trend');
  activeInc.innerText = state.activeIncidents;
  
  if (state.simRunning) {
    activeInc.style.color = "var(--color-crimson)";
    activeIncTrend.innerText = "Friction Activated";
    activeIncTrend.className = "kpi-trend trend-down";
  } else {
    activeInc.style.color = "var(--color-soft-white)";
    activeIncTrend.innerText = "Auto-Quarantined";
    activeIncTrend.className = "kpi-trend trend-neutral";
  }

  // Circular TrustDNA posture gauge
  const circle = document.getElementById('global-gauge-circle');
  if (circle) {
    const circum = 2 * Math.PI * 85;
    const offset = circum - (state.globalTrustIndex / 100) * circum;
    circle.style.strokeDashoffset = offset;
    
    let color = 'var(--color-emerald)';
    let statusLabel = 'Highly Secure';
    if (state.globalTrustIndex < 50) {
      color = 'var(--color-crimson)';
      statusLabel = 'Incident Containment';
    } else if (state.globalTrustIndex < 80) {
      color = 'var(--color-amber)';
      statusLabel = 'Warning State';
    }

    circle.style.stroke = color;
    const numVal = document.getElementById('gauge-number-val');
    const labelVal = document.getElementById('gauge-status-label');
    if (numVal) numVal.innerText = `${state.globalTrustIndex}%`;
    if (labelVal) {
      labelVal.innerText = statusLabel;
      labelVal.style.color = color;
    }
  }
}

// 12. Digital Trust Twin Profiles Selector Loader
function loadTwinUser() {
  const select = document.getElementById('twin-user-select');
  const user = state.users[select.value];
  
  document.getElementById('twin-avatar').src = user.avatar;
  document.getElementById('twin-name').innerText = user.name;
  document.getElementById('twin-role').innerText = user.role;
  document.getElementById('twin-dept').innerText = user.dept;
  document.getElementById('twin-branch').innerText = user.branch;
  document.getElementById('twin-priv-lvl').innerText = user.privilege;
  
  // Set Trust Twin score
  const scoreNum = document.getElementById('twin-trust-number');
  let score = 98;
  if (user.name === "James Sterling") {
    score = state.simRunning ? 42 : 94;
  } else if (user.name === "Marcus Vance") {
    score = state.simRunning ? 74 : 88;
  }
  scoreNum.innerText = `${score}%`;
  
  scoreNum.className = 'twin-score-number';
  if (score < 50) scoreNum.classList.add('critical');
  else if (score < 80) scoreNum.classList.add('warning');

  // Populate DNA Behavior bars list
  const container = document.getElementById('behavior-container');
  container.innerHTML = '';
  
  user.behaviors.forEach((b, idx) => {
    let currentVal = b.value;
    // Mock simulation increase
    if (state.simRunning && user.name === "James Sterling") {
      if (idx === 0) currentVal = 85; // Working hours variance spikes
      if (idx === 4) currentVal = 92; // File export rates spike
      if (idx === 5) currentVal = 88; // Cloud uploads rate spike
    }

    const item = document.createElement('div');
    item.className = 'behavior-bar-container';
    item.innerHTML = `
      <div class="behavior-bar-header">
        <span>${b.label}</span>
        <span style="font-weight:600;">${currentVal}%</span>
      </div>
      <div class="behavior-bar-track">
        <div class="behavior-bar-fill" style="width: ${currentVal}%; background: ${currentVal > 75 ? 'var(--color-crimson)' : currentVal > 50 ? 'var(--color-amber)' : 'var(--color-electric)'};"></div>
      </div>
    `;
    container.appendChild(item);
  });

  // Re-draw baseline comparisons chart
  initTabCharts('digital-twin');
}

// 13. Digital Twin Canvas Micro Mesh Animation
let twinMeshId = null;
function initTwinMeshVisualizer() {
  const canvas = document.getElementById('twin-mesh-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();

  let angle = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = Math.min(canvas.width, canvas.height) * 0.35;

    ctx.strokeStyle = state.simRunning ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)';
    ctx.lineWidth = 1;

    // Draw rotating cyber orbits
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.3, angle + (i * Math.PI / 3), 0, Math.PI * 2);
      ctx.stroke();
    }

    // Outer cyber shield dots
    ctx.fillStyle = state.simRunning ? 'var(--color-crimson)' : 'var(--color-emerald)';
    ctx.beginPath();
    ctx.arc(cx + r * Math.cos(angle), cy + r * 0.3 * Math.sin(angle), 4, 0, Math.PI*2);
    ctx.fill();

    angle += 0.015;
    twinMeshId = requestAnimationFrame(draw);
  }

  if (twinMeshId) cancelAnimationFrame(twinMeshId);
  draw();
}

// 14. Adaptive Privilege Pipeline Drawer Update
function updateAdaptiveFlowchart() {
  const stepTrust = document.getElementById('flow-node-trust');
  const stepMFA = document.getElementById('flow-node-mfa');
  const stepReadOnly = document.getElementById('flow-node-readonly');
  const stepRestricted = document.getElementById('flow-node-restricted');
  const stepLocked = document.getElementById('flow-node-locked');

  const arrow1 = document.getElementById('flow-arrow-1');
  const arrow2 = document.getElementById('flow-arrow-2');
  const arrow3 = document.getElementById('flow-arrow-3');
  const arrow4 = document.getElementById('flow-arrow-4');

  // Reset active classes
  [stepTrust, stepMFA, stepReadOnly, stepRestricted, stepLocked].forEach(n => {
    n.classList.remove('active', 'locked');
  });
  [arrow1, arrow2, arrow3, arrow4].forEach(a => {
    a.classList.remove('active');
  });

  document.getElementById('flow-trust-score').innerText = `${state.globalTrustIndex}% Status`;

  if (state.simRunning) {
    if (state.activeScenario === 'theft') {
      // Step 5: Locked
      stepLocked.classList.add('locked');
      [stepTrust, stepMFA, stepReadOnly, stepRestricted].forEach(n => n.classList.add('active'));
      [arrow1, arrow2, arrow3, arrow4].forEach(a => a.classList.add('active'));
    } 
    else if (state.activeScenario === 'usb') {
      // Step 4: Quarantined
      stepRestricted.classList.add('active');
      [stepTrust, stepMFA, stepReadOnly].forEach(n => n.classList.add('active'));
      [arrow1, arrow2, arrow3].forEach(a => a.classList.add('active'));
    } 
    else if (state.activeScenario === 'vendor') {
      // Step 3: Read Only
      stepReadOnly.classList.add('active');
      [stepTrust, stepMFA].forEach(n => n.classList.add('active'));
      [arrow1, arrow2].forEach(a => a.classList.add('active'));
    }
  } else {
    // Normal state - Step 1
    stepTrust.classList.add('active');
  }
}

// 15. AI Security Copilot Engine
function handleCopilotChatKey(event) {
  if (event.key === 'Enter') {
    sendCopilotChatMessage();
  }
}

function sendCopilotChatMessage() {
  const input = document.getElementById('copilot-chat-input');
  const query = input.value.trim();
  if (!query) return;

  appendChatBubble(query, 'user');
  input.value = '';

  // Generating simulator response typing delay
  setTimeout(() => {
    let response = "I have scanned the active event indicators. All logs indicate normal operations matching corporate baseline templates.";
    
    if (state.simRunning) {
      if (state.activeScenario === 'theft') {
        response = `
          <strong>ALERT ID: SEC-THEFT-409 DETECTED</strong><br><br>
          <strong>Analysis:</strong> Trader James Sterling is flagged with a 94% behavioral variance. A USB storage device was mounted out-of-hours, followed by bulk database SELECT queries on the relational Treasury schemas.<br><br>
          <strong>Status:</strong> Autonomous Action completed. All session tokens are killed and the host machine is locked. Click 'Export Archive' on the Forensics Lab page for full terminal process hashes.
        `;
      } 
      else if (state.activeScenario === 'usb') {
        response = `
          <strong>ALERT ID: SEC-USB-882 DETECTED</strong><br><br>
          <strong>Analysis:</strong> Branch terminal 14.8 initiated a mount on an unauthorized hardware storage device. Signature engines flagged suspicious executable shell scripts.<br><br>
          <strong>Status:</strong> Adaptive Privilege Pipeline isolated the machine node from corporate DNS servers.
        `;
      }
    } else {
      if (query.toLowerCase().includes('priya')) {
        response = `
          <strong>User Profile: Priya Sharma</strong><br>
          Current TrustDNA level is 98%. Active database sessions are verified with hardware tokens. No compliance violations found.
        `;
      } else if (query.toLowerCase().includes('james')) {
        response = `
          <strong>User Profile: James Sterling</strong><br>
          Current TrustDNA level is 94%. Baseline comparison remains stable. No anomalous USB volumes or file copies flagged.
        `;
      }
    }

    appendChatBubble(response, 'assistant');
  }, 1000);
}

function presetCopilotQuery(text) {
  document.getElementById('copilot-chat-input').value = text;
  sendCopilotChatMessage();
}

function appendChatBubble(text, sender) {
  const area = document.getElementById('copilot-msg-area');
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${sender}`;
  bubble.innerHTML = text;
  area.appendChild(bubble);
  
  // Scroll to bottom
  area.scrollTop = area.scrollHeight;
}

// 16. Evidence Locker Operations
function openAddEvidenceModal() {
  document.getElementById('evidence-modal').style.display = 'flex';
}

function closeAddEvidenceModal() {
  document.getElementById('evidence-modal').style.display = 'none';
}

function handleAddEvidence(event) {
  event.preventDefault();
  const name = document.getElementById('ev-name').value;
  const source = document.getElementById('ev-source').value;

  // Generate simulated hash
  const hex = '0123456789ABCDEF';
  let mockHash = '';
  for (let i = 0; i < 64; i++) {
    mockHash += hex[Math.floor(Math.random() * 16)];
  }

  state.evidence.push({
    item: name,
    source: source,
    hash: mockHash,
    time: new Date().toISOString().replace('T', ' ').slice(0, 19),
    status: "Quantum Safe Verified",
    verifyClass: "severity-low"
  });

  closeAddEvidenceModal();
  refreshTables();
  showToast('Quantum Cryptographic Signature verified successfully', 'success');
  
  // Clear inputs
  document.getElementById('ev-name').value = '';
  document.getElementById('ev-source').value = '';
}

// 17. Render Tables & HTML Lists
function refreshTables() {
  // Alert Table (Executive Dashboard)
  const execTable = document.querySelector('#exec-alerts-table tbody');
  if (execTable) {
    execTable.innerHTML = '';
    state.alerts.forEach(a => {
      const row = document.createElement('tr');
      let statusDot = `<span class="status-indicator"><span class="status-dot"></span>${a.status}</span>`;
      if (a.severity === 'High') {
        statusDot = `<span class="status-indicator"><span class="status-dot active-alert"></span>${a.status}</span>`;
      } else if (a.severity === 'Medium') {
        statusDot = `<span class="status-indicator"><span class="status-dot warning-alert"></span>${a.status}</span>`;
      }

      row.innerHTML = `
        <td>${statusDot}</td>
        <td><span class="severity-badge severity-${a.severity.toLowerCase()}">${a.severity}</span></td>
        <td><strong>${a.user}</strong></td>
        <td>${a.dept}</td>
        <td>${a.risk}</td>
        <td style="font-family: monospace;">${a.time}</td>
        <td><span style="font-size:11px; color:var(--color-electric); font-weight:600;">${a.action}</span></td>
      `;
      execTable.appendChild(row);
    });
  }

  // SOC Queue Table
  const socTable = document.querySelector('#soc-alerts-table tbody');
  if (socTable) {
    socTable.innerHTML = '';
    state.alerts.forEach(a => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><span class="status-indicator"><span class="status-dot ${a.severity === 'High' ? 'active-alert' : ''}"></span>${a.status}</span></td>
        <td><span class="severity-badge severity-${a.severity.toLowerCase()}">${a.severity}</span></td>
        <td>Database Query Monitor</td>
        <td>SQL Server Row Count</td>
        <td>${a.risk}</td>
        <td style="font-family: monospace;">${a.time}</td>
        <td><button class="btn-primary" style="padding: 4px 8px; font-size:10px; width:auto;" onclick="switchTab('incident-investigation')">Investigate</button></td>
      `;
      socTable.appendChild(row);
    });
  }

  // Insider Threat Table
  const insiderTable = document.querySelector('#insider-alerts-table tbody');
  if (insiderTable) {
    insiderTable.innerHTML = '';
    state.alerts.forEach(a => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><span class="status-indicator"><span class="status-dot ${a.severity === 'High' ? 'active-alert' : ''}"></span>${a.status}</span></td>
        <td><strong>${a.user}</strong></td>
        <td>${a.dept}</td>
        <td>London Corporate</td>
        <td>Behavior Variance</td>
        <td><span style="font-weight:700; color:var(--color-crimson);">${a.risk}</span></td>
        <td style="font-family: monospace;">${a.time}</td>
      `;
      insiderTable.appendChild(row);
    });
  }

  // Evidence Locker Table
  const evTable = document.querySelector('#evidence-table tbody');
  if (evTable) {
    evTable.innerHTML = '';
    state.evidence.forEach(e => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${e.item}</strong></td>
        <td>${e.source}</td>
        <td style="font-family: monospace; font-size:11px;">${e.hash.slice(0, 16)}...${e.hash.slice(-8)}</td>
        <td>${e.time}</td>
        <td><span class="severity-badge ${e.verifyClass}">${e.status}</span></td>
        <td><a href="#" style="color:var(--color-electric); text-decoration:none;" onclick="triggerReportDownload('${e.item}')">Download</a></td>
      `;
      evTable.appendChild(row);
    });
  }

  // Suspicious Users (Insider Threat Sidebar)
  const suspiciousList = document.getElementById('insider-suspicious-list');
  if (suspiciousList) {
    suspiciousList.innerHTML = '';
    
    // Default list
    const suspUsers = [
      { name: "James Sterling", dept: "Treasury Operations", risk: state.simRunning ? "94% Danger" : "32% Normal", class: state.simRunning ? "severity-high" : "severity-low" },
      { name: "Marcus Vance", dept: "Cloud DevOps Team", risk: "48% Anomaly", class: "severity-medium" },
      { name: "Apex Dev Contractor", dept: "Third-Party DevOps", risk: state.simRunning ? "88% Critical" : "65% Suspicious", class: state.simRunning ? "severity-high" : "severity-medium" }
    ];

    suspUsers.forEach(u => {
      const div = document.createElement('div');
      div.style.cssText = 'background: rgba(11, 18, 32, 0.4); border: 1px solid var(--border-glass); border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center;';
      div.innerHTML = `
        <div>
          <div style="font-weight:600; font-size:13px;">${u.name}</div>
          <div style="font-size:11px; color:var(--color-muted); margin-top:2px;">${u.dept}</div>
        </div>
        <span class="severity-badge ${u.class}">${u.risk}</span>
      `;
      suspiciousList.appendChild(div);
    });
  }

  // Forensic Investigation Lab details
  const forensicProfile = document.getElementById('forensic-profile-card');
  if (forensicProfile) {
    forensicProfile.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:15px;">
        <img class="user-avatar" src="${state.users.james.avatar}" style="width:48px; height:48px;" alt="James">
        <div>
          <h3 style="font-size:15px; font-weight:700;">James Sterling</h3>
          <span style="font-size:11px; color:var(--color-muted);">Treasury FX Officer</span>
        </div>
      </div>
      <div class="twin-detail-row"><span class="twin-detail-label">Monitored Device</span><span class="twin-detail-val">MacBook-LDN-301</span></div>
      <div class="twin-detail-row"><span class="twin-detail-label">Active Host IP</span><span class="twin-detail-val">10.102.14.8</span></div>
      <div class="twin-detail-row"><span class="twin-detail-label">Audit Privilege</span><span class="twin-detail-val" style="color:var(--color-crimson);">Locked/Suspended</span></div>
    `;
  }

  // Forensic processes
  const procTable = document.querySelector('#forensic-processes-table tbody');
  if (procTable) {
    procTable.innerHTML = '';
    const procs = [
      { pid: 1402, cmd: "tar -czf /tmp/treasury_dump.tar.gz ./FX_Vault_relational", thread: "User session 882", state: state.simRunning ? "Critical Activity" : "Completed", cpu: "14.2%" },
      { pid: 1489, cmd: "cp /tmp/treasury_dump.tar.gz /Volumes/USB_STORE/", thread: "I/O local bus", state: state.simRunning ? "Suspicious Copy" : "Completed", cpu: "8.5%" },
      { pid: 1502, cmd: "aws s3 cp /tmp/treasury_dump.tar.gz s3://unverified-backup-vault/", thread: "HTTPS network outgoing", state: state.simRunning ? "Unauthorized Exfil" : "Inactive", cpu: "1.2%" },
      { pid: 1582, cmd: "killall -9 securityd", thread: "Terminal daemon override", state: "Blocked", cpu: "0.0%" }
    ];
    procs.forEach(p => {
      const tr = document.createElement('tr');
      let stateBadge = `<span class="severity-badge severity-low">${p.state}</span>`;
      if (p.state.includes("Critical") || p.state.includes("Exfil")) {
        stateBadge = `<span class="severity-badge severity-high">${p.state}</span>`;
      } else if (p.state.includes("Suspicious")) {
        stateBadge = `<span class="severity-badge severity-medium">${p.state}</span>`;
      }
      tr.innerHTML = `
        <td style="font-family:monospace;">${p.pid}</td>
        <td style="font-family:monospace; font-size:11px; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${p.cmd}</td>
        <td>${p.thread}</td>
        <td>${stateBadge}</td>
        <td>${p.cpu}</td>
      `;
      procTable.appendChild(tr);
    });
  }

  // Forensic USB Connection logs
  const usbTable = document.querySelector('#forensic-usb-table tbody');
  if (usbTable) {
    usbTable.innerHTML = `
      <tr>
        <td>VID:0781 PID:5581</td>
        <td>USB_STORE (32GB)</td>
        <td><span style="font-weight:700; color:var(--color-crimson);">High volume writes</span></td>
        <td><span class="severity-badge severity-high">Access Blocked</span></td>
      </tr>
      <tr>
        <td>VID:1050 PID:0407</td>
        <td>Yubico Yubikey hardware</td>
        <td>MFA Token registers read</td>
        <td><span class="severity-badge severity-low">Authorized</span></td>
      </tr>
    `;
  }

  // Forensic Database Logs
  const forensicDb = document.querySelector('#forensic-db-table tbody');
  if (forensicDb) {
    forensicDb.innerHTML = `
      <tr>
        <td>CoreBank.FXAccounts</td>
        <td style="font-family:monospace; font-size:11px;">SELECT * FROM FX_Balances WHERE Limit > 1000000</td>
        <td>42,900 rows</td>
        <td><span class="severity-badge severity-high">Anomalous Volume</span></td>
      </tr>
      <tr>
        <td>CoreBank.FXAccounts</td>
        <td style="font-family:monospace; font-size:11px;">SELECT Balance FROM FX_Balances WHERE AccountNum = 12042</td>
        <td>1 row</td>
        <td><span class="severity-badge severity-low">Normal</span></td>
      </tr>
    `;
  }

  // Vendor risk cards
  const vendorContainer = document.getElementById('vendor-cards-container');
  if (vendorContainer) {
    vendorContainer.innerHTML = '';
    state.vendors.forEach(v => {
      const activeTrust = state.simRunning && v.name.includes("Apex") ? 22 : v.trust;
      const activeRisk = state.simRunning && v.name.includes("Apex") ? "Critical" : v.risk;
      const activeClass = state.simRunning && v.name.includes("Apex") ? "critical-vendor" : v.class;

      const card = document.createElement('div');
      card.className = `glass-card vendor-card ${activeClass}`;
      card.innerHTML = `
        <div class="glass-card-header" style="margin-bottom:12px;">
          <h3 style="font-size:14px; font-weight:700;">${v.name}</h3>
          <span class="severity-badge ${activeTrust > 80 ? 'severity-low' : activeTrust > 50 ? 'severity-medium' : 'severity-high'}">${activeRisk}</span>
        </div>
        <div style="font-size:11px; color:var(--color-muted); margin-bottom:15px;">Parent Host: ${v.company}</div>
        
        <div class="twin-detail-row"><span class="twin-detail-label">TrustDNA rating</span><span class="twin-detail-val" style="font-weight:700;">${activeTrust}%</span></div>
        <div class="twin-detail-row"><span class="twin-detail-label">Access Expiration</span><span class="twin-detail-val">${v.expiry}</span></div>
      `;
      vendorContainer.appendChild(card);
    });
  }
}

function filterInsiderAlerts() {
  const sevFilter = document.getElementById('insider-filter-sev').value;
  const deptFilter = document.getElementById('insider-filter-dept').value;

  const filtered = state.alerts.filter(a => {
    const matchSev = sevFilter === 'ALL' || a.severity.toUpperCase() === sevFilter;
    const matchDept = deptFilter === 'ALL' || a.dept.includes(deptFilter);
    return matchSev && matchDept;
  });

  // Re-draw table body for insider detection
  const insiderTable = document.querySelector('#insider-alerts-table tbody');
  if (insiderTable) {
    insiderTable.innerHTML = '';
    filtered.forEach(a => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><span class="status-indicator"><span class="status-dot ${a.severity === 'High' ? 'active-alert' : ''}"></span>${a.status}</span></td>
        <td><strong>${a.user}</strong></td>
        <td>${a.dept}</td>
        <td>London Corporate</td>
        <td>Behavior Variance</td>
        <td><span style="font-weight:700; color:var(--color-crimson);">${a.risk}</span></td>
        <td style="font-family: monospace;">${a.time}</td>
      `;
      insiderTable.appendChild(row);
    });
  }
}

function resetInsiderFilters() {
  document.getElementById('insider-filter-sev').value = 'ALL';
  document.getElementById('insider-filter-dept').value = 'ALL';
  filterInsiderAlerts();
}

// 18. Simulated Download Action
function triggerReportDownload(reportName) {
  showToast(`Generating report signature for: ${reportName}`, 'info');
  setTimeout(() => {
    // Generate virtual blob downloading
    const link = document.createElement('a');
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(`FORTIX SECURE REPORT: ${reportName}\nQuantum Hash Signed Archive\nGenerated on: ${new Date().toISOString()}`);
    link.download = `${reportName.toLowerCase().replace(/\s+/g, '_')}_audit.txt`;
    link.click();
    showToast('Secure PDF/Archive Download Started', 'success');
  }, 1000);
}

// 19. Initializer Hook setup
function initAppCore() {
  // Navigation binding
  document.querySelectorAll('.sidebar-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      switchTab(item.getAttribute('data-tab'));
    });
  });

  // Default twin profile load
  loadTwinUser();

  // Draw networks & logs
  initLiveLogging();
  initSwarmEngine();
  initCollusionGraph();
  initTimeMachine();
  
  // Render tables
  refreshTables();

  // Load initial charts for default view
  initTabCharts('executive');

  // Trigger canvas mesh loops
  initTwinMeshVisualizer();
}

// Global hook
window.addEventListener('load', () => {
  initLoginCanvas();
});
