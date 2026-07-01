function addUserInformation() {
    let basePath = '';
    if (window.location.pathname.includes('/Projects/')) {
        basePath = '../../Config/userinformation.txt?v=1.7';
    } else if (window.location.pathname.includes('/HTML/')) {
        basePath = '../Config/userinformation.txt?v=1.7';
    } else {
        basePath = 'Config/userinformation.txt?v=1.7';
    }

    fetch(basePath)
        .then(response => response.text())
        .then(data => {
            const lines = data.split('\n').map(line => line.trim()).filter(Boolean);
            const [profilePicUrl, profileName, profileRole, location, ...rawSocials] = lines;
            const defaultIntro = 'Designing simple interfaces, brands, and visual systems.';

            const socialIconMap = {
                'x.com': 'fa-brands fa-x-twitter',
                'facebook.com': 'fa-brands fa-square-facebook',
                'discord.com': 'fa-brands fa-discord',
                'discord.gg': 'fa-brands fa-discord',
                'dsc.gg': 'fa-brands fa-discord',
                'instagram.com': 'fa-brands fa-instagram',
                'youtube.com': 'fa-brands fa-youtube',
                'linkedin.com': 'fab fa-linkedin',
                'artstation.com': 'fa-brands fa-artstation',
                'github.com': 'fab fa-github',
                'wordpress.com': 'fab fa-wordpress',
                'vimeo.com': 'fab fa-vimeo',
                'behance.net': 'fab fa-behance',
                'playstation.com': 'fab fa-playstation',
                'xbox.com': 'fab fa-xbox',
                'vk.com': 'fab fa-vk',
                'steamcommunity.com': 'fab fa-steam',
                'tumblr.com': 'fab fa-tumblr',
                'threads.net': 'fab fa-threads',
                'patreon.com': 'fab fa-patreon',
                'twitch.tv': 'fab fa-twitch',
                'mixer.com': 'fab fa-mixer',
                'mastodon.social': 'fab fa-mastodon',
                'mailchimp.com': 'fab fa-mailchimp',
                'email': 'fas fa-envelope',
                'resume': 'fa-solid fa-file-lines'
            };

            const isEmailAddress = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            const isResumeLink = value => value.toLowerCase().endsWith('.pdf') || value.toLowerCase().startsWith('resume:');
            const isKnownSocial = value => Object.keys(socialIconMap).some(key => value.includes(key)) || isEmailAddress(value) || isResumeLink(value);
            const hasCustomIntro = rawSocials.length > 0 && !isKnownSocial(rawSocials[0]);
            const introText = hasCustomIntro ? rawSocials[0] : defaultIntro;
            const socials = hasCustomIntro ? rawSocials.slice(1) : rawSocials;

            const container = document.querySelector('.top-container');
            if (!container) return;

            let userInfoPanel = container.querySelector('.user-info-panel');
            if (!userInfoPanel) {
                userInfoPanel = document.createElement('div');
                userInfoPanel.className = 'user-info-panel';
                container.prepend(userInfoPanel);
            }
            userInfoPanel.textContent = '';

            const img = document.createElement('img');
            img.src = profilePicUrl;
            img.alt = `${profileName || 'Profile'} portrait`;
            img.className = 'profile-pic';
            userInfoPanel.appendChild(img);

            const userNameLink = document.createElement('a');
            userNameLink.href = window.location.pathname.includes('/Projects/') ? '../../index.html' : 'index.html';
            userNameLink.className = 'user-name-link';

            const userName = document.createElement('h1');
            userName.className = 'user-name';
            userName.textContent = profileName || '';
            userNameLink.appendChild(userName);
            userInfoPanel.appendChild(userNameLink);

            const userRole = document.createElement('h2');
            userRole.className = 'user-role';
            userRole.textContent = profileRole || '';
            userInfoPanel.appendChild(userRole);

            const userIntro = document.createElement('p');
            userIntro.className = 'user-intro';
            userIntro.textContent = introText;
            userInfoPanel.appendChild(userIntro);

            const userLocationContainer = document.createElement('div');
            userLocationContainer.className = 'user-location-container';

            const locationIcon = document.createElement('span');
            locationIcon.className = 'material-symbols-outlined';
            locationIcon.textContent = 'near_me';
            userLocationContainer.appendChild(locationIcon);

            const userLocation = document.createElement('h2');
            userLocation.textContent = location || '';
            userLocationContainer.appendChild(userLocation);
            userInfoPanel.appendChild(userLocationContainer);

            const socialIcons = document.createElement('div');
            socialIcons.className = 'social-icons';
            userInfoPanel.appendChild(socialIcons);

            socials.forEach(social => {
                if (!social) return;

                const isEmail = isEmailAddress(social);
                const isResume = isResumeLink(social);
                const socialUrl = social.toLowerCase().startsWith('resume:') ? social.slice(7).trim() : social;
                const socialType = Object.keys(socialIconMap).find(key => !isResume && social.includes(key));
                const iconClass = isResume ? socialIconMap.resume : (socialType ? socialIconMap[socialType] : (isEmail ? socialIconMap.email : null));
                if (!iconClass) return;

                const a = document.createElement('a');
                a.href = isEmail && !socialType ? `mailto:${social}` : socialUrl;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.setAttribute('aria-label', isResume ? 'Resume' : (isEmail ? 'Email' : socialType.replace('.com', '').replace('.net', '')));
                if (isResume) a.className = 'resume-button';

                const icon = document.createElement('i');
                icon.className = iconClass;
                a.appendChild(icon);

                if (isResume) {
                    const label = document.createElement('span');
                    label.textContent = 'Resume';
                    a.appendChild(label);
                }

                socialIcons.appendChild(a);
            });
        })
        .catch(error => console.error('Error loading user information:', error));
}

document.addEventListener('DOMContentLoaded', addUserInformation);
