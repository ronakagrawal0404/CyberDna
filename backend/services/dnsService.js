// DNS-over-HTTPS (DoH) Service using public Cloudflare & Google resolvers
// RFC 8484 compliant HTTPS DNS queries

async function queryDoH(name, type, resolver = 'cloudflare') {
  const url = resolver === 'cloudflare'
    ? `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`
    : `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/dns-json' },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    clearTimeout(timeout);
    return null;
  }
}

export async function analyzeDomainDns(domain) {
  const cleanDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  
  const [mxData, txtData, dmarcData, aData, nsData] = await Promise.all([
    queryDoH(cleanDomain, 'MX'),
    queryDoH(cleanDomain, 'TXT'),
    queryDoH(`_dmarc.${cleanDomain}`, 'TXT'),
    queryDoH(cleanDomain, 'A'),
    queryDoH(cleanDomain, 'NS')
  ]);

  const findings = [];
  const rawRecords = {
    mx: [],
    txt: [],
    dmarc: [],
    a: [],
    ns: []
  };

  // 1. MX Records
  if (mxData && mxData.Answer) {
    rawRecords.mx = mxData.Answer.map(ans => ans.data);
  }

  // 2. A Records
  if (aData && aData.Answer) {
    rawRecords.a = aData.Answer.map(ans => ans.data);
  }

  // 3. NS Records
  if (nsData && nsData.Answer) {
    rawRecords.ns = nsData.Answer.map(ans => ans.data);
  }

  // 4. SPF in TXT records
  let spfRecord = null;
  if (txtData && txtData.Answer) {
    rawRecords.txt = txtData.Answer.map(ans => ans.data.replace(/^"|"$/g, ''));
    spfRecord = rawRecords.txt.find(t => t.toLowerCase().startsWith('v=spf1'));
  }

  // 5. DMARC in TXT records
  let dmarcRecord = null;
  if (dmarcData && dmarcData.Answer) {
    rawRecords.dmarc = dmarcData.Answer.map(ans => ans.data.replace(/^"|"$/g, ''));
    dmarcRecord = rawRecords.dmarc.find(t => t.toLowerCase().startsWith('v=dmarc1'));
  }

  // Security Analysis of DNS
  const hasMx = rawRecords.mx.length > 0;

  if (hasMx) {
    // Domain handles email, so SPF and DMARC are critical
    if (!spfRecord) {
      findings.push({
        source: 'DNS / SPF',
        finding: 'Missing SPF (Sender Policy Framework) Record',
        evidence: `Domain has ${rawRecords.mx.length} MX record(s) but no 'v=spf1' TXT record found.`,
        confidence: 'High',
        risk: 'High',
        whyItMatters: 'Without SPF, unauthorized threat actors can spoof emails originating from your domain.',
        recommendedAction: 'Publish a TXT record at the root domain specifying your designated outbound mail servers (e.g. v=spf1 include:_spf.google.com ~all).',
        remediationType: 'dns_config',
        guide: {
          recordType: 'TXT',
          host: '@',
          value: 'v=spf1 include:_spf.google.com ~all'
        }
      });
    } else {
      // Check SPF policy strictness
      if (spfRecord.includes('+all')) {
        findings.push({
          source: 'DNS / SPF',
          finding: 'Permissive SPF Policy (+all)',
          evidence: `SPF record contains '+all': ${spfRecord}`,
          confidence: 'High',
          risk: 'High',
          whyItMatters: '+all authorizes ANY host on the internet to send legitimate emails on behalf of this domain.',
          recommendedAction: 'Change the qualifier to soft-fail (~all) or hard-fail (-all).',
          remediationType: 'dns_config',
          guide: {
            recordType: 'TXT',
            host: '@',
            value: spfRecord.replace('+all', '~all')
          }
        });
      }
    }

    if (!dmarcRecord) {
      findings.push({
        source: 'DNS / DMARC',
        finding: 'Missing DMARC Record',
        evidence: `No TXT record found at _dmarc.${cleanDomain}`,
        confidence: 'High',
        risk: 'Critical',
        whyItMatters: 'DMARC prevents domain spoofing and phishing attacks. Without DMARC, receiving mail servers will accept spoofed emails.',
        recommendedAction: `Create a TXT record at _dmarc.${cleanDomain} with policy p=quarantine or p=reject.`,
        remediationType: 'dns_config',
        guide: {
          recordType: 'TXT',
          host: `_dmarc.${cleanDomain}`,
          value: `v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@${cleanDomain}; pct=100; sp=quarantine`
        }
      });
    } else {
      if (dmarcRecord.toLowerCase().includes('p=none')) {
        findings.push({
          source: 'DNS / DMARC',
          finding: 'DMARC Policy Set to Monitoring Only (p=none)',
          evidence: `DMARC record: ${dmarcRecord}`,
          confidence: 'High',
          risk: 'Medium',
          whyItMatters: 'p=none reports spoofing attempts but does not instruct receivers to reject fraudulent messages.',
          recommendedAction: 'Graduate DMARC policy from p=none to p=quarantine or p=reject once SPF/DKIM alignment is verified.',
          remediationType: 'dns_config',
          guide: {
            recordType: 'TXT',
            host: `_dmarc.${cleanDomain}`,
            value: dmarcRecord.replace(/p=none/i, 'p=quarantine')
          }
        });
      }
    }
  }

  return {
    domain: cleanDomain,
    hasMx,
    mxCount: rawRecords.mx.length,
    spfRecord,
    dmarcRecord,
    rawRecords,
    findings
  };
}
