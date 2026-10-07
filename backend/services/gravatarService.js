// Gravatar Public Profile & Avatar Discovery Service
// Uses cryptographic MD5 hash of trimmed, lowercase email address
import crypto from 'crypto';

export async function lookupGravatar(email) {
  const cleanEmail = email.trim().toLowerCase();
  const hash = crypto.createHash('md5').update(cleanEmail).digest('hex');
  const avatarUrl = `https://www.gravatar.com/avatar/${hash}?d=404`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    // Check avatar presence
    const avatarRes = await fetch(avatarUrl, {
      method: 'HEAD',
      signal: controller.signal
    });

    const hasAvatar = avatarRes.status === 200;

    // Check JSON profile
    let profileData = null;
    try {
      const profileRes = await fetch(`https://en.gravatar.com/${hash}.json`, {
        headers: { 'User-Agent': 'CyberDNA-Footprint-Scanner' },
        signal: controller.signal
      });
      if (profileRes.ok) {
        const json = await profileRes.json();
        if (json.entry && json.entry[0]) {
          profileData = json.entry[0];
        }
      }
    } catch (e) {
      // non-fatal
    }

    clearTimeout(timeout);

    if (!hasAvatar && !profileData) {
      return { exists: false, hash };
    }

    const accounts = [];
    const findings = [];

    const discoveredName = profileData?.displayName || profileData?.preferredUsername || null;
    const aboutMe = profileData?.aboutMe || null;
    const profileUrl = profileData?.profileUrl || `https://gravatar.com/${hash}`;
    const location = profileData?.currentLocation || null;

    accounts.push({
      platform: 'Gravatar',
      handle: profileData?.preferredUsername || cleanEmail.split('@')[0],
      url: profileUrl,
      avatarUrl: `https://www.gravatar.com/avatar/${hash}?s=200`,
      displayName: discoveredName || 'Gravatar Profile',
      bio: aboutMe,
      location,
      hash
    });

    // Check linked accounts (WordPress, Vimeo, Twitter, etc.)
    const linkedServices = [];
    if (profileData?.accounts && Array.isArray(profileData.accounts)) {
      for (const acc of profileData.accounts) {
        linkedServices.push(acc.shortname || acc.domain);
        accounts.push({
          platform: acc.shortname || 'External Account',
          handle: acc.username,
          url: acc.url,
          displayName: acc.display || acc.username,
          verified: acc.verified === 'true'
        });
      }
    }

    findings.push({
      source: 'Gravatar / Global Hash Registry',
      finding: `Public Gravatar Profile Associated with ${cleanEmail}`,
      evidence: `MD5 Hash: ${hash}. Discovered avatar and metadata profile. Linked networks: ${linkedServices.join(', ') || 'None'}.`,
      confidence: 'High',
      risk: 'Medium',
      whyItMatters: 'Gravatar hashes allow third parties to correlate an email address with public avatars, usernames, and linked profiles across thousands of WordPress/Automattic-enabled websites.',
      recommendedAction: 'Log into gravatar.com to review public profile visibility or replace personal photo with an abstract avatar.',
      remediationType: 'privacy_settings',
      guide: {
        title: 'Gravatar Privacy Configuration',
        steps: [
          'Visit https://gravatar.com and log in with your WordPress.com credentials',
          'Review profile data under "My Profile"',
          'Hide public profile or unlink extraneous connected accounts'
        ]
      }
    });

    return {
      exists: true,
      hash,
      hasAvatar,
      profileData,
      accounts,
      findings
    };
  } catch (err) {
    clearTimeout(timeout);
    return { exists: false, error: err.message };
  }
}
