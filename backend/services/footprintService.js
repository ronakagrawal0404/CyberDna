// Digital Footprint Orchestration & Pipeline Engine
// Implements: Input -> Scan -> Discover -> Verify -> Analyze -> Risk Score -> Report -> Action

import { analyzeDomainDns } from './dnsService.js';
import { lookupDomainRdap } from './rdapService.js';
import { lookupGitHubUser } from './githubService.js';
import { lookupGravatar } from './gravatarService.js';
import { lookupKeybase } from './keybaseService.js';
import { lookupDevProfiles } from './devServices.js';
import { checkBreaches } from './hibpService.js';
import { verifyAndDeduplicate } from './verificationEngine.js';
import { calculateDigitalExposureScore } from './riskEngine.js';

export async function runDigitalFootprintScan(targetType, targetQuery) {
  const query = targetQuery.trim();
  const startTime = Date.now();

  const scanStages = [
    { id: 'init', name: 'Initializing scan', status: 'completed' },
    { id: 'discover_profiles', name: 'Discovering public profiles', status: 'pending' },
    { id: 'check_domains', name: 'Checking associated domains', status: 'pending' },
    { id: 'analyze_exposure', name: 'Analyzing public exposure', status: 'pending' },
    { id: 'verify_findings', name: 'Verifying findings', status: 'pending' },
    { id: 'calculate_risk', name: 'Calculating risk', status: 'pending' },
    { id: 'generate_report', name: 'Generating report', status: 'pending' }
  ];

  let rawFindings = [];
  let discoveredAccounts = [];
  let discoveredDomains = [];
  let discoveredRepos = [];
  let breachTelemetry = null;
  let dnsTelemetry = null;
  let rdapTelemetry = null;

  // STAGE 1: Discover Public Profiles & Associated Assets
  scanStages[1].status = 'in_progress';

  if (targetType === 'email') {
    const parts = query.split('@');
    const emailPrefix = parts[0];
    const emailDomain = parts[1];

    if (emailDomain) {
      discoveredDomains.push(emailDomain);
    }

    // A. Gravatar
    const gravatarResult = await lookupGravatar(query);
    if (gravatarResult && gravatarResult.exists) {
      if (gravatarResult.accounts) discoveredAccounts.push(...gravatarResult.accounts);
      if (gravatarResult.findings) rawFindings.push(...gravatarResult.findings);
    }

    // B. Check if handle exists on GitHub & dev platforms
    if (emailPrefix) {
      const [ghResult, devResult] = await Promise.all([
        lookupGitHubUser(emailPrefix),
        lookupDevProfiles(emailPrefix)
      ]);

      if (ghResult && ghResult.exists) {
        discoveredAccounts.push(...ghResult.accounts);
        rawFindings.push(...ghResult.findings);
        discoveredRepos.push(...ghResult.repos);
      }
      if (devResult && devResult.accounts) {
        discoveredAccounts.push(...devResult.accounts);
        rawFindings.push(...devResult.findings);
      }
    }

    // C. Breach Check
    breachTelemetry = await checkBreaches(query);
    if (breachTelemetry && breachTelemetry.findings) {
      rawFindings.push(...breachTelemetry.findings);
    }

    // D. Domain security for email host
    if (emailDomain && !['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'proton.me', 'protonmail.com'].includes(emailDomain.toLowerCase())) {
      scanStages[2].status = 'in_progress';
      const [dnsRes, rdapRes] = await Promise.all([
        analyzeDomainDns(emailDomain),
        lookupDomainRdap(emailDomain)
      ]);
      dnsTelemetry = dnsRes;
      rdapTelemetry = rdapRes;
      if (dnsRes && dnsRes.findings) rawFindings.push(...dnsRes.findings);
      if (rdapRes && rdapRes.findings) rawFindings.push(...rdapRes.findings);
    }

  } else if (targetType === 'username') {
    const cleanHandle = query.replace(/^@/, '');

    // A. GitHub
    const ghPromise = lookupGitHubUser(cleanHandle);
    // B. Keybase
    const keybasePromise = lookupKeybase(cleanHandle);
    // C. Dev Networks (GitLab, HackerNews, Dev.to)
    const devPromise = lookupDevProfiles(cleanHandle);
    // D. Breach indicators
    const breachPromise = checkBreaches(cleanHandle);

    const [ghResult, keybaseResult, devResult, breachRes] = await Promise.all([
      ghPromise,
      keybasePromise,
      devPromise,
      breachPromise
    ]);

    if (ghResult && ghResult.exists) {
      discoveredAccounts.push(...ghResult.accounts);
      rawFindings.push(...ghResult.findings);
      discoveredRepos.push(...ghResult.repos);

      // Check if user has personal blog/domain listed
      if (ghResult.user && ghResult.user.blog) {
        const blogDomain = ghResult.user.blog.replace(/^https?:\/\//i, '').split('/')[0].trim();
        if (blogDomain && blogDomain.includes('.')) {
          discoveredDomains.push(blogDomain);
        }
      }
    }

    if (keybaseResult && keybaseResult.exists) {
      discoveredAccounts.push(...keybaseResult.accounts);
      rawFindings.push(...keybaseResult.findings);
    }

    if (devResult && devResult.accounts) {
      discoveredAccounts.push(...devResult.accounts);
      rawFindings.push(...devResult.findings);
    }

    breachTelemetry = breachRes;
    if (breachRes && breachRes.findings) {
      rawFindings.push(...breachRes.findings);
    }

    // STAGE 2: Associated Domains check
    scanStages[2].status = 'in_progress';
    if (discoveredDomains.length > 0) {
      const primaryDomain = discoveredDomains[0];
      const [dnsRes, rdapRes] = await Promise.all([
        analyzeDomainDns(primaryDomain),
        lookupDomainRdap(primaryDomain)
      ]);
      dnsTelemetry = dnsRes;
      rdapTelemetry = rdapRes;
      if (dnsRes && dnsRes.findings) rawFindings.push(...dnsRes.findings);
      if (rdapRes && rdapRes.findings) rawFindings.push(...rdapRes.findings);
    }

  } else if (targetType === 'domain') {
    const cleanDomain = query.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    discoveredDomains.push(cleanDomain);

    scanStages[2].status = 'in_progress';
    const [dnsRes, rdapRes] = await Promise.all([
      analyzeDomainDns(cleanDomain),
      lookupDomainRdap(cleanDomain)
    ]);
    dnsTelemetry = dnsRes;
    rdapTelemetry = rdapRes;
    if (dnsRes && dnsRes.findings) rawFindings.push(...dnsRes.findings);
    if (rdapRes && rdapRes.findings) rawFindings.push(...rdapRes.findings);

    // Also check postmaster/admin or domain breach indicators
    breachTelemetry = await checkBreaches(cleanDomain);
    if (breachTelemetry && breachTelemetry.findings) {
      rawFindings.push(...breachTelemetry.findings);
    }
  }

  scanStages[1].status = 'completed';
  scanStages[2].status = 'completed';

  // STAGE 3 & 4: Verifying Findings & Deduplication
  scanStages[3].status = 'in_progress';
  scanStages[4].status = 'in_progress';

  const verificationResult = verifyAndDeduplicate(rawFindings, discoveredAccounts, query, targetType);
  const finalAccounts = verificationResult.accounts;
  const finalFindings = verificationResult.findings;

  scanStages[3].status = 'completed';
  scanStages[4].status = 'completed';

  // STAGE 5: Calculating Risk Engine
  scanStages[5].status = 'in_progress';
  const riskResult = calculateDigitalExposureScore(finalFindings, finalAccounts, dnsTelemetry, discoveredRepos);
  scanStages[5].status = 'completed';

  // STAGE 6: Generating Report & Relationship Topology Graph
  scanStages[6].status = 'in_progress';

  // Build Topology Graph
  const graphNodes = [];
  const graphEdges = [];

  // Root Query Node
  const rootId = `root-query`;
  graphNodes.push({
    id: rootId,
    label: query,
    type: targetType,
    sublabel: `Target Query (${targetType.toUpperCase()})`,
    confidence: 'High',
    isRoot: true
  });

  // Connect Accounts
  finalAccounts.forEach((acc, idx) => {
    const accId = `acc-${idx}-${acc.platform}`;
    graphNodes.push({
      id: accId,
      label: `${acc.platform}: @${acc.handle}`,
      type: 'account',
      sublabel: acc.displayName || acc.platform,
      platform: acc.platform,
      url: acc.url,
      avatarUrl: acc.avatarUrl,
      confidence: acc.confidence,
      isConfirmed: acc.isConfirmed
    });

    graphEdges.push({
      id: `edge-${rootId}-${accId}`,
      source: rootId,
      target: accId,
      label: acc.isConfirmed ? 'Confirmed Identity' : 'Correlating Handle',
      confidence: acc.confidence,
      style: acc.confidence === 'High' ? 'solid' : 'dashed'
    });
  });

  // Connect Repositories (if GitHub account exists)
  const ghNode = graphNodes.find(n => n.label?.startsWith('GitHub'));
  const parentForRepos = ghNode ? ghNode.id : rootId;

  discoveredRepos.slice(0, 6).forEach((repo, idx) => {
    const repoId = `repo-${idx}-${repo.name}`;
    graphNodes.push({
      id: repoId,
      label: repo.name,
      type: 'repository',
      sublabel: repo.language || 'Code Repository',
      url: repo.htmlUrl,
      stars: repo.stars,
      confidence: 'High'
    });

    graphEdges.push({
      id: `edge-${parentForRepos}-${repoId}`,
      source: parentForRepos,
      target: repoId,
      label: 'Maintains Repo',
      confidence: 'High',
      style: 'solid'
    });
  });

  // Connect Domains
  discoveredDomains.forEach((dom, idx) => {
    const domId = `dom-${idx}-${dom}`;
    graphNodes.push({
      id: domId,
      label: dom,
      type: 'domain',
      sublabel: dnsTelemetry?.spfRecord ? 'DNS Configured' : 'Domain Asset',
      confidence: 'High'
    });

    graphEdges.push({
      id: `edge-${rootId}-${domId}`,
      source: rootId,
      target: domId,
      label: 'Associated Domain',
      confidence: 'High',
      style: 'solid'
    });
  });

  scanStages[6].status = 'completed';

  const scanReport = {
    scanId: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    targetType,
    targetQuery: query,
    timestamp: new Date().toISOString(),
    durationMs: Date.now() - startTime,
    stages: scanStages,
    summary: {
      totalFindings: finalFindings.length,
      accountsDiscovered: finalAccounts.length,
      confirmedAccounts: verificationResult.confirmedAccounts.length,
      potentialMatches: verificationResult.potentialMatches.length,
      domainsDiscovered: discoveredDomains.length,
      repositoriesDiscovered: discoveredRepos.length,
      breachCount: breachTelemetry?.breaches?.length || 0,
      breachStatus: breachTelemetry?.available ? 'Available' : 'Enrichment Omitted'
    },
    risk: riskResult,
    findings: finalFindings,
    accounts: finalAccounts,
    domains: discoveredDomains,
    repositories: discoveredRepos,
    telemetry: {
      dns: dnsTelemetry,
      rdap: rdapTelemetry,
      breaches: breachTelemetry
    },
    topologyGraph: {
      nodes: graphNodes,
      edges: graphEdges
    }
  };

  return scanReport;
}
