// GitHub Public API Discovery Service
// Queries official unauthenticated endpoints (or uses GITHUB_TOKEN if supplied in backend/.env)

export async function lookupGitHubUser(username) {
  const cleanUsername = username.trim().replace(/^@/, '');
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'CyberDNA-Footprint-Scanner'
  };

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}`, {
      headers,
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (userRes.status === 404) {
      return { exists: false, username: cleanUsername };
    }

    if (!userRes.ok) {
      // Could be rate limit (403)
      return { 
        exists: false, 
        username: cleanUsername, 
        rateLimited: userRes.status === 403,
        error: `GitHub API returned ${userRes.status}` 
      };
    }

    const userData = await userRes.json();

    // Fetch user public repositories
    let repos = [];
    try {
      const repoRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}/repos?sort=updated&per_page=15`, {
        headers
      });
      if (repoRes.ok) {
        repos = await repoRes.json();
      }
    } catch (e) {
      // non-fatal
    }

    // Scan public events for exposed commit emails
    const exposedEmails = new Set();
    if (userData.email) {
      exposedEmails.add(userData.email.toLowerCase());
    }

    try {
      const eventsRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}/events/public?per_page=10`, {
        headers
      });
      if (eventsRes.ok) {
        const events = await eventsRes.json();
        if (Array.isArray(events)) {
          for (const ev of events) {
            if (ev.type === 'PushEvent' && ev.payload && Array.isArray(ev.payload.commits)) {
              for (const c of ev.payload.commits) {
                if (c.author && c.author.email && !c.author.email.includes('users.noreply.github.com')) {
                  exposedEmails.add(c.author.email.toLowerCase());
                }
              }
            }
          }
        }
      }
    } catch (e) {
      // non-fatal
    }

    // Analyze findings
    const findings = [];
    const accounts = [{
      platform: 'GitHub',
      handle: userData.login,
      url: userData.html_url,
      avatarUrl: userData.avatar_url,
      displayName: userData.name || userData.login,
      bio: userData.bio,
      location: userData.location,
      company: userData.company,
      blog: userData.blog,
      followers: userData.followers,
      publicRepos: userData.public_repos,
      createdAt: userData.created_at,
      updatedAt: userData.updated_at
    }];

    // Check 1: Publicly exposed emails
    const emailsList = Array.from(exposedEmails);
    if (emailsList.length > 0) {
      findings.push({
        source: 'GitHub / Public Profile & Commits',
        finding: `Public Email Address Exposed (${emailsList.join(', ')})`,
        evidence: `Discovered in public Git commit history or GitHub user profile attributes.`,
        confidence: 'High',
        risk: 'High',
        whyItMatters: 'Publicly exposed emails in Git history are routinely scraped by spam botnets and targeted for phishing campaigns.',
        recommendedAction: 'Enable "Keep my email addresses private" and "Block command line pushes that expose my email" in GitHub Email Settings. Rewrite past commits using git-filter-repo if sensitive.',
        remediationType: 'privacy_settings',
        guide: {
          title: 'GitHub Email Privacy Settings',
          steps: [
            'Go to GitHub Settings > Emails',
            'Check "Keep my email addresses private"',
            'Check "Block command line pushes that expose my email"',
            'Use your @users.noreply.github.com address in git config user.email'
          ]
        }
      });
    }

    // Check 2: Sensitive repository name inspection
    const sensitiveKeywords = ['secret', 'token', 'key', 'cred', 'config', 'env', 'backup', 'dotfile', 'password'];
    const flaggedRepos = repos.filter(r => {
      const name = (r.name || '').toLowerCase();
      const desc = (r.description || '').toLowerCase();
      return sensitiveKeywords.some(k => name.includes(k) || desc.includes(k));
    });

    if (flaggedRepos.length > 0) {
      const repoNames = flaggedRepos.map(r => r.name).join(', ');
      findings.push({
        source: 'GitHub / Public Repositories',
        finding: `Potentially Sensitive Public Repository Identified (${repoNames})`,
        evidence: `Repositories matching sensitive configuration keywords: ${repoNames}`,
        confidence: 'High',
        risk: 'Medium',
        whyItMatters: 'Repositories with names indicating configurations or environment files frequently contain inadvertently committed API tokens, private keys, or internal hostnames.',
        recommendedAction: 'Audit these repositories using truffleHog or git-secrets to confirm no active API keys or connection strings are checked into public git history.',
        remediationType: 'code_audit',
        guide: {
          title: 'Git Repository Secret Audit',
          steps: [
            `Review commit logs of: ${repoNames}`,
            'Ensure .env files and *.key files are in .gitignore',
            'Rotate any secrets committed to past revisions'
          ]
        }
      });
    }

    // Check 3: Dormant/Forgotten account analysis
    if (userData.created_at) {
      const createdYear = new Date(userData.created_at).getFullYear();
      const updatedTime = new Date(userData.updated_at).getTime();
      const monthsSinceUpdate = Math.floor((Date.now() - updatedTime) / (1000 * 60 * 60 * 24 * 30));
      
      if (monthsSinceUpdate > 24) {
        findings.push({
          source: 'GitHub / Account Hygiene',
          finding: 'Dormant Developer Account (> 2 Years Without Activity)',
          evidence: `Account created in ${createdYear}, last modified ${monthsSinceUpdate} months ago.`,
          confidence: 'High',
          risk: 'Medium',
          whyItMatters: 'Dormant accounts rarely have active MFA enforcement or updated recovery emails, making them easy targets for credential stuffing.',
          recommendedAction: 'Sign in to confirm 2-Factor Authentication (WebAuthn/TOTP) is active, or archive obsolete repositories.'
        });
      }
    }

    return {
      exists: true,
      user: userData,
      repos: repos.map(r => ({
        name: r.name,
        fullName: r.full_name,
        htmlUrl: r.html_url,
        description: r.description,
        isFork: r.fork,
        stars: r.stargazers_count,
        language: r.language,
        updatedAt: r.updated_at
      })),
      exposedEmails: emailsList,
      accounts,
      findings
    };
  } catch (err) {
    clearTimeout(timeout);
    return { exists: false, error: err.message };
  }
}
