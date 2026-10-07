// Public Developer & Community Platforms Discovery Service
// HackerNews, GitLab, and Dev.to public REST endpoints

export async function lookupDevProfiles(username) {
  const cleanUsername = username.trim().replace(/^@/, '');
  const accounts = [];
  const findings = [];

  // 1. Hacker News Public Firebase API
  try {
    const hnRes = await fetch(`https://hacker-news.firebaseio.com/v0/user/${encodeURIComponent(cleanUsername)}.json`);
    if (hnRes.ok) {
      const hnUser = await hnRes.json();
      if (hnUser && hnUser.id) {
        accounts.push({
          platform: 'HackerNews',
          handle: hnUser.id,
          url: `https://news.ycombinator.com/user?id=${hnUser.id}`,
          displayName: hnUser.id,
          bio: hnUser.about ? hnUser.about.replace(/<[^>]+>/g, '').slice(0, 150) : null,
          createdAt: hnUser.created ? new Date(hnUser.created * 1000).toISOString() : null,
          karma: hnUser.karma
        });
      }
    }
  } catch (e) {
    // non-fatal
  }

  // 2. Dev.to Public API
  try {
    const devRes = await fetch(`https://dev.to/api/users/by_username?url=${encodeURIComponent(cleanUsername)}`);
    if (devRes.ok) {
      const devUser = await devRes.json();
      if (devUser && devUser.username) {
        accounts.push({
          platform: 'Dev.to',
          handle: devUser.username,
          url: `https://dev.to/${devUser.username}`,
          avatarUrl: devUser.profile_image,
          displayName: devUser.name,
          bio: devUser.summary,
          location: devUser.location,
          website: devUser.website_url
        });
      }
    }
  } catch (e) {
    // non-fatal
  }

  // 3. GitLab Public API
  try {
    const gitlabRes = await fetch(`https://gitlab.com/api/v4/users?username=${encodeURIComponent(cleanUsername)}`);
    if (gitlabRes.ok) {
      const gitlabUsers = await gitlabRes.json();
      if (Array.isArray(gitlabUsers) && gitlabUsers.length > 0) {
        const glUser = gitlabUsers[0];
        accounts.push({
          platform: 'GitLab',
          handle: glUser.username,
          url: glUser.web_url,
          avatarUrl: glUser.avatar_url,
          displayName: glUser.name,
          bio: glUser.bio,
          location: glUser.location
        });
      }
    }
  } catch (e) {
    // non-fatal
  }

  // Exposure finding: Username reuse
  if (accounts.length >= 2) {
    const platforms = accounts.map(a => a.platform).join(', ');
    findings.push({
      source: 'Developer Networks / Handle Correlation',
      finding: `Consistent Username Handle Reused Across ${accounts.length} Platforms (${platforms})`,
      evidence: `Discovered active public accounts with handle '${cleanUsername}' across ${platforms}.`,
      confidence: 'Medium',
      risk: 'Medium',
      whyItMatters: 'Username reuse allows attackers to easily cross-reference accounts, correlate forum posts, hobby interests, and build social engineering dossiers.',
      recommendedAction: 'Consider separating professional developer handles from discussion or gaming usernames.'
    });
  }

  return { accounts, findings };
}
